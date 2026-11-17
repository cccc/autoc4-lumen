import type { RGB } from "../color";
import { EFFECT_MARKER_MIN } from "./effects";

type EffectValue = {
    /** Raw effect channel value; see findEffect() for what it means. */
    marker: number;
    /** Speed or sensitivity, depending on the effect. */
    param: number;
} | null;

export interface CapabilityValues {
    rgb: RGB;
    white: number;
    intensity: number;
    zoom: number;
    effect: EffectValue;
}
export type Capability = keyof CapabilityValues;

export type CapabilityParams<C extends Capability> = {
    [key in C]: CapabilityValues[key];
};

type Codec<T> = {
    expectedLength: number;
    encode: (value: T) => Uint8Array;
    decode: (data: Uint8Array) => T;
};
function singleByteCodec(defaultValue: number): Codec<number> {
    return {
        expectedLength: 1,
        encode: (value: number) => new Uint8Array([value]),
        decode: (data: Uint8Array) => data[0] ?? defaultValue,
    };
}

type CapabilityDefinitions = {
    [key in Capability]: {
        label: string;
        off?: CapabilityValues[key];
        codec: Codec<CapabilityValues[key]>;
    };
};
export const CAPABILITIES: CapabilityDefinitions = {
    rgb: {
        label: "RGB",
        off: { r: 0, g: 0, b: 0 },
        codec: {
            expectedLength: 3,
            encode: (value: RGB) => new Uint8Array([value.r, value.g, value.b]),
            decode: (data: Uint8Array) => {
                return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0 };
            },
        },
    },
    white: {
        label: "White",
        off: 0,
        codec: singleByteCodec(0),
    },
    intensity: {
        label: "Intensity",
        off: 0,
        codec: singleByteCodec(0),
    },
    zoom: {
        label: "Zoom",
        codec: singleByteCodec(0),
    },
    effect: {
        label: "Effect",
        off: null,
        codec: {
            expectedLength: 2,
            encode: (value: EffectValue) =>
                new Uint8Array([value?.param ?? 0, value?.marker ?? 0]),
            decode: (data: Uint8Array) => {
                if (data.length < 2) return null;
                const [param, marker] = data;
                if (marker < EFFECT_MARKER_MIN) return null;
                return { marker, param };
            },
        },
    },
};
export const OFF_CAPABILITY_VALUES = {
    rgb: { r: 0, g: 0, b: 0 },
    white: 0,
    intensity: 0,
    effect: null,
} as const;