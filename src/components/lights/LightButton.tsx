import { Lightbulb, LightbulbOff, Power } from "lucide-react";
import BigButton from "../ui/big-button";
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
                    <BigButton onClick={toggle} color={state}>
                        <BigButton.Icon>
                            <Icon />
                        </BigButton.Icon>
                        <BigButton.Label>{children}</BigButton.Label>
                    </BigButton>
                );
            }}
        </MQTTSwitch>
    );
}