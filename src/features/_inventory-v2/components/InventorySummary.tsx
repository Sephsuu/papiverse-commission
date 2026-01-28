import { EmptyState } from "@/components/custom/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { SectionLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { MocksService } from "@/services/mocks.service";
import { formatDate } from "date-fns";

const pageKey = "inventorySummaryPage";

const columns = [
    { title: 'Product Name' , style: '' },
    { title: 'Final Stocks' , style: '' },
    { title: 'Total Sold' , style: 'text-center' },
    { title: 'Gross Sales' , style: '' },
    { title: 'Net Profit' , style: 'flex justify-end mr-4' },
]


export function InventorySummary({ date, className }: {
    date: string
    className?: string
}) {
    const { data: inventory, loading: loadingInventory } = useFetchOne(
        MocksService.getInventory1
    );

    const data = inventory?.data ?? [];

    const { page, setPage, size, paginated } = usePagination(data, 10, pageKey);

    if (loadingInventory) return <SectionLoading />
    return (
        <section className={`stack-md ${className}`}>
            <div className="text-xl font-bold">
                Inventory Summary for {formatDate(new Date(date), 'MMMM dd, yyyy')}
            </div>
            
            <Separator className="bg-gray-300 my-2" />
         
            <div className="table-wrapper">
                <div className={`thead grid grid-cols-${columns.length}`}>
                    {columns.map((item) => (
                        <div 
                            key={item.title}
                            className="th"
                        >
                            {item.title}
                        </div>
                    ))}
                </div>
                {paginated.map((item: any) => (
                    <div className={`tdata grid grid-cols-${columns.length}`}>
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
                ))}
            </div>

            {paginated.length === 0 && (
                <EmptyState />
            )}

            <TablePagination 
                data={data}
                paginated={paginated}
                page={page}
                setPage={setPage}
                size={size}
                pageKey={pageKey}
            />
   
        </section>
    )
}