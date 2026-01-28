"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { PapiverseLoading } from "@/components/ui/loader";
import { DateRangePicker } from "@/features/dashboard/components/DataRangePicker";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { SalesService } from "@/services/sales.service";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Fragment, useState } from "react";

const today = format(new Date(), "yyyy-MM-dd");
const pageKey = "productRankingPage";
const columns = [
    { title: "ProductName", style: "" },
    { title: "Quantity", style: "" },
    { title: "Amount", style: "" },
]

export function ProductRankingPage() {
    const [reload, setReload] = useState(false);
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);

    const { data: products, loading } = useFetchData<{
        productName: string;
        quantity: number;
        amount: number;
    }>(
        SalesService.getProductRanking,
        [reload],
        [startDate, endDate]
    );
    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(products, 10, pageKey);
    
    if (loading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up">
            <AppHeader label="Product Sales Ranking" />
            <div className="flex-center-y gap-2">
                <DateRangePicker 
                    startDate={ startDate }
                    endDate={ endDate }
                    setStartDate={ setStartDate }
                    setEndDate={ setEndDate }
                />
                <Button
                    onClick={ () => setReload(prev => !prev) }
                    className="bg-darkorange"
                    size="sm"
                >
                    <RefreshCcw /> Refresh
                </Button>
            </div>
            <div className="table-wrapper">
                {(!products || products.length === 0) ? (
                    <div className="py-10 text-center text-muted-foreground">
                        <p className="text-sm font-medium">No product sales found</p>
                        <p className="text-xs">
                            Try adjusting the date range or click refresh.
                        </p>
                    </div>
                ) : (
                    <Fragment>
                        <div className="thead flex-center-y">
                            <div className="w-20 flex-center">#</div>
                            <div className="w-full grid grid-cols-3">
                                {columns.map((item, index) => (
                                    <div key={index} className={`th ${item.style}`}>{item.title}</div>
                                ))}                     
                            </div>
                        </div>
                        {paginated.map((item, i) => (
                            <div className="tdata flex-center-y">
                                <div className="w-20 flex-center font-semibold">{ (page + 1 - 1) * size + i + 1 }</div>
                                <div className="w-full grid grid-cols-3">
                                    <div className="td">{ item.productName }</div>
                                    <div className="td">{ item.quantity }</div>
                                    <div className="td font-semibold">{ formatToPeso(item.amount) }</div>
                                </div>
                            </div>
                            
                        ))}
                    </Fragment>
                )}
            </div>

            <TablePagination 
                data={ products }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
                pageKey={ pageKey }
            />

        </section>
    )
}