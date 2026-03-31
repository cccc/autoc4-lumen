import { Navigate, useParams } from "react-router";
import DMXControls from "@/components/dmx/DMXControls";
import DMXMaster from "@/components/dmx/DMXMaster";
import Appliances from "@/components/lights/Appliances";
import { RoomPresetGrid } from "@/components/presets/PresetPanel";
import { gridStyle } from "@/lib/grid";
import type { Module, RoomConfig, TabConfig } from "@/lib/rooms";
import { rooms } from "@/lib/rooms";

function ModuleRenderer({
    room,
    module,
}: {
    room: RoomConfig;
    module: Module;
}) {
    switch (module.type) {
        case "heading":
            return <h4 className="text-sm font-medium mb-2">{module.text}</h4>;
        case "separator":
            return <hr className="my-3 border-border" />;
        case "appliances":
            return (
                <Appliances
                    room={room.id}
                    only={module.tags}
                    except={module.except}
                    style={module.cols ? gridStyle(module.cols) : undefined}
                />
            );
        case "dmx-master":
            return (
                <DMXMaster
                    room={room.id}
                    relayTopic={module.relayTopic}
                    only={module.tags}
                    except={module.except}
                />
            );
        case "dmx-controls":
            return (
                <DMXControls
                    room={room.id}
                    only={module.tags}
                    except={module.except}
                />
            );
        case "presets":
            return <RoomPresetGrid room={room.id} />;
    }
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            {children}
        </div>
    );
}

export function TabContent({
    room,
    tab,
}: {
    room: RoomConfig;
    tab: TabConfig;
}) {
    return (
        <>
            {tab.modules.map((module, i) => (
                <ModuleRenderer key={i} room={room} module={module} />
            ))}
        </>
    );
}

export default function RoomView() {
    const { roomId } = useParams<{ roomId: string }>();
    const room = rooms.find((r) => r.id === roomId);

    if (!room) return <Navigate to="/" replace />;

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {room.tabs.map((tab) => (
                    <Section key={tab.id} title={tab.label}>
                        <TabContent room={room} tab={tab} />
                    </Section>
                ))}
                <Section title="Presets">
                    <RoomPresetGrid room={room.id} />
                </Section>
            </div>
        </div>
    );
}