import { useMemo } from "react";
import type { RGB } from "./color";

interface SwitchAppliance {
    type: "switch" | "power" | "tasmota";
    topic: string;
    room: string;
    label: string;
    tags: string[];
}

export interface ColorAppliance {
    type: "dmx7ch" | "dmx4ch" | "rgb" | "rgbw";
    topic: string;
    room: string;
    label: string;
    tags: string[];
}

interface SensorAppliance {
    type: "sensor";
    topic: string;
    room: string;
    label: string;
    tags: string[];
}

interface DimmerAppliance {
    type: "dimmer";
    topic: string;
    /** Byte offset within the topic payload. Defaults to 0.
     *  Non-zero is a hack to let multiple spots share one MQTT topic; see
     *  sendByte() for the read-modify-write semantics. */
    offset?: number;
    room: string;
    label: string;
    tags: string[];
}

interface AtenAppliance {
    type: "aten";
    topic: string;
    powerTopic: string;
    room: string;
    label: string;
    tags: string[];
}

interface KitchenlightAppliance {
    type: "kitchenlight";
    room: string;
    label: string;
    tags: string[];
}

interface MusicAppliance {
    type: "music";
    room: string;
    label: string;
    tags: string[];
}

interface PairedAppliance {
    type: "paired";
    room: string;
    label: string;
    tags: string[];
    left: { topic: string; label: string; tint?: "cold" | "warm" };
    right: { topic: string; label: string; tint?: "cold" | "warm" };
}

export type Appliance =
    | SwitchAppliance
    | ColorAppliance
    | DimmerAppliance
    | SensorAppliance
    | AtenAppliance
    | KitchenlightAppliance
    | MusicAppliance
    | PairedAppliance;

/** Parse the first 3 bytes as RGB. Works for all color lamp types. */
export function parseColorFromPayload(bytes: Uint8Array): RGB | null {
    if (bytes.length < 3) return null;
    return { r: bytes[0], g: bytes[1], b: bytes[2] };
}

/** Returns all topics registered for an appliance (1 for most, 2 for paired, 0 for topicless). */
export function getApplianceTopics(appliance: Appliance): string[] {
    switch (appliance.type) {
        case "paired":
            return [appliance.left.topic, appliance.right.topic];
        case "kitchenlight":
        case "music":
            return [];
        case "aten":
            return [appliance.topic, appliance.powerTopic];
        default:
            return [appliance.topic];
    }
}

/** Check if an appliance is a color-capable type. */
export function isColorAppliance(
    appliance: Appliance,
): appliance is ColorAppliance {
    return ["dmx7ch", "dmx4ch", "rgb", "rgbw"].includes(appliance.type);
}

export { rooms, type RoomConfig } from "./rooms";

// ─── Appliance Registry ─────────────────────────────────────────

export const appliances: Appliance[] = [
    // ── Plenar ──
    {
        type: "switch",
        topic: "licht/plenar/vornewand",
        room: "plenar",
        label: "Vorne Wand",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/plenar/vornefenster",
        room: "plenar",
        label: "Vorne Fenster",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/plenar/hintenwand",
        room: "plenar",
        label: "Hinten Wand",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/plenar/hintenfenster",
        room: "plenar",
        label: "Hinten Fenster",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/plenar/amp",
        room: "plenar",
        label: "Verstärker",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/plenar/dmx",
        room: "plenar",
        label: "DMX Kannen",
        tags: ["tab/normal"],
    },
    {
        type: "tasmota",
        topic: "tasmota/plenar/hdmi-matrix",
        room: "plenar",
        label: "Matrix",
        tags: ["tab/normal"],
    },
    {
        type: "tasmota",
        topic: "tasmota/plenar/plenarsaal-pa",
        room: "plenar",
        label: "PA",
        tags: ["tab/normal"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/vorne1",
        room: "plenar",
        label: "Vorne 1",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/vorne2",
        room: "plenar",
        label: "Vorne 2",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/vorne3",
        room: "plenar",
        label: "Vorne 3",
        tags: ["tab/rgb"],
    },
    {
        type: "dimmer",
        topic: "dmx/plenar/hinten1",
        offset: 0,
        room: "plenar",
        label: "Spot Links",
        tags: ["tab/normal"],
    },
    {
        type: "dimmer",
        topic: "dmx/plenar/hinten1",
        offset: 1,
        room: "plenar",
        label: "Spot Rechts",
        tags: ["tab/normal"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/hinten2",
        room: "plenar",
        label: "Hinten 2",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/hinten3",
        room: "plenar",
        label: "Hinten 3",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/plenar/hinten4",
        room: "plenar",
        label: "Hinten 4",
        tags: ["tab/rgb"],
    },
    {
        type: "aten",
        topic: "aten/plenar",
        powerTopic: "tasmota/plenar/hdmi-matrix",
        room: "plenar",
        label: "HDMI Matrix",
        tags: ["tab/media"],
    },
    {
        type: "music",
        room: "plenar",
        label: "Music",
        tags: ["tab/media"],
    },

    // ── Wohnzimmer ──
    {
        type: "switch",
        topic: "licht/wohnzimmer/tuer",
        room: "wohnzimmer",
        label: "Tür",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/wohnzimmer/mitte",
        room: "wohnzimmer",
        label: "Mitte",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/wohnzimmer/kueche",
        room: "wohnzimmer",
        label: "Küche",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/wohnzimmer/gang",
        room: "wohnzimmer",
        label: "Gang",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "screen/wohnzimmer/infoscreen",
        room: "wohnzimmer",
        label: "Infoscreen",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "power/wohnzimmer/kitchenlight",
        room: "wohnzimmer",
        label: "LED-Wand",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/wohnzimmer/stehlampen",
        room: "wohnzimmer",
        label: "Stehlampen",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/wohnzimmer/wandlampe",
        room: "wohnzimmer",
        label: "Wandlampe",
        tags: ["tab/normal"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/mitte1",
        room: "wohnzimmer",
        label: "Mitte 1",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/mitte2",
        room: "wohnzimmer",
        label: "Mitte 2",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/mitte3",
        room: "wohnzimmer",
        label: "Mitte 3",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/tuer1",
        room: "wohnzimmer",
        label: "Tür 1",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/tuer2",
        room: "wohnzimmer",
        label: "Tür 2",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/tuer3",
        room: "wohnzimmer",
        label: "Tür 3",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/gang",
        room: "wohnzimmer",
        label: "Gang",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx7ch",
        topic: "dmx/wohnzimmer/baellebad",
        room: "wohnzimmer",
        label: "Bällebad",
        tags: ["tab/rgb"],
    },
    {
        type: "rgb",
        topic: "dmx/wohnzimmer/chaosknoten",
        room: "wohnzimmer",
        label: "Chaosknoten",
        tags: ["tab/rgb"],
    },
    {
        type: "rgbw",
        topic: "dmx/wohnzimmer/tresen",
        room: "wohnzimmer",
        label: "Tresen",
        tags: ["tab/rgb", "kueche"],
    },
    {
        type: "rgbw",
        topic: "dmx/wohnzimmer/tresen2",
        room: "wohnzimmer",
        label: "Tresen oben",
        tags: ["tab/rgb", "kueche"],
    },
    {
        type: "rgbw",
        topic: "dmx/wohnzimmer/spuele1",
        room: "wohnzimmer",
        label: "Spüle",
        tags: ["tab/rgb", "kueche"],
    },
    {
        type: "rgb",
        topic: "dmx/wohnzimmer/spuele2",
        room: "wohnzimmer",
        label: "Spüle oben",
        tags: ["tab/rgb", "kueche"],
    },
    {
        type: "kitchenlight",
        room: "wohnzimmer",
        label: "Kitchenlight",
        tags: ["tab/kl"],
    },
    {
        type: "music",
        room: "wohnzimmer",
        label: "Music",
        tags: ["tab/kl"],
    },

    // ── Fnord ──
    {
        type: "switch",
        topic: "licht/fnord/links",
        room: "fnord",
        label: "Links",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/fnord/rechts",
        room: "fnord",
        label: "Rechts",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/fnord/audio",
        room: "fnord",
        label: "Lautsprecher",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/fnord/dmx",
        room: "fnord",
        label: "DMX",
        tags: ["tab/normal"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/schranklinks",
        room: "fnord",
        label: "Schrank links",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/schrankrechts",
        room: "fnord",
        label: "Schrank rechts",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/fairyfenster",
        room: "fnord",
        label: "Fairy Fenster",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/scummfenster",
        room: "fnord",
        label: "SCUMM Fenster",
        tags: ["tab/rgb"],
    },
    {
        type: "music",
        room: "fnord",
        label: "Music",
        tags: ["tab/media"],
    },

    // ── Keller ──
    {
        type: "switch",
        topic: "licht/keller/vorne",
        room: "keller",
        label: "Vorne",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/keller/mitte",
        room: "keller",
        label: "Mitte",
        tags: ["tab/normal"],
    },
    {
        type: "paired",
        room: "keller",
        label: "Hinten",
        tags: ["tab/normal"],
        left: { topic: "led/keller/hintenkalt", label: "Kalt", tint: "cold" },
        right: { topic: "led/keller/hintenwarm", label: "Warm", tint: "warm" },
    },
    {
        type: "switch",
        topic: "licht/keller/loet",
        room: "keller",
        label: "Lötplatz",
        tags: ["tab/normal"],
    },
    {
        type: "paired",
        room: "keller",
        label: "Werkbank",
        tags: ["tab/normal"],
        left: { topic: "led/keller/werkbankkalt", label: "Kalt", tint: "cold" },
        right: {
            topic: "led/keller/werkbankwarm",
            label: "Warm",
            tint: "warm",
        },
    },
    {
        type: "music",
        room: "keller",
        label: "Music",
        tags: ["tab/media"],
    },

    // ── Sensors ──
    {
        type: "sensor",
        topic: "fenster/wohnzimmer/links",
        room: "wohnzimmer",
        label: "Fenster Links",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/wohnzimmer/rechts",
        room: "wohnzimmer",
        label: "Fenster Rechts",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/plenar/vornelinks",
        room: "plenar",
        label: "Fenster Vorne Links",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/plenar/vornerechts",
        room: "plenar",
        label: "Fenster Vorne Rechts",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/plenar/hintenlinks",
        room: "plenar",
        label: "Fenster Hinten Links",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/plenar/hintenrechts",
        room: "plenar",
        label: "Fenster Hinten Rechts",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/fnord/links",
        room: "fnord",
        label: "Fenster Links",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/fnord/rechts",
        room: "fnord",
        label: "Fenster Rechts",
        tags: ["sensor", "window"],
    },
];

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

/** Get only appliances of a specific type that supports a certain effect. */
export function hasType(
    lamps: ColorAppliance[],
    type: ColorAppliance["type"],
): boolean {
    return lamps.some((l) => l.type === type);
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

        const bytes = catalogPayloadToBytes(payload);
        const color = parseColorFromPayload(bytes);
        if (!color) continue;
        if (color.r === 0 && color.g === 0 && color.b === 0) continue;

        colors.push({ color, label: appliance.label });
    }

    return colors;
}