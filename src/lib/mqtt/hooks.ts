import { useStore } from "zustand";
import { sendByte, sendData } from "./client";
import type { MQTTPayload } from "./store";
import { mqttStore } from "./store";

/** Returns the latest payload for a specific MQTT topic, or undefined. */
export function useMQTTValue(topic: string): MQTTPayload | undefined {
    return useStore(mqttStore, (s) => s.topics.get(topic));
}

/** Returns the latest payload as a parsed JSON value, or undefined. */
export function useMQTTJSON<T>(topic: string): T | undefined {
    const payload = useMQTTValue(topic);
    if (!payload) return undefined;
    try {
        return JSON.parse(payload.string) as T;
    } catch {
        return undefined;
    }
}

/** Returns the latest payload as a string, or undefined. */
export function useMQTTString(topic: string): string | undefined {
    return useStore(mqttStore, (s) => s.topics.get(topic)?.string);
}

/** Returns the byte at `offset` (default 0) in a topic's payload, or undefined. */
export function useMQTTByte(
    topic: string,
    opts?: { offset?: number },
): number | undefined {
    const offset = opts?.offset ?? 0;
    return useStore(mqttStore, (s) => {
        const p = s.topics.get(topic);
        if (!p || p.bytes.length <= offset) return undefined;
        return p.bytes[offset];
    });
}

/** Returns whether the MQTT client is connected. */
export function useMQTTConnected(): boolean {
    return useStore(mqttStore, (s) => s.connected);
}

/** Returns stable send functions for publishing MQTT messages. */
export function useMQTTSend() {
    return { sendData, sendByte };
}