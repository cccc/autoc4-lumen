import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThrottledCallback } from "use-debounce";

/** Marks that no local value is shown; a private symbol, so it can never be a T. */
const NONE: unique symbol = Symbol("none");

interface LiveValueOptions<T> {
    /** Latest confirmed value, or undefined if it isn't known yet. */
    remote: T | undefined;
    /** Sends a new value to wherever `remote` comes from. */
    send: (value: T) => void;
    /** Minimum time between sends while the value is being changed. */
    interval?: number;
    /** How long a committed value is shown while waiting for `remote` to match. */
    settleTimeout?: number;
    /** Compare incoming values to the current value to check for equality. Defaults to Object.is */
    isEqual?: (a: T, b: T) => boolean;
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
    isEqual = Object.is,
}: LiveValueOptions<T>) {
    const [local, setLocal] = useState<T | typeof NONE>(NONE);
    const [changing, setChanging] = useState(false);
    const settleRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const throttledSend = useThrottledCallback(send, interval);

    // Committed value confirmed by remote -> hand control back
    if (
        !changing &&
        local !== NONE &&
        remote !== undefined &&
        isEqual(local, remote)
    ) {
        setLocal(NONE);
    }

    useEffect(() => () => clearTimeout(settleRef.current), []);

    /** Show `value` immediately and send it, throttled. */
    const change = useCallback(
        (value: T) => {
            clearTimeout(settleRef.current);
            setChanging(true);
            setLocal(() => value);
            throttledSend(value);
        },
        [throttledSend],
    );

    /** Send `value` now and keep showing it until `remote` confirms it. */
    const commit = useCallback(
        (value: T) => {
            clearTimeout(settleRef.current);
            setChanging(false);
            setLocal(() => value);
            throttledSend(value);
            throttledSend.flush();
            settleRef.current = setTimeout(() => setLocal(NONE), settleTimeout);
        },
        [throttledSend, settleTimeout],
    );

    const value = local !== NONE ? local : remote;
    return useMemo(() => ({ value, change, commit }), [value, change, commit]);
}