"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { InventorySection } from "./components/InventorySection";
import { Boxes, ListEnd } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PapiverseLoading } from "@/components/ui/loader";
import { InventoryBreakdownSection } from "./components/InventoryBreakdownSection";

const tabs = [
    {title: "Inventory", icon: Boxes},
    {title: "Breakdown", icon: ListEnd},
] 

export function InventoriesPage() {
    const { claims, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState(tabs[0].title);

    if (authLoading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <div className="flex-center-y justify-between">
                <AppHeader 
                    label="All Inventories" 
                    hidePapiverseLogo
                />
                <div className="flex border-slate-300 bg-white rounded-md">
                    {tabs.map((item) => (
                        <button 
                            key={item.title}
                            onClick={() => setActiveTab(item.title)}
                            className={`shadow-sm px-4 py-1.5 rounded-md flex-center-y gap-2 ${activeTab === item.title && "bg-darkbrown text-light"}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === tabs[0].title && (
                <InventorySection 
                    claims={claims}
                />
            )}

            {activeTab === tabs[1].title && (
                <InventoryBreakdownSection 
                    claims={claims}
                />
            )}
        </section>
    )
}