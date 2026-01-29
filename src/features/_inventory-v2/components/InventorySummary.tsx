import { EmptyState } from "@/components/custom/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { SectionLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useToday } from "@/hooks/use-today";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { MocksService } from "@/services/mocks.service";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { DetailedCommissary } from "@/types/inventory";
import { formatDate } from "date-fns";
import { Ellipsis, Plus } from "lucide-react";
import Link from "next/link";

const pageKey = "inventorySummaryPage";

const columns = [
    { title: 'Product Name' , style: '' },
    { title: 'Previous Inventory' , style: '' },
    { title: 'Total In' , style: 'text-center' },
    { title: 'Total Out' , style: '' },
    { title: 'Current Inventory' , style: 'flex justify-end mr-4' },
]


export function InventorySummary({ date, className, byWeek }: {
    date: string
    className?: string
    byWeek: boolean
}) {
    const { data: inventory, loading: loadingInventory } = useFetchData<DetailedCommissary>(
        SupplyOrderService.getDetailedCommissary,
        [date, byWeek],
        [byWeek ? "WEEK" : "CUSTOM_DATE", date]
    );

    const { page, setPage, size, paginated } = usePagination(inventory, 10, pageKey);

    if (loadingInventory) return <SectionLoading />
    return (
        <section className={`stack-md ${className}`}>
            <div className="flex-center-y justify-between">
                <div className="text-xl font-bold">
                    Inventory Summary for {formatDate(new Date(date), 'MMMM dd, yyyy')}
                </div>
                <Link 
                    href={`/inventory/pricing?date=${String(date)}`}
                    className="hover:underline"
                >
                    View All
                </Link>
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
                </div>
                
                {paginated.map((item) => (
                    <div className="flex-center-y tdata">
                        <div className={`w-full grid grid-cols-${columns.length}`}>
                            <div className="td">{item.rawMaterial.name}</div>
                            <div className="td">{item.previousInventory}</div>
                            <div className="td">{item.totalIn}</div>
                            <div className="td">{item.totalOut}</div>
                            <div className="td">{item.currentInventory}</div>
                        </div>
                    </div>
                    
                ))}
            </div>

            {paginated.length === 0 && (
                <EmptyState />
            )}

            <TablePagination 
                data={inventory}
                paginated={paginated}
                page={page}
                setPage={setPage}
                size={size}
                pageKey={pageKey}
            />
   
        </section>
    )
}