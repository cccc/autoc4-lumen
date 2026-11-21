import { Slider } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

interface NumberSliderProps {
    value: number;
    /** Called continuously while dragging. */
    onChange: (value: number) => void;
    /** Called with the final value when the slider is released. */
    onCommit?: (value: number) => void;
    min?: number;
    max: number;
    /** Fill color of the selected range; defaults to the primary color. */
    color?: string;
    disabled?: boolean;
    className?: string;
}

/** A horizontal slider for a single number. */
export function NumberSlider({
    value,
    onChange,
    onCommit,
    min = 0,
    max,
    color,
    disabled,
    className,
}: NumberSliderProps) {
    return (
        <Slider.Root
            className={cn("w-full", className)}
            value={value}
            onValueChange={(v) => onChange(v)}
            onValueCommitted={(v) => onCommit?.(v)}
            min={min}
            max={max}
            disabled={disabled}
            thumbAlignment="edge"
        >
            <Slider.Control className="relative flex min-h-8 w-full touch-none items-center select-none data-disabled:opacity-50">
                <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted select-none">
                    <Slider.Indicator
                        className="h-full bg-primary select-none"
                        style={color ? { backgroundColor: color } : undefined}
                    />
                </Slider.Track>
                <Slider.Thumb className="relative block size-4 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3" />
            </Slider.Control>
        </Slider.Root>
    );
}