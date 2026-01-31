"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Repeat, ChevronDown, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionLoading } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { BranchService } from "@/services/branch.service";
import { SupplyService } from "@/services/supply.service";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Branch } from "@/types/branch";
import { Supply } from "@/types/supply";
import { useSidebar } from "@/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type NameItem = { id: any; name?: string | null };

const SORTS = [
    { key: "alpha_asc", label: "A-Z" },
    { key: "alpha_desc", label: "Z-A" },
    { key: "total_desc", label: "Highest total" },
    { key: "total_asc", label: "Lowest total" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

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
                className="w-full flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 shadow-sm shadow-lightbrown"
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

export function BranchPurchaseItemSummary({
    date,
    className,
    byWeek,
}: {
    date: string;
    className?: string;
    byWeek: boolean;
}) {
    useToday();
    useSearchParams();

    const { open } = useSidebar();

    const [isSwapped, setIsSwapped] = useState(false);
    const [reload, setReload] = useState(false);

    const [rowBranchSelected, setRowBranchSelected] = useState<string[]>([]);
    const [rowSupplySelected, setRowSupplySelected] = useState<string[]>([]);
    const [colBranchSelected, setColBranchSelected] = useState<string[]>([]);
    const [colSupplySelected, setColSupplySelected] = useState<string[]>([]);

    // NEW: sorting mode
    const [rowSort, setRowSort] = useState<SortKey>("total_desc");
    const [colSort, setColSort] = useState<SortKey>("total_desc");

    const { data: branches, loading: loadingBranches } = useFetchData<Branch[]>(
        BranchService.getAllBranches,
        [reload]
    );

    const { data: supplies, loading: loadingSupplies } = useFetchData<Supply[]>(
        SupplyService.getAllSupplies,
        [reload]
    );

    const { data: purchaseItems, loading: loadingPurchaseItems } = useFetchOne<any>(
        SupplyOrderService.getAllBranchPurchaseItem,
        [byWeek, date, reload],
        [byWeek ? "WEEK" : "CUSTOM_DATE", date, reload ? "1" : "0"]
    );

    const apiSupplies = useMemo(() => {
        const raw = purchaseItems?.items;
        if (!raw) return [] as any[];
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
        if (apiBranchNames.length > 0) {
            return apiBranchNames.map((name) => ({ id: name, name }));
        }

        return (Array.isArray(branches) ? branches : []).map((b: any) => ({
            id: b?.id ?? b?.branchId ?? b?.name,
            name: b?.name ?? b?.branchName ?? "",
        }));
    }, [apiBranchNames, branches]);

    const supplyItems: NameItem[] = useMemo(() => {
        if (apiSupplies.length > 0) {
            return apiSupplies
                .map((s: any) => ({
                    id: s?.sku ?? s?.id ?? s?.name,
                    name: s?.name ?? "",
                }))
                .filter((x) => String(x?.name ?? "").trim().length > 0);
        }

        return (Array.isArray(supplies) ? supplies : []).map((s: any) => ({
            id: s?.id ?? s?.sku ?? s?.name,
            name: s?.name ?? "",
        }));
    }, [apiSupplies, supplies]);

    const rowDataBase = (isSwapped ? supplyItems : branchItems) as NameItem[];
    const columnDataBase = (isSwapped ? branchItems : supplyItems) as NameItem[];

    const activeRowSelected = isSwapped ? rowSupplySelected : rowBranchSelected;
    const activeColSelected = isSwapped ? colBranchSelected : colSupplySelected;

    const setActiveRowSelected = isSwapped ? setRowSupplySelected : setRowBranchSelected;
    const setActiveColSelected = isSwapped ? setColBranchSelected : setColSupplySelected;

    const rowLabel = isSwapped ? "Supply" : "Branch";
    const columnLabel = isSwapped ? "Branch" : "Supply";

    const loadingRow = isSwapped ? loadingSupplies : loadingBranches;
    const loadingColumn = isSwapped ? loadingBranches : loadingSupplies;

    const toggleSelection = (
        value: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    const clearSelections = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter([]);

    const getCellValue = (rowName: string, colName: string) => {
        const branchName = isSwapped ? colName : rowName;
        const supplyName = isSwapped ? rowName : colName;

        const key = `${String(supplyName).trim()}||${String(branchName).trim()}`;
        return totalLookup.get(key) ?? 0;
    };

    // NEW: totals per row / per column (used for sorting)
    const rowTotals = useMemo(() => {
        const map = new Map<string, number>();

        for (const r of rowDataBase) {
            const rn = String(r?.name ?? "").trim();
            if (!rn) continue;

            let sum = 0;
            for (const c of columnDataBase) {
                const cn = String(c?.name ?? "").trim();
                if (!cn) continue;
                sum += getCellValue(rn, cn);
            }

            map.set(rn, sum);
        }

        return map;
    }, [rowDataBase, columnDataBase, totalLookup, isSwapped]);

    const colTotals = useMemo(() => {
        const map = new Map<string, number>();

        for (const c of columnDataBase) {
            const cn = String(c?.name ?? "").trim();
            if (!cn) continue;

            let sum = 0;
            for (const r of rowDataBase) {
                const rn = String(r?.name ?? "").trim();
                if (!rn) continue;
                sum += getCellValue(rn, cn);
            }

            map.set(cn, sum);
        }

        return map;
    }, [rowDataBase, columnDataBase, totalLookup, isSwapped]);

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

        return base;
    }, [rowData, activeRowSelected]);

    const filteredColumnData = useMemo(() => {
        const base = activeColSelected.length === 0
            ? columnData
            : columnData.filter((item) => activeColSelected.includes(String(item?.name ?? "")));

        return base;
    }, [columnData, activeColSelected]);

    const colCount = filteredColumnData.length;
    const gridTemplateColumns = useMemo(
        () => `220px repeat(${colCount}, minmax(150px, 1fr))`,
        [colCount]
    );
    const minWidthPx = useMemo(() => 220 + colCount * 150, [colCount]);

    const dateTitle = useMemo(() => {
        try {
            return format(new Date(date), "MMMM dd, yyyy");
        } catch {
            return date;
        }
    }, [date]);

    const showTotalsHintRow = rowSort === "total_desc" || rowSort === "total_asc";
    const showTotalsHintCol = colSort === "total_desc" || colSort === "total_asc";

    return (
        <section className={`stack-md ${className}`}>
            <div className="text-xl font-bold">
                Branch Purchase Items Summary for {dateTitle}
            </div>

            <Separator className="bg-gray-300 my-2" />

            <div className="row-md items-center">
                {loadingColumn ? (
                    <Skeleton className="h-12 w-full bg-slate-300" />
                ) : (
                    <div className="w-full">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                {columnLabel} <span className="font-bold">(Column)</span>
                            </div>

                        </div>

                        <div className="flex-center-y gap-4">
                            <MultiSelectPopover
                                label={`${columnLabel}s`}
                                items={columnData}
                                selected={activeColSelected}
                                onToggle={(v) => toggleSelection(v, setActiveColSelected)}
                                onClear={() => clearSelections(setActiveColSelected)}
                                placeholderAll={`All ${columnLabel.toLowerCase()}s`}
                            />

                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4 opacity-70" />
                                <Select value={colSort} onValueChange={(v) => setColSort(v as SortKey)}>
                                    <SelectTrigger className="h-9 w-44 bg-white shadow-sm shadow-lightbrown">
                                        <SelectValue placeholder="Sort columns" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORTS.map((s) => (
                                            <SelectItem key={s.key} value={s.key}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="mx-2 my-auto"
                            onClick={() => setIsSwapped((prev) => !prev)}
                        >
                            <Repeat className="cursor-pointer w-6 h-6" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-lightbrown font-bold mb-2" showArrow={false}>
                        SWAP
                    </TooltipContent>
                </Tooltip>

                {loadingRow ? (
                    <Skeleton className="h-12 w-full bg-slate-300" />
                ) : (
                    <div className="w-full">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                {rowLabel} <span className="font-bold">(Row)</span>
                            </div>
                        </div>

                        <div className="flex-center-y gap-4">
                            <MultiSelectPopover
                                label={`${rowLabel}s`}
                                items={rowData}
                                selected={activeRowSelected}
                                onToggle={(v) => toggleSelection(v, setActiveRowSelected)}
                                onClear={() => clearSelections(setActiveRowSelected)}
                                placeholderAll={`All ${rowLabel.toLowerCase()}s`}
                            />

                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4 opacity-70" />
                                <Select value={rowSort} onValueChange={(v) => setRowSort(v as SortKey)}>
                                    <SelectTrigger className="h-9 w-44 bg-white shadow-sm shadow-lightbrown">
                                        <SelectValue placeholder="Sort rows" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORTS.map((s) => (
                                            <SelectItem key={s.key} value={s.key}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* <Button
                    className="bg-darkgreen! mt-auto shadow-sm hover:opacity-90"
                    onClick={() => setReload((p) => !p)}
                >
                    <RefreshCcw />
                    Refresh
                </Button> */}
            </div>

            {loadingBranches || loadingSupplies || loadingPurchaseItems ? (
                <SectionLoading />
            ) : (
                <div
                    className={`table-wrapper-scrollable animate-fade-in-up pt-4 ${
                        open ? "w-[82vw]" : "w-[94vw]"
                    }`}
                >
                    <div
                        className="thead grid"
                        style={{
                            gridTemplateColumns,
                            minWidth: `${minWidthPx}px`,
                        }}
                    >
                        <div className="th sticky left-0 z-40 bg-[#e2e8f0] border-r"></div>

                        {filteredColumnData.map((item: any) => {
                            const name = String(item?.name ?? "");
                            const t = colTotals.get(name.trim()) ?? 0;

                            return (
                                <Tooltip>
                                    <TooltipTrigger className="th bg-[#e2e8f0] relative" key={item.id ?? item.name}>
                                        <div className="truncate">{name}</div>
                                        {showTotalsHintCol && (
                                            <Badge className="absolute top-1 right-2 rounded-full text-[11px] font-semibold bg-darkbrown">
                                                {t}
                                            </Badge>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-lightbrown mb-2 font-bold" showArrow={false}>{name}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {filteredRowData.map((row: any) => {
                        const rowName = String(row?.name ?? "");
                        const rt = rowTotals.get(rowName.trim()) ?? 0;

                        return (
                            <div
                                className="tdata grid relative"
                                key={row.id ?? row.name}
                                style={{
                                    gridTemplateColumns,
                                    minWidth: `${minWidthPx}px`,
                                }}
                            >
                                <Tooltip>
                                    <TooltipTrigger className="td sticky left-0 z-40 bg-light border-r shadow-[2px_0_6px_rgba(0,0,0,0.12)]">
                                        <div className="truncate">{rowName}</div>
                                        {showTotalsHintRow && (
                                            <Badge className="absolute top-1 right-1 text-[11px] rounded-full bg-lightbrown font-semibold">
                                                {rt}
                                            </Badge>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-lightbrown mb-2 font-bold" showArrow={false}>{rowName}</TooltipContent>
                                </Tooltip>

                                {filteredColumnData.map((col: any) => {
                                    const v = getCellValue(String(row?.name ?? ""), String(col?.name ?? ""));
                                    return (
                                        <div
                                            className="td bg-light! border border-[rgb(201, 201, 201)] text-right"
                                            key={col.id ?? col.name}
                                        >
                                            {v}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
