import RoomPanel from "@/components/lights/RoomPanel";
import { rooms } from "@/lib/rooms";
import { TabContent } from "./RoomView";

export default function LightTab() {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
                <RoomPanel
                    key={room.id}
                    name={room.label}
                    room={room.id}
                    tabs={room.tabs.map((tab) => ({
                        id: tab.id,
                        label: tab.label,
                        content: <TabContent room={room} tab={tab} />,
                    }))}
                />
            ))}
        </div>
    );
}