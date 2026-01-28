"use client"

import { usePathname } from "next/navigation"

export function AppCanvas({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    const isAuth = pathName === "/auth" || pathName === "/unauthorized"
    
    return (
        <main className={`w-full bg-slate-100 ${!isAuth ? "py-4 pl-2 pr-4 max-md:pr-2" : ""}`}>
            {children}
        </main>
    )
}
