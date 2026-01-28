"use client"

import { AppHeader } from "@/components/shared/AppHeader"
import { useEffect, useState } from "react"
import { DatePicker } from "../_supply-orders-v2/components/DatePicker";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";

export function BranchPurchaseItemPage({ className }: {
    className?: string
}) {
    const { dateObj } = useToday();
    const searchParams = useSearchParams();
    const [date, setDate] = useState("");

    const selectedDate = searchParams.get("date");

    useEffect(() => {
        if (selectedDate) {
            setDate(selectedDate);
        } else {
            setDate(format(new Date(), "yyyy-MM-dd"));
        }
    }, [searchParams])
    
    return (
        <section className={`stack-md ${className}`}>
            <div className="flex-center-y">
                <AppHeader 
                    label="Inventory Summary for " 
                    hidePapiverseLogo={true}
                    className="w-full"
                />
                <DatePicker 
                    date={date}
                    setDate={setDate}
                />
                
            </div>
            <div>{dateObj.getUTCDate()}</div>

        </section>
    )
}