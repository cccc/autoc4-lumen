import type { ReactNode } from "react";
import type { Appliance } from "@/lib/appliances";
import PowerSwitch from "./PowerSwitch";

interface ApplianceSectionProps {
    appliance: Appliance;
    children: ReactNode;
}

/** Full-width section with the appliance label and, if configured, a power switch. */
export default function ApplianceSection({
    appliance,
    children,
}: ApplianceSectionProps) {
    return (
        <section className="col-span-full space-y-2">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold flex-1">
                    {appliance.label}
                </h3>
                {"power" in appliance && appliance.power && (
                    <PowerSwitch {...appliance.power} />
                )}
            </div>
            {children}
        </section>
    );
}