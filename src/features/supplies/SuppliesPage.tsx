"use client"

import { PapiverseLoading } from "@/components/ui/loader";
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply";
import { Ham, Info, PackageX, Snowflake, SquarePen, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { CreateSupply } from "./components/CreateSupply";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SupplyService } from "@/services/supply.service";
import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { UpdateSupply } from "./components/UpdateSupply";
import { DeleteSupply } from "./components/DeleteSupply";
import { OrderStatusBadge } from "@/components/ui/badge";
import { useCrudState } from "@/hooks/use-crud-state";
import { useAuth } from "@/hooks/use-auth";
import useNotifications from "@/hooks/use-notification";
import { NotificationSheet } from "@/components/shared/NotificationSheet";
import { ViewSupply } from "./components/ViewSupply";

const pageKey = "supplyPage";
const columns = [
    { title: "SKU ID", style: "" },
    { title: "Supply Name", style: "" },
    { title: "Base Measurement", style: "" },
    { title: "Converted Measurement", style: "" },
    { title: "Minimum Stock Required", style: "" },
    { title: "Internal Price", style: "text-right" },
    { title: "External Price", style: "text-right" },
    { title: 'Action', style: 'text-center' }
]
const franchiseeColumns = [
    { title: "SKU ID", style: "" },
    { title: "Supply Name", style: "" },
    { title: "Base Measurement", style: "" },
    { title: "Converted Measurement", style: "" },
    { title: "Price", style: "text-right" },
    { title: "Minimum Stock Required", style: "text-right" },
]


const filters = ['All', 'Meat', 'Snow Frost', 'Non Deliverables'];

export function SuppliesPage() {
    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState(filters[0]);

    const { data, loading, error } = useFetchData<Supply>(SupplyService.getAllSupplies, [reload]);
    const { filteredNotifications, loading: notifLoading } = useNotifications({ claims, type: "SUPPLY" })
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['code', 'name']); 
    

    const filteredData = filteredItems.filter(i => {
        if (filter === 'Meat') return i.category === 'MEAT';
        if (filter === 'Snow Frost') return i.category === 'SNOWFROST';
        if (filter === 'Non Deliverables') return i.category === 'NONDELIVERABLES';
        return true;
    });

    const { page, setPage, size, setSize, paginated } = usePagination(filteredData, 20, pageKey);    
    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete, showNotif, setShowNotif } = useCrudState<Supply>();

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Supplies" />
            <TableFilter 
                setSearch={ setSearch }
                searchPlaceholder="Search for a supply"
                setOpen={ setOpen }
                buttonLabel="Add a supply"
                size={ size }
                setSize={ setSize }
                filters={ filters }
                filter={ filter }
                setFilter={ setFilter }
                removeAdd={ !isFranchisor }
                filteredNotifications={ filteredNotifications }
                setShowNotif={ setShowNotif }
            />

            <div className="table-wrapper">
                <div className={`thead grid max-md:w-250! ${isFranchisor ? "grid-cols-8" : "grid-cols-6"}`}>
                    {(isFranchisor ? columns : franchiseeColumns).map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>{item.title}</div>
                    ))}                     
                </div>
                
                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ?
                        paginated.map((item, index) => (
                            <div className={`tdata grid max-md:w-250! ${isFranchisor ? "grid-cols-8" : "grid-cols-6"}`} key={ index }>
                                <div onClick={ () => setView(item) } className="td">{ item.sku }</div>
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
                                <div className="td flex gap-2">{ `${item.unitQuantity?.toFixed(2)} ${item.unitMeasurement}` }</div>
                               <div className="td flex gap-2 ">
                                    {item.convertedQuantity && item.convertedMeasurement
                                        ? `${item.convertedQuantity.toFixed(2)} ${item.convertedMeasurement}`
                                        : <div className="text-darkred font-semibold">N/A</div>}
                                </div>
                                {!isFranchisor && (
                                    <div className="td justify-between">
                                        { !item.isDeliverables 
                                            ? <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                            : <>
                                                <div>₱</div>
                                                <div>{formatToPeso(claims.branch.isInternal ? item.unitPriceInternal! : item.unitPriceExternal!).slice(1,)}</div>
                                            </> }
                                    </div>
                                )}
                                <div className={`td`}>
                                    { item.minStock } { item.unitMeasurement ?? '' }
                                </div>
                                {isFranchisor && (
                                    <><div className="td justify-between">
                                        { !item.isDeliverables 
                                            ? <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                            : <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.unitPriceInternal!).slice(1,)}</div>
                                            </> }
                                    </div>
                                    <div className="td justify-between">
                                        { !item.isDeliverables 
                                            ? <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                            : <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.unitPriceExternal!).slice(1,)}</div>
                                            </> }
                                    </div>
                                    <div className="flex-center-y gap-2 mx-auto">
                                        <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                        <button onClick={ () => setView(item) }><Info className="w-4 h-4" /></button>
                                        <button
                                            onClick={ () => setDelete(item) }
                                        >
                                            <Trash2 className="w-4 h-4 text-darkred" />
                                        </button>
                                    </div></>
                                )}
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

            {open && (
                <CreateSupply 
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            )}

            {toView && (
                <ViewSupply
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toUpdate && (
                <UpdateSupply
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}

            {toDelete && (
                <DeleteSupply
                    toDelete={ toDelete }
                    setDelete={ setDelete }
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