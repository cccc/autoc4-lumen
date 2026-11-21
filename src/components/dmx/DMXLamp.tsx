import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RGB } from "@/lib/color";
import { cn } from "@/lib/utils";
import ColorPicker from "./ColorPicker";
import {
    BaseDialog,
    DialogCloseButton,
    showDialog,
    type BaseDialogProps,
} from "@/lib/dialog";
import { type LampType } from "@/lib/dmx/lamp-types";
import useLamp from "./useLamp";
import { NumberSlider } from "@/components/ui/number-slider";
import { EFFECTS, findEffect, type EffectId } from "@/lib/dmx/effects";

interface DMXLampProps {
    label: string;
    topic: string;
    type: LampType;
}

interface LampEditorProps extends BaseDialogProps {
    topic: string;
    type: LampType;
}
function LampEditor({ topic, type, title }: LampEditorProps) {
    const lamp = useLamp(topic, type);
    const { supports, update, commit, values, poweroff } = lamp;

    const { rgb, white } = values;

    const supportsWhite = supports("white");
    const supportsAdvanced =
        supports("intensity") || supports("zoom") || supports("effect");

    return (
        <BaseDialog title={title} className="sm:max-w-lg">
            <div className="space-y-3">
                <ColorPicker
                    color={rgb ?? RGB.BLACK}
                    onChange={(c) =>
                        update({
                            rgb: c,
                        })
                    }
                    showWhite={supportsWhite}
                    white={white}
                    onWhiteChange={(w) =>
                        update({
                            white: w,
                        })
                    }
                    onCommit={(c) => commit({ rgb: c })}
                    onWhiteCommit={(w) => commit({ white: w })}
                />
                {supportsAdvanced && <AdvancedSection lamp={lamp} />}
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg text-sm bg-off text-white hover:bg-off-hover active:scale-95"
                        onClick={poweroff}
                    >
                        Off
                    </button>
                    <DialogCloseButton
                        type="button"
                        className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
                    >
                        Close
                    </DialogCloseButton>
                </div>
            </div>
        </BaseDialog>
    );
}

function AdvancedSection({ lamp }: { lamp: ReturnType<typeof useLamp> }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<EffectId>("fade");
    const [param, setParam] = useState(128);

    const { supports, update, commit, values } = lamp;

    const { intensity, zoom } = values;

    const supportsIntensity = supports("intensity");
    const supportsEffects = supports("effect");
    const supportsZoom = supports("zoom");

    const selectedEffect = EFFECTS.find((e) => e.id === selected)!;

    function applyEffect() {
        commit({
            effect: {
                marker: selectedEffect.marker,
                param,
            },
        });
    }

    const sectionLabelParts = [
        supportsIntensity && "Intensity",
        supportsZoom && "Zoom",
        supportsEffects && "Effects",
    ].filter(Boolean);

    const sectionLabel =
        sectionLabelParts.length > 1
            ? `${sectionLabelParts.slice(0, -1).join(", ")} & ${sectionLabelParts.at(-1)}`
            : sectionLabelParts[0];

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpen(!open)}
            >
                <ChevronDown
                    className={cn(
                        "size-4 transition-transform",
                        !open && "-rotate-90",
                    )}
                />
                {sectionLabel}
            </button>
            {open && (
                <div className="px-3 pb-3 space-y-3">
                    {supportsIntensity && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                                Intensity: {intensity}
                            </label>
                            <NumberSlider
                                min={0}
                                max={255}
                                value={intensity ?? 0}
                                onChange={(i) => update({ intensity: i })}
                                onCommit={(i) => commit({ intensity: i })}
                            />
                        </div>
                    )}
                    {supportsZoom && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                                Zoom: {zoom}
                            </label>
                            <NumberSlider
                                min={0}
                                max={255}
                                value={zoom ?? 0}
                                onChange={(z) => update({ zoom: z })}
                                onCommit={(z) => commit({ zoom: z })}
                            />
                        </div>
                    )}
                    {supportsEffects && (
                        <>
                            <div className="flex rounded-lg bg-muted p-0.5">
                                {EFFECTS.map((e) => (
                                    <button
                                        key={e.id}
                                        type="button"
                                        className={cn(
                                            "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
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
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">
                                    {selectedEffect.paramLabel}: {param}
                                </label>
                                <NumberSlider
                                    min={0}
                                    max={255}
                                    value={param}
                                    onChange={setParam}
                                />
                            </div>
                            <button
                                type="button"
                                className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 active:scale-[0.98]"
                                onClick={applyEffect}
                            >
                                Apply {selectedEffect.label}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DMXLamp({ label, topic, type }: DMXLampProps) {
    const { supports, values } = useLamp(topic, type);

    const color = values.rgb ?? RGB.BLACK;
    const white = values.white ?? 0;
    const intensity = values.intensity ?? 255;
    const effect = values.effect;

    const supportsWhite = supports("white");

    const hex = RGB.toHex(color);
    const isOff =
        color.r === 0 && color.g === 0 && color.b === 0 && white === 0;

    const effectLabel = effect
        ? findEffect(effect.marker)?.label.toLowerCase()
        : undefined;

    function openEditor() {
        void showDialog(LampEditor, {
            title: label,
            topic,
            type,
            initialColor: color,
            initialWhite: white,
            initialIntensity: intensity,
        });
    }

    return (
        <button
            type="button"
            className="min-w-0 rounded-lg flex flex-col items-stretch overflow-hidden border-2 border-border transition-colors active:scale-95"
            onClick={openEditor}
        >
            <div
                className="h-16 w-full flex items-center justify-center"
                style={
                    isOff && !effectLabel
                        ? {
                              backgroundColor: "var(--muted)",
                              backgroundImage:
                                  "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(128,128,128,0.1) 4px, rgba(128,128,128,0.1) 5px)",
                          }
                        : effectLabel
                          ? { backgroundColor: "var(--muted)" }
                          : { backgroundColor: hex }
                }
            >
                {effectLabel && (
                    <span className="text-[10px] text-muted-foreground/50 animate-pulse animation-duration-[4s]">
                        {effectLabel}
                    </span>
                )}
            </div>
            <div className="flex-1 px-1.5 py-1.5 bg-card flex flex-col items-center justify-center">
                <span className="text-xs font-medium leading-tight text-foreground text-center">
                    {label}
                </span>
                {supportsWhite && white > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                        W: {white}
                    </span>
                )}
            </div>
        </button>
    );
}