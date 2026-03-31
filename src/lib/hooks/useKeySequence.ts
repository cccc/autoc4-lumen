import { useCallback, useEffect, useRef } from "react";

/**
 * Calls `onMatch` when the user types a specific key sequence.
 * Resets if no key is pressed within `timeout` ms.
 */
export function useKeySequence(
    keys: number[],
    onMatch: () => void,
    timeout = 2000,
) {
    const indexRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const reset = useCallback(() => {
        indexRef.current = 0;
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (timerRef.current) clearTimeout(timerRef.current);

            if (e.keyCode === keys[indexRef.current]) {
                indexRef.current++;
                if (indexRef.current === keys.length) {
                    onMatch();
                    reset();
                    return;
                }
                timerRef.current = setTimeout(reset, timeout);
            } else {
                reset();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [keys, onMatch, timeout, reset]);
}