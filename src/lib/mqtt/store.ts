import { createStore } from "zustand/vanilla";

export interface MQTTPayload {
    bytes: Uint8Array;
    string: string;
    retained: boolean;
}

export interface MQTTState {
    connected: boolean;
    topics: Map<string, MQTTPayload>;
}

export const mqttStore = createStore<MQTTState>(() => ({
    connected: false,
    topics: new Map(),
}));

export function setConnected(connected: boolean) {
    mqttStore.setState({ connected });
}

export function setTopic(topic: string, payload: MQTTPayload) {
    mqttStore.setState((prev) => {
        const next = new Map(prev.topics);
        next.set(topic, payload);
        return { topics: next };
    });
}