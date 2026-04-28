"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { useToday } from "@/hooks/use-today";
import { formatDateToWords, formatNumber, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { InventoryReportBreakdown } from "@/types/inventory";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { BreakdownDatePickerModal, BreakdownPeriodMode } from "./components/BreakdownDatePickerModal";
import { getCategoryIcon } from "@/hooks/use-helper";

const columns = [
    { title: "Supply" },
    { title: "Movement" },
    { title: "Current Stock" },
    { title: "Capital" },
    { title: "Sales" },
    { title: "Profit" },
];

const filters = ['All', 'Meat', 'Snow Frost'];
const sorts = [
    { label: "Alphabetical", value: "name_asc" },
    { label: "By Capital", value: "capital_desc" },
    // { label: "Lowest Capital", value: "capital_asc" },
    { label: "By Profit", value: "profit_desc" },
    // { label: "Lowest Profit", value: "profit_asc" },
] as const;
type SortKey = (typeof sorts)[number]["value"];


function formatProfit(value: number) {
    return value < 0 ? `-${formatToPeso(Math.abs(value))}` : formatToPeso(value);
}

export function SupplytBreakdownPage() {
    const { today } = useToday();
    const todayDate = new Date(today);
    const initialStartDate = format(todayDate, "yyyy-MM-dd");
    const [date, setDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialStartDate);
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<BreakdownPeriodMode>("DAY");
    const [filter, setFilter] = useState(filters[0]);
    const [sort, setSort] = useState<SortKey>("profit_desc");

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

    const { data: report, loading: loadingReport } = useFetchOne<InventoryReportBreakdown>(
        InventoryService.getSupplyFinanceBreakdown,
        [startDate, endDate, filter],
        [1, startDate, endDate, filter.replace(' ', '')]
    )

    const { setSearch, filteredItems } = useSearchFilter(report?.items, ['rawMaterialName']);

    const filteredData = useMemo(() => {
        return filteredItems.filter((item) => {
            if (filter === filters[1]) return item.category === 'MEAT';
            if (filter === filters[2]) return item.category === 'SNOWFROST';
            return true;
        });
    }, [filter, filteredItems]);

    const sortedData = useMemo(() => {
        const items = [...filteredData];

        if (sort === "name_asc") {
            items.sort((a, b) => a.rawMaterialName.localeCompare(b.rawMaterialName));
            return items;
        }

        // if (sort === "name_desc") {
        //     items.sort((a, b) => b.rawMaterialName.localeCompare(a.rawMaterialName));
        //     return items;
        // }

        if (sort === "capital_desc") {
            items.sort((a, b) => b.capital - a.capital);
            return items;
        }

        // if (sort === "capital_asc") {
        //     items.sort((a, b) => a.capital - b.capital);
        //     return items;
        // }

        if (sort === "profit_desc") {
            items.sort((a, b) => b.profit - a.profit);
            return items;
        }

        items.sort((a, b) => a.profit - b.profit);
        return items;
    }, [filteredData, sort]);

    const { page, setPage, size, setSize, paginated } = usePagination(sortedData, 10);

    if (loadingReport || !report) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Report Breakdown" />

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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: "Total Capital",
                        value: formatToPeso(report.totalCapital),
                        helper: "Overall production cost",
                    },
                    {
                        label: "Total Sales",
                        value: formatToPeso(report.totalSales),
                        helper: "Recorded sales amount",
                    },
                    {
                        label: "Total Expenses",
                        value: formatProfit(report.totalExpenses),
                        helper: "Total expenditures",
                    },
                    {
                        label: "Total Profit",
                        value: formatProfit(report.totalProfit),
                        helper: "Net return for the range",
                        isNegative: report.totalProfit < 0,
                    },
                ].map((item) => (
                    <div key={item.label} className="w-full rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className={`mt-3 text-2xl font-semibold ${item.isNegative ? "text-darkred" : "text-slate-900"}`}>
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
                    setSearch={ setSearch }
                    searchPlaceholder="Search for a supply"
                    size={ size }
                    setSize={ setSize }
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
                            className={`tdata grid grid-cols-6 max-md:w-250!`}
                        >
                            <div className="td gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                            {getCategoryIcon(item.category)}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.category}</TooltipContent>
                                </Tooltip>

                                <div className="min-w-0">
                                    <div className="truncate font-semibold text-slate-900">
                                        {item.rawMaterialName}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {item.sku}
                                    </div>
                                </div>
                            </div>

                            <div className="td flex-col items-start! text-slate-600">
                                <p className="font-bold text-slate-900">
                                    {formatNumber(item.soldQuantity)} sold
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatNumber(item.producedQuantity)} produced
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

                            <div className={`td justify-between font-semibold ${item.profit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                {item.profit !== null && item.profit !== undefined
                                    ? <>
                                        <div>{item.profit < 0 ? "-₱" : "₱"}</div>
                                        <div>{formatToPeso(Math.abs(item.profit)).slice(1,)}</div>
                                    </>
                                    : <span className="text-xs text-gray">Not available</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <TablePagination
                data={ sortedData }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
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
