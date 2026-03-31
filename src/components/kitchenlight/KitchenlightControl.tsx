import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendByte, sendData } from "@/lib/mqtt/client";

type Screen =
    | "empty"
    | "checker"
    | "matrix"
    | "moodlight"
    | "openchaos"
    | "pacman"
    | "sine"
    | "strobe"
    | "text"
    | "floodit"
    | "clock"
    | "conway";

const SCREENS: { value: Screen; label: string }[] = [
    { value: "empty", label: "Leer" },
    { value: "checker", label: "Schachbrett" },
    { value: "openchaos", label: "OpenChaos" },
    { value: "pacman", label: "Pacman" },
    { value: "text", label: "Text" },
    { value: "sine", label: "Sinus" },
    { value: "moodlight", label: "Moodlight" },
    { value: "matrix", label: "Matrix" },
    { value: "floodit", label: "FloodIt!" },
    { value: "clock", label: "Uhr" },
    { value: "conway", label: "Conway" },
];

function hexTo10Bit(hex: string, offset: number): number {
    return Math.round(
        (Number.parseInt(hex.substring(offset, offset + 2), 16) * 0x3ff) / 0xff,
    );
}

function changeScreen(data: ArrayBuffer) {
    sendData("kitchenlight/change_screen", new Uint8Array(data), true);
}

function buildSimple(screenId: number): ArrayBuffer {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, screenId, true);
    return buf;
}

function buildChecker(delay: number, colorA: string, colorB: string) {
    const buf = new ArrayBuffer(20);
    const v = new DataView(buf);
    v.setUint32(0, 1, true);
    v.setUint32(4, delay, true);
    v.setUint16(8, hexTo10Bit(colorA, 1), true);
    v.setUint16(10, hexTo10Bit(colorA, 3), true);
    v.setUint16(12, hexTo10Bit(colorA, 5), true);
    v.setUint16(14, hexTo10Bit(colorB, 1), true);
    v.setUint16(16, hexTo10Bit(colorB, 3), true);
    v.setUint16(18, hexTo10Bit(colorB, 5), true);
    return buf;
}

function buildMatrix(lines: number) {
    const buf = new ArrayBuffer(8);
    const v = new DataView(buf);
    v.setUint32(0, 2, true);
    v.setUint32(4, lines, true);
    return buf;
}

function buildMoodlight(mode: number) {
    const size = mode === 1 ? 19 : 17;
    const buf = new ArrayBuffer(size);
    const v = new DataView(buf);
    v.setUint32(0, 3, true);
    v.setUint8(4, mode);
    v.setUint32(5, 1, true); // step
    v.setUint32(9, 10, true); // fade delay
    v.setUint32(13, 10000, true); // pause
    if (mode === 1) v.setUint16(17, 30, true); // hue step
    return buf;
}

function buildOpenChaos(delay: number) {
    const buf = new ArrayBuffer(8);
    const v = new DataView(buf);
    v.setUint32(0, 4, true);
    v.setUint32(4, delay, true);
    return buf;
}

function buildText(delay: number, text: string) {
    const buf = new ArrayBuffer(8 + text.length + 1);
    const v = new DataView(buf);
    v.setUint32(0, 8, true);
    v.setUint32(4, delay, true);
    for (let i = 0; i < text.length; i++) {
        v.setUint8(8 + i, text.charCodeAt(i) & 0xff);
    }
    v.setUint8(8 + text.length, 0);
    return buf;
}

function buildConway(speed: number, generations: number, fill: boolean) {
    const buf = new ArrayBuffer(16);
    const v = new DataView(buf);
    v.setUint32(0, 12, true);
    v.setUint32(4, speed, true);
    v.setUint32(8, generations, true);
    v.setUint32(12, fill ? 1 : 0, true);
    return buf;
}

// --- Parameter forms ---

function CheckerParams({
    onApply,
}: {
    onApply: (delay: number, colorA: string, colorB: string) => void;
}) {
    const [delay, setDelay] = useState(500);
    const [colorA, setColorA] = useState("#ffffff");
    const [colorB, setColorB] = useState("#000000");
    return (
        <div className="space-y-3">
            <SliderField
                label="Delay"
                value={delay}
                min={0}
                max={5000}
                onChange={setDelay}
            />
            <ColorField label="Farbe A" value={colorA} onChange={setColorA} />
            <ColorField label="Farbe B" value={colorB} onChange={setColorB} />
            <Button size="lg" onClick={() => onApply(delay, colorA, colorB)}>
                Set
            </Button>
        </div>
    );
}

function OpenChaosParams({ onApply }: { onApply: (delay: number) => void }) {
    const [delay, setDelay] = useState(1000);
    return (
        <div className="space-y-3">
            <SliderField
                label="Delay"
                value={delay}
                min={300}
                max={4000}
                onChange={setDelay}
            />
            <Button size="lg" onClick={() => onApply(delay)}>
                Set
            </Button>
        </div>
    );
}

function TextParams({
    onApply,
}: {
    onApply: (delay: number, text: string) => void;
}) {
    const [delay, setDelay] = useState(250);
    const [text, setText] = useState("");
    return (
        <div className="space-y-3">
            <SliderField
                label="Delay"
                value={delay}
                min={20}
                max={1000}
                onChange={setDelay}
            />
            <div className="space-y-1">
                <label className="text-sm">Text</label>
                <input
                    type="text"
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            <Button size="lg" onClick={() => onApply(delay, text)}>
                Set
            </Button>
        </div>
    );
}

function MoodlightParams({ onApply }: { onApply: (mode: number) => void }) {
    const [mode, setMode] = useState(1);
    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-sm">Mode</label>
                <select
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                    value={mode}
                    onChange={(e) => setMode(Number(e.target.value))}
                >
                    <option value={1}>Colorwheel</option>
                    <option value={2}>Random</option>
                </select>
            </div>
            <Button size="lg" onClick={() => onApply(mode)}>
                Set
            </Button>
        </div>
    );
}

function MatrixParams({ onApply }: { onApply: (lines: number) => void }) {
    const [lines, setLines] = useState(16);
    return (
        <div className="space-y-3">
            <SliderField
                label="Linien"
                value={lines}
                min={1}
                max={32}
                onChange={setLines}
            />
            <Button size="lg" onClick={() => onApply(lines)}>
                Set
            </Button>
        </div>
    );
}

function FloodItParams() {
    const COLORS = [1, 2, 3, 4, 5, 6, 7, 8];
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
                {COLORS.map((n) => (
                    <Button
                        key={n}
                        size="lg"
                        variant="outline"
                        onClick={() =>
                            sendByte("kitchenlight/FloodIt/flood", n - 1, {
                                retained: true,
                            })
                        }
                    >
                        {n}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function ConwayParams({
    onApply,
}: {
    onApply: (speed: number, generations: number, fill: boolean) => void;
}) {
    const [speed, setSpeed] = useState(5);
    const [generations, setGenerations] = useState(100);
    const [fill, setFill] = useState(false);
    return (
        <div className="space-y-3">
            <SliderField
                label="Generationen/s"
                value={speed}
                min={1}
                max={19}
                onChange={setSpeed}
            />
            <SliderField
                label="Wechseln nach"
                value={generations}
                min={1}
                max={500}
                onChange={setGenerations}
            />
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={fill}
                    onChange={(e) => setFill(e.target.checked)}
                    className="size-5"
                />
                Füllen
            </label>
            <Button size="lg" onClick={() => onApply(speed, generations, fill)}>
                Set
            </Button>
        </div>
    );
}

// --- Shared field components ---

function SliderField({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm">
                {label}: {value}
            </label>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-8 touch-none"
            />
        </div>
    );
}

function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm">{label}:</label>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="size-10 rounded border border-input cursor-pointer"
            />
        </div>
    );
}

// --- Main component ---

function ScreenParams({ screen }: { screen: Screen }) {
    switch (screen) {
        case "checker":
            return (
                <CheckerParams
                    onApply={(delay, a, b) =>
                        changeScreen(buildChecker(delay, a, b))
                    }
                />
            );
        case "openchaos":
            return (
                <OpenChaosParams
                    onApply={(d) => changeScreen(buildOpenChaos(d))}
                />
            );
        case "text":
            return (
                <TextParams onApply={(d, t) => changeScreen(buildText(d, t))} />
            );
        case "moodlight":
            return (
                <MoodlightParams
                    onApply={(m) => changeScreen(buildMoodlight(m))}
                />
            );
        case "matrix":
            return (
                <MatrixParams onApply={(l) => changeScreen(buildMatrix(l))} />
            );
        case "floodit":
            return <FloodItParams />;
        case "conway":
            return (
                <ConwayParams
                    onApply={(s, g, f) => changeScreen(buildConway(s, g, f))}
                />
            );
        case "empty":
            return (
                <Button size="lg" onClick={() => changeScreen(buildSimple(0))}>
                    Set
                </Button>
            );
        case "pacman":
            return (
                <Button size="lg" onClick={() => changeScreen(buildSimple(5))}>
                    Set
                </Button>
            );
        case "sine":
            return (
                <Button size="lg" onClick={() => changeScreen(buildSimple(6))}>
                    Set
                </Button>
            );
        case "strobe":
            return (
                <Button size="lg" onClick={() => changeScreen(buildSimple(7))}>
                    Set
                </Button>
            );
        case "clock":
            return (
                <Button size="lg" onClick={() => changeScreen(buildSimple(11))}>
                    Set
                </Button>
            );
        default:
            return null;
    }
}

export default function KitchenlightControl() {
    const [screen, setScreen] = useState<Screen>("empty");

    return (
        <div className="space-y-3">
            <select
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                value={screen}
                onChange={(e) => setScreen(e.target.value as Screen)}
            >
                {SCREENS.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>
            <ScreenParams screen={screen} />
        </div>
    );
}