import { DoorClosed, DoorOpen } from "lucide-react";
import { useMQTTByte } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

interface WindowSensorProps {
    topic: string;
    label: string;
}

export default function WindowSensor({ topic, label }: WindowSensorProps) {
    const byte = useMQTTByte(topic);
    const isOpen = byte !== undefined && byte !== 0;
    const isUnknown = byte === undefined;

    const Icon = isOpen ? DoorOpen : DoorClosed;

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg min-w-32",
                isUnknown && "bg-muted text-muted-foreground",
                !isUnknown &&
                    isOpen &&
                    "bg-off/70 text-white border border-off",
                !isUnknown &&
                    !isOpen &&
                    "bg-secondary text-secondary-foreground border border-border",
            )}
        >
            <Icon className="size-6 shrink-0" />
            <span className="font-medium">{label}</span>
        </div>
    );
}