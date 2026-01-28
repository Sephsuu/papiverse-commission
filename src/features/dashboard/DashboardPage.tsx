"use client"

import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "./AdminDashboard";
import { FranchiseeDashboard } from "./FranchiseeDashboard";
import { PapiverseLoading } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardPage() {
    const router = useRouter();
    const { claims, loading } = useAuth();
    
    useEffect(() => {
        if (!loading && claims.roles.length === 0) {
            router.push("/auth");
        }
    }, [loading, claims, router]);
    
    if (loading) return <PapiverseLoading />
    if (claims.roles[0] === 'FRANCHISOR') return <AdminDashboard />
    if (claims.roles[0] === 'FRANCHISEE') return <FranchiseeDashboard />
}