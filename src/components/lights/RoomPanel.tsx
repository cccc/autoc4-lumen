import { Power } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMQTTSend } from "@/lib/mqtt";

interface Tab {
    id: string;
    label: string;
    content: ReactNode;
}

interface RoomPanelProps {
    name: string;
    room: string;
    tabs: Tab[];
}

export default function RoomPanel({ name, room, tabs }: RoomPanelProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
    const { sendData } = useMQTTSend();

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold flex-1">{name}</h2>
                <button
                    type="button"
                    className="size-9 rounded-md flex items-center justify-center text-off hover:bg-off/10 transition-colors active:scale-95"
                    onClick={() => sendData(`preset/${room}/off`, "", false)}
                    title="All off"
                >
                    <Power className="size-5" />
                </button>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id}>
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}