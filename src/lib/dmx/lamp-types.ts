import {
    CAPABILITIES,
    OFF_CAPABILITY_VALUES,
    type Capability,
    type CapabilityValues,
} from "./capabilities";
import { RGB } from "../color";

export type LampParams = Partial<CapabilityValues>;

interface LampTypeDefinition {
    label: string;
    capabilities: Capability[];
    encode: (value: LampParams) => Uint8Array;
    decode: (data: Uint8Array) => LampParams;
    supports: (capability: Capability) => boolean;
    poweroff: (value: LampParams) => LampParams;
    update: (value: LampParams, patch: LampParams) => LampParams;
}

function createLampType<C extends Capability>(
    label: string,
    capabilities: (C | number)[],
): LampTypeDefinition {
    const fields: { cap: C; offset: number }[] = [];
    let offset = 0;
    for (const cap of capabilities) {
        if (typeof cap === "number") {
            offset += cap;
            continue;
        }
        fields.push({ cap: cap, offset });
        const codec = CAPABILITIES[cap].codec;
        offset += codec.expectedLength;
    }
    const expectedLength = offset;

    const capabilitiesArr = capabilities.filter(
        (c): c is C => typeof c !== "number",
    );
    const capabilitiesSet = new Set<Capability>(capabilitiesArr);

    return {
        label: label,
        capabilities: capabilitiesArr,
        encode: (value) => {
            const data = new Uint8Array(expectedLength);
            for (const { cap, offset } of fields) {
                const v = value[cap];
                if (v === undefined) continue;
                const encoded = CAPABILITIES[cap].codec.encode(v);
                data.set(encoded, offset);
            }
            return data;
        },
        decode: (data) => {
            const result: LampParams = {};
            for (const { cap, offset } of fields) {
                const codec = CAPABILITIES[cap].codec;
                const slice = data.slice(offset, offset + codec.expectedLength);
                result[cap] = codec.decode(slice);
            }
            return result;
        },
        supports: (capability: Capability) => {
            return capabilitiesSet.has(capability);
        },
        poweroff: (value: LampParams) => {
            return { ...value, ...OFF_CAPABILITY_VALUES };
        },
        update: (value: LampParams, patch: LampParams) => {
            const next = { ...value, ...patch };

            // Color and effect are mutually exclusive; whichever the patch
            // sets wins. This holds for the implemented effects, which are
            // color programs that ignore RGB. Effects that animate the set
            // color (see effects.ts) would have to keep it.
            if (patch.effect) {
                next.rgb = RGB.BLACK;
            } else if (
                patch.rgb &&
                !RGB.isBlack(patch.rgb) &&
                patch.effect === undefined
            ) {
                next.effect = null;
            }

            // Without an explicit intensity, starting an effect or setting a
            // color turns the lamp fully on, and setting black turns it off.
            // A color patch on a lamp that keeps running an effect (where
            // RGB is black) leaves the intensity alone.
            if (patch.intensity === undefined) {
                if (patch.effect) {
                    next.intensity = 255;
                } else if (patch.rgb && !next.effect) {
                    next.intensity = RGB.isBlack(patch.rgb) ? 0 : 255;
                }
            }

            return next;
        },
    };
}

export const LAMP_TYPES = {
    rgb: createLampType("RGB", ["rgb"]),
    rgbw: createLampType("RGBW", ["rgb", "white"]),
    dmx4ch: createLampType("DMX 4CH", ["rgb", "intensity"]),
    zrgbw: createLampType("ZRGBW", ["zoom", "rgb", "white"]),
    dmx7ch: createLampType("DMX 7CH", ["rgb", 1, "effect", "intensity"]),
} as const;
export type LampType = keyof typeof LAMP_TYPES;