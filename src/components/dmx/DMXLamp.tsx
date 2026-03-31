import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { RGB } from "@/lib/color";
import { rgbToHex } from "@/lib/color";
import { useMQTTSend, useMQTTValue } from "@/lib/mqtt";
import { cn } from "@/lib/utils";
import { showDialog, closeDialog } from "@/lib/dialog";
import ColorPicker from "./ColorPicker";

export type LampType = "rgb" | "rgbw" | "dmx4ch" | "dmx7ch";

interface DMXLampProps {
    label: string;
    topic: string;
    type: LampType;
}

function parseColor(bytes: Uint8Array): RGB {
    return {
        r: bytes[0] ?? 0,
        g: bytes[1] ?? 0,
        b: bytes[2] ?? 0,
    };
}

function parseWhite(bytes: Uint8Array): number {
    return bytes[3] ?? 0;
}

function buildPayload(
    type: LampType,
    color: RGB,
    white: number,
    intensity = 255,
): Uint8Array {
    switch (type) {
        case "rgb":
            return new Uint8Array([color.r, color.g, color.b]);
        case "rgbw":
            return new Uint8Array([color.r, color.g, color.b, white]);
        case "dmx4ch":
            return new Uint8Array([color.r, color.g, color.b, intensity]);
        case "dmx7ch":
            return new Uint8Array([
                color.r,
                color.g,
                color.b,
                0,
                0,
                0,
                intensity,
            ]);
    }
}

function buildPoweroff(type: LampType): Uint8Array {
    switch (type) {
        case "rgb":
            return new Uint8Array([0, 0, 0]);
        case "rgbw":
        case "dmx4ch":
            return new Uint8Array([0, 0, 0, 0]);
        case "dmx7ch":
            return new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
    }
}

function LampEditor({
    topic,
    type,
    initialColor,
    initialWhite,
    initialIntensity,
}: {
    topic: string;
    type: LampType;
    initialColor: RGB;
    initialWhite: number;
    initialIntensity: number;
}) {
    const [color, setColor] = useState<RGB>(initialColor);
    const [white, setWhite] = useState(initialWhite);
    const [intensity, setIntensity] = useState(initialIntensity);
    const { sendData } = useMQTTSend();

    const send = useCallback(
        (c: RGB, w: number, i: number) => {
            sendData(topic, buildPayload(type, c, w, i), true);
        },
        [topic, type, sendData],
    );

    const handleColorChange = useCallback(
        (c: RGB) => {
            setColor(c);
            const isBlack = c.r === 0 && c.g === 0 && c.b === 0;
            if (isBlack && (type === "dmx7ch" || type === "dmx4ch")) {
                setIntensity(0);
                send(c, white, 0);
            } else if (type === "dmx7ch" || type === "dmx4ch") {
                setIntensity(255);
                send(c, white, 255);
            } else {
                send(c, white, intensity);
            }
        },
        [white, intensity, type, send],
    );

    const handleWhiteChange = useCallback(
        (w: number) => {
            setWhite(w);
            send(color, w, intensity);
        },
        [color, intensity, send],
    );

    const handleIntensityChange = useCallback(
        (i: number) => {
            setIntensity(i);
            send(color, white, i);
        },
        [color, white, send],
    );

    const handlePoweroff = useCallback(() => {
        sendData(topic, buildPoweroff(type), true);
        setColor({ r: 0, g: 0, b: 0 });
        setWhite(0);
    }, [topic, type, sendData]);

    return (
        <div className="space-y-3">
            <ColorPicker
                color={color}
                onChange={handleColorChange}
                showWhite={type === "rgbw"}
                white={white}
                onWhiteChange={type === "rgbw" ? handleWhiteChange : undefined}
            />
            {(type === "dmx7ch" || type === "dmx4ch") && (
                <AdvancedSection
                    type={type}
                    topic={topic}
                    intensity={intensity}
                    onIntensityChange={handleIntensityChange}
                    sendData={sendData}
                />
            )}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm bg-off text-white hover:bg-off-hover active:scale-95"
                    onClick={handlePoweroff}
                >
                    Off
                </button>
                <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
                    onClick={() => closeDialog()}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// Effect byte 5 values matching the DMX controller firmware
const EFFECTS = [
    { id: "fade", label: "Fade", paramLabel: "Speed", marker: 0x81 },
    { id: "flash-less", label: "Flash--", paramLabel: "Speed", marker: 0xa1 },
    { id: "flash", label: "Flash", paramLabel: "Speed", marker: 0xc1 },
    { id: "sound", label: "Sound", paramLabel: "Sensitivity", marker: 0xe1 },
] as const;

type EffectId = (typeof EFFECTS)[number]["id"];

function AdvancedSection({
    type,
    topic,
    intensity,
    onIntensityChange,
    sendData,
}: {
    type: LampType;
    topic: string;
    intensity: number;
    onIntensityChange: (i: number) => void;
    sendData: (topic: string, data: Uint8Array, retained: boolean) => void;
}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<EffectId>("fade");
    const [param, setParam] = useState(128);
    const has7ch = type === "dmx7ch";

    const effect = EFFECTS.find((e) => e.id === selected)!;

    function applyEffect() {
        sendData(
            topic,
            new Uint8Array([0, 0, 0, 0, param, effect.marker, 255]),
            true,
        );
    }

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
                {has7ch ? "Intensity & Effects" : "Intensity"}
            </button>
            {open && (
                <div className="px-3 pb-3 space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                            Intensity: {intensity}
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={255}
                            value={intensity}
                            onChange={(e) =>
                                onIntensityChange(Number(e.target.value))
                            }
                            className="w-full h-6 touch-none"
                        />
                    </div>
                    {has7ch && (
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
                                    {effect.paramLabel}: {param}
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={255}
                                    value={param}
                                    onChange={(e) =>
                                        setParam(Number(e.target.value))
                                    }
                                    className="w-full h-6 touch-none"
                                />
                            </div>
                            <button
                                type="button"
                                className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 active:scale-[0.98]"
                                onClick={applyEffect}
                            >
                                Apply {effect.label}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DMXLamp({ label, topic, type }: DMXLampProps) {
    const payload = useMQTTValue(topic);
    const bytes = payload?.bytes ?? new Uint8Array(0);
    const color = parseColor(bytes);
    const white = parseWhite(bytes);
    const intensity =
        type === "dmx7ch" && bytes.length >= 7
            ? bytes[6]
            : type === "dmx4ch" && bytes.length >= 4
              ? bytes[3]
              : 255;
    const hex = rgbToHex(color);
    const isOff =
        color.r === 0 &&
        color.g === 0 &&
        color.b === 0 &&
        (type !== "rgbw" || white === 0);

    // Detect active effect from byte 5 (7ch only)
    let effectLabel: string | null = null;
    if (type === "dmx7ch" && bytes.length >= 7 && bytes[5] !== 0) {
        const b5 = bytes[5];
        if (b5 >= 0x80 && b5 <= 0x9f) effectLabel = "fade";
        else if (b5 >= 0xa0 && b5 <= 0xbf) effectLabel = "flash--";
        else if (b5 >= 0xc0 && b5 <= 0xdf) effectLabel = "flash";
        else if (b5 >= 0xe0) effectLabel = "sound";
    }

    function openEditor() {
        showDialog({
            title: label,
            className: "sm:max-w-lg",
            content: (
                <LampEditor
                    topic={topic}
                    type={type}
                    initialColor={color}
                    initialWhite={white}
                    initialIntensity={intensity}
                />
            ),
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
                    <span className="text-[10px] text-muted-foreground/50 animate-pulse [animation-duration:4s]">
                        {effectLabel}
                    </span>
                )}
            </div>
            <div className="flex-1 px-1.5 py-1.5 bg-card flex flex-col items-center justify-center">
                <span className="text-xs font-medium leading-tight text-foreground text-center">
                    {label}
                </span>
                {type === "rgbw" && white > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                        W: {white}
                    </span>
                )}
            </div>
        </button>
    );
}