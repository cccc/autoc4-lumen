import {
    LAMP_TYPES,
    type LampParams,
    type LampType,
} from "@/lib/dmx/lamp-types";
import { useLiveValue } from "@/lib/hooks/useLiveValue";
import { sendData, useMQTTValue } from "@/lib/mqtt";
import { useMemo } from "react";

export default function useLamp(topic: string, type: LampType) {
    const payload = useMQTTValue(topic);
    const bytes = payload?.bytes;
    const lampType = LAMP_TYPES[type];

    const {
        value: liveBytes,
        change,
        commit,
    } = useLiveValue<Uint8Array>({
        remote: bytes,
        send: (changedBytes) => {
            sendData(topic, changedBytes, true);
        },
        isEqual: (a, b) => {
            if (a === b) return true;
            return a.length === b.length && a.every((v, i) => v === b[i]);
        },
    });

    const values = useMemo(
        () => lampType.decode(liveBytes ?? new Uint8Array(0)),
        [lampType, liveBytes],
    );

    return {
        values,
        poweroff: () => {
            commit(lampType.encode(lampType.poweroff(values)));
        },
        update: (patch: LampParams) => {
            change(lampType.encode(lampType.update(values, patch)));
        },
        supports: lampType.supports,
        commit: (patch: LampParams) => {
            commit(lampType.encode(lampType.update(values, patch)));
        },
    };
}