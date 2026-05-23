'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { useToday } from "@/hooks/use-today";
import { useEffect, useMemo, useState } from "react";
import { formatDateToWords, formatNumber, formatToPeso } from "@/lib/formatter";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { PapiverseLoading } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Ham, PackageX, Snowflake } from "lucide-react";
import Link from "next/link";
import { DatePickerModal, InventoryReportPeriodMode } from "./components/DatePickerModal";
import {
    endOfMonth,
    endOfQuarter,
    endOfWeek,
    format,
    isAfter,
    isSameDay,
    parseISO,
    startOfMonth,
    startOfQuarter,
    startOfWeek
} from "date-fns";
import { FinanceService } from "@/services/finance.service";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SS_SD = 'supplyReportStartDate'
const SS_ED = 'supplyReportEndDate'
const YMD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_CATEGORIES = ["MEAT", "SNOWFROST"];

const columns = [
    {title: 'Product', style: ''},
    {title: 'Movement', style: ''},
    {title: 'Capital', style: ''},
    {title: 'Sales', style: ''},
    {title: 'Profit', style: ''},
]

const isYmdDate = (value: unknown): value is string => (
    typeof value === "string" && YMD_DATE_PATTERN.test(value)
);

const clampFutureDate = (date: Date, todayDate: Date) => (
    isAfter(date, todayDate) ? todayDate : date
);

const inferPeriodModeFromDateRange = (
    startDate: string,
    endDate: string,
    today: string
): InventoryReportPeriodMode => {
    if (!isYmdDate(startDate) || !isYmdDate(endDate) || !isYmdDate(today)) {
        return "DAY";
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const todayDate = parseISO(today);

    if (isSameDay(start, end)) {
        return "DAY";
    }

    const weekStart = startOfWeek(start, { weekStartsOn: 0 });
    const weekEnd = clampFutureDate(endOfWeek(start, { weekStartsOn: 0 }), todayDate);
    if (isSameDay(start, weekStart) && isSameDay(end, weekEnd)) {
        return "WEEK";
    }

    const monthStart = startOfMonth(start);
    const monthEnd = clampFutureDate(endOfMonth(start), todayDate);
    if (isSameDay(start, monthStart) && isSameDay(end, monthEnd)) {
        return "MONTH";
    }

    const quarterStart = startOfQuarter(start);
    const quarterEnd = clampFutureDate(endOfQuarter(start), todayDate);
    if (isSameDay(start, quarterStart) && isSameDay(end, quarterEnd)) {
        return "QUARTER";
    }

    return "DAY";
};

export function SupplyReportPage() {
    const { today } = useToday();
    const { getSessionStorage, setSessionStorage } = useSessionStorage<string>();
    const [date, setDate] = useState(() => {
        const storedStartDate = getSessionStorage(SS_SD);
        return isYmdDate(storedStartDate) ? storedStartDate : today;
    });
    const [endDate, setEndDate] = useState(() => {
        const storedEndDate = getSessionStorage(SS_ED);
        return isYmdDate(storedEndDate) ? storedEndDate : today;
    });
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>(() => (
        inferPeriodModeFromDateRange(date, endDate, today)
    ));

    useEffect(() => {
        setSessionStorage(SS_SD, date);
    }, [date, setSessionStorage]);

    useEffect(() => {
        setSessionStorage(SS_ED, endDate);
    }, [endDate, setSessionStorage]);

    useEffect(() => {
        setPeriodMode(inferPeriodModeFromDateRange(date, endDate, today));
    }, [date, endDate, today]);

    const startDate = date;
    const parsedDate = date ? new Date(date) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const displayDate = useMemo(() => {
        if (!parsedDate || !parsedEndDate) return "Select period";

        if (periodMode === "DAY") return format(parsedDate, "MMMM dd, yyyy");
        if (periodMode === "WEEK") return `${format(parsedDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
        if (periodMode === "MONTH") return format(parsedDate, "MMMM yyyy");

        const quarterNumber = Math.floor(parsedDate.getMonth() / 3) + 1;
        return `Q${quarterNumber} ${format(parsedDate, "yyyy")}`;
    }, [parsedDate, parsedEndDate, periodMode]);
    const displayBadge = useMemo(() => {
        if (!parsedDate) return null;
        if (periodMode === "DAY") return format(parsedDate, "EEEE").toUpperCase();
        if (periodMode === "WEEK") return "Sun-Sat";
        if (periodMode === "MONTH") return "MONTH";
        return "QUARTER";
    }, [parsedDate, periodMode]);

    const { data: report, loading: loadingReport } = useFetchOne(
        FinanceService.getSupplyFinanceReport,
        [startDate, endDate],
        [1, startDate, endDate]
    )

    const categories = useMemo(() => {
        const existingCategories = report?.categories ?? [];
        const normalizedCategories = new Map(
            existingCategories.map((category: any) => [category.category, category])
        );

        REQUIRED_CATEGORIES.forEach((category) => {
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
                            {displayDate}
                        </div>

                        <Badge className={`bg-darkbrown font-bold ml-2 ${periodMode !== "DAY" && "ml-4"}`}>
                            {displayBadge}
                        </Badge>
                    </div>

                </div>
            </div>

            <DatePickerModal
                date={date}
                mode={periodMode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setMode={setPeriodMode}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Capital",
                        value: formatToPeso(report.overall.capital),
                        helper: "Estimated input cost",
                    },
                    {
                        label: "Sales",
                        value: formatToPeso(report.overall.sales),
                        helper: "Gross recorded sales",
                    },
                    {
                        label: "Profit",
                        value: formatToPeso(report.overall.sales - report.totalExpenses),
                    },
                    {
                        label: "Total Expenses",
                        value: formatToPeso(report.totalExpenses),
                        helper: "Total expenditure",
                    },
                    {
                        label: "Delivery Fees",
                        value: formatToPeso(report.totalDelivery),
                        helper: "Delivery fees on supply orders",
                    },
                    {
                        label: "Other Fees",
                        value: formatToPeso(report.totalOthers),
                        helper: "Other fees on supply orders",
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className={`mt-3 text-2xl font-semibold ${item.label === "Profit" && report.overall.profit < 0 ? "text-darkred" : "text-slate-900"}`}>
                            {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                        {item.label === 'Profit' && (
                            <div className="text-sm text-slate-500">
                                REN Profit: 
                                <span className="mt-1 text-lg text-darkgreen font-semibold ml-1.5">{formatToPeso(report.renProfit)}</span>
                            </div>
                        )}
                        
                    </div>
                ))}
            </div>

            <div className="mt-2 flex gap-4">
                {categories.map((category: any) => {
                    const sellThrough = category.producedQuantity > 0
                        ? Math.round((category.soldQuantity / category.producedQuantity) * 100)
                        : 0;

                    const isMeat = String(category.category).toUpperCase() === "MEAT";

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
                                        {Number(category.soldQuantity).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} sold from{" "}
                                        {Number(category.producedQuantity).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} produced
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
                                        {isMeat ? 'Jerry Profit' : 'Snowfrost Profit'} 
                                    </p>
                                    <p className={`mt-2 text-lg font-bold scale-x-110 origin-left ${category.profit < 0 ? "text-darkred" : "text-green-700"}`}>
                                        {isMeat ?  formatToPeso(report.jerryProfit) : formatToPeso(category.profit)}
                                    </p>
                                </div>
                                {isMeat ? (
                                    <div className="rounded-xl bg-white p-3">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                            MEAT Expenses
                                        </p>
                                        <p className="mt-2 font-semibold text-slate-900">
                                            {formatToPeso(report.expenses[0].totalExpenses)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="col-span-2 rounded-xl bg-white p-3">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                            Snowfrost Expenses
                                        </p>
                                        <p className="mt-2 font-semibold text-slate-900">
                                            {formatToPeso(report.expenses[1].totalExpenses)}
                                        </p>
                                    </div>
                                )}
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
                        href={`/finance/supply-breakdown`}
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

                                    <div className="td justify-between">
                                        {item.capital !== null && item.capital !== undefined
                                            ? <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.capital).slice(1,)}</div>
                                            </>
                                            : <span className="text-xs text-gray">Not available</span>
                                        }
                                    </div>

                                    <div className="td justify-between">
                                        {item.sales !== null && item.sales !== undefined
                                            ? <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.sales).slice(1,)}</div>
                                            </>
                                            : <span className="text-xs text-gray">Not available</span>
                                        }
                                    </div>

                                    <div className={`td justify-between font-semibold ${item.profit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                        {item.profit !== null && item.profit !== undefined
                                            ? <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.profit).slice(1,)}</div>
                                            </>
                                            : <span className="text-xs text-gray">Not available</span>
                                        }
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
