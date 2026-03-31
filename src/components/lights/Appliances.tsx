import AtenMatrix from "@/components/aten/AtenMatrix";
import DMXLamp from "@/components/dmx/DMXLamp";
import KitchenlightControl from "@/components/kitchenlight/KitchenlightControl";
import { MusicControls } from "@/components/music/MusicPlayer";
import WindowSensor from "@/components/status/WindowSensor";
import type { Appliance } from "@/lib/appliances";
import { useAppliances } from "@/lib/appliances";
import DimmerButton from "./DimmerButton";
import LightButton from "./LightButton";
import PairedLightButton from "./PairedLightButton";
import TasmotaButton from "./TasmotaButton";

function ApplianceComponent({ appliance }: { appliance: Appliance }) {
    switch (appliance.type) {
        case "switch":
            return (
                <LightButton topic={appliance.topic}>
                    {appliance.label}
                </LightButton>
            );
        case "power":
            return (
                <LightButton topic={appliance.topic} variant="power">
                    {appliance.label}
                </LightButton>
            );
        case "tasmota":
            return (
                <TasmotaButton topic={appliance.topic}>
                    {appliance.label}
                </TasmotaButton>
            );
        case "dimmer":
            return (
                <DimmerButton
                    topic={appliance.topic}
                    label={appliance.label}
                    offset={appliance.offset}
                />
            );
        case "dmx7ch":
        case "dmx4ch":
        case "rgb":
        case "rgbw":
            return (
                <DMXLamp
                    topic={appliance.topic}
                    type={appliance.type}
                    label={appliance.label}
                />
            );
        case "paired":
            return (
                <PairedLightButton
                    label={appliance.label}
                    left={appliance.left}
                    right={appliance.right}
                />
            );
        case "sensor":
            return (
                <WindowSensor topic={appliance.topic} label={appliance.label} />
            );
        case "aten":
            return (
                <div style={{ gridColumn: "1 / -1" }}>
                    <AtenMatrix
                        topic={appliance.topic}
                        powerTopic={appliance.powerTopic}
                    />
                </div>
            );
        case "kitchenlight":
            return (
                <div style={{ gridColumn: "1 / -1" }}>
                    <KitchenlightControl />
                </div>
            );
        case "music":
            return (
                <div style={{ gridColumn: "1 / -1" }}>
                    <MusicControls room={appliance.room} />
                </div>
            );
    }
}

interface AppliancesProps {
    room: string;
    only?: string[];
    except?: string[];
    style?: React.CSSProperties;
}

export default function Appliances({
    room,
    only,
    except,
    style,
}: AppliancesProps) {
    const items = useAppliances({ room, only, except });

    const children = items.map((a) => {
        let key: string;
        switch (a.type) {
            case "paired":
                key = a.left.topic;
                break;
            case "dimmer":
                key = `${a.topic}:${a.offset ?? 0}`;
                break;
            case "kitchenlight":
            case "music":
                key = `${a.type}:${a.room}`;
                break;
            default:
                key = a.topic;
                break;
        }
        return <ApplianceComponent key={key} appliance={a} />;
    });

    if (style) {
        return <div style={style}>{children}</div>;
    }

    return (
        <div className="@container">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] @[28rem]:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] @[42rem]:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] @[56rem]:grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-1">
                {children}
            </div>
        </div>
    );
}