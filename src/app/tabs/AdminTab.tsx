import { Settings } from "lucide-react";
import { Link } from "react-router";
import AdminPanelComponent from "@/components/admin/AdminPanel";
import { buttonVariants } from "@/components/ui/button";

export default function AdminTab() {
    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Admin</h2>
                <Link
                    to="/settings"
                    className={buttonVariants({ variant: "outline" })}
                >
                    <Settings /> Settings
                </Link>
            </div>
            <AdminPanelComponent />
        </div>
    );
}