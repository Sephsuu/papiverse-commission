"use client"

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { SectionLoading } from "@/components/ui/loader";
import { useCrudState } from "@/hooks/use-crud-state";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { Inventory } from "@/types/inventory";
import { Info, LayoutList, Search, SquarePen } from "lucide-react";
import { UpdateRawMaterialInventory } from "./UpdateRawMaterialInventory";
import { ViewInventory } from "@/features/inventory/components/ViewInventory";
import { ViewItemInventoryLog } from "@/features/inventory/components/ViewItemInventoryLog";
import { Claim } from "@/types/claims";
import { InventoryService } from "@/services/inventory.service";
import { useState } from "react";

const pageKey = "rawMaterialInventoryPage";
const columns = [
    { title: "Raw Material Name", style: "" },
    { title: "Stock", style: "" },
    { title: "Unit Cost", style: "text-right" },
    { title: "Minimum Required Stock", style: "" },
    { title: "Actions", style: "" },
];

export function RawMaterialInventorySection({ claims }: {
    claims: Claim
}) {
    const [reload, setReload] = useState(false);

    const { data: inventories, loading } = useFetchOne<{
        total: {
            inventoryCost: number;
            inventoryValue: number;
            netProfit: number;
        },
        inventories: Inventory[];
    }>(
        InventoryService.getInventoryByBranch,
        [claims.branch.branchId, reload],
        [claims.branch.branchId, 0, 1000, 'RAW_MATERIAL']
    )
    const { search, setSearch, filteredItems } = useSearchFilter(inventories?.inventories ?? [], ["name", "sku"]);
    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 20, pageKey);

    const { toView, setView, toUpdate, setUpdate, showNotif, setShowNotif } = useCrudState<Inventory>();
    const { toView: toViewItem, setView: setViewItem } = useCrudState<Inventory>();

    if (loading) return <SectionLoading />
    return (
        <section className="stack-md">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Current Inventory Cost",
                        value: formatToPeso(inventories?.total.inventoryCost ?? 0),
                        helper: "Summation of inventory cost",
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </div>
            
            <TableFilter
                search={search}
                setSearch={setSearch}
                searchPlaceholder="Search for a raw material"
                size={size}
                setSize={setSize}
                removeAdd
                removeFilter
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-5 max-md:w-220!">
                    {columns.map((item) => (
                        <div key={item.title} className={`th ${item.style}`}>{item.title}</div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={page}>
                    {paginated.length > 0 ? (
                        paginated.map((item, index) => (
                            <div 
                                className={`tdata grid grid-cols-5 max-md:w-250! 
                                    ${item.stockLevel === 'GOOD' 
                                            ? "" 
                                        : item.stockLevel === 'WARNING' 
                                            ? "bg-yellow-200!" 
                                        : item.stockLevel === 'DANGER' 
                                            ? "bg-[#ffee8c]!" 
                                        : "bg-[#ffde21]!"
                                    }
                                `}
                                key={item.id}
                            >
                                <div className="td flex-col items-start!">
                                    <div className="font-semibold text-slate-900">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.sku}</div>
                                </div>

                                <div className="td">
                                    {item.quantity?.toFixed(2)} {item.unitMeasurement}
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.unitCost ?? 0).slice(1,)}</div>
                                </div>

                                <div className="td">
                                    {item.minStock} {item.unitMeasurement}
                                </div>

                                <div className="flex-center-y gap-2 mx-auto">
                                    <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                    <button onClick={() => setView(item) }><Info className="w-4 h-4" /></button>
                                    <button onClick={() => setViewItem(item) }><LayoutList className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="my-2 text-sm text-center">There are no raw materials yet.</div>
                    )}
                </div>
            </div>

            <TablePagination
                data={filteredItems}
                paginated={paginated}
                page={page}
                size={size}
                setPage={setPage}
                search={search}
                pageKey={pageKey}
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
                <UpdateRawMaterialInventory
                    toUpdate={toUpdate}
                    setUpdate={setUpdate}
                    setReload={setReload}
                />
            )}
        </section>
    );
}
