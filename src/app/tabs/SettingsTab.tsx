import SettingsPanel from "@/components/settings/SettingsPanel";

export default function SettingsTab() {
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <SettingsPanel />
        </div>
    );
}