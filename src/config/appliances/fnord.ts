import { defineAppliances } from "@/lib/appliances/types";

export default defineAppliances("fnord", [
    {
        type: "switch",
        topic: "licht/fnord/links",
        label: "Links",
        tags: ["tab/normal"],
    },
    {
        type: "switch",
        topic: "licht/fnord/rechts",
        label: "Rechts",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/fnord/audio",
        label: "Lautsprecher",
        tags: ["tab/normal"],
    },
    {
        type: "power",
        topic: "relais/fnord/dmx",
        label: "DMX",
        tags: ["tab/normal"],
    },
    {
        type: "wled",
        topic: "wled/fnord/wled-1",
        url: "http://wled-fnord.local/",
        label: "WLED 1",
        tags: ["tab/normal"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/schranklinks",
        label: "Schrank links",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/schrankrechts",
        label: "Schrank rechts",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/fairyfenster",
        label: "Fairy Fenster",
        tags: ["tab/rgb"],
    },
    {
        type: "dmx4ch",
        topic: "dmx/fnord/scummfenster",
        label: "SCUMM Fenster",
        tags: ["tab/rgb"],
    },
    {
        type: "music",
        label: "Music",
        tags: ["tab/media"],
    },
    {
        type: "sensor",
        topic: "fenster/fnord/links",
        label: "Fenster Links",
        tags: ["sensor", "window"],
    },
    {
        type: "sensor",
        topic: "fenster/fnord/rechts",
        label: "Fenster Rechts",
        tags: ["sensor", "window"],
    },
]);