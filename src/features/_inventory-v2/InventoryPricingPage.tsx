"use client"

import { AppHeader } from "@/components/shared/AppHeader"
import { useEffect, useState } from "react"
import { DatePicker } from "../_supply-orders-v2/components/DatePicker";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";
import { DatePickerModal } from "./components/DatePickerModal";
import { CalendarDays, Ellipsis, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatToPeso } from "@/lib/formatter";
import { MocksService } from "@/services/mocks.service";
import { usePagination } from "@/hooks/use-pagination";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";

const pageKey = "inventoryPricingPage";

const columns = [
    { title: 'Product Name' , style: '' },
    { title: 'Final Stocks' , style: '' },
    { title: 'Total Sold' , style: 'text-center' },
    { title: 'Gross Sales' , style: '' },
    { title: 'Net Profit' , style: 'flex justify-end mr-4' },
]

export function InventoryPricingPage({ className }: {
    className?: string
}) {
    const { dateObj } = useToday();
    const searchParams = useSearchParams();

    const [date, setDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );

    const { data: inventory, loading: loadingInventory } = useFetchOne(
        MocksService.getInventory1
    );
    
    const data = inventory?.data ?? [];

    const { page, setPage, size, paginated } = usePagination(data, 10, pageKey);

    
    const [toggleDate, setToggleDate] = useState(false);

    const selectedDate = searchParams.get("date");

    const parsedDate = selectedDate ? new Date(selectedDate) : null;

    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";

    const displayDay = parsedDate
        ? format(parsedDate, "EEEE").toUpperCase()
        : null;

    useEffect(() => {
        if (selectedDate) {
            setDate(selectedDate);
        } else {
            setDate(format(new Date(), "yyyy-MM-dd"));
        }
    }, [searchParams])
    
    return (
        <section className={`stack-md ${className}`}>
            <div className="flex-center-y justify-between gap-4">
                <AppHeader 
                    label="Inventory Summary for " 
                    hidePapiverseLogo={true}
                    className="mt-auto"
                />

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
                
            </div>

            <Separator className="bg-gray-300 my-2" />

            <div className="table-wrapper">
                <div className="thead flex-center-y">
                    <div className={`w-full grid grid-cols-${columns.length}`}>
                        {columns.map((item) => (
                            <div 
                                key={item.title}
                                className="th"
                            >
                                {item.title}
                            </div>
                        ))}
                    </div>  
                    <div className="w-10 flex-center"><Plus className="w-4 h-4" /></div>
                </div>
                
                {paginated.map((item: any) => (
                    <div className="flex-center-y tdata">
                        <div className={`w-full grid grid-cols-${columns.length}`}>
                            <div className="td">{item.product_name}</div>
                            <div className="td">{Number(item.sales_volume) + Number(item.reorder_level)}</div>
                            <div className="td">{item.sales_volume}</div>
                            <div className="td justify-between">
                                <div>₱</div>
                                {formatToPeso(Number(item.sales_volume) * Number(item.reorder_level)).slice(1,)}
                            </div>
                            <div className="td justify-between">
                                <div>₱</div>
                                {formatToPeso(Number(item.sales_volume) * Number(item.reorder_level) / 2).slice(1,)}
                            </div>
                        </div>
                        <div className="w-10 flex-center hover:opacity-20! cursor-pointer"><Ellipsis className="w-4 h-4"/></div>
                    </div>
                    
                ))}
            </div>

            <DatePickerModal
                date={date}
                setDate={setDate}
                open={toggleDate}
                setOpen={setToggleDate}
            />
        </section>
    )
}