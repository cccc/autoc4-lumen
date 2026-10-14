import { Power } from "lucide-react";
import BusleisteControl from "@/components/busleiste/BusleisteControl";
import { Button } from "@/components/ui/button";
import { confirm } from "@/lib/dialog";
import { useMQTTSend } from "@/lib/mqtt";
import DebugSettings from "./DebugSettings";
import ClubStatusControls from "./ClubStatusControls";

export default function AdminPanel() {
    const { sendByte } = useMQTTSend();

    function handleOpenGate() {
        sendByte("club/gate", 0);
    }

    function handleForceShutdown() {
        confirm({
            title: "Force Shutdown",
            description:
                "This bypasses safety checks such as window sensors. Only use this if you know what you are doing.\n\nThe club will be shut down immediately without verifying that windows are closed.",
            confirmLabel: (
                <span className="inline-flex items-center gap-1.5">
                    <Power className="size-4" /> Force Shutdown
                </span>
            ),
            onConfirm: () => sendByte("club/shutdown", 0x44),
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <ClubStatusControls />

                <div className="flex flex-col gap-3 md:w-48 shrink-0">
                    <Button
                        size="lg"
                        className="bg-on hover:bg-on-hover flex-1 text-base"
                        onClick={handleOpenGate}
                    >
                        Open Gate
                    </Button>
                    <Button
                        size="lg"
                        variant="destructive"
                        className="flex-1 text-base"
                        onClick={handleForceShutdown}
                    >
                        Force Shutdown
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="border rounded-lg p-4 flex-1">
                    <h3 className="font-semibold mb-3">Busleiste</h3>
                    <BusleisteControl />
                </div>
                <DebugSettings />
            </div>
        </div>
    );
}