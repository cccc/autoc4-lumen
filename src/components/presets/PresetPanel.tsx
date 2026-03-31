import { Lightbulb, LightbulbOff } from "lucide-react";
import { extractPresetColors, rooms } from "@/lib/appliances";
import { useMQTTJSON, useMQTTSend } from "@/lib/mqtt";
import PresetButton from "./PresetButton";

interface CatalogEntry {
    name: string;
    topics: Record<string, string>;
}

/** The preset button grid for a single room. No card wrapper. */
export function RoomPresetGrid({ room }: { room: string }) {
    const catalog = useMQTTJSON<CatalogEntry[]>(`preset/${room}/catalog`);
    const { sendData } = useMQTTSend();

    function applyPreset(preset: string) {
        sendData(`preset/${room}/set`, preset, false);
    }

    const sorted = [...(catalog ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
    );

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg bg-preset hover:bg-preset-hover text-white px-4 py-4 transition-colors active:scale-[0.98]"
                    onClick={() => sendData(`preset/${room}/on`, "", false)}
                >
                    <Lightbulb
                        className="size-10 shrink-0"
                        strokeWidth={1.25}
                    />
                    <span className="font-medium">On</span>
                </button>
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg bg-preset hover:bg-preset-hover text-white px-4 py-4 transition-colors active:scale-[0.98]"
                    onClick={() => sendData(`preset/${room}/off`, "", false)}
                >
                    <LightbulbOff
                        className="size-10 shrink-0"
                        strokeWidth={1.25}
                    />
                    <span className="font-medium">Off</span>
                </button>
            </div>
            <div className="flex flex-col gap-1.5">
                {sorted.map((entry) => (
                    <PresetButton
                        key={entry.name}
                        label={entry.name}
                        colors={extractPresetColors(entry.topics)}
                        onClick={() => applyPreset(entry.name)}
                    />
                ))}
            </div>
        </div>
    );
}

/** Full preset panel with cards per room (for the function-mode presets page). */
export default function PresetPanel() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">{room.label}</h3>
                    <RoomPresetGrid room={room.id} />
                </div>
            ))}
        </div>
    );
}