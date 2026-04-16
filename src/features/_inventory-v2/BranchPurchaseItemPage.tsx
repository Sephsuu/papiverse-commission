"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronDown, Repeat } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionLoading } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
import { DatePickerModal, InventoryReportPeriodMode } from "../_finance-v2/components/DatePickerModal";

type NameItem = { id: string | number | null | undefined; name?: string | null };
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
    branches?: PurchaseBranch[] | null;
};
type BranchPurchaseMatrix = {
    items?: PurchaseSupply[] | PurchaseSupply | null;
};

const SORTS = [
    { key: "alpha_asc", label: "A-Z" },
    { key: "alpha_desc", label: "Z-A" },
    { key: "total_desc", label: "Highest total" },
    { key: "total_asc", label: "Lowest total" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];
const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

function getMatrixCellValue(
    totalLookup: Map<string, number>,
    isSwapped: boolean,
    rowName: string,
    colName: string
) {
    const branchName = isSwapped ? colName : rowName;
    const supplyName = isSwapped ? rowName : colName;
    const key = `${String(supplyName).trim()}||${String(branchName).trim()}`;

    return totalLookup.get(key) ?? 0;
}

function useOnClickOutside(
    refs: Array<React.RefObject<HTMLElement | null>>,
    handler: () => void,
    enabled: boolean
) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            const inside = refs.some((ref) => {
                const el = ref.current;
                return el ? el.contains(target) : false;
            });

            if (!inside) handler();
        };

        document.addEventListener("mousedown", listener, true);
        document.addEventListener("touchstart", listener, true);

        return () => {
            document.removeEventListener("mousedown", listener, true);
            document.removeEventListener("touchstart", listener, true);
        };
    }, [refs, handler, enabled]);
}

function MultiSelectPopover({
    label,
    items,
    selected,
    onToggle,
    onClear,
    placeholderAll,
    widthClassName = "w-full",
}: {
    label: string;
    items: NameItem[];
    selected: string[];
    onToggle: (v: string) => void;
    onClear: () => void;
    placeholderAll: string;
    widthClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useOnClickOutside([triggerRef, panelRef], () => setOpen(false), open);

    const selectedCount = selected.length;

    const filteredItems = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return items;
        return items.filter((it) => String(it?.name ?? "").toLowerCase().includes(query));
    }, [items, q]);

    return (
        <div className={`relative ${widthClassName}`}>
            <button
                ref={triggerRef}
                type="button"
                className="w-full flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 border border-slate-300"
                onClick={() => setOpen((p) => !p)}
            >
                <span className="text-sm text-left truncate">
                    {selectedCount === 0 ? placeholderAll : `${selectedCount} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute z-50 mt-2 w-[320px] rounded-md border bg-white shadow-lg"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">{label}</div>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClear();
                                }}
                            >
                                Clear
                            </Button>
                        </div>

                        <div className="mt-2">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search..."
                                className="h-9"
                            />
                        </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="max-h-64 overflow-auto p-1">
                        {filteredItems.length === 0 ? (
                            <div className="text-sm text-gray-500 py-4 text-center">No results</div>
                        ) : (
                            filteredItems.map((item) => {
                                const name = String(item?.name ?? "");
                                if (!name) return null;

                                const checked = selected.includes(name);

                                return (
                                    <button
                                        key={item.id ?? name}
                                        type="button"
                                        className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onToggle(name);
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            readOnly
                                            className="pointer-events-none accent-lightbrown"
                                        />
                                        <span className="truncate text-sm">{name}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function BranchPurchaseItemPage({ className }: { className?: string }) {
    const { today } = useToday();
    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [mode, setMode] = useState<InventoryReportPeriodMode>("DAY");
    const [toggleDate, setToggleDate] = useState(false);
    const parsedDate = date ? new Date(date) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const isWeeklyView = mode === "WEEK";
    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";
    const displayBadge = parsedDate
        ? isWeeklyView
            ? "Sun-Sat"
            : format(parsedDate, "EEEE").toUpperCase()
        : "DAY";
    const dateLabel = isWeeklyView && parsedDate && parsedEndDate
        ? `${format(parsedDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`
        : displayDate;

    const [isSwapped, setIsSwapped] = useState(false);

    const [rowBranchSelected, setRowBranchSelected] = useState<string[]>([]);
    const [rowSupplySelected, setRowSupplySelected] = useState<string[]>([]);
    const [colBranchSelected, setColBranchSelected] = useState<string[]>([]);
    const [colSupplySelected, setColSupplySelected] = useState<string[]>([]);
    const [rowBranchSearch, setRowBranchSearch] = useState("");
    const [rowSupplySearch, setRowSupplySearch] = useState("");
    const [colBranchSearch, setColBranchSearch] = useState("");
    const [colSupplySearch, setColSupplySearch] = useState("");

    // NEW: sorting mode
    const [rowSort, setRowSort] = useState<SortKey>("total_desc");
    const [colSort, setColSort] = useState<SortKey>("total_desc");

    const { data: purchaseItems, loading: loadingPurchaseItems } = useFetchOne<BranchPurchaseMatrix>(
        SupplyOrderService.getAllBranchPurchaseItem,
        [mode, date, endDate],
        [isWeeklyView ? "WEEK" : "CUSTOM_DATE", date, "0"]
    );

    const apiSupplies = useMemo(() => {
        const raw = purchaseItems?.items;
        if (!raw) return [] as PurchaseSupply[];
        if (Array.isArray(raw)) return raw;
        return [raw];
    }, [purchaseItems]);

    const apiBranchNames = useMemo(() => {
        const set = new Set<string>();

        for (const s of apiSupplies) {
            const bs = Array.isArray(s?.branches) ? s.branches : [];
            for (const b of bs) {
                const bn = String(b?.branchName ?? "").trim();
                if (bn) set.add(bn);
            }
        }

        return Array.from(set);
    }, [apiSupplies]);

    const totalLookup = useMemo(() => {
        const map = new Map<string, number>();

        for (const s of apiSupplies) {
            const supplyName = String(s?.name ?? "").trim();
            if (!supplyName) continue;

            const bs = Array.isArray(s?.branches) ? s.branches : [];
            for (const b of bs) {
                const branchName = String(b?.branchName ?? "").trim();
                if (!branchName) continue;

                const n =
                    Number(b?.totalOrder ?? b?.toralOrder ?? b?.total_order ?? b?.toral_order ?? 0) || 0;

                map.set(`${supplyName}||${branchName}`, n);
            }
        }

        return map;
    }, [apiSupplies]);

    const branchItems: NameItem[] = useMemo(() => {
        return apiBranchNames.map((name) => ({ id: name, name }));
    }, [apiBranchNames]);

    const supplyItems: NameItem[] = useMemo(() => {
        return apiSupplies
            .map((s) => ({
                id: s?.sku ?? s?.id ?? s?.name,
                name: s?.name ?? "",
            }))
            .filter((x) => String(x?.name ?? "").trim().length > 0);
    }, [apiSupplies]);

    const rowDataBase = (isSwapped ? supplyItems : branchItems) as NameItem[];
    const columnDataBase = (isSwapped ? branchItems : supplyItems) as NameItem[];

    const activeRowSelected = isSwapped ? rowSupplySelected : rowBranchSelected;
    const activeColSelected = isSwapped ? colBranchSelected : colSupplySelected;
    const activeRowSearch = isSwapped ? rowSupplySearch : rowBranchSearch;
    const activeColSearch = isSwapped ? colBranchSearch : colSupplySearch;

    const setActiveRowSelected = isSwapped ? setRowSupplySelected : setRowBranchSelected;
    const setActiveColSelected = isSwapped ? setColBranchSelected : setColSupplySelected;
    const setActiveRowSearch = isSwapped ? setRowSupplySearch : setRowBranchSearch;
    const setActiveColSearch = isSwapped ? setColBranchSearch : setColSupplySearch;

    const rowLabel = isSwapped ? "Supply" : "Branch";
    const columnLabel = isSwapped ? "Branch" : "Supply";

    const loadingRow = loadingPurchaseItems;
    const loadingColumn = loadingPurchaseItems;

    const toggleSelection = (
        value: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    const clearSelections = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter([]);

    const rowTotals = useMemo(() => {
        const map = new Map<string, number>();

        for (const r of rowDataBase) {
            const rn = String(r?.name ?? "").trim();
            if (!rn) continue;

            let sum = 0;
            for (const c of columnDataBase) {
                const cn = String(c?.name ?? "").trim();
                if (!cn) continue;
                sum += getMatrixCellValue(totalLookup, isSwapped, rn, cn);
            }

            map.set(rn, sum);
        }

        return map;
    }, [columnDataBase, isSwapped, rowDataBase, totalLookup]);

    const colTotals = useMemo(() => {
        const map = new Map<string, number>();

        for (const c of columnDataBase) {
            const cn = String(c?.name ?? "").trim();
            if (!cn) continue;

            let sum = 0;
            for (const r of rowDataBase) {
                const rn = String(r?.name ?? "").trim();
                if (!rn) continue;
                sum += getMatrixCellValue(totalLookup, isSwapped, rn, cn);
            }

            map.set(cn, sum);
        }

        return map;
    }, [columnDataBase, isSwapped, rowDataBase, totalLookup]);

    const applySort = (items: NameItem[], mode: SortKey, totals: Map<string, number>) => {
        const arr = [...items];

        if (mode === "alpha_asc") {
            arr.sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")));
            return arr;
        }

        if (mode === "alpha_desc") {
            arr.sort((a, b) => String(b?.name ?? "").localeCompare(String(a?.name ?? "")));
            return arr;
        }

        if (mode === "total_desc") {
            arr.sort((a, b) => {
                const ta = totals.get(String(a?.name ?? "").trim()) ?? 0;
                const tb = totals.get(String(b?.name ?? "").trim()) ?? 0;
                if (tb !== ta) return tb - ta;
                return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
            });
            return arr;
        }

        if (mode === "total_asc") {
            arr.sort((a, b) => {
                const ta = totals.get(String(a?.name ?? "").trim()) ?? 0;
                const tb = totals.get(String(b?.name ?? "").trim()) ?? 0;
                if (ta !== tb) return ta - tb;
                return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
            });
            return arr;
        }

        return arr;
    };

    const rowData = useMemo(
        () => applySort(rowDataBase, rowSort, rowTotals),
        [rowDataBase, rowSort, rowTotals]
    );

    const columnData = useMemo(
        () => applySort(columnDataBase, colSort, colTotals),
        [columnDataBase, colSort, colTotals]
    );

    const filteredRowData = useMemo(() => {
        const base = activeRowSelected.length === 0
            ? rowData
            : rowData.filter((item) => activeRowSelected.includes(String(item?.name ?? "")));

        const query = activeRowSearch.trim().toLowerCase();
        if (!query) return base;

        return base.filter((item) => String(item?.name ?? "").toLowerCase().includes(query));
    }, [rowData, activeRowSearch, activeRowSelected]);

    const filteredColumnData = useMemo(() => {
        const base = activeColSelected.length === 0
            ? columnData
            : columnData.filter((item) => activeColSelected.includes(String(item?.name ?? "")));

        const query = activeColSearch.trim().toLowerCase();
        if (!query) return base;

        return base.filter((item) => String(item?.name ?? "").toLowerCase().includes(query));
    }, [columnData, activeColSearch, activeColSelected]);

    const colCount = filteredColumnData.length;
    const gridTemplateColumns = useMemo(
        () => `220px repeat(${colCount}, minmax(150px, 1fr))`,
        [colCount]
    );
    const minWidthPx = useMemo(() => 220 + colCount * 150, [colCount]);

    const showTotalsHintRow = rowSort === "total_desc" || rowSort === "total_asc";
    const showTotalsHintCol = colSort === "total_desc" || colSort === "total_asc";

    return (
        <section className={`stack-md w-full min-w-0 max-w-full overflow-x-hidden pb-12 ${className}`}>
            <AppHeader label="Branch Purchases" />

            <div className="w-full">
                <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
                    <div
                        onClick={() => setToggleDate(true)}
                        className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                    >
                        <CalendarDays className="w-5 h-5" />

                        <div className="scale-x-110 origin-left">
                            {dateLabel}
                        </div>

                        <Badge className="bg-darkbrown font-bold ml-2">
                            {displayBadge}
                        </Badge>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white max-md:w-full max-md:justify-center"
                        onClick={() => setIsSwapped((prev) => !prev)}
                    >
                        <Repeat className="h-4 w-4 text-darkbrown" />
                        Swap to {isSwapped ? "Branch x Supply" : "Supply x Branch"}
                    </button>
                </div>

                <div className="row-md items-center max-md:grid! max-md:mx-1">
                    {loadingColumn ? (
                        <Skeleton className="h-12 w-full bg-slate-300" />
                    ) : (
                        <div className="w-100">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-700">
                                    {columnLabel} <span className="text-slate-400">(Column)</span>
                                </div>
                                {activeColSelected.length > 0 && (
                                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                                        {activeColSelected.length} selected
                                    </Badge>
                                )}
                            </div>

                            <div className="flex-center-y gap-4">
                                <div className="w-full space-y-2">
                                    <Input
                                        value={activeColSearch}
                                        onChange={(e) => setActiveColSearch(e.target.value)}
                                        placeholder={`Search ${columnLabel.toLowerCase()}...`}
                                        className="h-9 bg-white"
                                    />
                                    <MultiSelectPopover
                                        label={`${columnLabel}s`}
                                        items={columnData}
                                        selected={activeColSelected}
                                        onToggle={(v) => toggleSelection(v, setActiveColSelected)}
                                        onClear={() => clearSelections(setActiveColSelected)}
                                        placeholderAll={`All ${columnLabel.toLowerCase()}s`}
                                    />
                                    <AppSelect
                                        className="w-full"
                                        placeholder="Sort columns"
                                        items={SORTS.map((s) => ({ label: s.label, value: s.key }))}
                                        value={colSort}
                                        onChange={(value) => setColSort(value as SortKey)}
                                        triggerClassName="w-full flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 border border-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingRow ? (
                        <Skeleton className="h-12 w-full bg-slate-300" />
                    ) : (
                        <div className="w-100">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-700">
                                    {rowLabel} <span className="text-slate-400">(Row)</span>
                                </div>
                                {activeRowSelected.length > 0 && (
                                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                                        {activeRowSelected.length} selected
                                    </Badge>
                                )}
                            </div>

                            <div className="flex-center-y gap-4">
                                <div className="w-full space-y-2">
                                    <Input
                                        value={activeRowSearch}
                                        onChange={(e) => setActiveRowSearch(e.target.value)}
                                        placeholder={`Search ${rowLabel.toLowerCase()}...`}
                                        className="h-9 bg-white"
                                    />
                                    <MultiSelectPopover
                                        label={`${rowLabel}s`}
                                        items={rowData}
                                        selected={activeRowSelected}
                                        onToggle={(v) => toggleSelection(v, setActiveRowSelected)}
                                        onClear={() => clearSelections(setActiveRowSelected)}
                                        placeholderAll={`All ${rowLabel.toLowerCase()}s`}
                                    />
                                    <AppSelect
                                        className="w-full"
                                        placeholder="Sort columns"
                                        items={SORTS.map((s) => ({ label: s.label, value: s.key }))}
                                        value={rowSort}
                                        onChange={(value) => setRowSort(value as SortKey)}
                                        triggerClassName="w-full flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 border border-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loadingPurchaseItems ? (
                <SectionLoading />
            ) : filteredRowData.length === 0 || filteredColumnData.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
                    <div className="text-lg font-semibold text-slate-900">No matrix data for the current filters</div>
                    <div className="mt-2 text-sm text-slate-500">
                        Clear some row or column filters, or swap the matrix orientation to explore the purchase summary differently.
                    </div>
                </div>
            ) : (
                <div
                    className="table-wrapper-scrollable animate-fade-in-up overflow-x-auto overflow-y-hidden"
                >
                    <div
                        className="thead grid border-b border-slate-200"
                        style={{
                            gridTemplateColumns,
                            minWidth: `${minWidthPx}px`,
                        }}
                    >
                        <div className="th sticky left-0 z-40 bg-[#e2e8f0] border-r"></div>

                        {filteredColumnData.map((item, i: number) => {
                            const name = String(item?.name ?? "");
                            const t = colTotals.get(name.trim()) ?? 0;

                            return (
                                <Tooltip key={i}>
                                    <TooltipTrigger className="th bg-[#eef2f7] relative" key={item.id ?? item.name}>
                                        <div className="truncate">{name}</div>
                                        {showTotalsHintCol && (
                                            <Badge className="absolute top-1 right-2 rounded-full text-[11px] font-semibold bg-darkbrown">
                                                {numberFormatter.format(t)}
                                            </Badge>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-lightbrown mb-2 font-bold" showArrow={false}>{name}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {filteredRowData.map((row) => {
                        const rowName = String(row?.name ?? "");
                        const rt = rowTotals.get(rowName.trim()) ?? 0;

                        return (
                            <div
                                className="tdata grid relative border-b border-slate-100 last:border-b-0"
                                key={row.id ?? row.name}
                                style={{
                                    gridTemplateColumns,
                                    minWidth: `${minWidthPx}px`,
                                }}
                            >
                                <Tooltip>
                                    <TooltipTrigger className="td sticky left-0 z-40 bg-[#fffaf4] border-r border-slate-200 shadow-[2px_0_6px_rgba(0,0,0,0.08)]">
                                        <div className="truncate">{rowName}</div>
                                        {showTotalsHintRow && (
                                            <Badge className="absolute top-1 right-1 text-[11px] rounded-full bg-lightbrown font-semibold">
                                                {numberFormatter.format(rt)}
                                            </Badge>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-lightbrown mb-2 font-bold" showArrow={false}>{rowName}</TooltipContent>
                                </Tooltip>

                                {filteredColumnData.map((col) => {
                                    const v = getMatrixCellValue(
                                        totalLookup,
                                        isSwapped,
                                        String(row?.name ?? ""),
                                        String(col?.name ?? "")
                                    );
                                    return (
                                        <div
                                            className={`td border border-slate-200 text-right font-medium ${
                                                v > 0 ? "bg-white text-slate-900" : "bg-slate-50/70 text-slate-400"
                                            }`}
                                            key={col.id ?? col.name}
                                        >
                                            {numberFormatter.format(v)}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
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
