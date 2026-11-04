import { defineAppliances } from "@/lib/appliances/types";

export default defineAppliances("keller", [
    {
        type: "switch",
        topic: "licht/keller/vorne",
        label: "Vorne",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/keller/mitte",
        label: "Mitte",
        tags: ["tab/normal"],
    },
    {
        type: "paired",
        label: "Hinten",
        tags: ["tab/normal"],
        left: { topic: "led/keller/hintenkalt", label: "Kalt", tint: "cold" },
        right: { topic: "led/keller/hintenwarm", label: "Warm", tint: "warm" },
    },
    {
        type: "switch",
        topic: "licht/keller/loet",
        label: "Lötplatz",
        tags: ["tab/normal"],
    },
    {
        type: "paired",
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
        label: "Music",
        tags: ["tab/media"],
    },
]);