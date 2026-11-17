import type { ReactNode } from "react";
import AtenMatrix from "@/components/aten/AtenMatrix";
import DMXLamp from "@/components/dmx/DMXLamp";
import KitchenlightControl from "@/components/kitchenlight/KitchenlightControl";
import { MusicControls } from "@/components/music/MusicPlayer";
import WindowSensor from "@/components/status/WindowSensor";
import type { Appliance, ColorAppliance } from "@/lib/appliances";
import { useAppliances } from "@/lib/appliances";
import DimmerButton from "@/components/lights/DimmerButton";
import LightButton from "@/components/lights/LightButton";
import PairedLightButton from "@/components/lights/PairedLightButton";
import ApplianceSection from "./ApplianceSection";
import TasmotaButton from "@/components/lights/TasmotaButton";
import WLEDButton from "@/components/wled/WLEDButton";

/** The appliance variant with the given type, narrowed to that type. */
type ApplianceOf<T extends Appliance["type"]> = Appliance & { type: T };

interface ApplianceDefinition<A extends Appliance> {
    /** Tiles fill one grid cell; sections span the full row and get a header
     *  with the label and, if configured, a power switch. */
    layout: "tile" | "section";
    render: (appliance: A) => ReactNode;
    /** React key; defaults to the topic, or type and room for topicless ones. */
    key?: (appliance: A) => string;
}

const dmxLamp: ApplianceDefinition<ColorAppliance> = {
    layout: "tile",
    render: (a) => <DMXLamp topic={a.topic} type={a.type} label={a.label} />,
};

const registry: {
    [T in Appliance["type"]]: ApplianceDefinition<ApplianceOf<T>>;
} = {
    switch: {
        layout: "tile",
        render: (a) => <LightButton topic={a.topic}>{a.label}</LightButton>,
    },
    power: {
        layout: "tile",
        render: (a) => (
            <LightButton topic={a.topic} variant="power">
                {a.label}
            </LightButton>
        ),
    },
    tasmota: {
        layout: "tile",
        render: (a) => <TasmotaButton topic={a.topic}>{a.label}</TasmotaButton>,
    },
    dimmer: {
        layout: "tile",
        render: (a) => (
            <DimmerButton topic={a.topic} label={a.label} offset={a.offset} />
        ),
        key: (a) => `${a.topic}:${a.offset ?? 0}`,
    },
    dmx7ch: dmxLamp,
    dmx4ch: dmxLamp,
    rgb: dmxLamp,
    rgbw: dmxLamp,
    zrgbw: dmxLamp,
    paired: {
        layout: "tile",
        render: (a) => (
            <PairedLightButton label={a.label} left={a.left} right={a.right} />
        ),
        key: (a) => a.left.topic,
    },
    sensor: {
        layout: "tile",
        render: (a) => <WindowSensor topic={a.topic} label={a.label} />,
    },
    wled: {
        layout: "tile",
        render: (a) => (
            <WLEDButton label={a.label} topic={a.topic} url={a.url} />
        ),
    },
    aten: {
        layout: "section",
        render: (a) => <AtenMatrix topic={a.topic} />,
    },
    kitchenlight: {
        layout: "section",
        render: () => <KitchenlightControl />,
    },
    music: {
        layout: "section",
        render: (a) => <MusicControls room={a.room} />,
    },
};

// the mapped registry type guarantees each entry matches its own type
function definitionFor(appliance: Appliance) {
    return registry[appliance.type] as ApplianceDefinition<Appliance>;
}

function applianceKey(appliance: Appliance): string {
    const custom = definitionFor(appliance).key?.(appliance);
    if (custom) return custom;
    return "topic" in appliance
        ? appliance.topic
        : `${appliance.type}:${appliance.room}`;
}

function ApplianceComponent({ appliance }: { appliance: Appliance }) {
    const definition = definitionFor(appliance);
    const content = definition.render(appliance);

    if (definition.layout === "tile") return content;
    return <ApplianceSection appliance={appliance}>{content}</ApplianceSection>;
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

    const children = items.map((a) => (
        <ApplianceComponent key={applianceKey(a)} appliance={a} />
    ));

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