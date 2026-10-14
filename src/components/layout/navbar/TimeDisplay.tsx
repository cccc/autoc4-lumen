import { useMQTTValue } from "@/lib/mqtt";
import { useEffect, useMemo, useState } from "react";

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

export default function TimeDisplay() {
    const payload = useMQTTValue("time");

    const [localTime, setLocalTime] = useState(() => {
        const now = new Date();
        return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setLocalTime(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = useMemo(() => {
        if (!payload || payload.bytes.length < 7) return null;
        const b = payload.bytes;
        return `${pad2(b[0])}:${pad2(b[1])}`;
    }, [payload]);

    return (
        <span className="hidden lg:inline text-xs font-mono text-muted-foreground mx-1">
            {timeStr ?? localTime}
        </span>
    );
}