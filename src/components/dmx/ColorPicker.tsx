import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { HSV, RGB } from "@/lib/color";
import { hsvToRgb, rgbToHex, rgbToHsv } from "@/lib/color";
import { useMQTTJSON } from "@/lib/mqtt";

type PickerMode = "rect" | "wheel";

interface ColorPickerProps {
    color: RGB;
    onChange: (color: RGB) => void;
    showWhite?: boolean;
    white?: number;
    onWhiteChange?: (white: number) => void;
}

function SaturationValueCanvas({
    hue,
    saturation,
    value,
    onChange,
}: {
    hue: number;
    saturation: number;
    value: number;
    onChange: (s: number, v: number) => void;
}) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handlePointer = useCallback(
        (clientX: number, clientY: number) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const s = Math.min(
                1,
                Math.max(0, (clientX - rect.left) / rect.width),
            );
            const v = Math.min(
                1,
                Math.max(0, 1 - (clientY - rect.top) / rect.height),
            );
            onChange(s, v);
        },
        [onChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e.clientX, e.clientY);
        },
        [handlePointer],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handlePointer(e.clientX, e.clientY);
        },
        [handlePointer],
    );

    const pureColor = rgbToHex(hsvToRgb({ h: hue, s: 1, v: 1 }));

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-52 rounded-lg cursor-crosshair touch-none"
            style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureColor})`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            <div
                className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${saturation * 100}%`,
                    top: `${(1 - value) * 100}%`,
                    background: rgbToHex(
                        hsvToRgb({ h: hue, s: saturation, v: value }),
                    ),
                }}
            />
        </div>
    );
}

function HueSlider({
    hue,
    onChange,
}: {
    hue: number;
    onChange: (h: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointer = useCallback(
        (clientX: number) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            onChange(
                Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
            );
        },
        [onChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e.clientX);
        },
        [handlePointer],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handlePointer(e.clientX);
        },
        [handlePointer],
    );

    return (
        <div
            ref={ref}
            className="relative w-full h-8 rounded-lg cursor-pointer touch-none"
            style={{
                background:
                    "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${hue * 100}%`,
                    background: rgbToHex(hsvToRgb({ h: hue, s: 1, v: 1 })),
                }}
            />
        </div>
    );
}

function HueSaturationWheel({
    hue,
    saturation,
    value,
    onChange,
}: {
    hue: number;
    saturation: number;
    value: number;
    onChange: (h: number, s: number) => void;
}) {
    const wheelRef = useRef<HTMLDivElement>(null);

    const handlePointer = useCallback(
        (clientX: number, clientY: number) => {
            const rect = wheelRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const radius = rect.width / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;

            let angle = Math.atan2(dx, -dy);
            if (angle < 0) angle += 2 * Math.PI;
            const h = angle / (2 * Math.PI);
            const s = Math.min(1, Math.sqrt(dx * dx + dy * dy) / radius);
            onChange(h, s);
        },
        [onChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e.clientX, e.clientY);
        },
        [handlePointer],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handlePointer(e.clientX, e.clientY);
        },
        [handlePointer],
    );

    const angle = hue * 2 * Math.PI;
    const pct = saturation * 50;
    const indicatorX = 50 + pct * Math.sin(angle);
    const indicatorY = 50 - pct * Math.cos(angle);

    return (
        <div
            ref={wheelRef}
            className="relative w-full aspect-square max-w-52 mx-auto rounded-full cursor-crosshair touch-none"
            style={{
                background:
                    "radial-gradient(circle closest-side, white, rgb(255 255 255 / 0)), conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            <div
                className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${indicatorX}%`,
                    top: `${indicatorY}%`,
                    background: rgbToHex(
                        hsvToRgb({ h: hue, s: saturation, v: value }),
                    ),
                }}
            />
        </div>
    );
}

function ValueSlider({
    hue,
    saturation,
    value,
    onChange,
}: {
    hue: number;
    saturation: number;
    value: number;
    onChange: (v: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointer = useCallback(
        (clientX: number) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            onChange(
                Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
            );
        },
        [onChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e.clientX);
        },
        [handlePointer],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (e.buttons === 0) return;
            handlePointer(e.clientX);
        },
        [handlePointer],
    );

    const fullColor = rgbToHex(hsvToRgb({ h: hue, s: saturation, v: 1 }));

    return (
        <div
            ref={ref}
            className="relative w-full h-8 rounded-lg cursor-pointer touch-none"
            style={{
                background: `linear-gradient(to right, #000, ${fullColor})`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${value * 100}%`,
                    background: rgbToHex(
                        hsvToRgb({ h: hue, s: saturation, v: value }),
                    ),
                }}
            />
        </div>
    );
}

function ChannelSlider({
    label,
    value,
    max,
    color,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs w-6 text-muted-foreground">{label}</span>
            <input
                type="range"
                min={0}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 h-8 accent-current touch-none"
                style={{ color }}
            />
            <span className="text-xs w-8 text-right tabular-nums text-muted-foreground">
                {value}
            </span>
        </div>
    );
}

interface Swatch {
    label: string;
    color: RGB;
}

const SWATCHES_TOPIC = "interface/lumen/swatches";

const DEFAULT_SWATCHES: Swatch[] = [
    { label: "Red", color: { r: 255, g: 0, b: 0 } },
    { label: "Blue", color: { r: 0, g: 80, b: 255 } },
    { label: "Green", color: { r: 0, g: 255, b: 0 } },
    { label: "Purple", color: { r: 160, g: 0, b: 255 } },
    { label: "Orange", color: { r: 255, g: 100, b: 0 } },
    { label: "Gold", color: { r: 255, g: 180, b: 0 } },
    { label: "Amber", color: { r: 255, g: 140, b: 0 } },
    { label: "Coral", color: { r: 255, g: 114, b: 86 } },
    { label: "Magenta", color: { r: 255, g: 0, b: 150 } },
    { label: "Pink", color: { r: 255, g: 105, b: 180 } },
    { label: "Lavender", color: { r: 180, g: 140, b: 255 } },
    { label: "Cyan", color: { r: 0, g: 255, b: 255 } },
    { label: "Warm White", color: { r: 255, g: 197, b: 143 } },
    { label: "Candle", color: { r: 255, g: 147, b: 41 } },
    { label: "Daylight", color: { r: 255, g: 241, b: 224 } },
    { label: "Cool White", color: { r: 201, g: 226, b: 255 } },
    { label: "Teal", color: { r: 0, g: 180, b: 160 } },
    { label: "Lime", color: { r: 128, g: 255, b: 0 } },
    { label: "Sky", color: { r: 100, g: 180, b: 255 } },
    { label: "Indigo", color: { r: 75, g: 0, b: 130 } },
    { label: "Rose", color: { r: 255, g: 80, b: 120 } },
    { label: "Peach", color: { r: 255, g: 200, b: 160 } },
    { label: "Mint", color: { r: 150, g: 255, b: 200 } },
    { label: "Sunset", color: { r: 255, g: 70, b: 50 } },
];

const COLLAPSED_COUNT = 12;

function Swatches({ onSelect }: { onSelect: (color: RGB) => void }) {
    const mqttSwatches = useMQTTJSON<Swatch[]>(SWATCHES_TOPIC);
    const swatches = mqttSwatches ?? DEFAULT_SWATCHES;
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(swatches.length / COLLAPSED_COUNT);
    const visible = swatches.slice(
        page * COLLAPSED_COUNT,
        (page + 1) * COLLAPSED_COUNT,
    );
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    return (
        <div className="space-y-1">
            <div className="grid grid-cols-6 gap-1.5">
                {visible.map((swatch) => (
                    <button
                        key={swatch.label}
                        type="button"
                        className="aspect-square w-full rounded-md border border-border active:scale-90 transition-transform"
                        style={{
                            backgroundColor: rgbToHex(swatch.color),
                        }}
                        title={swatch.label}
                        onClick={() => onSelect(swatch.color)}
                    />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        className="p-0.5 rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                        disabled={!hasPrev}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                        {page + 1}/{totalPages}
                    </span>
                    <button
                        type="button"
                        className="p-0.5 rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                        disabled={!hasNext}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

type SliderMode = "rgb" | "hsv";

export default function ColorPicker({
    color,
    onChange,
    showWhite = false,
    white = 0,
    onWhiteChange,
}: ColorPickerProps) {
    const [mode, setMode] = useState<PickerMode>("wheel");
    const [sliderMode, setSliderMode] = useState<SliderMode>("rgb");
    const hsv = rgbToHsv(color);

    const handleHsvChange = useCallback(
        (partial: Partial<HSV>) => {
            const next = { ...hsv, ...partial };
            // Black (lamp off) round-trips to v=0 with meaningless h/s,
            // so picking only a hue/saturation would stay black. Default
            // the components the gesture doesn't set, so picking a color
            // turns the lamp on.
            if (hsv.v === 0) {
                if (partial.v === undefined) next.v = 1;
                if (partial.s === undefined && partial.h !== undefined)
                    next.s = 1;
            }
            onChange(hsvToRgb(next));
        },
        [hsv, onChange],
    );

    const modeToggle = (
        <ToggleGroup
            value={[mode]}
            onValueChange={(v) => {
                if (v.length > 0) setMode(v[0] as PickerMode);
            }}
            size="sm"
            variant="outline"
            className="ml-auto"
        >
            <ToggleGroupItem value="wheel">Wheel</ToggleGroupItem>
            <ToggleGroupItem value="rect">Rect</ToggleGroupItem>
        </ToggleGroup>
    );

    const sliderModeToggle = (
        <ToggleGroup
            value={[sliderMode]}
            onValueChange={(v) => {
                if (v.length > 0) setSliderMode(v[0] as SliderMode);
            }}
            size="sm"
            variant="outline"
            className="ml-auto"
        >
            <ToggleGroupItem value="rgb">RGB</ToggleGroupItem>
            <ToggleGroupItem value="hsv">HSV</ToggleGroupItem>
        </ToggleGroup>
    );

    const pickerArea = (
        <div className="space-y-3">
            {modeToggle}
            {mode === "rect" ? (
                <>
                    <SaturationValueCanvas
                        hue={hsv.h}
                        saturation={hsv.s}
                        value={hsv.v}
                        onChange={(s, v) => handleHsvChange({ s, v })}
                    />
                    <HueSlider
                        hue={hsv.h}
                        onChange={(h) => handleHsvChange({ h })}
                    />
                </>
            ) : (
                <>
                    <HueSaturationWheel
                        hue={hsv.h}
                        saturation={hsv.s}
                        value={hsv.v}
                        onChange={(h, s) => handleHsvChange({ h, s })}
                    />
                    <ValueSlider
                        hue={hsv.h}
                        saturation={hsv.s}
                        value={hsv.v}
                        onChange={(v) => handleHsvChange({ v })}
                    />
                </>
            )}
        </div>
    );

    const slidersArea = (
        <div className="space-y-3">
            {sliderModeToggle}
            {sliderMode === "rgb" ? (
                <>
                    <ChannelSlider
                        label="R"
                        value={color.r}
                        max={255}
                        color="#ef4444"
                        onChange={(r) => onChange({ ...color, r })}
                    />
                    <ChannelSlider
                        label="G"
                        value={color.g}
                        max={255}
                        color="#22c55e"
                        onChange={(g) => onChange({ ...color, g })}
                    />
                    <ChannelSlider
                        label="B"
                        value={color.b}
                        max={255}
                        color="#3b82f6"
                        onChange={(b) => onChange({ ...color, b })}
                    />
                </>
            ) : (
                <>
                    <ChannelSlider
                        label="H"
                        value={Math.round(hsv.h * 360)}
                        max={360}
                        color={rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }))}
                        onChange={(h) => handleHsvChange({ h: h / 360 })}
                    />
                    <ChannelSlider
                        label="S"
                        value={Math.round(hsv.s * 100)}
                        max={100}
                        color={rgbToHex(hsvToRgb({ h: hsv.h, s: hsv.s, v: 1 }))}
                        onChange={(s) => handleHsvChange({ s: s / 100 })}
                    />
                    <ChannelSlider
                        label="V"
                        value={Math.round(hsv.v * 100)}
                        max={100}
                        color={rgbToHex(color)}
                        onChange={(v) => handleHsvChange({ v: v / 100 })}
                    />
                </>
            )}
            {showWhite && onWhiteChange && (
                <ChannelSlider
                    label="W"
                    value={white}
                    max={255}
                    color="#ffffff"
                    onChange={onWhiteChange}
                />
            )}
            <Swatches onSelect={onChange} />
        </div>
    );

    return (
        <div className="@container space-y-3">
            <div className="flex flex-col @[30rem]:flex-row @[30rem]:items-start gap-3 @[30rem]:gap-5">
                <div className="@[30rem]:w-1/2">{pickerArea}</div>
                <div className="@[30rem]:flex-1">{slidersArea}</div>
            </div>
        </div>
    );
}