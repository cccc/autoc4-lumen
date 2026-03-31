import TasmotaSwitch from "@/components/lights/TasmotaSwitch";
import { Switch } from "@/components/ui/switch";
import { useMQTTByte, useMQTTJSON, useMQTTSend } from "@/lib/mqtt";
import { cn } from "@/lib/utils";

const OUTPUTS = ["01", "02", "03", "04"] as const;
const INPUTS = ["01", "02", "03", "04"] as const;

interface AtenMatrixProps {
    topic: string;
    powerTopic?: string;
}

function MatrixRow({
    label,
    connected,
    isActive,
    onClick,
}: {
    label: string;
    connected: boolean;
    isActive: (input: string) => boolean;
    onClick: (input: string) => void;
}): React.JSX.Element {
    return (
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-1.5 items-center">
            <span className="text-sm whitespace-nowrap pr-1 min-w-14">
                {label}
            </span>
            {INPUTS.map((inp, j) => (
                <button
                    key={inp}
                    type="button"
                    className={cn(
                        "h-12 rounded text-sm font-medium text-white transition-colors active:scale-95",
                        isActive(inp)
                            ? "bg-matrix-active hover:bg-matrix-active-hover"
                            : "bg-matrix-inactive hover:bg-matrix-inactive-hover",
                        !connected && "opacity-40 cursor-not-allowed",
                    )}
                    disabled={!connected}
                    title={`Set ${label.toLowerCase()} to input ${j + 1}`}
                    onClick={() => onClick(inp)}
                >
                    IN {j + 1}
                </button>
            ))}
        </div>
    );
}

export default function AtenMatrix({ topic, powerTopic }: AtenMatrixProps) {
    const connectionByte = useMQTTByte(`${topic}/connection`);
    const routingState = useMQTTJSON<Record<string, string[]>>(
        `${topic}/state`,
    );
    const { sendData } = useMQTTSend();
    const connected = connectionByte !== undefined && connectionByte !== 0;

    function isActive(input: string, output: string): boolean {
        if (!routingState) return false;
        return output in routingState && routingState[output][0] === input;
    }

    function handleClick(input: string, output: string) {
        sendData(`${topic}/cmd`, `sw i${input} o${output}`, false);
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center mb-2">
                <h3 className="text-sm font-semibold flex-1">
                    Aten HDMI-Matrix
                </h3>
                {powerTopic && (
                    <TasmotaSwitch topic={powerTopic}>
                        {(state, toggle) => (
                            <Switch
                                checked={state === "on"}
                                onCheckedChange={toggle}
                                disabled={state === "unknown"}
                            />
                        )}
                    </TasmotaSwitch>
                )}
            </div>
            {OUTPUTS.map((out, i) => (
                <MatrixRow
                    key={out}
                    label={`OUT ${i + 1}`}
                    connected={connected}
                    isActive={(inp) => isActive(inp, out)}
                    onClick={(inp) => handleClick(inp, out)}
                />
            ))}
            <div className="h-1.5" />
            <MatrixRow
                label="Set all"
                connected={connected}
                isActive={() => false}
                onClick={(inp) => handleClick(inp, "*")}
            />
        </div>
    );
}