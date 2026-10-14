import { useAdmin } from "@/lib/admin-context";
import { useMQTTByte, useMQTTConnected, useMQTTString } from "@/lib/mqtt";
import { cn } from "cn";
import { CircleCheck, CircleDashed, CircleMinus } from "lucide-react";

export default function StatusIndicator({
    variant,
}: {
    variant: "navbar" | "sidebar";
}) {
    const connected = useMQTTConnected();
    const clubStatus = useMQTTByte("club/status");
    // "\0" is the retained "no message" value, since MQTT can't retain an empty payload
    const clubStatusMessage = useMQTTString("club/status/message") || "\0";
    const { handleClickTrigger } = useAdmin();
    const isOpen = clubStatus !== undefined && clubStatus !== 0;

    let label: string;
    let colorClass: string;
    let Icon: typeof CircleCheck;

    if (!connected) {
        label = "Disconnected";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (clubStatus === undefined) {
        label = "Unknown";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (isOpen) {
        label = "Open";
        colorClass = "text-status-open";
        Icon = CircleCheck;
    } else {
        label = "Closed";
        colorClass = "text-status-closed";
        Icon = CircleMinus;
    }

    const statusDescr = !connected
        ? "Disconnected"
        : `Club is ${label.toLowerCase()}`;

    const title =
        clubStatusMessage !== "\0"
            ? `${statusDescr}\n\n${clubStatusMessage}`
            : statusDescr;

    return (
        <button
            type="button"
            className={cn(
                "items-center text-sm transition-colors",
                variant === "navbar"
                    ? "inline-flex justify-center gap-1.5 h-9 px-2 rounded-md"
                    : "flex gap-3 w-full px-4 py-3 text-left",
                colorClass,
            )}
            onClick={handleClickTrigger}
            title={title}
        >
            <Icon className="size-4" />
            <span className={cn(variant === "navbar" && "hidden lg:inline")}>
                {label}
            </span>
        </button>
    );
}