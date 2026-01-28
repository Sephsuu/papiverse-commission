"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatToPeso } from "@/lib/formatter";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { DatePickerModal } from "./components/DatePickerModal";
import { InventorySummary } from "./components/InventorySummary";
import { BranchPurchaseItemSummary } from "./components/BranchPurchaseItemSummary";

export function InventoryPage() {
    const [date, setDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );

    const [toggleDate, setToggleDate] = useState(false);

    const parsedDate = date ? new Date(date) : null;

    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";

    const displayDay = parsedDate
        ? format(parsedDate, "EEEE").toUpperCase()
        : null;

    const summary = [
        { title: "Inventory Value", value: formatToPeso(1830110.80) },
        { title: "Inventory Cost", value: formatToPeso(1000000) },
        { title: "Net Profit", value: formatToPeso(800000) },
        { title: "Gross Sales", value: formatToPeso(40000) },
        { title: "Capital", value: formatToPeso(20000) },
        { title: "Net Sales", value: formatToPeso(12000) },
    ]

    return (
        <section className="stack-md py-2 animate-fade-in-up">
            <AppHeader label="Inventory Overview" />
 
            <div
                onClick={() => setToggleDate(true)}
                className="flex-center-y gap-3 text-xl font-bold mt-4 bg-white shadow-sm shadow-lightbrown px-4 py-2 rounded-md w-fit cursor-pointer"
            >
                <CalendarDays />

                <div className="scale-x-110 origin-left">
                    {displayDate}
                </div>

                {displayDay && (
                    <Badge className="bg-darkbrown font-bold ml-4">
                    {displayDay}
                    </Badge>
                )}
            </div>

            <Separator className="bg-gray-300 my-4" />

            <DatePickerModal
                date={date}
                setDate={setDate}
                open={toggleDate}
                setOpen={setToggleDate}
            />

            <div className="grid grid-cols-3 gap-4">
                {summary.map((item) => (
                    <div
                        key={item.title}
                        className="bg-white shadow-sm shadow-lightbrown p-4 rounded-xl hover:bg-slate-100"
                    >
                        <div>{item.title}</div>
                        <Separator className="my-2" />
                        <div className="text-2xl font-bold">{item.value}</div>
                    </div>
                ))}
            </div>

            <InventorySummary 
                className="mt-8"
                date={date}
            />

            <BranchPurchaseItemSummary 
                className="mt-8"
                date={date}
            />
        </section>
    )
}
