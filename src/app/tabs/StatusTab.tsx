import HeartbeatTable from "@/components/status/HeartbeatTable";
import WindowsPanel from "@/components/status/WindowsPanel";

export default function StatusTab() {
    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <WindowsPanel />
                </div>
                <div>
                    <HeartbeatTable />
                </div>
            </div>
        </div>
    );
}