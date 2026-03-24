"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { OrderStatusBadge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Inventory } from "@/types/inventory";
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Ham, PackageX, Snowflake } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TablePagination } from "@/components/shared/TablePagination";

const pageKey = "branchInventoryPage";
const columns = [
    { title: 'SKU ID', style: '' },
    { title: 'Supply Name', style: '' },
    { title: 'Base Stock', style: '' },
    { title: 'Converted Stock', style: '' },
    { title: 'Unit Price', style: 'text-right' },
]
const filters = ['All', 'Meat', 'Snow Frost', 'Non Deliverables'];


export function BranchInventoryPage() {
    const searchParam = useSearchParams();
    const branchId = searchParam.get('id');
    const branchName = searchParam.get('name');
    const [filter, setFilter] = useState(filters[0]);

    const { data: inventories, loading } = useFetchOne<{
        total: {
            inventoryCost: number;
            inventoryValue: number;
            netProfit: number;
        },
        inventories: Inventory[];
    }>(
        InventoryService.getInventoryByBranch,
        [branchId],
        [Number(branchId), 0, 1000]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(inventories?.inventories, ['name', 'code']);

    const filteredData = filteredItems.filter(i => {
        if (filter === 'Meat') return i.category === 'MEAT';
        if (filter === 'Snow Frost') return i.category === 'SNOWFROST';
        if (filter === 'Non Deliverables') return i.category === 'NONDELIVERABLES';
        return true;
    });    

    const { page, setPage, size, setSize, paginated } = usePagination(filteredData, 20, pageKey);

    if (loading || !inventories) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <div className="flex-center-y gap-4 w-full">
                <Link href='/branches'>
                    <ArrowLeft className="w-7 h-7" />
                </Link>
                <AppHeader 
                    label={`${branchName} Inventory`} 
                    hidePapiverseLogo
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Current Inventory Value",
                        value: formatToPeso(inventories.total.inventoryValue ?? 0),
                        helper: "Summation of inventory prices",
                    },
                    {
                        label: "Current Inventory Cost",
                        value: formatToPeso(inventories.total.inventoryCost ?? 0),
                        helper: "Summation of inventory cost",
                    },
                    {
                        label: "Net Profit",
                        value: formatToPeso(inventories.total.inventoryCost ?? 0),
                        helper: "Profit summation of inventory",
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
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
                setSearch={ setSearch }
                searchPlaceholder="Search for an inventory"
                size={ size }
                setSize={ setSize }
                removeAdd
                filters={ filters }
                filter={ filter }
                setFilter={ setFilter }
                className="mt-2"
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-5 max-md:w-250!">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ?
                        paginated.map((item, index) => (
                            <div 
                                className={`tdata grid grid-cols-5 max-md:w-250! 
                                    ${item.stockLevel === 'GOOD' 
                                            ? "" 
                                        : item.stockLevel === 'WARNING' 
                                            ? "bg-orange-100!" 
                                        : item.stockLevel === 'DANGER' 
                                            ? "bg-red-100!" 
                                        : "bg-red-200!"
                                    }
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
                                        <TooltipContent>
                                            { item.category === 'MEAT' 
                                                ? "MEAT Category" 
                                            : item.category === 'SNOWFROST' 
                                                ? "SNOW FROST Category" 
                                            : "NON DELIVERABLES"}
                                        </TooltipContent>
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
        </section>
    )
}
