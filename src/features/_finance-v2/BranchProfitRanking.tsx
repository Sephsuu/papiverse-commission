"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { Badge } from "@/components/ui/badge";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useToday } from "@/hooks/use-today";
import { formatToPeso } from "@/lib/formatter";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { DatePickerModal, InventoryReportPeriodMode } from "@/features/_finance-v2/components/DatePickerModal";
import { format } from "date-fns";
import { CalendarDays, Ham, Snowflake } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RankingAmount = {
    rank: number;
    branchId: number;
    branchName: string;
    amount: number;
};

type BranchProfitRow = {
    branchId: number;
    branchName: string;
    overallRank: number;
    meatRank: number;
    snowRank: number;
    overallCapital: number;
    overallSales: number;
    overallProfit: number;
    meatProfit: number;
    snowProfit: number;
};

type BranchProfitRankingResponse = {
    startDate: string;
    endDate: string;
    branchCount: number;
    totalOverallCapital: number;
    totalOverallSales: number;
    totalOverallProfit: number;
    totalMeatProfit: number;
    totalSnowProfit: number;
    tableRows: BranchProfitRow[];
    overallRanking: RankingAmount[];
    meatRanking: RankingAmount[];
    snowRanking: RankingAmount[];
    chartData: {
        labels: string[];
        overallProfitSeries: number[];
        meatProfitSeries: number[];
        snowProfitSeries: number[];
    };
};

const pageKey = "branchProfitRankingPage";
const compactMoney = new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
});

function getRangeLabel(mode: InventoryReportPeriodMode, startDate?: string, endDate?: string) {
    if (!startDate) return "Select period";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (mode === "DAY") return format(start, "MMMM dd, yyyy");
    if (mode === "WEEK") return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
    if (mode === "MONTH") return format(start, "MMMM yyyy");

    const quarterNumber = Math.floor(start.getMonth() / 3) + 1;
    return `Q${quarterNumber} ${format(start, "yyyy")}`;
}

function getRangeBadge(mode: InventoryReportPeriodMode, startDate?: string) {
    if (!startDate) return "PERIOD";

    if (mode === "DAY") return format(new Date(startDate), "EEEE").toUpperCase();
    if (mode === "WEEK") return "SUN-SAT";
    if (mode === "MONTH") return "MONTH";
    return "QUARTER";
}

const columns = [
    { title: "Branch", style: "" },
    { title: "Capital", style: "" },
    { title: "Sales", style: "" },
    { title: "Meat Profit", style: "" },
    { title: "Snow Profit", style: "" },
    { title: "Overall Profit", style: "" },
];

const emptyRanking = async () => null;

export function BranchProfitRankingPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { today } = useToday();
    const initialStartDate = searchParams.get("startDate") ?? today;
    const initialEndDate = searchParams.get("endDate") ?? today;
    const [date, setDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>("DAY");
    const [toggleDate, setToggleDate] = useState(false);

    const { data: ranking, loading } = useFetchOne<BranchProfitRankingResponse | null>(
        date && endDate ? SupplyOrderService.getBranchProfitRanking : emptyRanking,
        [date, endDate],
        date && endDate ? [date, endDate] : []
    );

    const tableRows = ranking?.tableRows ?? [];
    const {
        page,
        setPage,
        size,
        paginated,
    } = usePagination(tableRows, 10, pageKey);

    const dateLabel = useMemo(() => {
        const start = ranking?.startDate ?? date;
        const end = ranking?.endDate ?? endDate;
        return getRangeLabel(periodMode, start, end);
    }, [date, endDate, periodMode, ranking?.endDate, ranking?.startDate]);

    const dateBadge = useMemo(() => {
        const start = ranking?.startDate ?? date;
        return getRangeBadge(periodMode, start);
    }, [date, periodMode, ranking?.startDate]);

    const chartRows = useMemo(() => {
        if (!ranking?.chartData?.labels?.length) return [];

        return ranking.chartData.labels.map((branchName, index) => ({
            branchName,
            overallProfit: Number(ranking.chartData.overallProfitSeries[index] ?? 0),
            meatProfit: Number(ranking.chartData.meatProfitSeries[index] ?? 0),
            snowProfit: Number(ranking.chartData.snowProfitSeries[index] ?? 0),
        })).slice(0, 10);
    }, [ranking?.chartData]);
    const chartWidth = useMemo(() => Math.max(chartRows.length * 120, 1100), [chartRows.length]);
    const summaryCards = useMemo(() => {
        if (!ranking) return [];

        return [
            {
                label: "Overall Capital",
                value: formatToPeso(ranking.totalOverallCapital),
                helper: "Combined capital",
                valueClassName: "text-slate-900",
            },
            {
                label: "Overall Sales",
                value: formatToPeso(ranking.totalOverallSales),
                helper: "Combined sales",
                valueClassName: "text-slate-900",
            },
            {
                label: "Overall Profit",
                value: formatToPeso(ranking.totalOverallProfit),
                helper: "Combined profit",
                valueClassName: "text-darkgreen",
            },
            {
                label: "Meat Profit",
                value: formatToPeso(ranking.totalMeatProfit),
                helper: "Total meat profit",
                valueClassName: "text-slate-900",
                icon: <Ham className="h-4 w-4 text-darkbrown" />,
            },
            {
                label: "Snow Profit",
                value: formatToPeso(ranking.totalSnowProfit),
                helper: "Total snowfrost profit",
                valueClassName: "text-slate-900",
                icon: <Snowflake className="h-4 w-4 text-darkbrown" />,
            },
        ];
    }, [ranking]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (date) params.set("startDate", date);
        else params.delete("startDate");

        if (endDate) params.set("endDate", endDate);
        else params.delete("endDate");

        const current = searchParams.toString();
        const next = params.toString();
        if (current !== next) {
            router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
        }
    }, [date, endDate, pathname, router, searchParams]);

    if (loading) return <PapiverseLoading />;

    return (
        <section className="stack-md min-w-0 max-w-full overflow-x-hidden animate-fade-in-up pb-12">
            <AppHeader label="Branch Profit Ranking Dashboard" />

            <div
                onClick={() => setToggleDate(true)}
                className="flex w-fit cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm"
            >
                <CalendarDays className="h-5 w-5" />
                <div className="truncate scale-x-110 origin-left">{dateLabel}</div>
                <Badge className="ml-auto bg-darkbrown font-bold">{dateBadge}</Badge>
            </div>

            {ranking && (
                <>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {summaryCards.map((card) => (
                            <div key={card.label} className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{card.label}</p>
                                    {card.icon}
                                </div>
                                <p className={`mt-3 text-2xl font-semibold ${card.valueClassName}`}>{card.value}</p>
                                <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
                            </div>
                        ))}
                    </div>

                    <div className="min-w-0 max-w-full overflow-hidden rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                        <div className="mb-1 text-lg font-semibold text-darkbrown">Top 10 Branch Profit Trend</div>
                        <div className="mb-4 text-sm text-slate-500">Overall vs Meat vs Snowfrost profit</div>
                        <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
                            <div className="h-[330px] min-w-[1100px]">
                                <BarChart width={chartWidth} height={330} data={chartRows} margin={{ top: 12, right: 12, left: 4, bottom: 48 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="branchName"
                                        angle={-25}
                                        textAnchor="end"
                                        interval={0}
                                        height={74}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        width={72}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value) => `₱${compactMoney.format(Number(value))}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [formatToPeso(Number(value)), name]}
                                        labelFormatter={(label) => `Branch: ${label}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="overallProfit" name="Overall Profit" fill="#7b3f00" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="meatProfit" name="Meat Profit" fill="#d97706" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="snowProfit" name="Snow Profit" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 max-w-full overflow-x-auto">
                        <div className="table-wrapper min-w-[1100px]">
                        {tableRows.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground">
                                <p className="text-sm font-medium">No branch profit ranking found</p>
                                <p className="text-xs">Try adjusting the date range.</p>
                            </div>
                        ) : (
                            <>
                                <div className="thead flex">
                                    <div className="th w-15 flex-center">#</div>
                                    <div className="w-full grid grid-cols-6">
                                        {columns.map((item, index) => (
                                            <div key={index} className={`th ${item.style}`}>
                                                {item.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white">
                                    {paginated.map((row) => (
                                        <div className="flex tdata" key={row.branchId}>
                                            <div className="td w-15 flex-center">{row.overallRank}</div>
                                            <div className="w-full grid grid-cols-6 border-b border-slate-100 last:border-b-0">
                                                <Link 
                                                    href={`/finance/branch-po-report?branch=${row.branchId}&start=${date}&end=${endDate}`}
                                                    className="td hover:font-semibold hover:underline"
                                                >
                                                    {row.branchName}
                                                </Link>
                                                <div className="td justify-between font-semibold">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(row.overallCapital).slice(1)}</span>
                                                </div>
                                                <div className="td justify-between font-semibold">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(row.overallSales).slice(1)}</span>
                                                </div>
                                                <div className="td justify-between">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(row.meatProfit).slice(1)}</span>
                                                </div>
                                                <div className="td justify-between">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(row.snowProfit).slice(1)}</span>
                                                </div>
                                                <div className="td justify-between font-semibold text-darkgreen">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(row.overallProfit).slice(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        </div>
                    </div>

                    <TablePagination<BranchProfitRow>
                        data={tableRows}
                        paginated={paginated}
                        page={page}
                        size={size}
                        setPage={setPage}
                        pageKey={pageKey}
                    />
                </>
            )}

            <DatePickerModal
                date={date}
                mode={periodMode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setMode={setPeriodMode}
            />
        </section>
    );
}
