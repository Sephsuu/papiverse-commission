"use client";

import { useState } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/features/dashboard/components/DataRangePicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Ham, PackageX, Snowflake } from "lucide-react";

export const report = {
    branchId: 1,
    branchName: "Krispy Papi Main",
    startDate: "2026-03-07",
    endDate: "2026-03-13",
    overall: {
        producedQuantity: 220.0,
        soldQuantity: 103.0,
        capital: 29034.0,
        sales: 31413.0,
        profit: 2379.0,
    },
    categories: [
        {
            category: "MEAT",
            producedQuantity: 120.0,
            soldQuantity: 60.0,
            capital: 19332.0,
            sales: 21480.0,
            profit: 2148.0,
        },
        {
            category: "SNOWFROST",
            producedQuantity: 100.0,
            soldQuantity: 43.0,
            capital: 9702.0,
            sales: 9933.0,
            profit: 231.0,
        },
    ],
    products: [
        {
            rawMaterialId: 46,
            sku: "KP-MEAT-66249",
            name: "Apron",
            category: "MEAT",
            unitMeasurement: "PC",
            producedQuantity: 120.0,
            soldQuantity: 60.0,
            capital: 19332.0,
            sales: 21480.0,
            profit: 2148.0,
        },
        {
            rawMaterialId: 22,
            sku: "KP-SNOW-36341",
            name: "BLUE LEMONADE POWDER",
            category: "SNOWFROST",
            unitMeasurement: "PACK",
            producedQuantity: 100.0,
            soldQuantity: 43.0,
            capital: 9702.0,
            sales: 9933.0,
            profit: 231.0,
        },
    ],
};

const currencyFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const today = new Date().toISOString().split("T")[0];
const productColumns = [
    { title: "Product" },
    { title: "Movement" },
    { title: "Sales" },
    { title: "Profit" },
];

function formatCurrency(value: number) {
    return currencyFormatter.format(value);
}

function formatNumber(value: number) {
    return numberFormatter.format(value);
}

function formatDate(value: string) {
    return dateFormatter.format(new Date(value));
}


export default function TestPage() {
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Report" />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-slate-700">
                                Branch ID #{report.branchId}
                            </Badge>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {report.branchName}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing report data from {formatDate(startDate)} to {formatDate(endDate)}.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            Select Date Range
                        </p>
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                    {
                        label: "Produced Quantity",
                        value: formatNumber(report.overall.producedQuantity),
                        helper: "Total units prepared",
                    },
                    {
                        label: "Sold Quantity",
                        value: formatNumber(report.overall.soldQuantity),
                        helper: "Units sold in range",
                    },
                    {
                        label: "Capital",
                        value: formatCurrency(report.overall.capital),
                        helper: "Estimated input cost",
                    },
                    {
                        label: "Sales",
                        value: formatCurrency(report.overall.sales),
                        helper: "Gross recorded sales",
                    },
                    {
                        label: "Profit",
                        value: formatCurrency(report.overall.profit),
                        helper: "Net return",
                    },
                ].map((item) => (
                    <Card key={item.label} className="gap-3 py-5">
                        <CardContent className="px-5">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                {item.label}
                            </p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">
                                {item.value}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
                <Card className="py-5">
                    <CardHeader className="pb-0">
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>
                            Performance snapshot per category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {report.categories.map((category) => {
                            const sellThrough = Math.round(
                                (category.soldQuantity / category.producedQuantity) * 100
                            );

                            return (
                                <div
                                    key={category.category}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-semibold text-slate-900">
                                                {category.category}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatNumber(category.soldQuantity)} sold from{" "}
                                                {formatNumber(category.producedQuantity)} produced
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                        >
                                            {sellThrough}% sell-through
                                        </Badge>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                Capital
                                            </p>
                                            <p className="mt-2 font-semibold text-slate-900">
                                                {formatCurrency(category.capital)}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                Sales
                                            </p>
                                            <p className="mt-2 font-semibold text-slate-900">
                                                {formatCurrency(category.sales)}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                Profit
                                            </p>
                                            <p className="mt-2 font-semibold text-emerald-600">
                                                {formatCurrency(category.profit)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="overflow-hidden rounded-md border border-slate-300 bg-white py-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4 px-4">
                        <div>
                            <div className="text-darkbrown font-semibold">PRODUCT DETAILS</div>
                            <div className="mt-1 text-sm text-slate-500">
                                Item-level sales and profit performance for the selected range.
                            </div>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {report.products.length} items
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="table-wrapper">
                            <div className="thead grid grid-cols-4 border-y border-slate-200 bg-slate-50/80">
                                {productColumns.map((item, i) => (
                                    <div className="th text-[11px] uppercase tracking-[0.14em]" key={i}>
                                        {item.title}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white">
                                {report.products.map((item: any) => (
                                    <div
                                        key={item.rawMaterialId}
                                        className="tdata grid grid-cols-4 border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="td gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            {item.category === "MEAT" ? (
                                                                <Ham className="h-4 w-4 text-darkbrown" />
                                                            ) : item.category === "SNOWFROST" ? (
                                                                <Snowflake className="h-4 w-4 text-blue" />
                                                            ) : (
                                                                <PackageX className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {item.category === "MEAT"
                                                            ? "MEAT Category"
                                                            : item.category === "SNOWFROST"
                                                                ? "SNOW FROST Category"
                                                                : "NON DELIVERABLES"}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">
                                                    {item.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.sku} • {item.unitMeasurement}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="td flex-col items-start! gap-0.5 text-slate-600">
                                            <p className="font-medium text-slate-900">
                                                {formatNumber(item.soldQuantity)} sold
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatNumber(item.producedQuantity)} produced
                                            </p>
                                        </div>

                                        <div className="td font-medium text-slate-800">
                                            {formatCurrency(item.sales)}
                                        </div>

                                        <div className="td text-darkgreen font-semibold scale-x-110 origin-left">
                                            {formatCurrency(item.profit)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
