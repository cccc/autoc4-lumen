import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useStore } from "zustand";
import { mqttStore } from "@/lib/mqtt/store";
import { mqttMatchTopic } from "@/lib/mqtt/topics";
import { cn } from "@/lib/utils";

export default function HeartbeatTable() {
    const topics = useStore(mqttStore, (s) => s.topics);

    const entries: { name: string; online: boolean }[] = [];
    for (const [topic, payload] of topics) {
        if (mqttMatchTopic("heartbeat/#", topic)) {
            const name = topic.replace("heartbeat/", "");
            entries.push({
                name,
                online: payload.bytes.length > 0 && payload.bytes[0] !== 0,
            });
        }
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    if (entries.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No heartbeat data yet.
            </p>
        );
    }

    return (
        <div>
            <h3 className="font-semibold mb-2">Infrastructure</h3>
            <div className="rounded-lg border overflow-hidden">
                {entries.map((entry, i) => (
                    <div
                        key={entry.name}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm",
                            entry.online
                                ? "bg-on/70 text-white"
                                : "bg-off/70 text-white",
                            i > 0 && "border-t border-white/20",
                        )}
                    >
                        {entry.online ? (
                            <ThumbsUp className="size-4 shrink-0" />
                        ) : (
                            <ThumbsDown className="size-4 shrink-0" />
                        )}
                        <span className="flex-1">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}