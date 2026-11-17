import {
    LAMP_TYPES,
    type LampParams,
    type LampType,
} from "@/lib/dmx/lamp-types";
import { poweroffLamp, updateLamp } from "@/lib/dmx/lamps";
import { useMQTTValue } from "@/lib/mqtt";

export default function useLamp(topic: string, type: LampType) {
    const payload = useMQTTValue(topic);
    const lampType = LAMP_TYPES[type];
    const values = lampType.decode(payload?.bytes ?? new Uint8Array(0));

    return {
        values,
        poweroff: () => {
            poweroffLamp(topic, type);
        },
        update: (patch: LampParams) => {
            updateLamp(topic, type, patch);
        },
        supports: lampType.supports,
    };
}