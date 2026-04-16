'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { useToday } from "@/hooks/use-today";
import { useMemo, useState } from "react";
import { formatDateToWords, formatNumber, formatToPeso } from "@/lib/formatter";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { InventoryService } from "@/services/inventory.service";
import { PapiverseLoading } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Ham, PackageX, Snowflake } from "lucide-react";
import { DatePickerModal, InventoryReportPeriodMode } from "./components/DatePickerModal";
import { format } from "date-fns";

type RawMaterialFinanceReport = {
    branchId: number;
    branchName: string;
    startDate: string;
    endDate: string;
    totalExpenses: number;
    overall: {
        soldFromSupplier: number;
        consumes: number;
        capital: number;
        sales: number;
        remaining: number;
    };
    categories: {
        category: string;
        soldFromSupplier: number;
        consumes: number;
        capital: number;
        sales: number;
        remaining: number;
    }[];
    products: {
        rawMaterialId: number;
        sku: string;
        name: string;
        category: string;
        unitMeasurement: string;
        soldFromSupplier: number;
        consumes: number;
        capital: number;
        sales: number;
        remaining: number;
    }[];
};

const columns = [
    { title: 'Raw Material', style: '' },
    { title: 'Movement', style: '' },
    { title: 'Capital', style: '' },
    { title: 'Consumed Value', style: '' },
    { title: 'Remaining', style: '' },
];

export function RawMaterialReportPage() {
    const { today } = useToday();
    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>("DAY");

    const startDate = date;
    const parsedDate = useMemo(() => (date ? new Date(date) : null), [date]);
    const parsedEndDate = useMemo(() => (endDate ? new Date(endDate) : null), [endDate]);
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

    const { data: report, loading: loadingReport } = useFetchOne<RawMaterialFinanceReport>(
        InventoryService.getRawMaterialFinanceReport,
        [startDate, endDate],
        [1, startDate, endDate]
    );

    if (loadingReport || !report) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Raw Material Report" />

            <div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="mt-auto">
                            <h2 className="text-xl font-bold text-darkbrown">
                                {report.branchName}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing raw material report data from {formatDateToWords(startDate)} to {formatDateToWords(endDate)}.
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
                        label: "Sold From Supplier/in",
                        value: formatNumber(report.overall.soldFromSupplier),
                        helper: "Total sourced quantity/ingoing items",
                    },
                    {
                        label: "Consumed items/out",
                        value: formatNumber(report.overall.consumes),
                        helper: "Total quantity consumed/outgoing items",
                    },
                    {
                        label: "Capital",
                        value: formatToPeso(report.overall.capital),
                        helper: "Raw material capital used",
                    },
                    // {
                    //     label: "Total Expenses",
                    //     value: formatToPeso(report.totalExpenses),
                    //     helper: "Total expenditure",
                    // },
                    {
                        label: "Consumed Value",
                        value: formatToPeso(report.overall.sales),
                        helper: "Total recorded consumed amount",
                    },
                    {
                        label: "Remaining Value",
                        value: formatToPeso(report.overall.remaining),
                        helper: "Residual value after usage",
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

            <div className="mt-4 space-y-4">
                <div className="flex-center-y justify-between">
                    <div>
                        <div className="text-darkbrown font-bold text-xl">Raw Material Details</div>
                        <div className="text-sm text-gray">
                            Item-level capital, sales, and remaining value for the selected range.
                        </div>
                    </div>
                </div>
                <div>
                    <div className="table-wrapper">
                        <div className="thead grid grid-cols-5">
                            {columns.map((item, index) => (
                                <div className="th" key={index}>{item.title}</div>
                            ))}
                        </div>

                        <div className="divide-y divide-slate-200 bg-white">
                            {report.products.map((item) => (
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
                                        <div>
                                            <div>{item.name}</div>
                                            <div className="text-xs text-slate-500">{item.sku}</div>
                                        </div>
                                    </div>

                                    <div className="td flex-col items-start! text-slate-600">
                                        <p className="font-medium text-slate-900">
                                            {formatNumber(item.consumes)} consumed
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatNumber(item.soldFromSupplier)} sourced
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

                                    <div className="td justify-between font-semibold text-darkbrown">
                                        {item.remaining !== null && item.remaining !== undefined
                                            ? <>
                                                <div>₱</div>
                                                <div>{formatToPeso(item.remaining).slice(1,)}</div>
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
    );
}
