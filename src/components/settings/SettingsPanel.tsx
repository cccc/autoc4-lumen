import { Switch } from "@/components/ui/switch";
import { usePWAStore } from "@/lib/pwa";

function AppSettings() {
    const { installable, setInstallable } = usePWAStore();

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">App</h3>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                    <div className="text-sm font-medium">Installable (PWA)</div>
                    <div className="text-xs text-muted-foreground">
                        Offer installing as an app instead of a plain home
                        screen shortcut. Disabling may require restarting the
                        browser to take effect.
                    </div>
                </div>
                <Switch
                    checked={installable}
                    onCheckedChange={(checked) => setInstallable(checked)}
                />
            </label>
        </div>
    );
}

export default function SettingsPanel() {
    return (
        <div className="space-y-6 max-w-xl">
            <AppSettings />
        </div>
    );
}