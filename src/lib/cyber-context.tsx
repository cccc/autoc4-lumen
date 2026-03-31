import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { useKeySequence } from "@/lib/hooks/useKeySequence";

interface CyberContextValue {
    active: boolean;
    toggle: () => void;
}

const CyberContext = createContext<CyberContextValue>({
    active: false,
    toggle: () => {},
});

// Up Up Down Down Left Right Left Right B A
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

export function CyberProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState(false);
    const toggle = useCallback(() => setActive((prev) => !prev), []);

    useKeySequence(KONAMI_CODE, toggle);

    const value = useMemo(() => ({ active, toggle }), [active, toggle]);

    return <CyberContext value={value}>{children}</CyberContext>;
}

export function useCyber() {
    return useContext(CyberContext);
}