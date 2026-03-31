import { useCallback, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import type { ColorAppliance } from "@/lib/appliances";
import { useColorAppliances } from "@/lib/appliances";
import type { RGB } from "@/lib/color";
import { hexToRgb, rgbToHex } from "@/lib/color";
import { useMQTTSend } from "@/lib/mqtt";
import { sendByte, sendData } from "@/lib/mqtt/client";
import { mqttStore } from "@/lib/mqtt/store";
import { closeDialog, showDialog } from "@/lib/dialog";
import ColorPicker from "./ColorPicker";

function buildMasterPayload(type: ColorAppliance["type"], c: RGB): Uint8Array {
    const isBlack = c.r === 0 && c.g === 0 && c.b === 0;
    switch (type) {
        case "rgb":
            return new Uint8Array([c.r, c.g, c.b]);
        case "rgbw":
            return new Uint8Array([c.r, c.g, c.b, 0]);
        case "dmx4ch":
            return new Uint8Array([c.r, c.g, c.b, isBlack ? 0 : 255]);
        case "dmx7ch":
            return new Uint8Array([c.r, c.g, c.b, 0, 0, 0, isBlack ? 0 : 255]);
    }
}

function useCommonColorHex(
    room: string,
    only?: string[],
    except?: string[],
): string | null {
    const lamps = useColorAppliances({ room, only, except });
    return useStore(mqttStore, (state) => {
        let common: RGB | null = null;
        let allSame = true;

        for (const lamp of lamps) {
            const payload = state.topics.get(lamp.topic);
            if (!payload || payload.bytes.length < 3) continue;
            const r = payload.bytes[0];
            const g = payload.bytes[1];
            const b = payload.bytes[2];
            if (common === null) {
                common = { r, g, b };
            } else if (r !== common.r || g !== common.g || b !== common.b) {
                allSame = false;
                break;
            }
        }

        if (!allSame || !common) return null;
        return rgbToHex(common);
    });
}

function MasterEditor({
    lamps,
    initialColor,
}: {
    lamps: ColorAppliance[];
    initialColor: RGB;
}) {
    const [color, setColor] = useState<RGB>(initialColor);
    const { sendData: send } = useMQTTSend();

    const handleChange = useCallback(
        (c: RGB) => {
            setColor(c);
            for (const lamp of lamps) {
                send(lamp.topic, buildMasterPayload(lamp.type, c), true);
            }
        },
        [lamps, send],
    );

    return (
        <div className="space-y-3">
            <ColorPicker color={color} onChange={handleChange} />
            <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
                onClick={() => closeDialog()}
            >
                Close
            </button>
        </div>
    );
}

interface DMXMasterProps {
    room: string;
    relayTopic?: string;
    only?: string[];
    except?: string[];
}

export default function DMXMaster({
    room,
    relayTopic,
    only,
    except,
}: DMXMasterProps) {
    const commonHex = useCommonColorHex(room, only, except);
    const lamps = useColorAppliances({ room, only, except });
    const isOff = commonHex === "#000000";
    const showColor = commonHex && !isOff;

    function powerOffAll() {
        const black = { r: 0, g: 0, b: 0 };
        for (const lamp of lamps) {
            sendData(lamp.topic, buildMasterPayload(lamp.type, black), true);
        }
        if (relayTopic) {
            sendByte(relayTopic, 0, { retained: true });
        }
    }

    function openEditor() {
        showDialog({
            title: "Master",
            className: "sm:max-w-lg",
            content: (
                <MasterEditor
                    lamps={lamps}
                    initialColor={
                        commonHex ? hexToRgb(commonHex) : { r: 0, g: 0, b: 0 }
                    }
                />
            ),
        });
    }

    return (
        <div className="@container flex items-stretch gap-3 mb-3 w-full rounded-lg border-2 border-border overflow-hidden">
            <button
                type="button"
                className="w-20 shrink-0 active:scale-95 transition-transform"
                style={
                    showColor
                        ? { backgroundColor: commonHex }
                        : commonHex === null
                          ? {
                                backgroundColor: "var(--muted)",
                                backgroundImage:
                                    "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(128,128,128,0.1) 4px, rgba(128,128,128,0.1) 5px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(128,128,128,0.1) 4px, rgba(128,128,128,0.1) 5px)",
                            }
                          : {
                                backgroundColor: "var(--muted)",
                                backgroundImage:
                                    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(128,128,128,0.1) 4px, rgba(128,128,128,0.1) 5px)",
                            }
                }
                onClick={openEditor}
                title="Set master color"
            />
            <div className="flex items-center gap-3 py-2.5 pr-3 flex-1 min-w-0">
                <span
                    className="font-semibold text-sm"
                    title={
                        relayTopic
                            ? `Linked to relay: ${relayTopic}`
                            : undefined
                    }
                >
                    Master
                </span>
                <div className="flex-1" />
                <Button
                    size="lg"
                    variant="outline"
                    className="hidden @min-[294px]:inline-flex"
                    onClick={openEditor}
                >
                    Color
                </Button>
                <Button size="lg" variant="destructive" onClick={powerOffAll}>
                    Off
                </Button>
            </div>
        </div>
    );
}