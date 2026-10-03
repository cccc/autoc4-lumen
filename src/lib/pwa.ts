import { create } from "zustand";

const STORAGE_KEY = "autoc4:pwa:installable";

interface PWAStore {
    installable: boolean;
    setInstallable: (installable: boolean) => void;
}

function load(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

export const usePWAStore = create<PWAStore>((set) => ({
    installable: load(),
    setInstallable: (installable) => {
        try {
            localStorage.setItem(STORAGE_KEY, String(installable));
        } catch {
            /* localStorage may be unavailable */
        }
        set({ installable });
    },
}));