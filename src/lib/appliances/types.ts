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

/** Separate power relay for an appliance, rendered as a switch in its section header. */
export interface PowerControl {
    topic: string;
    /** "mqtt" reads and writes a single byte on the topic; "tasmota" uses
     *  {topic}/POWER and {topic}/cmnd/power. Defaults to "mqtt". */
    protocol?: "mqtt" | "tasmota";
}

interface AtenAppliance {
    type: "aten";
    topic: string;
    power?: PowerControl;
    room: string;
    label: string;
    tags: string[];
}

interface KitchenlightAppliance {
    type: "kitchenlight";
    power?: PowerControl;
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

interface WLEDAppliance {
    type: "wled";
    topic: string;
    url: string;
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
    | WLEDAppliance
    | PairedAppliance;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
    ? Omit<T, K>
    : never;

/** An appliance as written in a room config file; the room comes from the file. */
export type RoomAppliance = DistributiveOmit<Appliance, "room">;

/** Define the appliances of one room, in render order. */
export function defineAppliances(
    room: string,
    appliances: RoomAppliance[],
): Appliance[] {
    return appliances.map((appliance) => ({ ...appliance, room }));
}