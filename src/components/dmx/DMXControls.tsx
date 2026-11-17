import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useColorAppliances } from "@/lib/appliances";
import { adjustBrightness, randomColor } from "@/lib/color";
import {
    BaseDialog,
    DialogCloseButton,
    showDialog,
    useDialog,
} from "@/lib/dialog";
import { cn } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";
import { readLamp, updateLamp } from "@/lib/dmx/lamps";
import { LAMP_TYPES, type LampParams } from "@/lib/dmx/lamp-types";
import { EFFECTS, type EffectId } from "@/lib/dmx/effects";

interface DMXControlsProps {
    room: string;
    only?: string[];
    except?: string[];
}

function BrightnessControls({ room, only, except }: DMXControlsProps) {
    const lamps = useColorAppliances({ room, only, except });

    function applyBrightness(factor: number) {
        for (const lamp of lamps) {
            const lampType = LAMP_TYPES[lamp.type];

            const supportsRGB = lampType.supports("rgb");
            const supportsWhite = lampType.supports("white");
            if (!supportsRGB && !supportsWhite) continue;

            const values = readLamp(lamp.topic, lamp.type);
            const patch: LampParams = {};
            if (values.rgb) {
                patch.rgb = adjustBrightness(values.rgb, factor);
            }
            if (values.white != null) {
                patch.white = Math.round(Math.min(255, values.white * factor));
            }
            updateLamp(lamp.topic, lamp.type, patch);
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

function RoomEffectDialog({ room, only, except }: DMXControlsProps) {
    const [selected, setSelected] = useState<EffectId>("fade");
    const [param, setParam] = useState(128);
    const lamps = useColorAppliances({ room, only, except });
    const { remove } = useDialog();

    const effect = EFFECTS.find((e) => e.id === selected)!;

    function apply() {
        for (const lamp of lamps) {
            if (!LAMP_TYPES[lamp.type].supports("effect")) continue;
            updateLamp(lamp.topic, lamp.type, {
                // Do we wanna reset the color or is the effect kinda cool
                effect: {
                    marker: effect.marker,
                    param,
                },
                intensity: 255,
            });
        }
        remove();
    }

    return (
        <BaseDialog title="Effects" className="sm:max-w-lg">
            <div className="space-y-4">
                <div className="flex rounded-lg bg-muted p-0.5">
                    {EFFECTS.map((e) => (
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
            </div>
            <DialogFooter className="flex gap-2">
                <Button onClick={apply}>Apply {effect.label}</Button>
                <DialogCloseButton variant="secondary">
                    Cancel
                </DialogCloseButton>
            </DialogFooter>
        </BaseDialog>
    );
}

function RandomDialog({ room, only, except }: DMXControlsProps) {
    const [brightness, setBrightness] = useState(128);
    const lamps = useColorAppliances({ room, only, except });
    const { remove } = useDialog();

    function apply() {
        for (const lamp of lamps) {
            const c = randomColor(brightness / 255);

            // Do we wanna reset all white lamps too?
            if (!LAMP_TYPES[lamp.type].supports("rgb")) continue;
            updateLamp(lamp.topic, lamp.type, {
                rgb: c,
                white: 0,
                effect: null,
                intensity: 255,
            });
        }
        remove();
    }

    return (
        <BaseDialog title="Random Colors" className="sm:max-w-lg">
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
                    <DialogCloseButton variant="secondary">
                        Cancel
                    </DialogCloseButton>
                </div>
            </div>
        </BaseDialog>
    );
}

function EffectsControls({ room, only, except }: DMXControlsProps) {
    const lamps = useColorAppliances({ room, only, except });
    const hasEffects = lamps.some((l) => LAMP_TYPES[l.type].supports("effect"));

    return (
        <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Actions</span>
            <div className="flex flex-wrap gap-2">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() =>
                        showDialog(RandomDialog, {
                            room,
                            only,
                            except,
                        })
                    }
                >
                    Random
                </Button>
                {hasEffects && (
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() =>
                            showDialog(RoomEffectDialog, {
                                room,
                                only,
                                except,
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