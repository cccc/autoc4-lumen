import {
    Check,
    CircleCheck,
    CircleDashed,
    CircleMinus,
    LayoutGrid,
    Menu,
    Moon,
    Monitor,
    Power,
    Sun,
    Snail,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-context";
import { useCyber } from "@/lib/cyber-context";
import { confirm } from "@/lib/dialog";
import {
    useMQTTByte,
    useMQTTConnected,
    useMQTTSend,
    useMQTTValue,
} from "@/lib/mqtt";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/lib/view-mode";
import { rooms } from "@/lib/appliances";

const functionNavItems = [
    { to: "/light", label: "Light" },
    { to: "/presets", label: "Presets" },
    { to: "/status", label: "Status" },
] as const;

function SettingsDropdown() {
    const { theme, setTheme, resolved } = useTheme();
    const { mode: viewMode, setMode: setViewMode } = useViewMode();
    const { pref: motionPref, setPref: setMotionPref } = useReducedMotion();
    const navigate = useNavigate();

    function switchViewMode(mode: "function" | "room") {
        setViewMode(mode);
        navigate(mode === "function" ? "/light" : `/room/${rooms[0].id}`);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-md hover:bg-accent transition-colors text-sm"
                title="Display"
            >
                {resolved === "dark" ? (
                    <Moon className="size-4" />
                ) : (
                    <Sun className="size-4" />
                )}
                <span className="hidden lg:inline text-muted-foreground">
                    Display
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="size-4 mr-2" /> Light
                    {theme === "light" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="size-4 mr-2" /> Dark
                    {theme === "dark" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="size-4 mr-2" /> System
                    {theme === "system" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={() => switchViewMode("function")}>
                    <LayoutGrid className="size-4 mr-2" /> By Function
                    {viewMode === "function" && (
                        <Check className="size-4 ml-auto" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchViewMode("room")}>
                    <LayoutGrid className="size-4 mr-2" /> By Room
                    {viewMode === "room" && (
                        <Check className="size-4 ml-auto" />
                    )}
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem
                    onClick={() =>
                        setMotionPref(
                            motionPref === "reduce" ? "system" : "reduce",
                        )
                    }
                >
                    <Snail className="size-4 mr-2" />
                    <span>
                        Reduced
                        <br />
                        Motion
                    </span>
                    {motionPref === "reduce" && (
                        <Check className="size-4 ml-auto" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function StatusIndicator() {
    const connected = useMQTTConnected();
    const clubStatus = useMQTTByte("club/status");
    const { handleClickTrigger } = useAdmin();
    const isOpen = clubStatus !== undefined && clubStatus !== 0;

    let label: string;
    let colorClass: string;
    let Icon: typeof CircleCheck;

    if (!connected) {
        label = "Disconnected";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (clubStatus === undefined) {
        label = "Unknown";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (isOpen) {
        label = "Open";
        colorClass = "text-status-open";
        Icon = CircleCheck;
    } else {
        label = "Closed";
        colorClass = "text-status-closed";
        Icon = CircleMinus;
    }

    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-md transition-colors text-sm",
                colorClass,
            )}
            onClick={handleClickTrigger}
            title={
                !connected ? "Disconnected" : `Club is ${label.toLowerCase()}`
            }
        >
            <Icon className="size-4" />
            <span className="hidden lg:inline">{label}</span>
        </button>
    );
}

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

function TimeDisplay() {
    const payload = useMQTTValue("time");

    const [localTime, setLocalTime] = useState(() => {
        const now = new Date();
        return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setLocalTime(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = useMemo(() => {
        if (!payload || payload.bytes.length < 7) return null;
        const b = payload.bytes;
        return `${pad2(b[0])}:${pad2(b[1])}`;
    }, [payload]);

    return (
        <span className="hidden lg:inline text-xs font-mono text-muted-foreground mx-1">
            {timeStr ?? localTime}
        </span>
    );
}

function ShutdownButton() {
    const { sendByte } = useMQTTSend();

    function handleShutdown() {
        confirm({
            title: "Shutdown",
            description:
                "Are you sure you want to shut down the club? This will result in many of the lamps and electrical devices being turned off.\n\nBefore shutting down the club make sure all windows are closed.",
            confirmLabel: (
                <span className="inline-flex items-center gap-1.5">
                    <Power className="size-4" /> Shutdown
                </span>
            ),
            onConfirm: () => sendByte("club/shutdown", 0),
        });
    }

    return (
        <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm"
            onClick={handleShutdown}
            title="Shutdown"
        >
            <Power className="size-4" />
            <span className="hidden lg:inline">Shutdown</span>
        </button>
    );
}

function SidebarStatus() {
    const connected = useMQTTConnected();
    const clubStatus = useMQTTByte("club/status");
    const { handleClickTrigger } = useAdmin();
    const isOpen = clubStatus !== undefined && clubStatus !== 0;

    let label: string;
    let colorClass: string;
    let Icon: typeof CircleCheck;

    if (!connected) {
        label = "Disconnected";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (clubStatus === undefined) {
        label = "Unknown";
        colorClass = "text-muted-foreground";
        Icon = CircleDashed;
    } else if (isOpen) {
        label = "Open";
        colorClass = "text-status-open";
        Icon = CircleCheck;
    } else {
        label = "Closed";
        colorClass = "text-status-closed";
        Icon = CircleMinus;
    }

    return (
        <button
            type="button"
            className={cn(
                "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left",
                colorClass,
            )}
            onClick={handleClickTrigger}
        >
            <Icon className="size-4" />
            {label}
        </button>
    );
}

function SidebarSettings({ onClose }: { onClose: () => void }) {
    const { theme, setTheme } = useTheme();
    const { mode: viewMode, setMode: setViewMode } = useViewMode();
    const { pref: motionPref, setPref: setMotionPref } = useReducedMotion();
    const { sendByte } = useMQTTSend();
    const navigate = useNavigate();

    function switchViewMode(mode: "function" | "room") {
        setViewMode(mode);
        navigate(mode === "function" ? "/light" : `/room/${rooms[0].id}`);
        onClose();
    }

    function handleShutdown() {
        onClose();
        confirm({
            title: "Shutdown",
            description:
                "Are you sure you want to shut down the club? This will result in many of the lamps and electrical devices being turned off.\n\nBefore shutting down the club make sure all windows are closed.",
            confirmLabel: (
                <span className="inline-flex items-center gap-1.5">
                    <Power className="size-4" /> Shutdown
                </span>
            ),
            onConfirm: () => sendByte("club/shutdown", 0),
        });
    }

    const themeOptions = [
        { value: "light" as const, icon: Sun, label: "Light" },
        { value: "dark" as const, icon: Moon, label: "Dark" },
        { value: "system" as const, icon: Monitor, label: "System" },
    ];

    return (
        <div className="flex flex-col mt-4 divide-y divide-border">
            <div className="pb-2">
                <SidebarStatus />
            </div>

            <div className="py-2">
                <span className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    View
                </span>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left",
                        viewMode === "function"
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                    )}
                    onClick={() => switchViewMode("function")}
                >
                    <LayoutGrid className="size-4" />
                    <span className="flex-1">By Function</span>
                    {viewMode === "function" && <Check className="size-4" />}
                </button>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left",
                        viewMode === "room"
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                    )}
                    onClick={() => switchViewMode("room")}
                >
                    <LayoutGrid className="size-4" />
                    <span className="flex-1">By Room</span>
                    {viewMode === "room" && <Check className="size-4" />}
                </button>
            </div>

            <div className="py-2">
                <span className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Theme
                </span>
                {themeOptions.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        type="button"
                        className={cn(
                            "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left",
                            theme === value
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50",
                        )}
                        onClick={() => setTheme(value)}
                    >
                        <Icon className="size-4" />
                        <span className="flex-1">{label}</span>
                        {theme === value && <Check className="size-4" />}
                    </button>
                ))}
            </div>

            <div className="py-2">
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left",
                        motionPref === "reduce"
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                    )}
                    onClick={() =>
                        setMotionPref(
                            motionPref === "reduce" ? "system" : "reduce",
                        )
                    }
                >
                    <Snail className="size-4" />
                    <span className="flex-1">Reduced Motion</span>
                    {motionPref === "reduce" && <Check className="size-4" />}
                </button>
            </div>

            <div className="pt-2">
                <button
                    type="button"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    onClick={handleShutdown}
                >
                    <Power className="size-4" />
                    Shutdown
                </button>
            </div>
        </div>
    );
}

function NavLink_({
    to,
    label,
    onClick,
}: {
    to: string;
    label: string;
    onClick?: () => void;
}) {
    return (
        <NavLink
            to={to}
            onClick={(e) => {
                // Don't trigger view transition when already on this page
                if (window.location.hash === `#${to}`) {
                    e.preventDefault();
                    return;
                }
                onClick?.();
            }}
            viewTransition
            className={({ isActive }) =>
                cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
            }
        >
            {label}
        </NavLink>
    );
}

function NavLinks({ onClick }: { onClick?: () => void }) {
    const { enabled: adminEnabled } = useAdmin();
    const { mode } = useViewMode();

    const items =
        mode === "function"
            ? functionNavItems
            : [
                  ...rooms.map((r) => ({
                      to: `/room/${r.id}`,
                      label: r.label,
                  })),
                  { to: "/status", label: "Status" },
              ];

    return (
        <>
            {items.map(({ to, label }) => (
                <NavLink_ key={to} to={to} label={label} onClick={onClick} />
            ))}
            {adminEnabled && (
                <NavLink_ to="/admin" label="Admin" onClick={onClick} />
            )}
        </>
    );
}

export default function Navbar() {
    const { active: cyberActive } = useCyber();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <nav
            className={cn(
                "border-b px-4 py-3 flex items-center gap-1 transition-all bg-card",
                cyberActive &&
                    "[background:repeating-linear-gradient(135deg,yellow,yellow_32px,black_32px,black_64px)] [text-shadow:0_0_2px_black,0_0_1px_white]",
            )}
        >
            {/* Nav links - always visible, scrollable on mobile */}
            <div className="flex items-center gap-1 overflow-x-auto">
                <NavLinks />
            </div>

            <div className="flex-1" />

            <TimeDisplay />

            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-1">
                <SettingsDropdown />
                <ShutdownButton />
            </div>

            <StatusIndicator />

            {/* Mobile menu for settings */}
            <button
                type="button"
                className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="size-5" />
            </button>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="right" className="w-64">
                    <SheetHeader>
                        <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <SidebarSettings onClose={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>
        </nav>
    );
}