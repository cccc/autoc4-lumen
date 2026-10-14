import { useDebugStore } from "@/lib/debug";
import { showDialog } from "@/lib/dialog";
import { Switch } from "@/components/ui/switch";
import MQTTPublishDialog from "./MQTTPublishDialog";
import { Send } from "lucide-react";
import { Button } from "../ui/button";

const DEBUG_SWITCHES = [
    {
        key: "connection" as const,
        label: "Connection Events",
        description: "Log MQTT connect/disconnect events",
    },
    {
        key: "messageReceived" as const,
        label: "Messages Received",
        description: "Log all incoming MQTT messages",
    },
    {
        key: "messageSent" as const,
        label: "Messages Sent",
        description: "Log all outgoing MQTT messages",
    },
    {
        key: "subscriptions" as const,
        label: "Subscriptions",
        description: "Log MQTT topic subscriptions on connect",
    },
];

export default function DebugSettings() {
    const debug = useDebugStore();

    return (
        <div className="border rounded-lg p-4 md:w-72 shrink-0">
            <h3 className="font-semibold mb-3">Debug Logging</h3>
            <div className="space-y-4">
                {DEBUG_SWITCHES.map(({ key, label, description }) => (
                    <label
                        key={key}
                        className="flex items-center justify-between gap-4 cursor-pointer"
                    >
                        <div>
                            <div className="text-sm font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">
                                {description}
                            </div>
                        </div>
                        <Switch
                            checked={debug[key]}
                            onCheckedChange={(checked) =>
                                debug.set({ [key]: checked })
                            }
                        />
                    </label>
                ))}
            </div>
            <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() =>
                    showDialog({
                        title: "Send MQTT Message",
                        content: <MQTTPublishDialog />,
                    })
                }
            >
                <Send className="size-4 mr-2" /> Send Message
            </Button>
        </div>
    );
}