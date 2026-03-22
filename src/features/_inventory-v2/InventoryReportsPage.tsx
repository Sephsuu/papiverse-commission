'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { useToday } from "@/hooks/use-today";
import { useMemo, useState } from "react";
import { formatDateToWords, formatNumber, formatToPeso } from "@/lib/formatter";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { InventoryService } from "@/services/inventory.service";
import { PapiverseLoading } from "@/components/ui/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Ham, PackageX, Snowflake } from "lucide-react";
import Link from "next/link";
import { DatePickerModal } from "./components/DatePickerModal";
import { addDays, format } from "date-fns";

const columns = [
    {title: 'Product', style: ''},
    {title: 'Movement', style: ''},
    {title: 'Capital', style: ''},
    {title: 'Sales', style: ''},
    {title: 'Profit', style: ''},
]

export function InventoryReportsPage() {
    const { today } = useToday();
    const [date, setDate] = useState(today);
    const [toggleDate, setToggleDate] = useState(false);
    const [byWeek, setByWeek] = useState(false);
    const requiredCategories = ["MEAT", "SNOWFROST"];

    const startDate = date;
    const endDate = useMemo(() => {
        if (!byWeek) return date;
        return format(addDays(new Date(date), 6), "yyyy-MM-dd");
    }, [byWeek, date]);

    const parsedDate = date ? new Date(date) : null;
    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";
    const displayDay = parsedDate
        ? format(parsedDate, "EEEE").toUpperCase()
        : null;

    const { data: report, loading: loadingReport } = useFetchOne(
        InventoryService.getCommissaryFinanceReport,
        [startDate, endDate],
        [1, startDate, endDate]
    )

    const categories = useMemo(() => {
        const existingCategories = report?.categories ?? [];
        const normalizedCategories = new Map(
            existingCategories.map((category: any) => [category.category, category])
        );

        requiredCategories.forEach((category) => {
            if (!normalizedCategories.has(category)) {
                normalizedCategories.set(category, {
                    category,
                    producedQuantity: 0,
                    soldQuantity: 0,
                    capital: 0,
                    sales: 0,
                    profit: 0,
                });
            }
        });

        return Array.from(normalizedCategories.values());
    }, [report?.categories]);

    if (loadingReport) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Report" />

            <div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="mt-auto">
                            <h2 className="text-xl font-bold text-darkbrown">
                                Krispy Papi Commissary
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing report data from {formatDateToWords(startDate)} to {formatDateToWords(endDate)}.
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => setToggleDate(true)}
                        className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                    >
                        <CalendarDays />

                        <div className="scale-x-110 origin-left">
                            {byWeek && parsedDate
                                ? `${format(parsedDate, "MMM d, yyy")} - ${format(addDays(parsedDate, 6), "MMM d, yyy")}`
                                : displayDate
                            }
                        </div>

                        <Badge className={`bg-darkbrown font-bold ml-2 ${byWeek && "ml-4"}`}>
                            {byWeek ? "Sun-Sat" : displayDay}
                        </Badge>
                    </div>

                </div>
            </div>

            <DatePickerModal
                date={date}
                setDate={setDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setByWeek={setByWeek}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                        value: formatToPeso(report.overall.capital),
                        helper: "Estimated input cost",
                    },
                    {
                        label: "Total Expenses",
                        value: formatToPeso(report.totalExpenses),
                        helper: "Total expenditure",
                    },
                    {
                        label: "Sales",
                        value: formatToPeso(report.overall.sales),
                        helper: "Gross recorded sales",
                    },
                    {
                        label: "Profit",
                        value: formatToPeso(report.overall.profit),
                        helper: "Net return",
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </div>

            <div className="mt-2 flex gap-4">
                {categories.map((category: any) => {
                    const sellThrough = category.producedQuantity > 0
                        ? Math.round((category.soldQuantity / category.producedQuantity) * 100)
                        : 0;

                    return (
                        <div
                            key={category.category}
                            className="w-full rounded-md border border-slate-300 bg-white p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-base font-semibold text-darkbrown">
                                        {category.category} Breakdown
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatNumber(category.soldQuantity)} sold from{" "}
                                        {formatNumber(category.producedQuantity)} produced
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-darkgreen bg-emerald-50 text-darkgreen"
                                >
                                    {sellThrough}% sell-through
                                </Badge>
                            </div>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-3 gap-3">
                                <div className="mt-auto rounded-xl bg-white p-3">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                        Capital
                                    </p>
                                    <p className="mt-2 font-semibold text-slate-900">
                                        {formatToPeso(category.capital)}
                                    </p>
                                </div>
                                <div className="mt-auto rounded-xl bg-white p-3">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                        Sales
                                    </p>
                                    <p className="mt-2 font-semibold text-slate-900">
                                        {formatToPeso(category.sales)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white p-3">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                        Profit
                                    </p>
                                    <p className="mt-2 text-green-700 text-lg font-bold scale-x-110 origin-left">
                                        {formatToPeso(category.profit)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 space-y-4">
                <div className="flex-center-y justify-between">
                    <div>
                        <div className="text-darkbrown font-bold text-xl">Product Details</div>
                        <div className="text-sm text-gray">
                            Item-level sales and profit performance for the selected range.
                        </div>
                    </div>
                    <Link 
                        href={`/inventory/pricing}`}
                        className="hover:underline max-sm:text-right"
                    >
                        View All
                    </Link>
                </div>
                <div>
                    <div className="table-wrapper">
                        <div className="thead grid grid-cols-5">
                            {columns.map((item, i) => (
                                <div className="th" key={i}>{item.title}</div>
                            ))}
                        </div>

                        <div className="divide-y divide-slate-200 bg-white">
                            {report.products.map((item: any) => (
                                <div
                                    key={item.rawMaterialId}
                                    className="tdata grid grid-cols-5"
                                >
                                    <div className="td gap-2">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {item.category === 'MEAT' 
                                                    ? <Ham className="w-4 h-4 text-darkbrown"/> 
                                                : item.category === 'SNOWFROST' 
                                                    ? <Snowflake className="w-4 h-4 text-blue" />
                                                : <PackageX className="w-4 h-4 text-slate-400" />
                                                }
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                { item.category === 'MEAT' 
                                                    ? "MEAT Category" 
                                                : item.category === 'SNOWFROST' 
                                                    ? "SNOW FROST Category" 
                                                : "NON DELIVERABLES"}
                                            </TooltipContent>
                                        </Tooltip>
                                        {item.name}
                                    </div>

                                    <div className="td flex-col items-start! text-slate-600">
                                        <p className="font-medium text-slate-900">
                                            {formatNumber(item.soldQuantity)} sold
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatNumber(item.producedQuantity)} produced
                                        </p>
                                    </div>

                                    <div className="td">
                                        {formatToPeso(item.capital)}
                                    </div>

                                    <div className="td">
                                        {formatToPeso(item.sales)}
                                    </div>

                                    <div className="td text-darkgreen font-semibold scale-x-110 origin-left">
                                        {formatToPeso(item.profit)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
