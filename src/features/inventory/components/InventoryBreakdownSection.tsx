"use client"

import { ErrorPage } from "@/components/custom/ErrorPage";
import { getCategoryIcon } from "@/hooks/use-helper";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Claim } from "@/types/claims";
import { InventoryBreakdown } from "@/types/inventory";
import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { SectionLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo, useState } from "react";

const pageKey = "inventoryBreakdownPage";
const filters = ["All", "Meat", "Snow Frost", "Non Deliverables"];
const columns = [
    { title: "Supply", style: "col-span-2" },
    { title: "Quantity", style: "" },
    { title: "Price", style: "text-right" },
    { title: "Unit Cost", style: "text-right" },
    { title: "Item Value", style: "text-right" },
    { title: "Item Cost", style: "text-right" },
    { title: "Net Profit", style: "text-right" },
];

type InventoryBranchBreakdownResponse = {
    total: {
        inventoryValue: number;
        inventoryCost: number;
        netProfit: number;
    };
    items: InventoryBreakdown[];
};

const numberFormatter = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

function formatNumber(value: number) {
    return numberFormatter.format(value);
}

function formatProfit(value: number) {
    return value < 0 ? `-${formatToPeso(Math.abs(value))}` : formatToPeso(value);
}

function getCategoryLabel(category: string) {
    if (category === "MEAT") return "MEAT Category";
    if (category === "SNOWFROST") return "SNOW FROST Category";
    return "NON DELIVERABLES";
}

export function InventoryBreakdownSection({ claims }: {
    claims: Claim
}) {
    const [filter, setFilter] = useState(filters[0]);

    const { data: breakdown, loading: loadingBreakdown, error } = useFetchOne<InventoryBranchBreakdownResponse>(
        InventoryService.getInventoryBranchBreakdown,
        [claims.branch.branchId],
        [claims.branch.branchId, 0, 1000]
    );

    const { search, setSearch, filteredItems } = useSearchFilter(
        breakdown?.items ?? [],
        ["name", "sku"]
    );

    const filteredData = useMemo(() => {
        return filteredItems.filter((item) => {
            if (filter === "Meat") return item.category === "MEAT";
            if (filter === "Snow Frost") return item.category === "SNOWFROST";
            if (filter === "Non Deliverables") return item.category === "NONDELIVERABLES";
            return true;
        });
    }, [filter, filteredItems]);

    const { page, setPage, size, setSize, paginated } = usePagination(filteredData, 20, pageKey);

    if (loadingBreakdown) return <SectionLoading />
    if (error) return <ErrorPage error={error} className="-mt-12" />
    if (!breakdown) return <ErrorPage error="Inventory breakdown page is unavailable" className="-mt-12" />

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Current Inventory Value",
                        value: formatToPeso(breakdown.total.inventoryValue ?? 0),
                        helper: "Summation of inventory prices",
                    },
                    {
                        label: "Current Inventory Cost",
                        value: formatToPeso(breakdown.total.inventoryCost ?? 0),
                        helper: "Summation of inventory cost",
                    },
                    {
                        label: "Net Profit",
                        value: formatProfit(breakdown.total.netProfit ?? 0),
                        helper: "Profit summation of each inventory",
                        isNegative: (breakdown.total.netProfit ?? 0) < 0,
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className={`mt-3 text-2xl font-semibold ${item.isNegative ? "text-darkred" : "text-slate-900"}`}>
                            {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </div>

            <TableFilter
                setSearch={setSearch}
                searchPlaceholder="Search for an inventory"
                size={size}
                setSize={setSize}
                removeAdd
                filters={filters}
                filter={filter}
                setFilter={setFilter}
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-8 max-md:w-320!">
                    {columns.map((item) => (
                        <div key={item.title} className={`th ${item.style}`}>
                            {item.title}
                        </div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ? (
                        paginated.map((item) => (
                            <div className="tdata grid grid-cols-8 max-md:w-320!" key={item.inventoryId}>
                                <div className="td col-span-2 gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{getCategoryLabel(item.category)}</TooltipContent>
                                    </Tooltip>

                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {item.sku}
                                        </div>
                                    </div>
                                </div>

                                <div className="td flex-col items-start!">
                                    <span 
                                        className={`font-semibold mr-1
                                            
                                        `}>
                                        { item.quantity?.toFixed(3) }
                                    </span> 
                                    { item.unitMeasurement }
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.externalPrice).slice(1,)}</div>
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.unitCost).slice(1,)}</div>
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.itemValue).slice(1,)}</div>
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.itemCost).slice(1,)}</div>
                                </div>

                                <div className={`td justify-end font-semibold ${item.itemNetProfit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                    {formatProfit(item.itemNetProfit)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-8 my-2 text-center text-sm">There are no inventory breakdown items yet.</div>
                    )}
                </div>
            </div>

            {filteredData.length > 0 && (
                <TablePagination
                    data={filteredData}
                    paginated={paginated}
                    page={page}
                    size={size}
                    setPage={setPage}
                    search={search}
                    filter={filter}
                    pageKey={pageKey}
                />
            )}
        </>
    );
}
