// Effect channel values matching the DMX controller firmware.
// `marker` is the value written to start an effect; any value within `range`
// reads back as that effect running.
//
// This is the 7 channel mode of the "64P LED PRO" style fixtures. Channels are
// 1-based in the manual, so channel N is payload byte N - 1:
//
//   Ch 1-3  0-255    red, green, blue
//   Ch 4    0-7      nothing
//           8-255    color macro (speed on ch 5; RGB must be off)
//   Ch 5    0-15     nothing
//           16-255   strobe speed while ch 6 is unused, otherwise the
//                    macro/effect speed or sound sensitivity
//   Ch 6    0-31     nothing
//           32-63    dim -> bright
//           64-95    bright -> dim
//           96-127   dim -> bright -> dim
//           128-159  color mixing        ("fade")
//           160-191  3 color change      ("flash-less")
//           192-223  7 color change      ("flash")
//           224-255  sound active        ("sound")
//   Ch 7    0-255    dimmer
//
// Only the four effects from 128 up are implemented. They are built-in color
// programs: the fixture ignores RGB while one is running, and ch 5 is its
// speed (or sensitivity for sound).
//
// Not implemented:
// - The three dimming animations (32-127). They animate the brightness of the
//   RGB color that is set, so they need a non-black color. According to the
//   manual ch 4 and 5 do nothing in this range, so they would have no
//   parameter. Untested: whether they loop (probably as a ramp with a hard
//   jump back) and whether ch 5 really has no influence on their speed.
// - Strobe (ch 5 at 16-255 with ch 6 unused), which strobes the RGB color.
// - Color macros (ch 4).
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