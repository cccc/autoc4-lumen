import { sendData } from "../mqtt";
import { mqttStore } from "../mqtt/store";
import { LAMP_TYPES, type LampParams, type LampType } from "./lamp-types";

export function readLamp(topic: string, type: LampType) {
    const state = mqttStore.getState().topics.get(topic);
    const lampType = LAMP_TYPES[type];
    return lampType.decode(state?.bytes ?? new Uint8Array());
}

export function updateLamp(topic: string, type: LampType, patch: LampParams) {
    const lampType = LAMP_TYPES[type];
    const updated = lampType.update(readLamp(topic, type), patch);
    sendData(topic, lampType.encode(updated), true);
}

export function poweroffLamp(topic: string, type: LampType) {
    const lampType = LAMP_TYPES[type];
    const updated = lampType.poweroff(readLamp(topic, type));
    sendData(topic, lampType.encode(updated), true);
}