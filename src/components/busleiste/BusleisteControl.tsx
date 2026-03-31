import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    useMQTTByte,
    useMQTTJSON,
    useMQTTSend,
    useMQTTString,
} from "@/lib/mqtt";
import { cn } from "@/lib/utils";

interface BusleisteModuleProps {
    name: string;
}

function BusleisteModule({ name }: BusleisteModuleProps) {
    const activeModule = useMQTTString("busleiste/active_module");
    const activeInterrupt = useMQTTString("busleiste/active_interrupt");
    const enabledByte = useMQTTByte(`busleiste/modules/${name}/enabled`);
    const { sendData, sendByte } = useMQTTSend();
    const [textValue, setTextValue] = useState("");

    const isActiveModule = activeModule === name;
    const isInterrupt = activeInterrupt === name;
    const isPlaying = isInterrupt || (isActiveModule && !activeInterrupt);
    const isPaused = isActiveModule && !!activeInterrupt && !isInterrupt;
    const enabled = enabledByte !== undefined ? enabledByte !== 0 : undefined;

    function handleActivate() {
        sendData("busleiste/change_module", name, true);
    }

    function handleToggleEnable() {
        sendByte(`busleiste/modules/${name}/enabled`, enabled ? 0 : 1, {
            retained: true,
        });
    }

    function handleTextSubmit() {
        if (textValue === "") {
            sendData("busleiste/modules/Text/settings", "", true);
        } else {
            const lines = textValue.split("\n");
            while (lines.length < 4) lines.push("");
            sendData(
                "busleiste/modules/Text/settings",
                JSON.stringify(lines),
                true,
            );
        }
    }

    return (
        <div
            className={cn(
                "border-2 rounded-lg px-3 py-2 flex items-center flex-wrap gap-2",
                isPlaying && "border-on",
                isPaused && "border-tint-warm",
                !isPlaying && !isPaused && "border-border",
            )}
        >
            <span className="text-sm font-medium flex-1">{name}</span>
            <div className="flex gap-1">
                <button
                    type="button"
                    className={cn(
                        "size-9 rounded flex items-center justify-center text-white text-lg",
                        activeModule === undefined && "bg-neutral-700",
                        isActiveModule && "bg-on",
                        activeModule !== undefined &&
                            !isActiveModule &&
                            "bg-off",
                    )}
                    title="Set as active module"
                    onClick={handleActivate}
                >
                    &#x23f5;
                </button>
                <button
                    type="button"
                    className={cn(
                        "size-9 rounded flex items-center justify-center text-white text-lg",
                        enabled === undefined && "bg-neutral-700",
                        enabled === true && "bg-on",
                        enabled === false && "bg-off",
                    )}
                    title="Enable as interrupt"
                    onClick={handleToggleEnable}
                >
                    &#x23fb;
                </button>
            </div>
            {name === "Text" && (
                <div className="w-full flex gap-2 items-start">
                    <textarea
                        className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm font-mono resize-y"
                        rows={4}
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                    />
                    <Button size="sm" onClick={handleTextSubmit}>
                        Submit
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function BusleisteControl() {
    const modules =
        useMQTTJSON<Record<string, [string, string]>>("busleiste/modules");

    if (!modules) {
        return (
            <p className="text-muted-foreground text-sm">
                No modules available
            </p>
        );
    }

    const moduleNames = Object.values(modules).map(([name]) => name);

    return (
        <div className="flex flex-col gap-2">
            {moduleNames.map((name) => (
                <BusleisteModule key={name} name={name} />
            ))}
        </div>
    );
}