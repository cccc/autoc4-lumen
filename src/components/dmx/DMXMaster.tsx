import { useCallback, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import type { ColorAppliance } from "@/lib/appliances";
import { useColorAppliances } from "@/lib/appliances";
import type { RGB } from "@/lib/color";
import { hexToRgb, isBlack, rgbToHex } from "@/lib/color";
import { sendByte } from "@/lib/mqtt/client";
import { mqttStore } from "@/lib/mqtt/store";
import ColorPicker from "./ColorPicker";
import {
    BaseDialog,
    DialogCloseButton,
    showDialog,
    type BaseDialogProps,
} from "@/lib/dialog";
import { DialogFooter } from "../ui/dialog";
import { LAMP_TYPES } from "@/lib/dmx/lamp-types";
import { poweroffLamp, updateLamp } from "@/lib/dmx/lamps";

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
            if (!payload) continue;

            const lampType = LAMP_TYPES[lamp.type];

            if (!lampType.supports("rgb")) continue;

            const values = lampType.decode(payload.bytes);
            const rgb = values.rgb!;

            if (!common) {
                common = rgb;
            } else {
                if (
                    common.r !== rgb.r ||
                    common.g !== rgb.g ||
                    common.b !== rgb.b
                ) {
                    allSame = false;
                    break;
                }
            }
        }

        if (!allSame || !common) return null;
        return rgbToHex(common);
    });
}

interface MasterEditorProps extends BaseDialogProps {
    lamps: ColorAppliance[];
    initialColor: RGB;
}
function MasterEditor({ title, lamps, initialColor }: MasterEditorProps) {
    const [color, setColor] = useState<RGB>(initialColor);

    const handleChange = useCallback(
        (c: RGB) => {
            setColor(c);
            for (const lamp of lamps) {
                updateLamp(lamp.topic, lamp.type, {
                    rgb: c,
                    white: 0,
                    intensity: isBlack(c) ? 0 : 255,
                    effect: null,
                });
            }
        },
        [lamps],
    );

    return (
        <BaseDialog title={title} className="sm:max-w-lg">
            <ColorPicker color={color} onChange={handleChange} />
            <DialogFooter>
                <DialogCloseButton>Close</DialogCloseButton>
            </DialogFooter>
        </BaseDialog>
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
        for (const lamp of lamps) {
            poweroffLamp(lamp.topic, lamp.type);
        }
        if (relayTopic) {
            sendByte(relayTopic, 0, { retained: true });
        }
    }

    function openEditor() {
        void showDialog(MasterEditor, {
            title: "Master",
            lamps,
            initialColor: commonHex
                ? hexToRgb(commonHex)
                : { r: 0, g: 0, b: 0 },
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