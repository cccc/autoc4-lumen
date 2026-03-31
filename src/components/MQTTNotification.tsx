import { useEffect, useRef } from "react";
import { toast, type ExternalToast } from "sonner";
import { useMQTTValue } from "@/lib/mqtt";
import type { MQTTPayload } from "@/lib/mqtt/store";

type ToastType = "info" | "success" | "warning" | "error";

interface MessageResult {
    text: string;
    type?: ToastType;
    options?: ExternalToast;
}

type MessageResolver =
    | Record<number, string | MessageResult>
    | ((payload: MQTTPayload) => string | MessageResult | null);

interface MQTTNotificationProps {
    topic: string;
    messages: MessageResolver;
    /** Grace period in ms to skip retained messages on connect. Default 2000. */
    grace?: number;
}

function resolve(
    messages: MessageResolver,
    payload: MQTTPayload,
): MessageResult | null {
    if (typeof messages === "function") {
        const result = messages(payload);
        if (result === null) return null;
        return typeof result === "string" ? { text: result } : result;
    }

    const byte = payload.bytes[0];
    const entry = messages[byte];
    if (entry === undefined) return null;
    return typeof entry === "string" ? { text: entry } : entry;
}

function showToast(result: MessageResult) {
    const type = result.type ?? "info";
    toast[type](result.text, result.options);
}

/**
 * Declarative MQTT notification. Mount this to show toasts
 * when a topic receives a message. Renders nothing.
 */
export default function MQTTNotification({
    topic,
    messages,
    grace = 2000,
}: MQTTNotificationProps) {
    const payload = useMQTTValue(topic);
    const readyRef = useRef(false);
    const prevRef = useRef<MQTTPayload | undefined>(undefined);

    // Grace period to skip retained messages on initial connect
    useEffect(() => {
        const timer = setTimeout(() => {
            readyRef.current = true;
        }, grace);
        return () => clearTimeout(timer);
    }, [grace]);

    useEffect(() => {
        if (!payload || !readyRef.current) {
            prevRef.current = payload;
            return;
        }
        if (prevRef.current === payload) return;
        prevRef.current = payload;

        const result = resolve(messages, payload);
        if (result) showToast(result);
    }, [payload, messages]);

    return null;
}