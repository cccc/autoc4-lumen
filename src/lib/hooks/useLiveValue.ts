import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThrottledCallback } from "use-debounce";

interface LiveValueOptions<T> {
    /** Latest confirmed value, or undefined if it isn't known yet. */
    remote: T | undefined;
    /** Sends a new value to wherever `remote` comes from. */
    send: (value: T) => void;
    /** Minimum time between sends while the value is being changed. */
    interval?: number;
    /** How long a committed value is shown while waiting for `remote` to match. */
    settleTimeout?: number;
}

/**
 * A remote value that is sent live (throttled) while being changed, e.g. by
 * dragging a slider.
 *
 * While changing, the local value is shown and `remote` is ignored, so late
 * updates from earlier sends can't pull the value back. `commit` sends the
 * final value immediately and keeps showing it until `remote` matches or the
 * settle timeout passes; after that `remote` is the source of truth again.
 */
export function useLiveValue<T>({
    remote,
    send,
    interval = 50,
    settleTimeout = 1000,
}: LiveValueOptions<T>) {
    // Wrapped so T itself may include null/undefined
    const [local, setLocal] = useState<{ value: T } | null>(null);
    const [changing, setChanging] = useState(false);
    const settleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const throttledSend = useThrottledCallback(send, interval);

    // Committed value confirmed by remote -> hand control back
    if (!changing && local !== null && Object.is(remote, local.value)) {
        setLocal(null);
    }

    useEffect(() => () => clearTimeout(settleRef.current), []);

    /** Show `value` immediately and send it, throttled. */
    const change = useCallback(
        (value: T) => {
            clearTimeout(settleRef.current);
            setChanging(true);
            setLocal({ value });
            throttledSend(value);
        },
        [throttledSend],
    );

    /** Send `value` now and keep showing it until `remote` confirms it. */
    const commit = useCallback(
        (value: T) => {
            clearTimeout(settleRef.current);
            setChanging(false);
            setLocal({ value });
            throttledSend(value);
            throttledSend.flush();
            settleRef.current = setTimeout(() => setLocal(null), settleTimeout);
        },
        [throttledSend, settleTimeout],
    );

    const value = local ? local.value : remote;
    return useMemo(() => ({ value, change, commit }), [value, change, commit]);
}