import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Slider } from "@base-ui/react/slider";
import { NumberSlider } from "@/components/ui/number-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HSV, RGB } from "@/lib/color";
import { useMQTTJSON } from "@/lib/mqtt";

type PickerMode = "rect" | "wheel";

/** How the HSV controls report: each sends only the components it sets. */
interface HsvHandlers {
    onChange: (hsv: Partial<HSV>) => void;
    onCommit: (hsv: Partial<HSV>) => void;
}

interface ColorPickerProps {
    color: RGB;
    /** Called continuously while a control is being dragged. */
    onChange?: (color: RGB) => void;
    /**
     * Called with the final color when a drag ends. A swatch click is final
     * right away, so it goes here, or to `onChange` if this isn't given.
     */
    onCommit?: (color: RGB) => void;
    showWhite?: boolean;
    white?: number;
    onWhiteChange?: (white: number) => void;
    onWhiteCommit?: (white: number) => void;
}

function SaturationValueCanvas({
    hue,
    saturation,
    value,
    onChange,
    onCommit,
}: {
    hue: number;
    saturation: number;
    value: number;
} & HsvHandlers) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const drag = useDrag(
        (clientX: number, clientY: number) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const s = Math.min(
                1,
                Math.max(0, (clientX - rect.left) / rect.width),
            );
            const v = Math.min(
                1,
                Math.max(0, 1 - (clientY - rect.top) / rect.height),
            );
            return { s, v };
        },
        onChange,
        onCommit,
    );

    const pureColor = RGB.toHex(RGB.fromHSV({ h: hue, s: 1, v: 1 }));

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-52 rounded-lg cursor-crosshair touch-none"
            style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureColor})`,
            }}
            {...drag}
        >
            <div
                className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${saturation * 100}%`,
                    top: `${(1 - value) * 100}%`,
                    background: RGB.toHex(
                        RGB.fromHSV({ h: hue, s: saturation, v: value }),
                    ),
                }}
            />
        </div>
    );
}

function HueSlider({ hue, onChange, onCommit }: { hue: number } & HsvHandlers) {
    return (
        <GradientSlider
            value={Math.round(hue * 360)}
            max={360}
            onChange={(h) => onChange({ h: h / 360 })}
            onCommit={(h) => onCommit({ h: h / 360 })}
            background="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
            thumbColor={RGB.toHex(RGB.fromHSV({ h: hue, s: 1, v: 1 }))}
        />
    );
}

function HueSaturationWheel({
    hue,
    saturation,
    value,
    onChange,
    onCommit,
}: {
    hue: number;
    saturation: number;
    value: number;
} & HsvHandlers) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const drag = useDrag(
        (clientX: number, clientY: number) => {
            const rect = wheelRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const radius = rect.width / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;

            let angle = Math.atan2(dx, -dy);
            if (angle < 0) angle += 2 * Math.PI;
            const h = angle / (2 * Math.PI);
            const s = Math.min(1, Math.sqrt(dx * dx + dy * dy) / radius);
            return { h, s };
        },
        onChange,
        onCommit,
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
            {...drag}
        >
            <div
                className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${indicatorX}%`,
                    top: `${indicatorY}%`,
                    background: RGB.toHex(
                        RGB.fromHSV({ h: hue, s: saturation, v: value }),
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
    onCommit,
}: {
    hue: number;
    saturation: number;
    value: number;
} & HsvHandlers) {
    const fullColor = RGB.toHex(RGB.fromHSV({ h: hue, s: saturation, v: 1 }));

    // 0-255 matches the brightest channel exactly, so no precision is lost
    return (
        <GradientSlider
            value={Math.round(value * 255)}
            max={255}
            onChange={(v) => onChange({ v: v / 255 })}
            onCommit={(v) => onCommit({ v: v / 255 })}
            background={`linear-gradient(to right, #000, ${fullColor})`}
            thumbColor={RGB.toHex(
                RGB.fromHSV({ h: hue, s: saturation, v: value }),
            )}
        />
    );
}

/** A slider drawn as a color gradient, with a thumb showing the current color. */
function GradientSlider({
    value,
    max,
    onChange,
    onCommit,
    background,
    thumbColor,
}: {
    value: number;
    max: number;
    onChange: (value: number) => void;
    onCommit: (value: number) => void;
    background: string;
    thumbColor: string;
}) {
    return (
        <Slider.Root
            value={value}
            min={0}
            max={max}
            onValueChange={(v) => onChange(v)}
            onValueCommitted={(v) => onCommit(v)}
        >
            <Slider.Control className="relative flex h-8 w-full cursor-pointer touch-none items-center select-none">
                <Slider.Track
                    className="h-8 w-full rounded-lg"
                    style={{ background }}
                />
                <Slider.Thumb
                    className="size-6 rounded-full border-2 border-white shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    style={{ background: thumbColor }}
                />
            </Slider.Control>
        </Slider.Root>
    );
}

/**
 * Pointer handling for a 2D drag area. `locate` maps a pointer position to a
 * value; the drag reports it through `onChange` while moving and commits the
 * last one when the pointer is released or the drag is canceled.
 */
function useDrag<T>(
    locate: (clientX: number, clientY: number) => T | null,
    onChange: (value: T) => void,
    onCommit: (value: T) => void,
) {
    // The last reported value, committed when the drag ends. Kept in a ref
    // so the commit doesn't depend on a re-render after the last move.
    // Wrapped so a T of null still counts as a value.
    const lastRef = useRef<{ value: T } | null>(null);

    const report = (clientX: number, clientY: number) => {
        const value = locate(clientX, clientY);
        if (value === null) return;
        lastRef.current = { value };
        onChange(value);
    };

    return {
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
            // Primary button only; touch and pen contacts also report 0
            if (e.button !== 0) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            report(e.clientX, e.clientY);
        },
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            report(e.clientX, e.clientY);
        },
        // Fires after pointerup and pointercancel, but only for drags that
        // set the capture above
        onLostPointerCapture: () => {
            if (lastRef.current) onCommit(lastRef.current.value);
            lastRef.current = null;
        },
    };
}

function ChannelSlider({
    label,
    value,
    max,
    color,
    onChange,
    onCommit,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
    onChange: (v: number) => void;
    onCommit?: (v: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs w-6 text-muted-foreground">{label}</span>
            <NumberSlider
                className="flex-1"
                min={0}
                max={max}
                value={value}
                onChange={onChange}
                onCommit={onCommit}
                color={color}
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
                            backgroundColor: RGB.toHex(swatch.color),
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
    onCommit,
    showWhite = false,
    white = 0,
    onWhiteChange,
    onWhiteCommit,
}: ColorPickerProps) {
    const [mode, setMode] = useState<PickerMode>("wheel");
    const [sliderMode, setSliderMode] = useState<SliderMode>("rgb");
    const hsv = HSV.fromRGB(color);

    function withHsv(partial: Partial<HSV>): RGB {
        const next = { ...hsv, ...partial };
        // Black (lamp off) round-trips to v=0 with meaningless h/s, so
        // picking only a hue/saturation would stay black. Default the
        // components the gesture doesn't set, so picking a color turns the
        // lamp on.
        if (hsv.v === 0) {
            if (partial.v === undefined) next.v = 1;
            if (partial.s === undefined && partial.h !== undefined) next.s = 1;
        }
        return RGB.fromHSV(next);
    }

    /** Handlers for a control whose value `toColor` turns into a color. */
    function bind<T>(toColor: (value: T) => RGB) {
        return {
            onChange: (value: T) => onChange?.(toColor(value)),
            onCommit: (value: T) => onCommit?.(toColor(value)),
        };
    }

    const hsvHandlers = bind(withHsv);

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
                        {...hsvHandlers}
                    />
                    <HueSlider hue={hsv.h} {...hsvHandlers} />
                </>
            ) : (
                <>
                    <HueSaturationWheel
                        hue={hsv.h}
                        saturation={hsv.s}
                        value={hsv.v}
                        {...hsvHandlers}
                    />
                    <ValueSlider
                        hue={hsv.h}
                        saturation={hsv.s}
                        value={hsv.v}
                        {...hsvHandlers}
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
                        {...bind((r: number) => ({ ...color, r }))}
                    />
                    <ChannelSlider
                        label="G"
                        value={color.g}
                        max={255}
                        color="#22c55e"
                        {...bind((g: number) => ({ ...color, g }))}
                    />
                    <ChannelSlider
                        label="B"
                        value={color.b}
                        max={255}
                        color="#3b82f6"
                        {...bind((b: number) => ({ ...color, b }))}
                    />
                </>
            ) : (
                <>
                    <ChannelSlider
                        label="H"
                        value={Math.round(hsv.h * 360)}
                        max={360}
                        color={RGB.toHex(RGB.fromHSV({ h: hsv.h, s: 1, v: 1 }))}
                        {...bind((h: number) => withHsv({ h: h / 360 }))}
                    />
                    <ChannelSlider
                        label="S"
                        value={Math.round(hsv.s * 100)}
                        max={100}
                        color={RGB.toHex(
                            RGB.fromHSV({ h: hsv.h, s: hsv.s, v: 1 }),
                        )}
                        {...bind((s: number) => withHsv({ s: s / 100 }))}
                    />
                    <ChannelSlider
                        label="V"
                        value={Math.round(hsv.v * 100)}
                        max={100}
                        color={RGB.toHex(color)}
                        {...bind((v: number) => withHsv({ v: v / 100 }))}
                    />
                </>
            )}
            {showWhite && (
                <ChannelSlider
                    label="W"
                    value={white}
                    max={255}
                    color="#ffffff"
                    onChange={(w) => onWhiteChange?.(w)}
                    onCommit={onWhiteCommit}
                />
            )}
            <Swatches onSelect={(c) => (onCommit ?? onChange)?.(c)} />
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