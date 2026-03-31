import type { ReactNode } from "react";
import { useMQTTByte, useMQTTSend } from "@/lib/mqtt";

export type SwitchState = "on" | "off" | "unknown";

interface MQTTSwitchProps {
    topic: string;
    children: (state: SwitchState, toggle: () => void) => ReactNode;
}

/**
 * Render-prop component that provides MQTT on/off state and a toggle function.
 * The actual UI is entirely up to the children render function.
 */
export default function MQTTSwitch({ topic, children }: MQTTSwitchProps) {
    const byte = useMQTTByte(topic);
    const { sendByte } = useMQTTSend();

    const state: SwitchState =
        byte === undefined ? "unknown" : byte !== 0 ? "on" : "off";

    function toggle() {
        sendByte(topic, state === "on" ? 0 : 1, { retained: true });
    }

    return <>{children(state, toggle)}</>;
}