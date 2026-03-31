import { useState } from "react";
import { toast } from "sonner";
import { Power, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import BusleisteControl from "@/components/busleiste/BusleisteControl";
import MQTTSwitch from "@/components/lights/MQTTSwitch";
import { useDebugStore } from "@/lib/debug";
import { confirm, showDialog, closeDialog } from "@/lib/dialog";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

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

function parseHexBytes(input: string): Uint8Array | null {
    const trimmed = input.trim();
    if (!trimmed) return new Uint8Array(0);
    const parts = trimmed.split(/[\s,]+/);
    const bytes: number[] = [];
    for (const part of parts) {
        const clean = part.replace(/^0x/i, "");
        const val = Number.parseInt(clean, 16);
        if (Number.isNaN(val) || val < 0 || val > 255) return null;
        bytes.push(val);
    }
    return new Uint8Array(bytes);
}

function MQTTPublishDialog() {
    const [topic, setTopic] = useState("");
    const [payload, setPayload] = useState("");
    const [mode, setMode] = useState<"hex" | "text">("hex");
    const [retained, setRetained] = useState(false);
    const { sendData } = useMQTTSend();

    function handleSend() {
        if (!topic.trim()) {
            toast.error("Topic is required.");
            return;
        }

        if (mode === "hex") {
            const bytes = parseHexBytes(payload);
            if (bytes === null) {
                toast.error(
                    "Invalid hex bytes. Use space-separated values like: 00 FF 1A",
                );
                return;
            }
            sendData(topic, bytes, retained);
        } else {
            sendData(topic, payload, retained);
        }

        toast.success(`Sent to ${topic}`);
        closeDialog();
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium">Topic</label>
                <Input
                    type="text"
                    placeholder="licht/wohnzimmer/tuer"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Payload</label>
                    <div className="flex gap-1 text-xs">
                        <button
                            type="button"
                            className={cn(
                                "px-2 py-0.5 rounded",
                                mode === "hex"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => setMode("hex")}
                        >
                            Hex
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "px-2 py-0.5 rounded",
                                mode === "text"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => setMode("text")}
                        >
                            Text
                        </button>
                    </div>
                </div>
                <Input
                    type="text"
                    placeholder={
                        mode === "hex"
                            ? "00 FF 1A or 0x00 0xFF 0x1A"
                            : "Hello world"
                    }
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="font-mono"
                />
                {mode === "hex" && (
                    <p className="text-xs text-muted-foreground">
                        Space-separated hex bytes. Empty for 0 bytes.
                    </p>
                )}
            </div>

            <label className="flex items-center gap-2 text-sm">
                <Switch
                    checked={retained}
                    onCheckedChange={(v) => setRetained(v as boolean)}
                />
                Retained
            </label>

            <div className="flex gap-2">
                <Button onClick={handleSend}>
                    <Send className="size-4 mr-2" /> Send
                </Button>
                <Button variant="secondary" onClick={() => closeDialog()}>
                    Close
                </Button>
            </div>
        </div>
    );
}

function DebugSettings() {
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

export default function AdminPanel() {
    const { sendData, sendByte } = useMQTTSend();
    const statusMessage = useMQTTString("club/status/message");
    const [messageInput, setMessageInput] = useState("");

    function handleSetMessage(e: React.FormEvent) {
        e.preventDefault();
        sendData("club/status/message", messageInput, true);
        toast.success("Status message set.");
    }

    function handleClearMessage() {
        sendData("club/status/message", "", true);
        toast.success("Status message cleared.");
    }

    function handleOpenGate() {
        sendByte("club/gate", 0);
    }

    function handleForceShutdown() {
        confirm({
            title: "Force Shutdown",
            description:
                "This bypasses safety checks such as window sensors. Only use this if you know what you are doing.\n\nThe club will be shut down immediately without verifying that windows are closed.",
            confirmLabel: (
                <span className="inline-flex items-center gap-1.5">
                    <Power className="size-4" /> Force Shutdown
                </span>
            ),
            onConfirm: () => sendByte("club/shutdown", 1),
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="border rounded-lg overflow-hidden flex-1">
                    <MQTTSwitch topic="club/status">
                        {(state, toggle) => (
                            <div
                                className={cn(
                                    "px-6 py-5 flex items-center justify-between gap-4 transition-colors",
                                    state === "on" && "bg-on/15",
                                    state === "off" && "bg-off/15",
                                )}
                            >
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">
                                        Club Status
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {state === "on"
                                            ? "The club is currently open."
                                            : state === "off"
                                              ? "The club is currently closed."
                                              : "Status unknown. Not connected?"}
                                    </p>
                                    {statusMessage && (
                                        <p className="text-sm italic">
                                            {statusMessage}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "shrink-0 px-6 py-3 rounded-lg text-sm font-semibold transition-colors active:scale-95",
                                        state === "on" &&
                                            "bg-on hover:bg-on-hover text-white",
                                        state === "off" &&
                                            "bg-off hover:bg-off-hover text-white",
                                        state === "unknown" &&
                                            "bg-muted text-muted-foreground",
                                    )}
                                    onClick={toggle}
                                >
                                    {state === "on"
                                        ? "Close Club"
                                        : "Open Club"}
                                </button>
                            </div>
                        )}
                    </MQTTSwitch>

                    <div className="border-t px-6 py-4 space-y-2">
                        <label className="text-sm font-medium">
                            Status Message
                        </label>
                        <form onSubmit={handleSetMessage} className="flex">
                            <Input
                                type="text"
                                placeholder="Set a public status message..."
                                value={messageInput}
                                onChange={(e) =>
                                    setMessageInput(e.target.value)
                                }
                                className="rounded-r-none border-r-0"
                            />
                            <Button
                                type="submit"
                                className="rounded-none border-x-0"
                            >
                                Set
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-l-none"
                                onClick={handleClearMessage}
                            >
                                Clear
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:w-48 shrink-0">
                    <Button
                        size="lg"
                        className="bg-on hover:bg-on-hover flex-1 text-base"
                        onClick={handleOpenGate}
                    >
                        Open Gate
                    </Button>
                    <Button
                        size="lg"
                        variant="destructive"
                        className="flex-1 text-base"
                        onClick={handleForceShutdown}
                    >
                        Force Shutdown
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="border rounded-lg p-4 flex-1">
                    <h3 className="font-semibold mb-3">Busleiste</h3>
                    <BusleisteControl />
                </div>
                <DebugSettings />
            </div>
        </div>
    );
}