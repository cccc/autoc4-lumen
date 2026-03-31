import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

interface AdminContextValue {
    enabled: boolean;
    toggle: () => void;
    /** Attach this to an element's onClick to trigger admin mode via repeated clicks. */
    handleClickTrigger: () => void;
}

const AdminContext = createContext<AdminContextValue>({
    enabled: false,
    toggle: () => {},
    handleClickTrigger: () => {},
});

const STORAGE_KEY = "autoc4:admin:enabled";
const CLICK_COUNT = 5;
const CLICK_TIMEOUT = 2000;

function getStoredAdmin(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

export function AdminProvider({ children }: { children: ReactNode }) {
    const [enabled, setEnabled] = useState(getStoredAdmin);
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const toggle = useCallback(() => {
        setEnabled((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                /* localStorage may be unavailable */
            }
            return next;
        });
    }, []);

    const handleClickTrigger = useCallback(() => {
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        clickCountRef.current++;

        if (clickCountRef.current >= CLICK_COUNT) {
            clickCountRef.current = 0;
            toggle();
            return;
        }

        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0;
        }, CLICK_TIMEOUT);
    }, [toggle]);

    return (
        <AdminContext value={{ enabled, toggle, handleClickTrigger }}>
            {children}
        </AdminContext>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}