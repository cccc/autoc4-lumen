const HTTP_PROTOCOL_REPLACEMENT_REGEX = /^http(s?):\/\//;

export const mqttConfig = {
    serverUrl: new URL(
        import.meta.env.VITE_MQTT_SERVER_URL,
        globalThis.location.href,
    ).href.replace(HTTP_PROTOCOL_REPLACEMENT_REGEX, "ws$1://"),
    clientIdPrefix: import.meta.env.VITE_MQTT_CLIENT_PREFIX ?? "lumen_",
};

/** All MQTT topic subscriptions, centralized. */
export const subscriptions = [
    // Lights & switches
    "licht/+/+",
    "led/+/+",
    "power/+/+",
    "relais/+/+",
    "tasmota/+/+/POWER",
    "socket/+/+/+",
    "screen/+/+",

    // DMX
    "dmx/+/+",

    // Club state
    "club/status",
    "club/status/message",
    "club/shutdown",
    "club/gate",

    // Infrastructure
    "heartbeat/#",
    "fenster/+/+",

    // Music
    "mpd/+/state",
    "mpd/+/song",

    // Presets
    "preset/+/catalog",

    // Time
    "time",

    // Aten HDMI Matrix
    "aten/+/connection",
    "aten/+/state",

    // Busleiste
    "busleiste/modules",
    "busleiste/modules/+/enabled",
    "busleiste/active_module",
    "busleiste/active_interrupt",

    // Remote reload
    "interface/lumen/reload",

    // Color swatches
    "interface/lumen/swatches",
] as const;