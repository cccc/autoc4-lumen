import mqtt, { type IClientPublishOptions } from "mqtt";
import { getDebugFlags } from "@/lib/debug";
import { mqttConfig, subscriptions } from "./config";
import { mqttStore, setConnected, setTopic } from "./store";

// mqtt.js browser build accepts Uint8Array at runtime but types only declare Buffer
declare module "mqtt" {
    interface MqttClient {
        publish(
            topic: string,
            message: Uint8Array,
            opts?: IClientPublishOptions,
        ): this;
    }
}

let client: mqtt.MqttClient | null = null;

// `fatal: true` makes decode() throw on invalid UTF-8 instead of substituting
// the replacement character (U+FFFD), so binary payloads with stray high bytes
// don't get logged as garbled strings.
const STRICT_UTF8 = new TextDecoder("utf-8", { fatal: true });

/** Format payload for debug logging: show as string if it looks like text, otherwise raw bytes. */
function formatPayload(bytes: Uint8Array): unknown {
    if (bytes.length === 0) return "(empty)";
    // Reject non-printable control chars (except common whitespace) and DEL.
    for (const b of bytes) {
        if (b === 0x7f) return bytes;
        if (b < 0x20 && b !== 0x0a && b !== 0x0d && b !== 0x09) return bytes;
    }
    // Strict UTF-8 catches lone continuation bytes, invalid leaders, etc.
    try {
        return STRICT_UTF8.decode(bytes);
    } catch {
        return bytes;
    }
}

function generateId(): string {
    return mqttConfig.clientIdPrefix + Math.random().toString(36).slice(2, 10);
}

export function connectMQTT(): mqtt.MqttClient {
    if (client) return client;

    client = mqtt.connect(mqttConfig.serverUrl, {
        clientId: generateId(),
        protocolVersion: 4,
    });

    client.on("connect", () => {
        if (getDebugFlags().connection) console.debug("MQTT connected");
        setConnected(true);
        const logSubs = getDebugFlags().subscriptions;
        for (const topic of subscriptions) {
            client!.subscribe(topic);
            if (logSubs) console.debug(`MQTT subscribe [${topic}]`);
        }
    });

    client.on("close", () => {
        if (getDebugFlags().connection)
            console.debug("MQTT disconnected, reconnecting...");
        setConnected(false);
    });

    client.on("message", (topic, payload, packet) => {
        const bytes = new Uint8Array(payload);
        if (getDebugFlags().messageReceived)
            console.debug(
                `MQTT recv [${topic}]${packet.retain ? " (retained)" : ""}`,
                formatPayload(bytes),
            );
        setTopic(topic, {
            bytes,
            string: new TextDecoder().decode(payload),
            retained: packet.retain,
        });
    });

    return client;
}

export function getMQTTClient(): mqtt.MqttClient | null {
    return client;
}

export function sendData(
    topic: string,
    data: string | Uint8Array,
    retained = false,
): void {
    const payload =
        typeof data === "string" ? new TextEncoder().encode(data) : data;
    if (getDebugFlags().messageSent)
        console.debug(`MQTT send [${topic}]`, formatPayload(payload), {
            retained,
        });
    client?.publish(topic, payload, { retain: retained });
}

export function sendByte(
    topic: string,
    value: number,
    opts?: { offset?: number; retained?: boolean },
): void {
    const retained = opts?.retained ?? false;

    // No offset → write the full topic as a single byte (the common case).
    if (opts?.offset === undefined) {
        sendData(topic, new Uint8Array([value]), retained);
        return;
    }

    // Offset specified → caller is addressing one byte inside a multi-byte
    // payload, so read-modify-write to preserve the surrounding bytes. This
    // is the shared-topic dimmer hack — see DimmerAppliance.offset. Racy if
    // two writers update the same topic simultaneously, but UI interactions
    // are sequential and retained messages reconcile.
    const { offset } = opts;
    const current = mqttStore.getState().topics.get(topic)?.bytes;
    const length = Math.max(current?.length ?? 1, offset + 1);
    const out = new Uint8Array(length);
    if (current) out.set(current);
    out[offset] = value;
    sendData(topic, out, retained);
}