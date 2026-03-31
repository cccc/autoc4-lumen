import type { CSSProperties } from "react";

/** Inline grid style for a fixed column count. Used by callers that override
 *  the default responsive auto-fill layout via the `style` prop. */
export function gridStyle(cols: number): CSSProperties {
    return {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "0.375rem",
    };
}