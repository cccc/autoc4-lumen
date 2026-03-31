import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useColorAppliances } from "@/lib/appliances";
import { adjustBrightness, randomColor } from "@/lib/color";
import { closeDialog, showDialog } from "@/lib/dialog";
import { useMQTTSend } from "@/lib/mqtt";
import { mqttStore } from "@/lib/mqtt/store";
import { cn } from "@/lib/utils";

interface DMXControlsProps {
    room: string;
    only?: string[];
    except?: string[];
}

function BrightnessControls({ room, only, except }: DMXControlsProps) {
    const lamps = useColorAppliances({ room, only, except });
    const { sendData } = useMQTTSend();

    function applyBrightness(factor: number) {
        const state = mqttStore.getState();
        for (const lamp of lamps) {
            const payload = state.topics.get(lamp.topic);
            if (!payload || payload.bytes.length < 3) continue;
            const rgb = {
                r: payload.bytes[0],
                g: payload.bytes[1],
                b: payload.bytes[2],
            };
            const adjusted = adjustBrightness(rgb, factor);
            const bytes = new Uint8Array(payload.bytes.length);
            bytes.set(payload.bytes);
            bytes[0] = adjusted.r;
            bytes[1] = adjusted.g;
            bytes[2] = adjusted.b;
            sendData(lamp.topic, bytes, true);
        }
    }

    return (
        <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Brightness</span>
            <div className="flex gap-2">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => applyBrightness(0.75)}
                >
                    -25%
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => applyBrightness(0.85)}
                >
                    -15%
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => applyBrightness(1.15)}
                >
                    +15%
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => applyBrightness(1.25)}
                >
                    +25%
                </Button>
            </div>
        </div>
    );
}

const ROOM_EFFECTS = [
    { id: "fade", label: "Fade", paramLabel: "Speed", marker: 0x81 },
    { id: "flash-less", label: "Flash--", paramLabel: "Speed", marker: 0xa1 },
    { id: "flash", label: "Flash", paramLabel: "Speed", marker: 0xc1 },
    { id: "sound", label: "Sound", paramLabel: "Sensitivity", marker: 0xe1 },
] as const;

type RoomEffectId = (typeof ROOM_EFFECTS)[number]["id"];

function RoomEffectDialog({ room, only, except }: DMXControlsProps) {
    const [selected, setSelected] = useState<RoomEffectId>("fade");
    const [param, setParam] = useState(128);
    const lamps = useColorAppliances({ room, only, except });
    const { sendData } = useMQTTSend();

    const effect = ROOM_EFFECTS.find((e) => e.id === selected)!;

    function apply() {
        for (const lamp of lamps) {
            if (lamp.type === "dmx7ch") {
                sendData(
                    lamp.topic,
                    new Uint8Array([0, 0, 0, 0, param, effect.marker, 255]),
                    true,
                );
            }
        }
        closeDialog();
    }

    return (
        <div className="space-y-4">
            <div className="flex rounded-lg bg-muted p-0.5">
                {ROOM_EFFECTS.map((e) => (
                    <button
                        key={e.id}
                        type="button"
                        className={cn(
                            "flex-1 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                            selected === e.id
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setSelected(e.id)}
                    >
                        {e.label}
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <label className="text-sm">
                    {effect.paramLabel}: {param}
                </label>
                <input
                    type="range"
                    min={0}
                    max={255}
                    value={param}
                    onChange={(e) => setParam(Number(e.target.value))}
                    className="w-full h-8 touch-none"
                />
            </div>
            <div className="flex gap-2">
                <Button onClick={apply}>Apply {effect.label}</Button>
                <Button variant="secondary" onClick={() => closeDialog()}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function RandomDialog({ room, only, except }: DMXControlsProps) {
    const [brightness, setBrightness] = useState(128);
    const lamps = useColorAppliances({ room, only, except });
    const { sendData } = useMQTTSend();

    function apply() {
        for (const lamp of lamps) {
            const c = randomColor(brightness / 255);
            switch (lamp.type) {
                case "dmx7ch":
                    sendData(
                        lamp.topic,
                        new Uint8Array([c.r, c.g, c.b, 0, 0, 0, 255]),
                        true,
                    );
                    break;
                case "dmx4ch":
                    sendData(
                        lamp.topic,
                        new Uint8Array([c.r, c.g, c.b, 255]),
                        true,
                    );
                    break;
                case "rgbw":
                    sendData(
                        lamp.topic,
                        new Uint8Array([c.r, c.g, c.b, 0]),
                        true,
                    );
                    break;
                case "rgb":
                    sendData(lamp.topic, new Uint8Array([c.r, c.g, c.b]), true);
                    break;
            }
        }
        closeDialog();
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm">Brightness: {brightness}</label>
                <input
                    type="range"
                    min={0}
                    max={255}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-8 touch-none"
                />
            </div>
            <div className="flex gap-2">
                <Button onClick={apply}>Apply</Button>
                <Button variant="secondary" onClick={() => closeDialog()}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function EffectsControls({ room, only, except }: DMXControlsProps) {
    const lamps = useColorAppliances({ room, only, except });
    const has7ch = lamps.some((l) => l.type === "dmx7ch");

    return (
        <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Actions</span>
            <div className="flex flex-wrap gap-2">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() =>
                        showDialog({
                            title: "Random Colors",
                            content: (
                                <RandomDialog
                                    room={room}
                                    only={only}
                                    except={except}
                                />
                            ),
                        })
                    }
                >
                    Random
                </Button>
                {has7ch && (
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() =>
                            showDialog({
                                title: "Effects",
                                content: (
                                    <RoomEffectDialog
                                        room={room}
                                        only={only}
                                        except={except}
                                    />
                                ),
                            })
                        }
                    >
                        Effects
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function DMXControls({ room, only, except }: DMXControlsProps) {
    return (
        <div className="space-y-3 mt-3">
            <BrightnessControls room={room} only={only} except={except} />
            <EffectsControls room={room} only={only} except={except} />
        </div>
    );
}