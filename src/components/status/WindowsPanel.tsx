import Appliances from "@/components/lights/Appliances";
import { gridStyle } from "@/lib/grid";
import { rooms, useAppliances } from "@/lib/appliances";

function RoomWindows({ id, label }: { id: string; label: string }) {
    const windows = useAppliances({ room: id, only: ["window"] });
    if (windows.length === 0) return null;

    return (
        <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{label}</h4>
            <Appliances room={id} only={["window"]} style={gridStyle(2)} />
        </div>
    );
}

export default function WindowsPanel() {
    return (
        <div>
            <h3 className="font-semibold mb-3">Fenster</h3>
            {rooms.map((room) => (
                <RoomWindows key={room.id} id={room.id} label={room.label} />
            ))}
        </div>
    );
}