"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatNumber } from "@/lib/formatter";

type SupplyBranch = {
    branchName: string;
    totalOrder: number;
};

type SupplyItemRow = {
    key: string;
    sku: string;
    name: string;
    totalOrder: number;
    branches: SupplyBranch[];
};

const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

export function SupplyItemTable({ items }: { items: SupplyItemRow[] }) {
    return (
        <div className="table-wrapper">
            <div className="thead grid grid-cols-7">
                <div className="th col-span-2">Item</div>
                <div className="th col-span-2">Total</div>
                <div className="th col-span-3">Branches Who Ordered (Full)</div>
            </div>

            <div className="bg-white">
                {items.map((item) => {
                    const orderedBranches = item.branches.filter((branch) => branch.totalOrder > 0);
                    const previewBranches = orderedBranches.slice(0, 3);
                    const hiddenCount = Math.max(0, orderedBranches.length - previewBranches.length);

                    return (
                        <div key={item.key} className="tdata grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                            <div className="td col-span-2">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-gray text-xs">{item.sku}</p>
                                </div>
                            </div>

                            <div className="td col-span-2 font-semibold">{formatNumber(item.totalOrder)}</div>

                            <div className="td col-span-3 flex-col">
                                <div className="w-full">
                                    {orderedBranches.length === 0 ? (
                                        <span className="text-slate-400">No active branch</span>
                                    ) : (
                                        <>
                                            {previewBranches.map((branch) => (
                                                <div
                                                    key={`${item.key}-${branch.branchName}`}
                                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                                                >
                                                    <span className="font-medium">{branch.branchName}</span>
                                                    <span className="ml-2 text-slate-500">({numberFormatter.format(branch.totalOrder)})</span>
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
                                                        className="w-[420px] max-w-[90vw] p-3"
                                                    >
                                                        <div className="mb-2 text-sm font-semibold text-slate-900">
                                                            All ordering branches
                                                        </div>
                                                        <div className="max-h-72 space-y-1 overflow-auto pr-1">
                                                            {orderedBranches.map((branch) => (
                                                                <div
                                                                    key={`all-${item.key}-${branch.branchName}`}
                                                                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                                                                >
                                                                    <span className="mr-3 truncate">{branch.branchName}</span>
                                                                    <span className="shrink-0 font-medium">
                                                                        {numberFormatter.format(branch.totalOrder)}
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
