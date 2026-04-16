'use client'

import { AppHeader } from "@/components/shared/AppHeader"
import { Boxes, ListEnd } from "lucide-react"
import { useState } from "react"
import { RawMaterialInventorySection } from "./components/RawMaterialInventorySection"
import { RawMaterialBreakdownSection } from "./components/RawMaterialBreakdownSection"
import { useAuth } from "@/hooks/use-auth"
import { PapiverseLoading } from "@/components/ui/loader"

const tabs = [
  { title: "inventory", label: "Inventory", icon: Boxes },
  { title: "breakdown", label: "Breakdown", icon: ListEnd },
];

export function RawMaterialsInventoryPage() {
    const { claims, loading: authLoading} = useAuth();
    const [activeTab, setActiveTab] = useState(tabs[0].title);

    if (authLoading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <div className="flex-center-y justify-between">
                <AppHeader 
                    label="All Inventories for Raw Materials" 
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
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === tabs[0].title && (
                <RawMaterialInventorySection
                    claims={ claims }
                />
            )}

            {activeTab === tabs[1].title && (
                <RawMaterialBreakdownSection
                    claims={ claims }
                />
            )}
        </section>
    )
}