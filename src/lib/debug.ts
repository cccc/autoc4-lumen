import { create } from "zustand";

const STORAGE_KEY = "autoc4:debug";

interface DebugFlags {
    messageReceived: boolean;
    messageSent: boolean;
    connection: boolean;
    subscriptions: boolean;
}

interface DebugStore extends DebugFlags {
    set: (flags: Partial<DebugFlags>) => void;
}

function load(): DebugFlags {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch {
        /* localStorage may be unavailable */
    }
    return defaults;
}

function persist(flags: DebugFlags) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {
        /* localStorage may be unavailable */
    }
}

const defaults: DebugFlags = {
    messageReceived: false,
    messageSent: false,
    connection: true,
    subscriptions: false,
};

export const useDebugStore = create<DebugStore>((set) => ({
    ...load(),
    set: (flags) =>
        set((state) => {
            const next = { ...state, ...flags };
            persist(next);
            return next;
        }),
}));

/** Read debug flags outside React (e.g. from MQTT client callbacks). */
export function getDebugFlags(): DebugFlags {
    return useDebugStore.getState();
}