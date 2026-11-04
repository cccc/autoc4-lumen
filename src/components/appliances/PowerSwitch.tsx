import { Switch } from "@/components/ui/switch";
import type { PowerControl } from "@/lib/appliances";
import MQTTSwitch from "@/lib/mqtt/MQTTSwitch";
import TasmotaSwitch from "@/lib/mqtt/TasmotaSwitch";

/** On/off switch for a power relay; disabled until its state is known. */
export default function PowerSwitch({
    topic,
    protocol = "mqtt",
}: PowerControl) {
    const Source = protocol === "tasmota" ? TasmotaSwitch : MQTTSwitch;

    return (
        <Source topic={topic}>
            {(state, toggle) => (
                <Switch
                    aria-label="Power"
                    checked={state === "on"}
                    onCheckedChange={toggle}
                    disabled={state === "unknown"}
                />
            )}
        </Source>
    );
}