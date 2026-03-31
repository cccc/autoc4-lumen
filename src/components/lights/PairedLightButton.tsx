import { useMQTTByte, useMQTTSend } from "@/lib/mqtt";
import { cn } from "@/lib/utils";
import { Lightbulb, Snowflake, Sun } from "lucide-react";

interface HalfProps {
    topic: string;
    label: string;
    tint?: "cold" | "warm";
}

interface PairedLightButtonProps {
    label: string;
    left: HalfProps;
    right: HalfProps;
}

function Half({
    topic,
    label,
    tint,
    side,
}: HalfProps & { side: "left" | "right" }) {
    const byte = useMQTTByte(topic);
    const { sendByte } = useMQTTSend();
    const isOn = byte !== undefined && byte !== 0;
    const isUnknown = byte === undefined;

    const Icon =
        tint === "cold" ? Snowflake : tint === "warm" ? Sun : Lightbulb;

    return (
        <button
            type="button"
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-white transition-colors active:scale-95",
                side === "left" && "rounded-l-lg",
                side === "right" && "rounded-r-lg",
                isUnknown && "bg-muted text-muted-foreground",
                !isUnknown &&
                    isOn &&
                    tint === "cold" &&
                    "bg-tint-cold hover:bg-tint-cold-hover",
                !isUnknown &&
                    isOn &&
                    tint === "warm" &&
                    "bg-tint-warm hover:bg-tint-warm-hover",
                !isUnknown && isOn && !tint && "bg-on hover:bg-on-hover",
                !isUnknown && !isOn && "bg-off hover:bg-off-hover",
            )}
            onClick={() => sendByte(topic, isOn ? 0 : 1, { retained: true })}
        >
            <Icon className="size-9" strokeWidth={1.25} />
            <span>{label}</span>
        </button>
    );
}

export default function PairedLightButton({
    label,
    left,
    right,
}: PairedLightButtonProps) {
    return (
        <div className="relative w-full aspect-square">
            <div className="absolute inset-0 flex gap-px">
                <Half {...left} side="left" />
                <Half {...right} side="right" />
            </div>
            <span className="absolute inset-x-0 top-2 text-center text-xs font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pointer-events-none">
                {label}
            </span>
        </div>
    );
}