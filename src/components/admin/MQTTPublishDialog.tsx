import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { useMQTTSend } from "@/lib/mqtt";
import { useState } from "react";
import { closeDialog } from "@/lib/dialog";
import { cn } from "cn";
import { toast } from "sonner";

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

export default function MQTTPublishDialog() {
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