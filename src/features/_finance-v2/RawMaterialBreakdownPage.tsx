"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { useToday } from "@/hooks/use-today";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { format } from "date-fns";
import { CalendarDays, Ham, PackageX, Snowflake } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { BreakdownDatePickerModal, BreakdownPeriodMode } from "./components/BreakdownDatePickerModal";
import { AppTooltip } from "@/components/shared/AppTooltip";

type RawMaterialBreakdownReport = {
    branchId: number;
    branchName: string;
    startDate: string;
    endDate: string;
    totalExpenses: number;
    totalCapital: number;
    totalSales: number;
    totalRemaining: number;
    items: {
        rawMaterialId: number;
        sku: string;
        rawMaterialName: string;
        category: string | null;
        unitMeasurement: string;
        soldFromSupplier: number;
        consumes: number;
        capital: number;
        sales: number;
        remaining: number;
        currentStock: number;
        stockLevel: string;
    }[];
};

const columns = [
    { title: "Raw Material" },
    { title: "Movement" },
    { title: "Current Stock" },
    { title: "Capital" },
    { title: "Consumed Value" },
    { title: "Remaining Value" },
];

const filters = ["All", "Meat", "Snow Frost", "Non Deliverables"];
const sorts = [
    { label: "Alphabetical", value: "name_asc" },
    { label: "By Capital", value: "capital_desc" },
    { label: "By Remaining", value: "remaining_desc" },
] as const;
type SortKey = (typeof sorts)[number]["value"];

const numberFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

function formatNumber(value: number) {
    return numberFormatter.format(value);
}

export function RawMaterialBreakdownPage() {
    const { today } = useToday();
    const todayDate = new Date(today);
    const initialStartDate = format(todayDate, "yyyy-MM-dd");
    const [date, setDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialStartDate);
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<BreakdownPeriodMode>("DAY");
    const [filter, setFilter] = useState(filters[0]);
    const [sort, setSort] = useState<SortKey>("remaining_desc");

    const startDate = date;
    const parsedStartDate = useMemo(
        () => (startDate ? new Date(startDate) : null),
        [startDate]
    );
    const parsedEndDate = useMemo(
        () => (endDate ? new Date(endDate) : null),
        [endDate]
    );
    const displayDate = useMemo(() => {
        if (!parsedStartDate || !parsedEndDate) return "Select period";

        if (periodMode === "DAY") {
            return format(parsedStartDate, "MMMM dd, yyyy");
        }

        if (periodMode === "WEEK") {
            return `${format(parsedStartDate, "MMM d")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
        }

        if (periodMode === "MONTH") {
            return format(parsedStartDate, "MMMM yyyy");
        }

        return `${format(parsedStartDate, "QQQ yyyy")} • ${format(parsedStartDate, "MMM d")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
    }, [parsedEndDate, parsedStartDate, periodMode]);

    const displayBadge = useMemo(() => {
        if (!parsedStartDate) return "PERIOD";

        if (periodMode === "DAY") {
            return format(parsedStartDate, "EEEE").toUpperCase();
        }

        if (periodMode === "WEEK") {
            return "SUN-SAT";
        }

        if (periodMode === "MONTH") {
            return "MONTHLY";
        }

        return "QUARTERLY";
    }, [parsedStartDate, periodMode]);

    const { data: report, loading: loadingReport } = useFetchOne<RawMaterialBreakdownReport>(
        InventoryService.getRawMaterialFinanceBreakdown,
        [startDate, endDate],
        [1, startDate, endDate]
    );

    const { setSearch, filteredItems } = useSearchFilter(report?.items, ["rawMaterialName", "sku"]);

    const filteredData = useMemo(() => {
        return filteredItems.filter((item) => {
            if (filter === "Meat") return item.category === "MEAT";
            if (filter === "Snow Frost") return item.category === "SNOWFROST";
            if (filter === "Non Deliverables") return item.category === "NONDELIVERABLES" || item.category === null;
            return true;
        });
    }, [filter, filteredItems]);

    const sortedData = useMemo(() => {
        const items = [...filteredData];

        if (sort === "name_asc") {
            items.sort((a, b) => a.rawMaterialName.localeCompare(b.rawMaterialName));
            return items;
        }

        if (sort === "capital_desc") {
            items.sort((a, b) => b.capital - a.capital);
            return items;
        }

        items.sort((a, b) => b.remaining - a.remaining);
        return items;
    }, [filteredData, sort]);

    const { page, setPage, size, setSize, paginated } = usePagination(sortedData, 10);

    if (loadingReport || !report) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Raw Material Breakdown" />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-darkbrown">{report.branchName}</h2>
                    <p className="text-sm text-gray">
                        Full raw material breakdown from {formatDateToWords(report.startDate)} to{" "}
                        {formatDateToWords(report.endDate)}.
                    </p>
                </div>

                <div
                    onClick={() => setToggleDate(true)}
                    className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                >
                    <CalendarDays />

                    <div className="scale-x-110 origin-left">{displayDate}</div>

                    <Badge className="bg-darkbrown font-bold ml-2">
                        {displayBadge}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    // {
                    //     label: "Total Capital",
                    //     value: formatToPeso(report.totalCapital),
                    //     helper: "Overall raw material cost",
                    // },
                    {
                        label: "Total Consumed Value",
                        value: formatToPeso(report.totalSales),
                        helper: "Recorded consumed amount",
                    },
                    // {
                    //     label: "Total Remaining Value",
                    //     value: formatToPeso(report.totalRemaining),
                    //     helper: "Remaining value for the range",
                    // },
                ].map((item) => (
                    <div key={item.label} className="w-full rounded-md border border-slate-300 bg-white p-5 shadow-sm">
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

            <div className="mt-4">
                <div className="text-xl font-semibold text-darkbrown">Item Breakdown</div>
                <div className="text-sm text-slate-500">
                    Per-item view of stock, movement, and financial contribution.
                </div>
            </div>

            <div className="flex-center-y gap-2">
                <TableFilter
                    className="w-full"
                    setSearch={setSearch}
                    searchPlaceholder="Search for a raw material"
                    size={size}
                    setSize={setSize}
                    filters={filters}
                    filter={filter}
                    setFilter={setFilter}
                    removeAdd
                />
                <AppSelect
                    triggerClassName="bg-light shadow-xs border-input"
                    items={[...sorts]}
                    value={sort}
                    onChange={(value) => setSort(value as SortKey)}
                />
            </div>

            <div className="table-wrapper">
                <div className="thead grid grid-cols-6">
                    {columns.map((item) => (
                        <div key={item.title} className="th">
                            {item.title}
                        </div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.map((item) => (
                        <div
                            key={item.rawMaterialId}
                            className="tdata grid grid-cols-6 max-md:w-250!"
                        >
                            <AppTooltip
                                trigger={
                                    <div className="td gap-2">
                                        <AppTooltip 
                                            trigger={
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                                    {item.category === "MEAT"
                                                        ? <Ham className="w-4 h-4 text-darkbrown" />
                                                        : item.category === "SNOWFROST"
                                                            ? <Snowflake className="w-4 h-4 text-blue" />
                                                            : <PackageX className="w-4 h-4 text-slate-400" />
                                                    }
                                                </div>
                                            }
                                            content={item.category ?? "NON DELIVERABLES"}
                                        />
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold text-slate-900">
                                                {item.rawMaterialName}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {item.sku}
                                            </div>
                                        </div>
                                    </div>
                                }
                                content={item.rawMaterialName}
                            />

                            <div className="td flex-col items-start! text-slate-600">
                                <p className="font-bold text-slate-900">
                                    {formatNumber(item.consumes)} consumed
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatNumber(item.soldFromSupplier)} sourced
                                </p>
                            </div>

                            <div className="td font-bold">
                                {item.currentStock.toFixed(2)}
                                <span className="ml-1 text-gray font-medium">{item.unitMeasurement}</span>
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

            <TablePagination
                data={sortedData}
                paginated={paginated}
                page={page}
                size={size}
                setPage={setPage}
            />

            <BreakdownDatePickerModal
                date={date}
                open={toggleDate}
                setOpen={setToggleDate}
                mode={periodMode}
                setDate={setDate}
                setEndDate={setEndDate}
                setMode={setPeriodMode}
            />
        </section>
    );
}
