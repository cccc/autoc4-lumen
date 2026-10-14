import { cn } from "cn";
import MQTTSwitch from "../lights/MQTTSwitch";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";
import { useState } from "react";
import { toast } from "sonner";

export default function ClubStatusControls() {
    const statusMessage = useMQTTString("club/status/message") || "";
    const [messageInput, setMessageInput] = useState("");

    const { sendData, sendByte } = useMQTTSend();

    function handleSetMessage(e: React.SubmitEvent) {
        e.preventDefault();
        const toSend = messageInput === "" ? "\0" : messageInput;
        sendData("club/status/message", toSend, true);
        toast.success("Status message set.");
    }

    function handleClearMessage() {
        sendByte("club/status/message", 0, { retained: true });
        toast.success("Status message cleared.");
    }

    return (
        <div className="border rounded-lg overflow-hidden flex-1">
            <MQTTSwitch topic="club/status">
                {(state, toggle) => (
                    <div
                        className={cn(
                            "px-6 py-5 flex flex-col transition-colors",
                            {
                                "bg-on/15": state === "on",
                                "bg-off/15": state === "off",
                            },
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="space-y-1 flex-1">
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
                                {state === "on" ? "Close Club" : "Open Club"}
                            </button>
                        </div>
                        <div className="mt-2">
                            <label className="text-sm font-medium">
                                Status Message
                            </label>
                            <form onSubmit={handleSetMessage} className="flex">
                                <Input
                                    type="text"
                                    placeholder={statusMessage}
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
                )}
            </MQTTSwitch>
        </div>
    );
}