import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "system",
    setTheme: () => {},
    resolved: "dark",
});

const STORAGE_KEY = "autoc4:theme";

function getStored(): Theme {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "light" || v === "dark" || v === "system") return v;
    } catch {
        /* localStorage may be unavailable */
    }
    return "system";
}

function getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getStored);
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
        getSystemTheme,
    );

    const resolved = theme === "system" ? systemTheme : theme;

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        try {
            localStorage.setItem(STORAGE_KEY, t);
        } catch {
            /* localStorage may be unavailable */
        }
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => setSystemTheme(getSystemTheme());
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolved === "dark");
    }, [resolved]);

    return (
        <ThemeContext value={{ theme, setTheme, resolved }}>
            {children}
        </ThemeContext>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}