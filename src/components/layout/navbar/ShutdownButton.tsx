import type { ComponentProps, MouseEvent } from "react";
import { confirm } from "@/lib/confimation-dialog";
import { useMQTTSend } from "@/lib/mqtt";
import { Power } from "lucide-react";

export default function ShutdownButton({
    onClick,
    ...props
}: ComponentProps<"button">) {
    const { sendByte } = useMQTTSend();

    function handleShutdown(e: MouseEvent<HTMLButtonElement>) {
        onClick?.(e);
        void confirm({
            title: "Shutdown",
            description:
                "Are you sure you want to shut down the club? This will result in many of the lamps and electrical devices being turned off.\n\nBefore shutting down the club make sure all windows are closed.",
            confirmLabel: (
                <span className="inline-flex items-center gap-1.5">
                    <Power className="size-4" /> Shutdown
                </span>
            ),
        }).then((result) => result && sendByte("club/shutdown", 0));
    }

    return <button type="button" {...props} onClick={handleShutdown} />;
}