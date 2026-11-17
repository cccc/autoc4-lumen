import { useMemo } from "react";
import { appliances } from "@/config/appliances";
import { RGB } from "@/lib/color";
import type { Appliance, ColorAppliance } from "./types";
import { LAMP_TYPES } from "../dmx/lamp-types";

export * from "./types";

/** Returns all topics registered for an appliance (1 for most, 2 for paired, 0 for topicless). */
export function getApplianceTopics(appliance: Appliance): string[] {
    switch (appliance.type) {
        case "paired":
            return [appliance.left.topic, appliance.right.topic];
        case "music":
            return [];
        case "kitchenlight":
            return appliance.power ? [appliance.power.topic] : [];
        case "aten":
            return appliance.power
                ? [appliance.topic, appliance.power.topic]
                : [appliance.topic];
        default:
            return [appliance.topic];
    }
}

/** Check if an appliance is a color-capable type. */
export function isColorAppliance(
    appliance: Appliance,
): appliance is ColorAppliance {
    return ["dmx7ch", "dmx4ch", "rgb", "rgbw", "zrgbw"].includes(
        appliance.type,
    );
}

// ─── Hook ───────────────────────────────────────────────────────

interface UseAppliancesOpts {
    room: string;
    only?: string[];
    except?: string[];
}

export function useAppliances({
    room,
    only,
    except,
}: UseAppliancesOpts): Appliance[] {
    return useMemo(() => {
        return appliances.filter((a) => {
            if (a.room !== room) return false;
            if (only && !only.some((tag) => a.tags.includes(tag))) return false;
            if (except && except.some((tag) => a.tags.includes(tag)))
                return false;
            return true;
        });
    }, [room, only, except]);
}

/** Get only color-capable appliances, with the same tag filtering as useAppliances. */
export function useColorAppliances(opts: UseAppliancesOpts): ColorAppliance[] {
    const all = useAppliances(opts);
    return useMemo(() => all.filter(isColorAppliance), [all]);
}

/** Look up an appliance by topic. */
export function findApplianceByTopic(topic: string): Appliance | undefined {
    return appliances.find((a) => getApplianceTopics(a).includes(topic));
}

/** Convert a catalog payload string (one char per byte) to Uint8Array. */
export function catalogPayloadToBytes(payload: string): Uint8Array {
    return new Uint8Array([...payload].map((c) => c.charCodeAt(0)));
}

export interface PresetColor {
    color: RGB;
    label: string;
}

/**
 * Extract colors with lamp labels from a preset catalog entry.
 * Uses the appliance registry to identify color lamps and parse their payloads.
 */
export function extractPresetColors(
    presetTopics: Record<string, string>,
): PresetColor[] {
    const colors: PresetColor[] = [];

    for (const [topic, payload] of Object.entries(presetTopics)) {
        const appliance = findApplianceByTopic(topic);
        if (!appliance || !isColorAppliance(appliance)) continue;

        const lampType = LAMP_TYPES[appliance.type];

        if (!lampType.supports("rgb")) continue;
        const values = lampType.decode(catalogPayloadToBytes(payload));

        if (values.rgb && !RGB.isBlack(values.rgb))
            colors.push({ color: values.rgb, label: appliance.label });
    }

    return colors;
}