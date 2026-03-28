"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./AppSidebar"
import { useAuth } from "@/hooks/use-auth"
import { MainLoader } from "../ui/loader"
import Link from "next/link"
import { changes } from "@/features/changes/data"
import { X } from "lucide-react"

export function AppCanvas({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    const { claims, loading } = useAuth();
    const isAuth = pathName === "/auth" || pathName === "/unauthorized" || claims.roles.length === 0
    const dismissKey = `changes-banner-dismissed-06-26-2026`;
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setIsDismissed(window.sessionStorage.getItem(dismissKey) === "true");
    }, [dismissKey]);

    function handleDismiss() {
        setIsDismissed(true);
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(dismissKey, "true");
        }
    }

    if (loading) return <MainLoader />
    
    return (
        <>
            {claims.roles.length > 0 && <AppSidebar />}
            <main className={`w-full bg-slate-100 ${!isAuth ? "py-4 pl-2 pr-4 max-md:pr-2" : ""}`}>
                {!isAuth && !isDismissed && (
                    <div className="relative mb-4 flex items-start justify-between gap-3 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-darkbrown shadow-sm">
                        <div className="font-semibold">There were some changes on March 26 - 28, 2026.</div>
                        <Link href="/changes" className="font-semibold underline underline-offset-2 hover:opacity-80">
                            View changes
                        </Link>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="absolute -right-2 -top-2 rounded-full border border-slate-400 p-1 text-darkbrown/70 transition bg-white hover:bg-orange-100 hover:text-darkbrown"
                            aria-label="Dismiss changes alert"
                        >
                            <X className="h-4 w-4 text-darkbrown" />
                        </button>
                    </div>
                )}
                {children}
            </main>
        </>
        
    )
}
