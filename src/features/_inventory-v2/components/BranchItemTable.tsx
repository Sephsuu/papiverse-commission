"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatNumber } from "@/lib/formatter";

type OrderedItem = {
    itemKey: string;
    itemName: string;
    sku: string;
    totalOrder: number;
};

type BranchRow = {
    key: string;
    branchName: string;
    totalOrder: number;
    orderedItems: OrderedItem[];
};

const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

export function BranchItemTable({ branches }: { branches: BranchRow[] }) {
    return (
        <div className="table-wrapper">
            <div className="thead grid grid-cols-7">
                <div className="th col-span-2">Branch</div>
                <div className="th col-span-2">Total Ordered</div>
                <div className="th col-span-3">Ordered Items</div>
            </div>

            <div className="bg-white">
                {branches.map((branch) => {
                    const previewItems = branch.orderedItems.slice(0, 3);
                    const hiddenCount = Math.max(0, branch.orderedItems.length - previewItems.length);

                    return (
                        <div key={branch.key} className="tdata grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                            <div className="td col-span-2 font-semibold">{branch.branchName}</div>

                            <div className="td col-span-2 font-semibold">{formatNumber(branch.totalOrder)}</div>

                            <div className="td col-span-3 flex-col">
                                <div className="w-full">
                                    {branch.orderedItems.length === 0 ? (
                                        <span className="text-slate-400">No ordered items</span>
                                    ) : (
                                        <>
                                            {previewItems.map((item) => (
                                                <div
                                                    key={`${branch.key}-${item.itemKey}`}
                                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                                                >
                                                    <span className="font-medium">{item.itemName}</span>
                                                    <span className="ml-2 text-xs text-slate-500">{item.sku}</span>
                                                    <span className="ml-2 text-slate-500">({numberFormatter.format(item.totalOrder)})</span>
                                                </div>
                                            ))}

                                            {hiddenCount > 0 && (
                                                <HoverCard openDelay={120} closeDelay={80}>
                                                    <HoverCardTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="ml-2 mt-1 text-xs font-semibold text-gray underline underline-offset-2"
                                                        >
                                                            View more ({hiddenCount})
                                                        </button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent
                                                        align="start"
                                                        className="w-[460px] max-w-[90vw] p-3"
                                                    >
                                                        <div className="mb-2 text-sm font-semibold text-slate-900">
                                                            All ordered items for {branch.branchName}
                                                        </div>
                                                        <div className="max-h-72 space-y-1 overflow-auto pr-1">
                                                            {branch.orderedItems.map((item) => (
                                                                <div
                                                                    key={`all-${branch.key}-${item.itemKey}`}
                                                                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                                                                >
                                                                    <span className="mr-3 truncate">
                                                                        {item.itemName} <span className="text-xs text-slate-500">({item.sku})</span>
                                                                    </span>
                                                                    <span className="shrink-0 font-medium">
                                                                        {numberFormatter.format(item.totalOrder)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
