import type { RoomConfig } from "@/lib/rooms";

export const rooms: RoomConfig[] = [
    {
        id: "wohnzimmer",
        label: "Wohnzimmer",
        tabs: [
            {
                id: "normal",
                label: "Normal",
                modules: [{ type: "appliances", tags: ["tab/normal"] }],
            },
            {
                id: "rgb",
                label: "RGB",
                modules: [
                    {
                        type: "dmx-master",
                        tags: ["tab/rgb"],
                        except: ["kueche"],
                    },
                    {
                        type: "appliances",
                        tags: ["tab/rgb"],
                        except: ["kueche"],
                        cols: 3,
                    },
                    {
                        type: "dmx-controls",
                        tags: ["tab/rgb"],
                        except: ["kueche"],
                    },
                    { type: "separator" },
                    { type: "heading", text: "Küche" },
                    { type: "appliances", tags: ["kueche"], cols: 2 },
                ],
            },
            {
                id: "kl",
                label: "KL",
                modules: [{ type: "appliances", tags: ["tab/kl"] }],
            },
        ],
    },
    {
        id: "plenar",
        label: "Plenarsaal",
        tabs: [
            {
                id: "normal",
                label: "Normal",
                modules: [{ type: "appliances", tags: ["tab/normal"] }],
            },
            {
                id: "rgb",
                label: "RGB",
                modules: [
                    {
                        type: "dmx-master",
                        tags: ["tab/rgb"],
                        relayTopic: "relais/plenar/dmx",
                    },
                    { type: "appliances", tags: ["tab/rgb"], cols: 3 },
                    { type: "dmx-controls", tags: ["tab/rgb"] },
                ],
            },
            {
                id: "media",
                label: "Media",
                modules: [{ type: "appliances", tags: ["tab/media"] }],
            },
        ],
    },
    {
        id: "fnord",
        label: "Fnordcenter",
        tabs: [
            {
                id: "normal",
                label: "Normal",
                modules: [{ type: "appliances", tags: ["tab/normal"] }],
            },
            {
                id: "rgb",
                label: "RGB",
                modules: [
                    {
                        type: "dmx-master",
                        tags: ["tab/rgb"],
                        relayTopic: "relais/fnord/dmx",
                    },
                    { type: "appliances", tags: ["tab/rgb"], cols: 2 },
                    { type: "dmx-controls", tags: ["tab/rgb"] },
                ],
            },
            {
                id: "media",
                label: "Media",
                modules: [{ type: "appliances", tags: ["tab/media"] }],
            },
        ],
    },
    {
        id: "keller",
        label: "Keller",
        tabs: [
            {
                id: "normal",
                label: "Normal",
                modules: [{ type: "appliances", tags: ["tab/normal"] }],
            },
            {
                id: "media",
                label: "Media",
                modules: [{ type: "appliances", tags: ["tab/media"] }],
            },
        ],
    },
];