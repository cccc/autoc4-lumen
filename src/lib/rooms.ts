// ─── Module Types ──────────────────────────────────────────────
// Each tab's content is an ordered array of modules. The renderer
// iterates them top-to-bottom with no conditional logic.

export type Module =
    | { type: "heading"; text: string }
    | { type: "separator" }
    | { type: "appliances"; tags: string[]; except?: string[]; cols?: number }
    | {
          type: "dmx-master";
          tags: string[];
          except?: string[];
          relayTopic?: string;
      }
    | { type: "dmx-controls"; tags: string[]; except?: string[] }
    | { type: "presets" };

// ─── Room / Tab Config ─────────────────────────────────────────

export interface TabConfig {
    id: string;
    label: string;
    modules: Module[];
}

export interface RoomConfig {
    id: string;
    label: string;
    tabs: TabConfig[];
}

// ─── Rooms ─────────────────────────────────────────────────────

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