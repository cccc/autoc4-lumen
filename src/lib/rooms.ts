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