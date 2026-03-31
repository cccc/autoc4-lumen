import type { ReactNode } from "react";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";

export type SwitchState = "on" | "off" | "unknown";

interface TasmotaSwitchProps {
    topic: string;
    children: (state: SwitchState, toggle: () => void) => ReactNode;
}

/**
 * Render-prop component for Tasmota power state.
 * Reads from {topic}/POWER and sends to {topic}/cmnd/power.
 */
export default function TasmotaSwitch({ topic, children }: TasmotaSwitchProps) {
    const powerState = useMQTTString(`${topic}/POWER`);
    const { sendData } = useMQTTSend();

    const state: SwitchState =
        powerState === undefined
            ? "unknown"
            : powerState === "ON"
              ? "on"
              : "off";

    function toggle() {
        sendData(`${topic}/cmnd/power`, state === "on" ? "off" : "on", false);
    }

    return <>{children(state, toggle)}</>;
}