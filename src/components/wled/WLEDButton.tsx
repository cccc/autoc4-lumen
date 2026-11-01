import { useMQTTString } from "@/lib/mqtt";
import { Star } from "lucide-react";
import BigButton from "../ui/big-button";
import WLEDDialog from "./WLEDDialog";
import { showDialog } from "@/lib/dialog";

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

    function openDialog() {
        console.log("Opening WLED dialog for", topic, label, url);
        void showDialog(WLEDDialog, { topic, label, url });
    }

    return (
        <BigButton color={state} onClick={openDialog}>
            <BigButton.Icon>
                <Star />
            </BigButton.Icon>
            <BigButton.Label>{label}</BigButton.Label>
        </BigButton>
    );
}