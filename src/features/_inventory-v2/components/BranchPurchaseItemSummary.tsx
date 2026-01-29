"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToday } from "@/hooks/use-today";
import { formatDate } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Repeat, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchData } from "@/hooks/use-fetch-data";
import { BranchService } from "@/services/branch.service";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplyService } from "@/services/supply.service";
import { Supply } from "@/types/supply";
import { Branch } from "@/types/branch";
import { SectionLoading } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";

type NameItem = { id: any; name?: string | null };

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
}: {
    date: string;
    className?: string;
}) {
    useToday();
    useSearchParams();

    const [isSwapped, setIsSwapped] = useState(false);

    const [rowBranchSelected, setRowBranchSelected] = useState<string[]>([]);
    const [rowSupplySelected, setRowSupplySelected] = useState<string[]>([]);
    const [colBranchSelected, setColBranchSelected] = useState<string[]>([]);
    const [colSupplySelected, setColSupplySelected] = useState<string[]>([]);

    const { data: branches = [], loading: loadingBranches } = useFetchData<Branch>(
        BranchService.getAllBranches
    );

    const { data: supplies = [], loading: loadingSupplies } = useFetchData<Supply>(
        SupplyService.getAllSupplies
    );

    const rowData = (isSwapped ? supplies : branches) as any[];
    const columnData = (isSwapped ? branches : supplies) as any[];

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

    const filteredRowData = useMemo(() => {
        if (activeRowSelected.length === 0) return rowData;
        return rowData.filter((item) => activeRowSelected.includes(String(item?.name ?? "")));
    }, [rowData, activeRowSelected]);

    const filteredColumnData = useMemo(() => {
        if (activeColSelected.length === 0) return columnData;
        return columnData.filter((item) => activeColSelected.includes(String(item?.name ?? "")));
    }, [columnData, activeColSelected]);

    const colCount = filteredColumnData.length;
    const gridTemplateColumns = useMemo(
        () => `220px repeat(${colCount}, minmax(150px, 1fr))`,
        [colCount]
    );
    const minWidthPx = useMemo(() => 220 + colCount * 150, [colCount]);

    return (
        <section className={`stack-md ${className}`}>
            <div className="text-xl font-bold">
                Inventory Summary for {formatDate(new Date(date), "MMMM dd, yyyy")}
            </div>

            <Separator className="bg-gray-300 my-2" />

            <div className="row-md items-center">
                {loadingColumn ? (
                    <Skeleton className="h-12 w-full bg-slate-300" />
                ) : (
                    <div className="w-full">
                        <div className="text-sm">
                            {columnLabel} <span className="font-bold">(Column)</span>
                        </div>

                        <MultiSelectPopover
                            label={`${columnLabel}s`}
                            items={columnData as any}
                            selected={activeColSelected}
                            onToggle={(v) => toggleSelection(v, setActiveColSelected)}
                            onClear={() => clearSelections(setActiveColSelected)}
                            placeholderAll={`All ${columnLabel.toLowerCase()}s`}
                        />
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
                        <div className="text-sm">
                            {rowLabel} <span className="font-bold">(Row)</span>
                        </div>

                        <MultiSelectPopover
                            label={`${rowLabel}s`}
                            items={rowData as any}
                            selected={activeRowSelected}
                            onToggle={(v) => toggleSelection(v, setActiveRowSelected)}
                            onClear={() => clearSelections(setActiveRowSelected)}
                            placeholderAll={`All ${rowLabel.toLowerCase()}s`}
                        />
                    </div>
                )}

                <Button
                    className="bg-darkgreen! mt-auto shadow-sm hover:opacity-90"
                    onClick={() => {}}
                >
                    <RefreshCcw />
                    Refresh
                </Button>
            </div>

            {loadingBranches || loadingSupplies ? (
                <SectionLoading />
            ) : (
                <div className="table-wrapper-scrollable mt-2 w-[80vw]">
                    <div
                        className="thead grid"
                        style={{
                            gridTemplateColumns,
                            minWidth: `${minWidthPx}px`,
                        }}
                    >
                        <div className="th sticky left-0 z-40 bg-[#e2e8f0] border-r"></div>

                        {filteredColumnData.map((item: any) => (
                            <div className="th bg-[#e2e8f0]" key={item.id ?? item.name}>
                                {item.name}
                            </div>
                        ))}
                    </div>

                    {filteredRowData.map((item: any) => (
                        <div
                            className="tdata grid relative"
                            key={item.id ?? item.name}
                            style={{
                                gridTemplateColumns,
                                minWidth: `${minWidthPx}px`,
                            }}
                        >
                            <div className="td sticky left-0 z-40 bg-light border-r shadow-[2px_0_6px_rgba(0,0,0,0.12)]">
                                {item.name}
                            </div>

                            {filteredColumnData.map((col: any) => (
                                <div
                                    className="td bg-light! border border-[rgb(201, 201, 201)]"
                                    key={col.id ?? col.name}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
