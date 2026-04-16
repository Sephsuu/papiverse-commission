'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { AppTooltip } from "@/components/shared/AppTooltip";
import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { OrderStatusBadge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useCrudState } from "@/hooks/use-crud-state";
import { getCategoryIcon } from "@/hooks/use-helper";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter"
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply"
import { ArrowUpFromDot, Info, SquarePen, Trash2, Weight } from "lucide-react";
import { CreateRawMaterial } from "./components/CreateRawMaterial";
import { DeleteRawMaterial } from "./components/DeleteRawMaterial";
import { UpdateRawMaterial } from "./components/UpdateRawMaterial";
import { ViewRawMaterial } from "./components/ViewRawMaterial";
import { useFetchData } from "@/hooks/use-fetch-data";
import { RawMaterialService } from "@/services/rawMaterial.service";
import { useState } from "react";

const pageKey = "rawMaterialPage";
const columns = [
    { title: "Raw Material", style: "col-span-2" },
    { title: "Base Measurement", style: "" },
    { title: "Converted Measurement", style: "" },
    { title: "Minimum Stock Required", style: "" },
    { title: "Price", style: "text-right" },
    { title: "Unit Cost", style: "text-right" },
    { title: 'Action', style: 'text-center' }
]
const franchiseeColumns = [
    { title: "Raw Material", style: "" },
    { title: "Base Measurement", style: "" },
    { title: "Converted Measurement", style: "" },
    { title: "Minimun Stock Required", style: "text-right" },
    { title: "Price", style: "text-right" },
]

export function RawMaterialsPage() {
    const [reload, setReload] = useState(false);

    const { claims, loading: authLoading, isFranchisor } = useAuth();

    const { data: rawMaterials, loading } = useFetchData<Supply>(
        RawMaterialService.getAllRawMaterials,
        [reload]
    )

    const { search, setSearch, filteredItems } = useSearchFilter(rawMaterials, ['sku', 'name']);

    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems);

    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete } = useCrudState<Supply>();
    
    if (authLoading || loading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <AppHeader label="All Raw Materials" />
            
            <TableFilter 
                setSearch={ setSearch }
                searchPlaceholder="Search for a raw material"
                setOpen={ setOpen }
                buttonLabel="Add raw material"
                size={ size }
                setSize={ setSize }
                removeAdd={ !isFranchisor }
            />

            <div className="table-wrapper">
                <div className={`thead grid max-md:w-250! ${isFranchisor ? "grid-cols-8" : "grid-cols-5"}`}>
                    {(isFranchisor ? columns : franchiseeColumns).map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>{item.title}</div>
                    ))}                     
                </div>
                
                <div className="animate-fade-in-up" key={`${page}`}>
                    {paginated.length > 0 ?
                        paginated.map((item, index) => (
                            <div className={`tdata grid max-md:w-250! ${isFranchisor ? "grid-cols-8" : "grid-cols-5"}`} key={ index }>
                                <div 
                                    className={`td gap-2 ${isFranchisor ? "col-span-2" : ""}`}
                                    onClick={ () => setView(item) }
                                >
                                    <AppTooltip
                                        trigger={
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                                {getCategoryIcon(item.category!)}
                                            </div>
                                        }
                                        content={item.category ?? ''}
                                    />
                             
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {item.sku}
                                        </div>
                                        {item.inventorySourceSku && (
                                            <AppTooltip
                                                trigger={
                                                    <div className="mt-1.5 flex-center-y text-[11px] text-slate-400 truncate">
                                                        <ArrowUpFromDot className="w-3 h-3 mr-1" />
                                                        {`${item.inventorySourceSku}`}
                                                        <Weight className="w-3 h-3 mr-1 ml-2" />
                                                        {item.stockFactor !== null ? `${Number(item.stockFactor).toFixed(3)}` : ""}
                                                    </div>
                                                }
                                                content={`Variation of ${item.inventorySourceSku}`}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="td flex gap-2">{ `${item.unitQuantity?.toFixed(2)} ${item.unitMeasurement}` }</div>
                               <div className="td flex gap-2 ">
                                    {item.convertedQuantity && item.convertedMeasurement
                                        ? `${item.convertedQuantity.toFixed(2)} ${item.convertedMeasurement}`
                                        : <div className="text-darkred font-semibold">N/A</div>}
                                </div>
                                <div className={`td`}>
                                    { item.minStock } { item.unitMeasurement ?? '' }
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
                                {isFranchisor && (
                                    <>
                                    {/* <div className="td justify-between">
                                        { !item.isDeliverables 
                                            ? <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                            : <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.unitPriceInternal!).slice(1,)}</div>
                                            </> }
                                    </div> */}
                                    <div className="td justify-between">
                                        { !item.isDeliverables 
                                            ? <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NON DELIVERABLE" /> 
                                            : <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.unitPriceExternal!).slice(1,)}</div>
                                            </> }
                                    </div>
                                    <div className="td justify-between">
                                        {item.unitCost !== null
                                            ? <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.unitCost).slice(1,)}</div>
                                            </>
                                            : <>
                                                <span className="text-xs text-gray">
                                                    Not available
                                                </span>
                                            </>
                                        }
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
                data={ rawMaterials }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
                search={ search }
                pageKey={ pageKey }
            />

            {open && (
                <CreateRawMaterial 
                    setOpen={ setOpen }
                    setReload={setReload}
                    supplies={ rawMaterials }
                />
            )}

            {toUpdate && (
                <UpdateRawMaterial
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={setReload}
                    supplies={ rawMaterials }
                />
            )}

            {toView && (
                <ViewRawMaterial
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toDelete && (
                <DeleteRawMaterial
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={setReload}
                />
            )}
        </section>
    )
}
