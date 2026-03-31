import { useEffect, useRef } from "react";
import {
    Navigate,
    Outlet,
    RouterProvider,
    createHashRouter,
    useLocation,
    useMatches,
    useParams,
} from "react-router";
import { Toaster } from "@/components/ui/sonner";
import MQTTNotification from "@/components/MQTTNotification";
import Navbar from "@/app/Navbar";
import AdminTab from "@/app/tabs/AdminTab";
import LightTab from "@/app/tabs/LightTab";
import PresetsTab from "@/app/tabs/PresetsTab";
import RoomView from "@/app/tabs/RoomView";
import StatusTab from "@/app/tabs/StatusTab";
import { AdminProvider } from "@/lib/admin-context";
import { rooms } from "@/lib/appliances";
import { CyberProvider } from "@/lib/cyber-context";
import { DialogProvider } from "@/lib/dialog";
import { connectMQTT } from "@/lib/mqtt";
import { ThemeProvider } from "@/lib/theme-context";
import { useViewMode } from "@/lib/view-mode";

interface RouteHandle {
    title?: string | ((params: Record<string, string | undefined>) => string);
    navIndex?:
        | number
        | ((params: Record<string, string | undefined>) => number);
}

function useRouteTitle() {
    const matches = useMatches();
    const params = useParams();
    const match = matches.at(-1);
    const handle = match?.handle as RouteHandle | undefined;

    useEffect(() => {
        let title = "AutoC4 Lumen";
        if (handle?.title) {
            const section =
                typeof handle.title === "function"
                    ? handle.title(params)
                    : handle.title;
            if (section) title = `AutoC4 Lumen - ${section}`;
        }
        document.title = title;
    }, [handle, params]);
}

function useNavDirection() {
    const matches = useMatches();
    const params = useParams();
    const match = matches.at(-1);
    const handle = match?.handle as RouteHandle | undefined;
    const prevIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (handle?.navIndex == null) return;
        const index =
            typeof handle.navIndex === "function"
                ? handle.navIndex(params)
                : handle.navIndex;

        if (prevIndexRef.current !== null && prevIndexRef.current !== index) {
            document.documentElement.dataset.navDirection =
                index > prevIndexRef.current ? "forward" : "back";
        }
        prevIndexRef.current = index;
    }, [handle, params]);
}

function roomNavIndex(params: Record<string, string | undefined>): number {
    const idx = rooms.findIndex((r) => r.id === params.roomId);
    return idx >= 0 ? idx : 0;
}

function useViewModeSync() {
    const { pathname } = useLocation();
    const { mode, setMode } = useViewMode();

    useEffect(() => {
        // Skip the root redirect path -- let DefaultRedirect handle it
        if (pathname === "/") return;
        if (pathname.startsWith("/room/") && mode !== "room") {
            setMode("room");
        } else if (
            !pathname.startsWith("/room/") &&
            pathname !== "/status" &&
            pathname !== "/admin" &&
            mode !== "function"
        ) {
            setMode("function");
        }
    }, [pathname, mode, setMode]);
}

function Layout() {
    useRouteTitle();
    useNavDirection();
    useViewModeSync();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="[view-transition-name:page-content]">
                <Outlet />
            </div>
        </div>
    );
}

function Notifications() {
    return (
        <>
            <MQTTNotification
                topic="club/shutdown"
                messages={{
                    0: { text: "Shutdown was initiated.", type: "warning" },
                    1: {
                        text: "Forced shutdown was initiated.",
                        type: "error",
                    },
                }}
            />
            <MQTTNotification
                topic="club/gate"
                messages={{ 0: "Gate was opened." }}
            />
            <MQTTNotification
                topic="interface/lumen/reload"
                messages={(payload) => {
                    // Skip retained reload messages to prevent reload loops
                    if (payload.retained) return null;
                    window.location.reload();
                    return null;
                }}
            />
        </>
    );
}

function roomTitle(params: Record<string, string | undefined>): string {
    const room = rooms.find((r) => r.id === params.roomId);
    return room?.label ?? "";
}

function DefaultRedirect() {
    const { mode } = useViewMode();
    return (
        <Navigate
            to={mode === "room" ? `/room/${rooms[0].id}` : "/light"}
            replace
        />
    );
}

const router = createHashRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <DefaultRedirect />,
            },
            {
                path: "/light",
                element: <LightTab />,
                handle: { title: "Light", navIndex: 0 },
            },
            {
                path: "/presets",
                element: <PresetsTab />,
                handle: { title: "Presets", navIndex: 1 },
            },
            {
                path: "/status",
                element: <StatusTab />,
                handle: { title: "Status", navIndex: 1000 },
            },
            {
                path: "/admin",
                element: <AdminTab />,
                handle: { title: "Admin", navIndex: 1001 },
            },
            {
                path: "/room/:roomId",
                element: <RoomView />,
                handle: { title: roomTitle, navIndex: roomNavIndex },
            },
        ],
    },
]);

export default function App() {
    useEffect(() => {
        connectMQTT();
    }, []);

    return (
        <ThemeProvider>
            <AdminProvider>
                <CyberProvider>
                    <RouterProvider router={router} />
                    <Notifications />
                    <Toaster richColors />
                    <DialogProvider />
                </CyberProvider>
            </AdminProvider>
        </ThemeProvider>
    );
}