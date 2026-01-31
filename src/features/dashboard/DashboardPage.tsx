"use client"

import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "./AdminDashboard";
import { FranchiseeDashboard } from "./FranchiseeDashboard";
import { MainLoader, PapiverseLoading } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { InventoriesPage } from "../inventory/InventoriesPage";

export function DashboardPage() {
    const router = useRouter();
    const { claims, loading } = useAuth();
    
    useEffect(() => {
        if (!loading && claims.roles.length === 0) {
            router.push("/auth");
        }
    }, [loading, claims, router]);
    
    if (loading) return <MainLoader />
    if (claims.roles[0] === 'FRANCHISOR') return <InventoriesPage />
    // if (claims.roles[0] === 'FRANCHISEE') return <FranchiseeDashboard />
    if (claims.roles[0] === 'FRANCHISEE') return <InventoriesPage />
}