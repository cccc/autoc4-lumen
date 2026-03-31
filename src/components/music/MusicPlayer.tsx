import { Button } from "@/components/ui/button";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

const ROOMS = [
    { id: "wohnzimmer", label: "Wohnzimmer" },
    { id: "plenar", label: "Plenarsaal" },
    { id: "fnord", label: "Fnordcenter" },
    { id: "keller", label: "Keller" },
] as const;

/** Just the music controls — no card wrapper. */
export function MusicControls({ room }: { room: string }) {
    const state = useMQTTString(`mpd/${room}/state`);
    const song = useMQTTString(`mpd/${room}/song`);
    const { sendData } = useMQTTSend();

    const isPlaying = state === "play";
    const isPaused = state === "pause";

    function send(command: string) {
        sendData(`mpd/${room}/control`, command, false);
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span
                    className={cn(
                        "size-2 rounded-full",
                        isPlaying && "bg-green-500",
                        isPaused && "bg-yellow-500",
                        !isPlaying && !isPaused && "bg-red-500",
                    )}
                />
                {song && (
                    <span className="text-xs text-muted-foreground truncate">
                        {song}
                    </span>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-4"
                    onClick={() => send("prev")}
                >
                    &#x23EE;
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-4"
                    onClick={() => send("play")}
                >
                    &#x23F5;
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-4"
                    onClick={() => send("pause")}
                >
                    &#x23F8;
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-4"
                    onClick={() => send("stop")}
                >
                    &#x23F9;
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-4"
                    onClick={() => send("next")}
                >
                    &#x23ED;
                </Button>
            </div>
        </div>
    );
}

/** Music controls in a card with a label — for use inside room tabs. */
export function RoomPlayer({ room, label }: { room: string; label: string }) {
    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2">{label}</h3>
            <MusicControls room={room} />
        </div>
    );
}

/** All room players in a grid. */
export default function MusicPanel() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROOMS.map(({ id, label }) => (
                <RoomPlayer key={id} room={id} label={label} />
            ))}
        </div>
    );
}