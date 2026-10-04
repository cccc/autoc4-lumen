import { useMQTTString } from "@/lib/mqtt";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import BigButton from "../ui/big-button";

interface WLEDButtonProps {
    label: string;
    topic: string;
    url: string;
}

export default function WLEDButton({ topic, label, url }: WLEDButtonProps) {
    const deviceStatus = useMQTTString(`${topic}/status`);
    const brightness = useMQTTString(`${topic}/g`);
    const state =
        deviceStatus === "online"
            ? brightness !== "0"
                ? "on"
                : "off"
            : "unknown";

    return (
        <BigButton render={<Link to={url} target="_blank" />} color={state}>
            <BigButton.Icon>
                <ExternalLink />
            </BigButton.Icon>
            <BigButton.Label>{label}</BigButton.Label>
        </BigButton>
    );
}