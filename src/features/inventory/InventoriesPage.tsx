"use client"

import { PapiverseLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { formatToPeso } from "@/lib/formatter";
import { Inventory } from "@/types/inventory";
import { Ham, Info, LayoutList, List, PackageX, Snowflake, SquarePen } from "lucide-react";
import { useState } from "react";
import { useFetchData } from "@/hooks/use-fetch-data";
import { InventoryService } from "@/services/inventory.service";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { UpdateInventory } from "./components/UpdateInventory";
import { useCrudState } from "@/hooks/use-crud-state";
import { OrderStatusBadge } from "@/components/ui/badge";
import { ViewInventory } from "./components/ViewInventory";
import { ViewItemInventoryLog } from "./components/ViewItemInventoryLog";
import useNotifications from "@/hooks/use-notification";
import { NotificationSheet } from "@/components/shared/NotificationSheet";

const pageKey = "inventoryPage";
const columns = [
    { title: 'SKU ID', style: '' },
    { title: 'Supply Name', style: '' },
    { title: 'Base Stock', style: '' },
    { title: 'Converted Stock', style: '' },
    { title: 'Unit Price', style: 'text-right' },
    { title: 'Action', style: 'text-center' },
]
const filters = ['All', 'Meat', 'Snow Frost', 'Non Deliverables'];

export function InventoriesPage() {
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState(filters[0]);

    const { claims, loading: authLoading } = useAuth();
    const { data, loading, error } = useFetchData<Inventory>(
        InventoryService.getInventoryByBranch,
        [claims.branch.branchId, reload],
        [claims.branch.branchId]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['name', 'code']);
    const { filteredNotifications, loading: notifLoading } = useNotifications({ claims, type: "STOCK" })

    const filteredData = filteredItems.filter(i => {
        if (filter === 'Meat') return i.category === 'MEAT';
        if (filter === 'Snow Frost') return i.category === 'SNOWFROST';
        if (filter === 'Non Deliverables') return i.category === 'NONDELIVERABLES';
        return true;
    });    

    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredData, 20, pageKey);
    const { toView, setView, toUpdate, setUpdate, showNotif, setShowNotif } = useCrudState<Inventory>();
    const { toView: toViewItem, setView: setViewItem } = useCrudState<Inventory>();

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Inventories" />

            <TableFilter 
                setSearch={ setSearch }
                searchPlaceholder="Search for an inventory"
                size={ size }
                setSize={ setSize }
                removeAdd
                filters={ filters }
                filter={ filter }
                setFilter={ setFilter }
                filteredNotifications={ filteredNotifications }
                setShowNotif={ setShowNotif }
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-6 max-md:w-250!">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ?
                        paginated.map((item, index) => (
                            <div 
                                className={`tdata grid grid-cols-6 max-md:w-250! ${item.stockLevel === 'GOOD' ? "" : item.stockLevel === 'WARNING' ? "bg-orange-100!" : item.stockLevel === 'DANGER' ? "bg-red-100!" : "bg-red-200!"}

                                `}
                                key={ index }
                            >
                                <div className="td">{ item.sku }</div>
                                <div className="td flex gap-2">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            {item.category === 'MEAT' ? <Ham className="w-4 h-4 text-darkbrown"/> 
                                            : item.category === 'SNOWFROST' ? <Snowflake className="w-4 h-4 text-blue" />
                                            : <PackageX className="w-4 h-4 text-slate-400" />
                                            }
                                        </TooltipTrigger>
                                        <TooltipContent>{ item.category === 'MEAT' ? "MEAT Category" : item.category === 'SNOWFROST' ? "SNOW FROST Category" : "NON DELIVERABLES"}</TooltipContent>
                                    </Tooltip>
                                    <div>{ item.name }</div>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger 
                                        className={`td text-start ${item.stockLevel === 'GOOD' ? "text-darkgreen!" : item.stockLevel === 'WARNING' ? "text-darkorange" : item.stockLevel === 'DANGER' ? "text-darkred" : "text-red-950"}`}
                                    >
                                        <span className="font-semibold mr-1">{ item.quantity?.toFixed(2) }</span> { item.unitMeasurement }
                                    </TooltipTrigger>
                                    <TooltipContent className="text-center">
                                        <div>Required Stock</div> 
                                        <div className="text-[16px]">{ item.minStock } { item.unitMeasurement ??  '' }</div>
                                    </TooltipContent>
                                </Tooltip>
                                <div 
                                    className={`td
                                        ${item.stockLevel === 'GOOD' 
                                        ? "text-darkgreen" 
                                        : item.stockLevel === 'WARNING' 
                                        ? "text-darkorange" 
                                        : item.stockLevel === 'DANGER' 
                                        ? "text-darkred" 
                                        : "text-red-950"}`}
                                >
                                    <span className="font-semibold mr-1">
                                        { item.convertedQuantity?.toFixed(2) ?? 'N/A' }</span> { item.convertedMeasurement }
                                </div>
                                <div className="td justify-between">
                                    { item.category === 'NONDELIVERABLES' 
                                        ? <OrderStatusBadge className="ms-auto scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                        : <><div>₱</div><div>{formatToPeso(item.unitPrice!).slice(1,)}</div></>
                                    }
                                </div>
                                <div className="flex-center-y gap-2 mx-auto">
                                    <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                    <button onClick={() => setView(item) }><Info className="w-4 h-4" /></button>
                                    <button onClick={() => setViewItem(item) }><LayoutList className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                        : (<div className="my-2 text-sm text-center col-span-6">There are no existing supplies yet.</div>)
                    }
                </div>
            </div>

            <TablePagination 
                data={ filteredData }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
                search={ search }
                filter={ filter }
                pageKey={ pageKey }
            />

            {toView && (
                <ViewInventory 
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toViewItem && (
                <ViewItemInventoryLog 
                    toView={ toViewItem }
                    setView={ setViewItem }
                />
            )}

            {toUpdate && (
                <UpdateInventory
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}

            {showNotif && (
                <NotificationSheet
                    notifications={ filteredNotifications }
                    setOpen={ setShowNotif }
                />
            )}
       
        </section>
    )
}