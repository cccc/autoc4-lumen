import { Slider } from "@base-ui/react/slider";
import { Sun } from "lucide-react";
import { useState } from "react";
import { useMQTTByte } from "@/lib/mqtt";
import { sendByte } from "@/lib/mqtt/client";
import { cn } from "@/lib/utils";

interface DimmerButtonProps {
    topic: string;
    label: string;
    offset?: number;
}

export default function DimmerButton({
    topic,
    label,
    offset = 0,
}: DimmerButtonProps) {
    const mqttBrightness = useMQTTByte(topic, { offset }) ?? 0;

    // Local state for smooth dragging — only send MQTT on release
    const [localValue, setLocalValue] = useState<number | null>(null);
    const [interacting, setInteracting] = useState(false);

    const brightness = localValue ?? mqttBrightness;
    const isOn = brightness > 0;

    // Clear local override once MQTT value catches up
    if (localValue !== null && !interacting && mqttBrightness === localValue) {
        setLocalValue(null);
    }

    function toggle() {
        sendByte(topic, isOn ? 0 : 255, { offset, retained: true });
    }

    return (
        <div className="w-full aspect-square flex flex-col gap-1">
            <button
                type="button"
                className={cn(
                    "w-full flex-1 min-h-0 rounded-lg flex flex-col items-center justify-center gap-1.5 font-medium text-white transition-colors active:scale-95",
                    isOn
                        ? "bg-on hover:bg-on-hover"
                        : "bg-off hover:bg-off-hover",
                )}
                onClick={toggle}
            >
                <Sun className="size-12" strokeWidth={1.25} />
                <span className="text-xs leading-tight text-center px-1">
                    {label}
                </span>
            </button>
            <div className="w-full">
                <Slider.Root
                    className="w-full"
                    value={brightness}
                    onValueChange={(value) => {
                        setInteracting(true);
                        setLocalValue(value);
                    }}
                    onValueCommitted={(value) => {
                        setInteracting(false);
                        sendByte(topic, value, { offset, retained: true });
                    }}
                    min={0}
                    max={255}
                >
                    <Slider.Control className="relative flex w-full cursor-pointer touch-none items-center select-none">
                        <Slider.Track className="relative h-8 w-full overflow-hidden rounded-lg bg-muted">
                            <Slider.Indicator className="h-full rounded-lg bg-on" />
                        </Slider.Track>
                        <Slider.Thumb className="absolute block h-8 w-1 cursor-grab opacity-0 outline-none active:cursor-grabbing" />
                    </Slider.Control>
                </Slider.Root>
            </div>
        </div>
    );
}