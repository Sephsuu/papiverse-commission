'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { getCategoryIcon } from "@/hooks/use-helper";
import { useToday } from "@/hooks/use-today";
import { formatDateTime, formatDateToWords, formatToPeso } from "@/lib/formatter";
import { BranchService } from "@/services/branch.service";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Branch } from "@/types/branch";
import { format } from "date-fns";
import { CalendarDays, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InventoryReportPeriodMode } from "./components/DatePickerModal";
import { BranchPODatePickerModal } from "./components/BranchPODatePickerModal";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProfitItem = {
    rawMaterialId: number;
    rawMaterialCode: string;
    rawMaterialName: string;
    quantity: number;
    unitMeasurement: string;
    revenue: number;
    cost: number;
    profit: number;
};

type ProfitCategory = {
    meatOrderId?: string | null;
    snowOrderId?: string | null;
    snowItems?: ProfitItem[];
    meatItems?: ProfitItem[];
    categoryProfit: number;
};

type OrderProfitBreakdown = {
    orderId: number;
    branchId: number;
    branchName: string;
    orderDate: string;
    meatCategory?: ProfitCategory | null;
    snowCategory?: ProfitCategory | null;
    overallProfit: number;
};

type BranchProfitResponse = {
    branchId: number;
    startDate: string;
    endDate: string;
    matchedOrderIds: number[];
    perOrderProfitBreakdown: OrderProfitBreakdown[];
    overallProfit: number;
    meatProfit: number;
    snowProfit: number;
};

const getEmptyBranchProfit = async () => null;

const columns = [
    { title: "PO ID", style: "" },
    { title: "Items", style: "" },
    { title: "Category Profit", style: "" },
    { title: "Overall Profit", style: "" },
];

export function BranchPOReportPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { today } = useToday();
    const initialBranch = searchParams.get("branch") ?? "";
    const initialStartDate = searchParams.get("startDate") ?? today;
    const initialEndDate = searchParams.get("endDate") ?? today;

    const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
    const [date, setDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>("DAY");

    const { data: branches, loading: loadingBranches } = useFetchData<Branch>(
        BranchService.getAllBranches
    );

    const { data: branchProfit, loading: loadingBranchProfit } = useFetchOne<BranchProfitResponse | null>(
        selectedBranch ? SupplyOrderService.getBranchesProfit : getEmptyBranchProfit,
        [selectedBranch, date, endDate],
        selectedBranch ? [selectedBranch, date, endDate] : []
    )

    const branchOptions = useMemo(
        () => branches.map((branch) => ({
            label: branch.name,
            value: String(branch.id),
        })),
        [branches]
    );

    const displayDate = useMemo(() => {
        const parsedDate = date ? new Date(date) : null;
        const parsedEndDate = endDate ? new Date(endDate) : null;
        if (!parsedDate || !parsedEndDate) return "Select period";

        if (periodMode === "DAY") return format(parsedDate, "MMMM dd, yyyy");
        if (periodMode === "WEEK") return `${format(parsedDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
        if (periodMode === "MONTH") return format(parsedDate, "MMMM yyyy");

        const quarterNumber = Math.floor(parsedDate.getMonth() / 3) + 1;
        return `Q${quarterNumber} ${format(parsedDate, "yyyy")}`;
    }, [date, endDate, periodMode]);

    const displayBadge = useMemo(() => {
        const parsedDate = date ? new Date(date) : null;
        if (!parsedDate) return null;
        if (periodMode === "DAY") return format(parsedDate, "EEEE").toUpperCase();
        if (periodMode === "WEEK") return "Sun-Sat";
        if (periodMode === "MONTH") return "MONTH";
        return "QUARTER";
    }, [date, periodMode]);

    const selectedBranchName = useMemo(
        () => branchOptions.find((item) => item.value === selectedBranch)?.label ?? "",
        [branchOptions, selectedBranch]
    );

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedBranch) params.set("branch", selectedBranch);
        else params.delete("branch");

        if (date) params.set("startDate", date);
        else params.delete("startDate");

        if (endDate) params.set("endDate", endDate);
        else params.delete("endDate");

        const current = searchParams.toString();
        const next = params.toString();
        if (current !== next) {
            router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
        }
    }, [selectedBranch, date, endDate, pathname, router, searchParams]);

    const summaryCards = useMemo(() => {
        if (!branchProfit) return [];

        return [
            {
                label: "Branch",
                value: `${selectedBranchName}`,
                helper: "Selected branch",
                valueClassName: "text-slate-900",
            },
            {
                label: "Overall Profit",
                value: formatToPeso(branchProfit.overallProfit),
                helper: `Profit data from ${formatDateToWords(branchProfit.startDate)} to ${formatDateToWords(branchProfit.endDate)}`,
                valueClassName: branchProfit.overallProfit < 0 ? "text-darkred" : "text-darkgreen",
            },
            {
                label: "Meat Profit",
                value: formatToPeso(branchProfit.meatProfit),
                helper: "Total MEAT category profit",
                valueClassName: "text-slate-900",
            },
            {
                label: "Snowfrost Profit",
                value: formatToPeso(branchProfit.snowProfit),
                helper: "Total SNOWFROST category profit",
                valueClassName: "text-slate-900",
            },
        ];
    }, [branchProfit, selectedBranchName]);

    if (loadingBranchProfit || loadingBranches) return <PapiverseLoading />
    return (
        <section className="stack-md">
            <AppHeader
                label="Branch Purchase Order Report"
            />

            <div
                onClick={() => setToggleDate(true)}
                className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
            >
                <Store />
                <div className="truncate">{selectedBranchName || "Select Branch"}</div>
                <span className="text-slate-400">|</span>
                <CalendarDays />
                <div className="truncate scale-x-110 origin-left">{displayDate}</div>
                <Badge className={`bg-darkbrown font-bold ml-2 ${periodMode !== "DAY" && "ml-4"}`}>
                    {displayBadge}
                </Badge>
            </div>

            <BranchPODatePickerModal
                date={date}
                mode={periodMode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setMode={setPeriodMode}
                branchOptions={branchOptions}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
            />

            {!selectedBranch && (
                <div className="min-h-[60vh] w-full rounded-md border border-dashed p-5 text-center opacity-70 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Store className="h-28 w-28 text-slate-400" strokeWidth={1.5} />
                        <p className="text-2xl font-semibold text-slate-500">Select a branch to view report.</p>
                    </div>
                </div>
            )}

            {loadingBranchProfit && selectedBranch && <PapiverseLoading />}

            {selectedBranch && branchProfit && (
                <>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div key={card.label} className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">{card.label}</p>
                                <p className={`mt-2 text-2xl font-semibold ${card.valueClassName}`}>
                                    {card.value}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">{card.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-4">
                        <div className="flex-center-y justify-between">
                            <div>
                                <div className="text-darkbrown font-bold text-xl">Order Profit Details</div>
                                <div className="text-sm text-gray">
                                    Per-order raw material profitability breakdown for the selected branch.
                                </div>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <div className="thead grid grid-cols-4">
                                {columns.map((item, index) => (
                                    <div className="th" key={index}>{item.title}</div>
                                ))}
                            </div>

                            <div className="divide-y divide-slate-200 bg-white">
                                {(branchProfit.perOrderProfitBreakdown ?? []).length === 0 ? (
                                    <div className="tdata grid grid-cols-1">
                                        <div className="td text-slate-500">No matched orders in this range.</div>
                                    </div>
                                ) : (
                                    branchProfit.perOrderProfitBreakdown.map((order) => {
                                        const categoryProfit = (order.meatCategory?.categoryProfit ?? 0) + (order.snowCategory?.categoryProfit ?? 0);
                                        const poRows = [
                                            order.meatCategory?.meatOrderId
                                                ? { category: "MEAT", poId: order.meatCategory.meatOrderId }
                                                : null,
                                            order.snowCategory?.snowOrderId
                                                ? { category: "SNOWFROST", poId: order.snowCategory.snowOrderId }
                                                : null,
                                        ].filter(Boolean) as { category: "MEAT" | "SNOWFROST"; poId: string }[];
                                        const categoryProfitRows = [
                                            order.meatCategory
                                                ? { category: "MEAT", value: order.meatCategory.categoryProfit ?? 0 }
                                                : null,
                                            order.snowCategory
                                                ? { category: "SNOWFROST", value: order.snowCategory.categoryProfit ?? 0 }
                                                : null,
                                        ].filter(Boolean) as { category: "MEAT" | "SNOWFROST"; value: number }[];

                                        return (
                                            <div key={order.orderId} className="tdata grid grid-cols-4">
                                                <div className="td text-slate-700 font-medium">
                                                    <div className="flex flex-col gap-1">
                                                        {poRows.length === 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                {getCategoryIcon("OTHER")}
                                                                <span>N/A</span>
                                                            </div>
                                                        ) : (
                                                            poRows.map((row) => {
                                                                const params = new URLSearchParams();
                                                                params.set("category", row.category);
                                                                if (selectedBranch) params.set("branch", selectedBranch);
                                                                if (date) params.set("startDate", date);
                                                                if (endDate) params.set("endDate", endDate);

                                                                return (
                                                                    <Link
                                                                        href={`/finance/branch-po-report/${order.orderId}?${params.toString()}`}
                                                                        key={`${order.orderId}-${row.poId}`}
                                                                        className="flex items-center gap-2 hover:font-semibold hover:underline"
                                                                    >
                                                                        {getCategoryIcon(row.category)}
                                                                        <span>{row.poId}</span>
                                                                    </Link>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="td">
                                                    {formatDateTime(order.orderDate)}
                                                </div>

                                                <div className="td">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        {categoryProfitRows.length === 0 ? (
                                                            <div className={`flex items-center justify-between font-semibold ${categoryProfit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                                                <div className="flex items-center gap-2">
                                                                    {getCategoryIcon("OTHER")}
                                                                    <span>Category</span>
                                                                </div>
                                                                <span>{formatToPeso(categoryProfit)}</span>
                                                            </div>
                                                        ) : (
                                                            categoryProfitRows.map((row) => (
                                                                <div
                                                                    key={`${order.orderId}-${row.category}-profit`}
                                                                    className={`flex items-center justify-between font-semibold ${row.category === 'SNOWFROST' ? "text-blue" : "text-darkbrown"}`}
                                                                >
                                                                    <span>₱</span>
                                                                    <span>{formatToPeso(row.value).slice(1)}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`td justify-between font-semibold ${order.overallProfit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                                    <div>₱</div>
                                                    <div>{formatToPeso(order.overallProfit).slice(1)}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}
