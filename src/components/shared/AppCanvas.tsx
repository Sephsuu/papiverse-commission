"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "./AppSidebar"
import { useAuth } from "@/hooks/use-auth"
import { MainLoader, PapiverseLoading } from "../ui/loader"

export function AppCanvas({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    const { claims, loading } = useAuth();
    const isAuth = pathName === "/auth" || pathName === "/unauthorized" || claims.roles.length === 0

    if (loading) return <MainLoader />
    
    return (
        <>
            {claims.roles.length > 0 && <AppSidebar />}
            <main className={`w-full bg-slate-100 ${!isAuth ? "py-4 pl-2 pr-4 max-md:pr-2" : ""}`}>
                {children}
            </main>
        </>
        
    )
}
