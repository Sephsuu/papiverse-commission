'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatToPeso } from "@/lib/formatter";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

type OrderProfitResponse = {
    orderId: number;
    branchId: number;
    branchName: string;
    orderDate: string;
    meatCategory?: ProfitCategory | null;
    snowCategory?: ProfitCategory | null;
    overallProfit: number;
};

type CategoryTab = "MEAT" | "SNOWFROST";

const columns = [
    { title: "Raw Material", style: "" },
    { title: "Qty", style: "" },
    { title: "Revenue", style: "" },
    { title: "Cost", style: "" },
    { title: "Profit", style: "" },
];

const getEmptyPOProfit = async () => null;

export function POReportPage() {
    const router = useRouter();
    const { id } = useParams();
    const searchParam = useSearchParams();
    const category = (searchParam.get("category") ?? "").toUpperCase();
    const initialCategory: CategoryTab = category === "SNOWFROST" ? "SNOWFROST" : "MEAT";
    const [selectedTab, setSelectedTab] = useState<CategoryTab>(initialCategory);
    const selectedBranch = searchParam.get("branch") ?? "";
    const startDate = searchParam.get("startDate") ?? "";
    const endDate = searchParam.get("endDate") ?? "";

    const orderId = Number(Array.isArray(id) ? id[0] : id);
    const validOrderId = Number.isFinite(orderId) && orderId > 0;

    const { data: poProfit, loading } = useFetchOne<OrderProfitResponse | null>(
        validOrderId ? SupplyOrderService.getPOProfit : getEmptyPOProfit,
        [orderId],
        validOrderId ? [orderId] : []
    );

    const availableTabs = useMemo(() => {
        if (!poProfit) return ["MEAT", "SNOWFROST"] as CategoryTab[];

        const tabs: CategoryTab[] = [];
        if (poProfit.meatCategory) tabs.push("MEAT");
        if (poProfit.snowCategory) tabs.push("SNOWFROST");
        return tabs.length ? tabs : (["MEAT", "SNOWFROST"] as CategoryTab[]);
    }, [poProfit]);

    useEffect(() => {
        if (!availableTabs.includes(selectedTab)) {
            setSelectedTab(availableTabs[0]);
        }
    }, [availableTabs, selectedTab]);

    const activeCategory = selectedTab === "MEAT" ? poProfit?.meatCategory : poProfit?.snowCategory;
    const activePOId = selectedTab === "MEAT" ? activeCategory?.meatOrderId : activeCategory?.snowOrderId;
    const activeItems =
        selectedTab === "MEAT"
            ? activeCategory?.meatItems ?? []
            : activeCategory?.snowItems ?? [];
    const summaryCards = poProfit
        ? [
            {
                label: "Overall Profit",
                value: formatToPeso(poProfit.overallProfit),
                helper: "Combined category profitability",
            },
            {
                label: poProfit.meatCategory?.meatOrderId,
                value: formatToPeso(poProfit.meatCategory?.categoryProfit ?? 0),
                helper: "MEAT category total profit",
            },
            {
                label: poProfit.snowCategory?.snowOrderId,
                value: formatToPeso(poProfit.snowCategory?.categoryProfit ?? 0),
                helper: "SNOWFROST category total profit",
            },
        ]
        : [];

    const backHref = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedBranch) params.set("branch", selectedBranch);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const query = params.toString();
        return query ? `/finance/branch-po-report?${query}` : "/finance/branch-po-report";
    }, [selectedBranch, startDate, endDate]);

    return (
        <section className="stack-md">
            <div className="flex-center-y gap-4">
                <ArrowLeft 
                    className="cursor-pointer"
                    onClick={() => router.push(backHref)}
                />
                <AppHeader 
                    label="Purchase Order Profit Details" 
                    className="w-full"
                />
            </div>

            {!validOrderId && (
                <div className="min-h-[40vh] w-full rounded-md border border-dashed p-5 text-center text-slate-500 flex items-center justify-center">
                    Invalid order id.
                </div>
            )}

            {validOrderId && loading && <PapiverseLoading />}

            {validOrderId && !loading && poProfit && (
                <>
                    <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-3">
                        {summaryCards.map((card) => (
                            <div key={card.label} className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">{card.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                                <p className="mt-1 text-sm text-slate-500">{card.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <div className="text-darkbrown font-bold text-xl">Category Profit Breakdown</div>
                                <div className="text-sm text-gray">Switch tabs to view item-level profitability per category.</div>
                            </div>
                            <AppTabSwitcher
                                tabs={availableTabs}
                                selectedTab={selectedTab}
                                setSelectedTab={(tab) => setSelectedTab(tab as CategoryTab)}
                            />
                        </div>

                        <div className="table-wrapper">
                            <div className="thead grid grid-cols-5">
                                {columns.map((item, index) => (
                                    <div className="th" key={index}>{item.title}</div>
                                ))}
                            </div>

                            <div className="divide-y divide-slate-200 bg-white">
                                {activeItems.length === 0 ? (
                                    <div className="tdata grid grid-cols-1">
                                        <div className="td text-slate-500">No {selectedTab} items found for this order.</div>
                                    </div>
                                ) : (
                                    activeItems.map((item) => (
                                        <div key={item.rawMaterialId} className="tdata grid grid-cols-5">
                                            <div className="td flex-col items-start! text-slate-700">
                                                <p className="font-semibold">{item.rawMaterialName}</p>
                                                <p className="text-xs text-slate-500">{item.rawMaterialCode}</p>
                                            </div>
                                            <div className="td text-slate-700">
                                                {item.quantity} {item.unitMeasurement}
                                            </div>
                                            <div className="td justify-between text-slate-700">
                                                <span>₱</span>
                                                <span>{formatToPeso(item.revenue).slice(1)}</span>
                                            </div>
                                            <div className="td justify-between text-slate-700">
                                                <span>₱</span>
                                                <span>{formatToPeso(item.cost).slice(1)}</span>
                                            </div>
                                            <div className="td justify-between font-semibold text-slate-900">
                                                <span>₱</span>
                                                <span>{formatToPeso(item.profit).slice(1)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {validOrderId && !loading && !poProfit && (
                <div className="min-h-[40vh] w-full rounded-md border border-dashed p-5 text-center text-slate-500 flex items-center justify-center">
                    No PO profit data found.
                </div>
            )}
        </section>
    );
}
