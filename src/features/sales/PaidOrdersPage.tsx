"use client"

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Download, Funnel, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PaidOrder } from "@/types/sales";
import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { PaidOrdersAccordion } from "./components/PaidOrdersAccordion";
import { InsertPaidOrdersExcel } from "./components/InsertPaidOrdersExcel";
import { PaidOrdersPreview } from "./components/PaidOrdersPreview";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SalesService } from "@/services/sales.service";
import { useAuth } from "@/hooks/use-auth";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { SalesCalendar } from "./components/SalesCalendar";
import { SectionLoading } from "@/components/ui/loader";
import { IngestedSales } from "./components/IngestedSales";
import { useCrudState } from "@/hooks/use-crud-state";
import { ViewFullPaidOrder } from "./components/ViewFullPaidOrder";

export default function PaidOrdersPage() {
    const today = new Date().toISOString().split("T")[0];
    const [selectedDay, setSelectedDay] = useState(today)
    const [reload, setReload] = useState(false);
    const [paidOrdersPreview, setPaidOrdersPreview] = useState<PaidOrder[]>([]);
    const [open, setOpen] = useState(false);

    const { claims, loading: authLoading } = useAuth();
    const { data, loading, error } = useFetchData<{
        orderId: string;
        cash: number;
        orderType: string;
        totalPaid: number;
        items: {
            productName: string;
            quantity: number;
        } []
    }>(
        SalesService.getPaidOrders, 
        [reload, selectedDay], 
        [claims.branch.branchId, selectedDay, selectedDay]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['orderId']);
    const { toView, setView } = useCrudState();        

    if (toView) return (
        <ViewFullPaidOrder 
            paidOrders={ data }
            selectedDay={ selectedDay }
            setView={ setView }
        />
    )
    return(
        <section className="flex flex-col gap-2 h-[130vh]">
            <AppHeader label="Paid Orders" />
            
            <div className="grid lg:grid-cols-5 gap-2">
                <SalesCalendar 
                    claims={ claims }
                    className="col-span-3 max-md:col-span-5 h-[95vh]"
                    selectedDay={ selectedDay }
                    setSelectedDay={ setSelectedDay }
                />
                
                {loading ? (
                    <SectionLoading className="col-span-2 max-md:col-span-5" />
                ) : (
                    data && (
                        <IngestedSales 
                            selectedDay={selectedDay}
                            paidOrders={data}
                            setView={ setView }
                            className="col-span-2 max-md:col-span-5 h-[95vh]"
                            setOpen={setOpen}
                        />
                    )
                )}

            </div>

            {open && (
                <InsertPaidOrdersExcel 
                    setOpen={ setOpen }
                    setPaidOrdersPreview={ setPaidOrdersPreview }
                />
            )}

            {paidOrdersPreview.length > 0 && (
                <PaidOrdersPreview 
                    claims={ claims }
                    paidOrdersPreview={ paidOrdersPreview }
                    setPaidOrdersPreview={ setPaidOrdersPreview }
                    setReload={ setReload }
                />
            )}
        </section>
    )
}