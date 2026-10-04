import { Power } from "lucide-react";
import BigButton from "../ui/big-button";
import TasmotaSwitch from "./TasmotaSwitch";

interface TasmotaButtonProps {
    topic: string;
    children: React.ReactNode;
}

export default function TasmotaButton({ topic, children }: TasmotaButtonProps) {
    return (
        <TasmotaSwitch topic={topic}>
            {(state, toggle) => (
                <BigButton onClick={toggle} color={state}>
                    <BigButton.Icon>
                        <Power />
                    </BigButton.Icon>
                    <BigButton.Label>{children}</BigButton.Label>
                </BigButton>
            )}
        </TasmotaSwitch>
    );
}