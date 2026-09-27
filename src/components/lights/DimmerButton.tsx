import { Slider } from "@base-ui/react/slider";
import { Sun } from "lucide-react";
import { useLiveValue } from "@/lib/hooks/useLiveValue";
import { sendByte, useMQTTByte } from "@/lib/mqtt";
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
    const {
        value: brightness,
        change,
        commit,
    } = useLiveValue({
        // undefined until the topic (or this byte of it) has been received
        remote: useMQTTByte(topic, { offset }),
        send: (value) => sendByte(topic, value, { offset, retained: true }),
        interval: 25,
    });

    const isUnknown = brightness === undefined;
    const isOn = brightness !== undefined && brightness > 0;

    function toggle() {
        commit(isOn ? 0 : 255);
    }

    return (
        <div className="w-full aspect-square flex flex-col gap-1">
            <button
                type="button"
                className={cn(
                    "w-full flex-1 min-h-0 rounded-lg flex flex-col items-center justify-center gap-1.5 font-medium text-white transition-colors active:scale-95",
                    isUnknown && "bg-muted text-muted-foreground",
                    !isUnknown && isOn && "bg-on hover:bg-on-hover",
                    !isUnknown && !isOn && "bg-off hover:bg-off-hover",
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
                    value={brightness ?? 0}
                    onValueChange={(value) => change(value)}
                    onValueCommitted={(value) => commit(value)}
                    min={0}
                    max={255}
                    disabled={isUnknown}
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