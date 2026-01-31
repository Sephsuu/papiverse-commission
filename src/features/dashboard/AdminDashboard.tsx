"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { Info } from "lucide-react";
import { useState } from "react";
import { SalesPage } from "../sales/SalesPage";
import { Separator } from "@/components/ui/separator";
import { PapiverseLoading } from "@/components/ui/loader";

const tabs = ['Sales', 'Employees', 'Expenses'];

export function AdminDashboard() {
    const { claims, loading: authLoading} = useAuth();
    const [tab, setTab] = useState('Sales');
    
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    if (authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label={`Welcome Back, ${claims.username}!`} />
            {/* <div className="row-md">
                {tabs.map((item, i) => (
                    <div className={`w-full stack-sm p-4 bg-white rounded-md shadow-sm ${tab === item && "!bg-gradient-to-r from-orange-50 to-yellow-50"}`} key={i}>
                        <div className={`flex justify-between ${tab === item ? "text-dark" : "text-gray"}`}>
                            <div className="text-sm font-semibold">{ item } Summary</div>
                            <button><Info className="w-4 h-4" /></button>
                        </div>
                        <div className="text-gray text-sm">
                            <span className={`inline-block scale-x-120 origin-left text-xl mr-6 font-semibold ${tab === item ? "text-dark" : "text-gray"}`}>{ formatToPeso(45000) }</span> 
                            as of { formatDateToWords(yesterday) }
                        </div>
                        <Button 
                            className={`!bg-darkbrown opacity-50 ${item === tab && "opacity-100"}`}
                            size="sm"
                            onClick={ () => setTab(item) }
                        >
                            View Details
                        </Button>
                    </div>
                ))}
            </div>
            <Separator className="h-2 my-2" /> */}
            {tab === tabs[0] && <SalesPage />}
        </section>
    )
}