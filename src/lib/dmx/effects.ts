export const EFFECTS = [
    {
        id: "fade",
        label: "Fade",
        paramLabel: "Speed",
        marker: 0x81,
        range: [0x80, 0x9f],
    },
    {
        id: "flash-less",
        label: "Flash--",
        paramLabel: "Speed",
        marker: 0xa1,
        range: [0xa0, 0xbf],
    },
    {
        id: "flash",
        label: "Flash",
        paramLabel: "Speed",
        marker: 0xc1,
        range: [0xc0, 0xdf],
    },
    {
        id: "sound",
        label: "Sound",
        paramLabel: "Sensitivity",
        marker: 0xe1,
        range: [0xe0, 0xff],
    },
] as const;

export type Effect = (typeof EFFECTS)[number];
export type EffectId = Effect["id"];

/** Lowest effect channel value that means an effect is running. */
export const EFFECT_MARKER_MIN = 0x80;

/** The effect a raw effect channel value belongs to, if any. */
export function findEffect(marker: number): Effect | undefined {
    return EFFECTS.find((e) => marker >= e.range[0] && marker <= e.range[1]);
}