import { BaseDialog, DialogCloseButton } from "@/lib/dialog";
import { DialogFooter } from "../ui/dialog";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";
import { Link } from "react-router";
import { useLiveValue } from "@/lib/hooks/useLiveValue";
import { Slider } from "@base-ui/react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface WLEDDialogProps {
    label: string;
    topic: string;
    url: string;
}
export default function WLEDDialog({ topic, label, url }: WLEDDialogProps) {
    const deviceStatus = useMQTTString(`${topic}/status`);
    const mqttBrightness = Number(useMQTTString(`${topic}/g`));
    const state =
        deviceStatus === "online"
            ? mqttBrightness !== 0
                ? "on"
                : "off"
            : "unknown";
    const { sendData } = useMQTTSend();

    function setMQTTBrightness(brightness: number) {
        // https://kno.wled.ge/interfaces/http-api/
        sendData(`${topic}/api`, `A=${brightness}`);
    }

    // debounce and optimistic updates
    const {
        value: brightness,
        change: changeBrightness,
        commit: commitBrightness,
    } = useLiveValue({
        remote: mqttBrightness,
        send: setMQTTBrightness,
    });

    function toggle() {
        // https://kno.wled.ge/interfaces/http-api/
        sendData(`${topic}/api`, "T=2");
    }

    return (
        <BaseDialog title={label}>
            <div>
                <div className="mx-auto grid w-full max-w-xs gap-1">
                    <div>
                        Device status:{" "}
                        <Switch
                            checked={state === "on"}
                            disabled={state === "unknown"}
                            onClick={toggle}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="slider-demo-temperature">
                            Brightness
                        </Label>
                        <span className="text-sm text-muted-foreground">
                            {brightness}
                        </span>
                    </div>
                    <Slider.Root
                        className="w-full"
                        value={Number(brightness) || 0}
                        onValueChange={changeBrightness}
                        onValueCommitted={commitBrightness}
                        min={0}
                        max={255}
                        disabled={state === "unknown"}
                    >
                        <Slider.Control className="relative flex w-full cursor-pointer touch-none items-center select-none">
                            <Slider.Track className="relative h-4 w-full overflow-hidden rounded-lg bg-muted">
                                <Slider.Indicator className="h-full rounded-lg bg-on" />
                            </Slider.Track>
                            <Slider.Thumb className="absolute block h-8 w-1 cursor-grab opacity-0 outline-none active:cursor-grabbing" />
                        </Slider.Control>
                    </Slider.Root>
                </div>
                <p>
                    <Link to={url} target="_blank" className="underline">
                        Open WLED Web Interface
                    </Link>
                </p>
            </div>
            <DialogFooter>
                <DialogCloseButton>Close</DialogCloseButton>
            </DialogFooter>
        </BaseDialog>
    );
}