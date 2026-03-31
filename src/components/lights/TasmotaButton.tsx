import { cn } from "@/lib/utils";
import { Power } from "lucide-react";
import BigButton from "./BigButton";
import TasmotaSwitch from "./TasmotaSwitch";

interface TasmotaButtonProps {
    topic: string;
    children: React.ReactNode;
}

export default function TasmotaButton({ topic, children }: TasmotaButtonProps) {
    return (
        <TasmotaSwitch topic={topic}>
            {(state, toggle) => (
                <BigButton
                    onClick={toggle}
                    className={cn(
                        state === "unknown" && "bg-muted text-muted-foreground",
                        state === "on" && "bg-on hover:bg-on-hover",
                        state === "off" && "bg-off hover:bg-off-hover",
                    )}
                >
                    <Power className="size-12" strokeWidth={1.25} />
                    <span className="text-xs leading-tight text-center px-1">
                        {children}
                    </span>
                </BigButton>
            )}
        </TasmotaSwitch>
    );
}