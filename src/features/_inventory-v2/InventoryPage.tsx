"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { DatePickerModal } from "./components/DatePickerModal";
import { InventorySummary } from "./components/InventorySummary";
import { toast } from "sonner";

export function InventoryPage() {
    const [date, setDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );

    const [toggleDate, setToggleDate] = useState(false);
    const [byWeek, setByWeek] = useState(false);

    const parsedDate = date ? new Date(date) : null;

    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";

    const displayDay = parsedDate
        ? format(parsedDate, "EEEE").toUpperCase()
        : null;

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Overview" />

            <div
                onClick={() => setToggleDate(true)}
                className="flex-center-y gap-3 text-xl font-bold mt-4 bg-white shadow-sm border px-4 py-2 rounded-md w-fit cursor-pointer max-md:m-1"
            >
                <CalendarDays />

                <div className="scale-x-110 origin-left">
                    {byWeek && parsedDate
                        ? `${format(parsedDate, "MMM d, yyy")} - ${format(new Date(parsedDate.getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d, yyy")}`
                        : displayDate
                    }
                </div>

                <Badge className="bg-darkbrown font-bold ml-4">
                    {byWeek ? "Sun-Sat" : displayDay}
                </Badge>
            </div>
        

            <Separator className="bg-gray-300 my-4" />

            <DatePickerModal
                date={date}
                setDate={setDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setByWeek={setByWeek}
            />

            <InventorySummary 
                className="mt-8"
                date={date}
                byWeek={byWeek}
                displayDate={displayDate}
            />
        </section>
    )
}
