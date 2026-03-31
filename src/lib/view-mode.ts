import { create } from "zustand";

export type ViewMode = "function" | "room";

const STORAGE_KEY = "autoc4:viewMode";

function load(): ViewMode {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "function" || v === "room") return v;
    } catch {
        /* localStorage may be unavailable */
    }
    return "function";
}

interface ViewModeStore {
    mode: ViewMode;
    setMode: (mode: ViewMode) => void;
}

export const useViewMode = create<ViewModeStore>((set) => ({
    mode: load(),
    setMode: (mode) => {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            /* localStorage may be unavailable */
        }
        set({ mode });
    },
}));