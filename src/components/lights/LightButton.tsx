import { cn } from "@/lib/utils";
import { Lightbulb, LightbulbOff, Power } from "lucide-react";
import BigButton from "./BigButton";
import MQTTSwitch from "./MQTTSwitch";

interface LightButtonProps {
    topic: string;
    variant?: "light" | "power";
    children: React.ReactNode;
}

export default function LightButton({
    topic,
    variant = "light",
    children,
}: LightButtonProps) {
    return (
        <MQTTSwitch topic={topic}>
            {(state, toggle) => {
                const Icon =
                    variant === "power"
                        ? Power
                        : state === "on"
                          ? Lightbulb
                          : LightbulbOff;

                return (
                    <BigButton
                        onClick={toggle}
                        className={cn(
                            state === "unknown" &&
                                "bg-muted text-muted-foreground",
                            state === "on" && "bg-on hover:bg-on-hover",
                            state === "off" && "bg-off hover:bg-off-hover",
                        )}
                    >
                        <Icon className="size-12" strokeWidth={1.25} />
                        <span className="text-xs leading-tight text-center px-1">
                            {children}
                        </span>
                    </BigButton>
                );
            }}
        </MQTTSwitch>
    );
}