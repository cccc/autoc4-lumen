import { Button } from "@/components/ui/button";
import { useMQTTSend, useMQTTString } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

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