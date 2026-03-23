"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { InventoryBreakdownSection } from "./components/InventoryBreakdownSection";

export function InventoryBreakdownPage() {
    const { claims, loading: authLoading } = useAuth();

    if (authLoading) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <AppHeader label="Inventory Breakdown" />

            <div className="space-y-1">
                <div className="text-lg font-semibold text-darkbrown">
                    {claims.branch.branchName}
                </div>
                <div className="text-sm text-slate-500">
                    Per-item breakdown of stock, value, cost, and profit for this branch.
                </div>
            </div>

            <InventoryBreakdownSection claims={claims} />
        </section>
    );
}
