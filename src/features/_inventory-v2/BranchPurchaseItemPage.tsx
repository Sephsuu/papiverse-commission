"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Boxes, CalendarDays, PackageSearch, Store, TrendingUp } from "lucide-react";

import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
import { TablePagination } from "@/components/shared/TablePagination";
import { Badge } from "@/components/ui/badge";
import { SectionLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { useToday } from "@/hooks/use-today";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { DatePickerModal, InventoryReportPeriodMode } from "../_finance-v2/components/DatePickerModal";
import { TableFilter } from "@/components/shared/TableFilter";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { SupplyItemTable } from "./components/SupplyItemTable";
import { BranchItemTable } from "./components/BranchItemTable";

const tabs = ['Supply Items', 'Branches']
type PurchaseBranch = {
    branchName?: string | null;
    totalOrder?: number | null;
    toralOrder?: number | null;
    total_order?: number | null;
    toral_order?: number | null;
};

type PurchaseSupply = {
    id?: string | number | null;
    sku?: string | null;
    name?: string | null;
    unitMeasurement?: string | null;
    branches?: PurchaseBranch[] | null;
};

type BranchPurchaseMatrix = {
    dateRange?: {
        startDate?: string;
        endDate?: string;
    };
    items?: PurchaseSupply[] | PurchaseSupply | null;
};

type NormalizedBranch = {
    branchName: string;
    totalOrder: number;
};

type NormalizedItem = {
    key: string;
    sku: string;
    name: string;
    unitMeasurement: string;
    totalOrder: number;
    activeBranchCount: number;
    branches: NormalizedBranch[];
};

type BranchOrderedItem = {
    itemKey: string;
    itemName: string;
    sku: string;
    totalOrder: number;
};

type NormalizedBranchRow = {
    key: string;
    branchName: string;
    totalOrder: number;
    activeItemCount: number;
    searchableItems: string;
    orderedItems: BranchOrderedItem[];
};

type ItemViewMode = "active" | "all";
type ItemSortMode = "total_desc" | "name_asc" | "active_branch_desc";

const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

const pageKey = "branchPurchaseItemPageV2";

function parseOrderValue(branch?: PurchaseBranch | null) {
    if (!branch) return 0;
    return Number(branch.totalOrder ?? branch.toralOrder ?? branch.total_order ?? branch.toral_order ?? 0) || 0;
}

function getRangeLabel(mode: InventoryReportPeriodMode, startDate?: string, endDate?: string) {
    if (!startDate) return "Select period";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (mode === "DAY") return format(start, "MMMM dd, yyyy");
    if (mode === "WEEK") return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
    if (mode === "MONTH") return format(start, "MMMM yyyy");

    const quarterNumber = Math.floor(start.getMonth() / 3) + 1;
    return `Q${quarterNumber} ${format(start, "yyyy")}`;
}

function getRangeBadge(mode: InventoryReportPeriodMode, startDate?: string) {
    if (!startDate) return "PERIOD";

    if (mode === "DAY") return format(new Date(startDate), "EEEE").toUpperCase();
    if (mode === "WEEK") return "SUN-SAT";
    if (mode === "MONTH") return "MONTH";
    return "QUARTER";
}

export function BranchPurchaseItemPage({ className }: { className?: string }) {
    const { today } = useToday();
    const [tab, setTab] = useState(tabs[0]);
    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [mode, setMode] = useState<InventoryReportPeriodMode>("DAY");
    const [toggleDate, setToggleDate] = useState(false);
    const [itemViewMode, setItemViewMode] = useState<ItemViewMode>("active");
    const [itemSortMode, setItemSortMode] = useState<ItemSortMode>("total_desc");
    const filters = useMemo(
        () => [
            { label: "Active Orders", value: "active" },
            { label: "All Supplies", value: "all" },
        ],
        []
    );
    const sorts = useMemo(
        () => [
            { label: "Highest Total", value: "total_desc" },
            { label: "Name (A-Z)", value: "name_asc" },
            { label: "Most Branches", value: "active_branch_desc" },
        ],
        []
    );

    const { data: purchaseItems, loading: loadingPurchaseItems } = useFetchOne<BranchPurchaseMatrix>(
        SupplyOrderService.getAllBranchPurchaseItem,
        [mode, date, endDate],
        [date, endDate]
    );

    const apiSupplies = useMemo(() => {
        const raw = purchaseItems?.items;
        if (!raw) return [] as PurchaseSupply[];
        if (Array.isArray(raw)) return raw;
        return [raw];
    }, [purchaseItems]);

    const normalizedItems = useMemo(() => {
        return apiSupplies.map((item, index) => {
            const branches = Array.isArray(item.branches) ? item.branches : [];
            const branchMap = new Map<string, number>();

            for (const branch of branches) {
                const name = String(branch?.branchName ?? "").trim();
                if (!name) continue;

                const qty = parseOrderValue(branch);
                branchMap.set(name, (branchMap.get(name) ?? 0) + qty);
            }

            const normalizedBranches = Array.from(branchMap.entries())
                .map(([branchName, totalOrder]) => ({ branchName, totalOrder }))
                .sort((a, b) => b.totalOrder - a.totalOrder);

            const totalOrder = normalizedBranches.reduce((sum, branch) => sum + branch.totalOrder, 0);
            const activeBranchCount = normalizedBranches.filter((branch) => branch.totalOrder > 0).length;

            return {
                key: `${item.sku ?? item.id ?? "item"}-${index}`,
                sku: String(item.sku ?? "N/A"),
                name: String(item.name ?? "Unknown Item"),
                unitMeasurement: String(item.unitMeasurement ?? "unit"),
                totalOrder,
                activeBranchCount,
                branches: normalizedBranches,
            } satisfies NormalizedItem;
        });
    }, [apiSupplies]);

    const { search, setSearch, filteredItems: searchFilteredItems } = useSearchFilter<NormalizedItem>(
        normalizedItems,
        ["name", "sku"]
    );

    const displayItems = useMemo(() => {
        const baseItems = itemViewMode === "active"
            ? searchFilteredItems.filter((item) => item.totalOrder > 0)
            : searchFilteredItems;

        const sorted = [...baseItems];

        if (itemSortMode === "name_asc") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            return sorted;
        }

        if (itemSortMode === "active_branch_desc") {
            sorted.sort((a, b) => {
                if (b.activeBranchCount !== a.activeBranchCount) return b.activeBranchCount - a.activeBranchCount;
                return b.totalOrder - a.totalOrder;
            });
            return sorted;
        }

        sorted.sort((a, b) => b.totalOrder - a.totalOrder);
        return sorted;
    }, [itemSortMode, itemViewMode, searchFilteredItems]);

    const normalizedBranches = useMemo(() => {
        const branchMap = new Map<string, { totalOrder: number; orderedItems: BranchOrderedItem[] }>();

        for (const item of normalizedItems) {
            for (const branch of item.branches) {
                if (branch.totalOrder <= 0) continue;

                const existing = branchMap.get(branch.branchName) ?? { totalOrder: 0, orderedItems: [] };
                existing.totalOrder += branch.totalOrder;
                existing.orderedItems.push({
                    itemKey: item.key,
                    itemName: item.name,
                    sku: item.sku,
                    totalOrder: branch.totalOrder,
                });
                branchMap.set(branch.branchName, existing);
            }
        }

        return Array.from(branchMap.entries())
            .map(([branchName, value]) => {
                const orderedItems = [...value.orderedItems].sort((a, b) => b.totalOrder - a.totalOrder);

                return {
                    key: branchName,
                    branchName,
                    totalOrder: value.totalOrder,
                    activeItemCount: orderedItems.length,
                    searchableItems: orderedItems.map((item) => `${item.itemName} ${item.sku}`).join(" "),
                    orderedItems,
                } satisfies NormalizedBranchRow;
            })
            .sort((a, b) => b.totalOrder - a.totalOrder);
    }, [normalizedItems]);

    const {
        search: branchSearch,
        setSearch: setBranchSearch,
        filteredItems: searchFilteredBranches,
    } = useSearchFilter<NormalizedBranchRow>(normalizedBranches, ["branchName", "searchableItems"]);

    const displayBranches = useMemo(() => {
        return searchFilteredBranches;
    }, [searchFilteredBranches]);

    const summary = useMemo(() => {
        let activeItems = 0;
        let totalOrderedQty = 0;
        const branchTotals = new Map<string, number>();

        for (const item of normalizedItems) {
            if (item.totalOrder > 0) activeItems += 1;
            totalOrderedQty += item.totalOrder;

            for (const branch of item.branches) {
                branchTotals.set(
                    branch.branchName,
                    (branchTotals.get(branch.branchName) ?? 0) + branch.totalOrder
                );
            }
        }

        const totalBranches = branchTotals.size;
        const activeBranches = Array.from(branchTotals.values()).filter((value) => value > 0).length;

        let topBranchName = "-";
        let topBranchQty = 0;

        for (const [name, qty] of branchTotals.entries()) {
            if (qty > topBranchQty) {
                topBranchName = name;
                topBranchQty = qty;
            }
        }

        return {
            totalItems: normalizedItems.length,
            activeItems,
            totalBranches,
            activeBranches,
            totalOrderedQty,
            topBranchName,
            topBranchQty,
        };
    }, [normalizedItems]);

    const dateLabel = useMemo(() => {
        const startFromResponse = purchaseItems?.dateRange?.startDate ?? date;
        const endFromResponse = purchaseItems?.dateRange?.endDate ?? endDate;
        return getRangeLabel(mode, startFromResponse, endFromResponse);
    }, [date, endDate, mode, purchaseItems?.dateRange?.endDate, purchaseItems?.dateRange?.startDate]);

    const dateBadge = useMemo(() => {
        const startFromResponse = purchaseItems?.dateRange?.startDate ?? date;
        return getRangeBadge(mode, startFromResponse);
    }, [date, mode, purchaseItems?.dateRange?.startDate]);

    const {
        page: itemPage,
        setPage: setItemPage,
        size: itemSize,
        setSize: setItemSize,
        paginated: paginatedItems,
    } = usePagination(displayItems, 10, `${pageKey}-items`);
    const {
        page: branchPage,
        setPage: setBranchPage,
        size: branchSize,
        setSize: setBranchSize,
        paginated: paginatedBranches,
    } = usePagination(displayBranches, 10, `${pageKey}-branches`);

    const isSupplyTab = tab === tabs[0];

    return (
        <section className={`stack-md w-full min-w-0 max-w-full overflow-x-hidden pb-12 ${className ?? ""}`}>
            <AppHeader label="Branch Purchase Insights" />

 
            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={tabs}
                    selectedTab={tab}
                    setSelectedTab={setTab}
                />
                <div
                    onClick={() => setToggleDate(true)}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm"
                >
                    <CalendarDays className="h-5 w-5" />
                    <div className="truncate scale-x-110 origin-left">{dateLabel}</div>
                    <Badge className="ml-auto bg-darkbrown font-bold">{dateBadge}</Badge>
                </div>
            </div>



            {loadingPurchaseItems ? (
                <SectionLoading />
            ) : (
                <>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Items</p>
                                <Boxes className="h-4 w-4 text-darkbrown" />
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">
                                {numberFormatter.format(summary.activeItems)} / {numberFormatter.format(summary.totalItems)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Active over total supplies</p>
                        </div>

                        <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Branches</p>
                                <Store className="h-4 w-4 text-darkbrown" />
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">
                                {numberFormatter.format(summary.activeBranches)} / {numberFormatter.format(summary.totalBranches)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Branches with orders in period</p>
                        </div>

                        <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total Ordered</p>
                                <TrendingUp className="h-4 w-4 text-darkbrown" />
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{numberFormatter.format(summary.totalOrderedQty)}</p>
                            <p className="mt-1 text-xs text-slate-500">Combined order quantity</p>
                        </div>

                        <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm md:col-span-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Top Branch by Quantity</p>
                                <PackageSearch className="h-4 w-4 text-darkbrown" />
                            </div>
                            <p className="mt-3 truncate text-xl font-semibold text-slate-900">{summary.topBranchName}</p>
                            <p className="mt-1 text-sm text-slate-500">{numberFormatter.format(summary.topBranchQty)} total ordered</p>
                        </div>
                    </div>

                    <div>
                        <div className="text-lg font-semibold text-darkbrown">
                            {isSupplyTab ? "Item Details" : "Branch Details"}
                        </div>
                        <div className="text-sm text-slate-500">
                            {isSupplyTab
                                ? "Items, branches who ordered, and ordered quantity per branch."
                                : "Branches, ordered items, and quantity ordered per item."}
                        </div>
                    </div>

                    {isSupplyTab ? (
                        <div className="flex-center-y gap-2 max-md:flex-col">
                            <TableFilter
                                className="w-full"
                                setSearch={setSearch}
                                search={search}
                                searchPlaceholder="Search for a supply"
                                size={itemSize}
                                setSize={setItemSize}
                                filters={filters}
                                filter={itemViewMode}
                                setFilter={(value) => setItemViewMode(value as ItemViewMode)}
                                removeAdd
                            />
                            <AppSelect
                                className="w-full md:w-[220px] md:shrink-0"
                                triggerClassName="bg-light shadow-xs border-input"
                                items={[...sorts]}
                                value={itemSortMode}
                                onChange={(value) => setItemSortMode(value as ItemSortMode)}
                            />
                        </div>
                    ) : (
                        <TableFilter
                            className="w-full"
                            setSearch={setBranchSearch}
                            search={branchSearch}
                            searchPlaceholder="Search for a branch or item"
                            size={branchSize}
                            setSize={setBranchSize}
                            removeAdd
                            removeFilter
                        />
                    )}

                    {isSupplyTab && displayItems.length === 0 ? (
                        <div className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-slate-500">
                            No items match your current filters.
                        </div>
                    ) : !isSupplyTab && displayBranches.length === 0 ? (
                        <div className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-slate-500">
                            No branches match your current filters.
                        </div>
                    ) : (
                        <>
                            {isSupplyTab ? (
                                <SupplyItemTable items={paginatedItems} />
                            ) : (
                                <BranchItemTable branches={paginatedBranches} />
                            )}

                            <div className="mt-4">
                                {isSupplyTab ? (
                                    <TablePagination<NormalizedItem>
                                        data={displayItems}
                                        page={itemPage}
                                        size={itemSize}
                                        setPage={setItemPage}
                                        paginated={paginatedItems}
                                        search={search}
                                        filter={itemViewMode}
                                        pageKey={`${pageKey}-items`}
                                    />
                                ) : (
                                    <TablePagination<NormalizedBranchRow>
                                        data={displayBranches}
                                        page={branchPage}
                                        size={branchSize}
                                        setPage={setBranchPage}
                                        paginated={paginatedBranches}
                                        search={branchSearch}
                                        filter="all"
                                        pageKey={`${pageKey}-branches`}
                                    />
                                )}
                            </div>
                        </>
                    )}
                 
                </>
            )}

            <DatePickerModal
                date={date}
                mode={mode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setMode={setMode}
            />
        </section>
    );
}
