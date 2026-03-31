import type { PresetColor } from "@/lib/appliances";
import { rgbToHex } from "@/lib/color";
import FloppyIcon from "./FloppyIcon";

interface PresetButtonProps {
    label: string;
    colors?: PresetColor[];
    onClick: () => void;
}

export default function PresetButton({
    label,
    colors,
    onClick,
}: PresetButtonProps) {
    return (
        <button
            type="button"
            className="group w-full flex items-center gap-3 rounded-lg bg-preset hover:bg-preset-hover text-white px-4 py-4 transition-colors active:scale-[0.98] text-left"
            onClick={onClick}
        >
            <FloppyIcon className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
                <div className="font-medium leading-tight truncate">
                    {label}
                </div>
                {colors && colors.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                        {colors.slice(0, 8).map((c) => (
                            <div
                                key={c.label}
                                className="h-3.5 w-5 rounded-[3px] border border-white/30"
                                style={{
                                    backgroundColor: rgbToHex(c.color),
                                }}
                                title={c.label}
                            />
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}