import { create } from "zustand";

type MotionPref = "system" | "reduce";

const STORAGE_KEY = "autoc4:reducedMotion";

function load(): MotionPref {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "system" || v === "reduce") return v;
    } catch {
        /* localStorage may be unavailable */
    }
    return "system";
}

interface ReducedMotionStore {
    pref: MotionPref;
    setPref: (pref: MotionPref) => void;
}

export const useReducedMotion = create<ReducedMotionStore>((set) => ({
    pref: load(),
    setPref: (pref) => {
        try {
            localStorage.setItem(STORAGE_KEY, pref);
        } catch {
            /* localStorage may be unavailable */
        }
        set({ pref });
        applyToDOM(pref);
    },
}));

function applyToDOM(pref: MotionPref) {
    document.documentElement.classList.toggle(
        "reduce-motion",
        pref === "reduce",
    );
}

// Apply on load
applyToDOM(load());