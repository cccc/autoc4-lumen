/**
 * Matches an MQTT topic against a subscription pattern.
 * Supports + (single-level) and # (multi-level) wildcards.
 */
export function mqttMatchTopic(subscription: string, topic: string): boolean {
    const subLevels = subscription.split("/");
    const topicLevels = topic.split("/");
    for (let i = 0; i < subLevels.length; i++) {
        const sub = subLevels[i];
        if (sub === "#") return true;
        if (sub !== topicLevels[i] && sub !== "+") return false;
    }
    return subLevels.length === topicLevels.length;
}