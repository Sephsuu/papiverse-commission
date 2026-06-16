"use client";

import { useEffect, useMemo, useState } from "react";
import { addYears, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/shared/AppHeader";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatToPeso } from "@/lib/formatter";
import { PaymentSettlementService } from "@/services/paymentSettlement.service";

type SettlementSide = "JERRY" | "REN" | "NONE";

type SettlementChartDataset = {
    label: string;
    data: number[];
    stack: string | null;
};

type SettlementChartData = {
    labels: string[];
    datasets: SettlementChartDataset[];
};

type WeeklySettlementBranchPoRow = {
    branchId: number;
    branchName: string;
    amount: number;
};

type WeeklySettlementReport = {
    year: number;
    month: number;
    weekNumber: number;
    weekStartDate: string;
    weekEndDate: string;
    branchPurchaseOrders: WeeklySettlementBranchPoRow[];
    totalPurchaseOrders: number;
    meatExpenses: number;
    snowExpenses: number;
    totalExpenses: number;
    difference: number;
    payer: SettlementSide;
    receiver: SettlementSide;
    settlementAmount: number;
    chartData?: SettlementChartData;
};

type MonthlySettlementWeekReport = {
    year: number;
    month: number;
    weekNumber: number;
    weekStartDate: string;
    weekEndDate: string;
    branchPurchaseOrders: WeeklySettlementBranchPoRow[];
    totalPurchaseOrders: number;
    meatExpenses: number;
    snowExpenses: number;
    totalExpenses: number;
    difference: number;
    payer: SettlementSide;
    receiver: SettlementSide;
    settlementAmount: number;
    chartData?: SettlementChartData;
};

type MonthlyPaymentSummaryRow = {
    weekNumber?: number;
    weekLabel?: string;
    details?: string;
    payer?: SettlementSide;
    receiver?: SettlementSide;
    payment?: string;
    amount?: number;
    settlementAmount?: number;
};

type MonthlySettlementReport = {
    year: number;
    month: number;
    weeks: MonthlySettlementWeekReport[];
    branchPurchaseOrderTotals?: {
        branchId: number | null;
        branchName: string;
        amount: number;
    }[];
    expenseSummary?: {
        meatExpenses: number;
        snowExpenses: number;
        totalExpenses: number;
    };
    totalRenToPay: number;
    totalJerryToPay: number;
    netPayer: SettlementSide;
    netReceiver: SettlementSide;
    netSettlementAmount: number;
    branchPurchaseOrderPieChart?: SettlementChartData;
    expensePieChart?: SettlementChartData;
    paymentSummary?: {
        rows?: MonthlyPaymentSummaryRow[];
    };
    chartData?: SettlementChartData;
};

type SettlementChartSeries = {
    key: string;
    label: string;
    stackId?: string;
    color: string;
};

type SettlementChartRow = {
    label: string;
    [key: string]: string | number;
};

type SettlementPieRow = {
    label: string;
    value: number;
};

type SettlementReportFilterState = {
    tab: SettlementReportTab;
    year: string;
    month: string;
    week: string;
};

const TAB_WEEKLY = "Weekly Settlement Report";
const TAB_MONTHLY = "Monthly Settlement Report";
const REPORT_TABS = [TAB_WEEKLY, TAB_MONTHLY] as const;
type SettlementReportTab = (typeof REPORT_TABS)[number];

const REPORT_FILTERS_KEY = "paymentSettlementReportFilters";
const CHART_PALETTE = [
    "#2F1B12",
    "#653818",
    "#8B4513",
    "#bf3612",
    "#d97706",
    "#2f855a",
    "#0ea5e9",
    "#7c3aed",
    "#4b5563",
    "#9ca3af",
];

function getDefaultFilterState(): SettlementReportFilterState {
    const now = new Date();
    return {
        tab: TAB_WEEKLY,
        year: String(now.getFullYear()),
        month: String(now.getMonth() + 1),
        week: "1",
    };
}

function readStoredFilters(): SettlementReportFilterState {
    const fallback = getDefaultFilterState();
    if (typeof window === "undefined") return fallback;

    const raw = window.sessionStorage.getItem(REPORT_FILTERS_KEY);
    if (!raw) return fallback;

    try {
        const parsed = JSON.parse(raw) as Partial<SettlementReportFilterState>;
        const tab = parsed.tab === TAB_MONTHLY ? TAB_MONTHLY : TAB_WEEKLY;
        const year = String(parsed.year ?? fallback.year);
        const month = String(parsed.month ?? fallback.month);
        const week = String(parsed.week ?? fallback.week);
        return { tab, year, month, week };
    } catch {
        return fallback;
    }
}

function getMaxWeekBucket(year: number, month: number) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return 5;
    const daysInMonth = new Date(year, month, 0).getDate();
    return daysInMonth > 28 ? 5 : 4;
}

function formatMonthYear(year: number, month: number) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return "Select Month & Year";
    }
    return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

function formatWeekRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return "-";
    return `${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d")}`;
}

function formatDifference(value: number) {
    if (value === 0) return formatToPeso(0);
    const sign = value > 0 ? "+" : "-";
    return `${sign}${formatToPeso(Math.abs(value))}`;
}

function mapChartData(chartData?: SettlementChartData): { rows: SettlementChartRow[]; series: SettlementChartSeries[] } {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];

    if (!labels.length || !datasets.length) return { rows: [], series: [] };

    const series = datasets.map((dataset, index) => ({
        key: `series_${index}`,
        label: dataset.label || `Series ${index + 1}`,
        stackId: dataset.stack || undefined,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
    }));

    const rows: SettlementChartRow[] = labels.map((label, labelIndex) => {
        const row: SettlementChartRow = { label };
        series.forEach((seriesItem, seriesIndex) => {
            row[seriesItem.key] = Number(datasets[seriesIndex]?.data?.[labelIndex] ?? 0);
        });
        return row;
    });

    return { rows, series };
}

function mapPieChartData(chartData?: SettlementChartData): { rows: SettlementPieRow[]; datasetLabel: string } {
    const labels = chartData?.labels ?? [];
    const firstDataset = chartData?.datasets?.[0];

    if (!labels.length || !firstDataset?.data?.length) {
        return { rows: [], datasetLabel: firstDataset?.label ?? "Amount" };
    }

    return {
        datasetLabel: firstDataset.label || "Amount",
        rows: labels.map((label, index) => ({
            label,
            value: Number(firstDataset.data[index] ?? 0),
        })),
    };
}

function MonthlyPieChart({ rows }: { rows: SettlementPieRow[] }) {
    const total = rows.reduce((sum, row) => sum + row.value, 0);

    return (
        <div className="grid min-h-72 gap-4 md:grid-cols-[minmax(170px,0.9fr)_minmax(0,1.1fr)]">
            <div className="h-64 min-w-0 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Pie
                            data={rows}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius="42%"
                            outerRadius="78%"
                            paddingAngle={rows.length > 1 ? 1 : 0}
                        >
                            {rows.map((row, index) => (
                                <Cell key={`${row.label}-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="max-h-72 min-w-0 space-y-2 overflow-y-auto pr-1 my-auto">
                {rows.map((row, index) => {
                    const percent = total > 0 ? (row.value / total) * 100 : 0;

                    return (
                        <div
                            className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-2 rounded-sm bg-white/60 px-2 py-1.5 text-sm"
                            key={`${row.label}-monthly-pie-label-${index}`}
                        >
                            <span
                                className="mt-1.5 size-3 shrink-0 rounded-sm"
                                style={{ backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length] }}
                            />
                            <span className="min-w-0 [overflow-wrap:anywhere] text-slate-700">{row.label}</span>
                            <span className="whitespace-nowrap font-semibold text-slate-900">{percent.toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function readableSettlementText(payer: SettlementSide, receiver: SettlementSide) {
    if (payer === "NONE" || receiver === "NONE") return "No settlement";
    return `${payer} pays ${receiver}`;
}

function readableParty(party: SettlementSide, fallback: string) {
    return party === "NONE" ? fallback : party;
}

function getPaymentSummaryWeekLabel(row: MonthlyPaymentSummaryRow, index: number) {
    if (row.weekLabel) return row.weekLabel.toUpperCase();
    if (row.weekNumber) return `WEEK ${row.weekNumber}`;
    return `WEEK ${index + 1}`;
}

function getPaymentSummaryAmount(row: MonthlyPaymentSummaryRow) {
    return Number(row.amount ?? row.settlementAmount ?? 0);
}

function getPaymentSummaryDetails(row: MonthlyPaymentSummaryRow) {
    if (row.details) return row.details.toUpperCase();
    if (row.payer && row.payer !== "NONE") return `TO PAY BY ${row.payer}`;
    return "NO SETTLEMENT";
}

function getPaymentSummaryPayment(row: MonthlyPaymentSummaryRow) {
    if (row.payment) return row.payment;
    if (row.payer && row.receiver && row.payer !== "NONE" && row.receiver !== "NONE") {
        return `${row.payer} → ${row.receiver}`;
    }
    return "NO PAYMENT";
}

export function PaymentSettlementPage() {
    const storedFilters = readStoredFilters();
    const [tab, setTab] = useState<SettlementReportTab>(storedFilters.tab);
    const [year, setYear] = useState(storedFilters.year);
    const [month, setMonth] = useState(storedFilters.month);
    const [week, setWeek] = useState(storedFilters.week);
    const [openFilter, setOpenFilter] = useState(false);

    const yearNum = Number(year);
    const monthNum = Number(month);
    const weekNum = Number(week);

    const hasValidYear = Number.isInteger(yearNum) && yearNum >= 1 && yearNum <= 9999;
    const hasValidMonth = Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12;
    const hasValidWeek = Number.isInteger(weekNum) && weekNum >= 1 && weekNum <= 5;
    const maxWeekBucket = useMemo(
        () => getMaxWeekBucket(yearNum, monthNum),
        [yearNum, monthNum]
    );

    useEffect(() => {
        if (!hasValidWeek) return;
        if (weekNum <= maxWeekBucket) return;
        setWeek(String(maxWeekBucket));
    }, [hasValidWeek, maxWeekBucket, weekNum]);

    const weeklyRequestReady = hasValidYear && hasValidMonth && hasValidWeek && weekNum <= maxWeekBucket;
    const monthlyRequestReady = hasValidYear && hasValidMonth;

    useEffect(() => {
        window.sessionStorage.setItem(
            REPORT_FILTERS_KEY,
            JSON.stringify({ tab, year, month, week } satisfies SettlementReportFilterState)
        );
    }, [tab, year, month, week]);

    const emptyFetch = async () => null;

    const { data: weeklyReport, loading: loadingWeeklyReport } = useFetchOne<WeeklySettlementReport | null>(
        tab === TAB_WEEKLY && weeklyRequestReady
            ? (() => PaymentSettlementService.getWeeklySettlementReport(yearNum, monthNum, weekNum) as any)
            : emptyFetch,
        [tab, weeklyRequestReady, yearNum, monthNum, weekNum],
        []
    );

    const { data: monthlyReport, loading: loadingMonthlyReport } = useFetchOne<MonthlySettlementReport | null>(
        tab === TAB_MONTHLY && monthlyRequestReady
            ? (() => PaymentSettlementService.getMonthlySettlementReport(yearNum, monthNum) as any)
            : emptyFetch,
        [tab, monthlyRequestReady, yearNum, monthNum],
        []
    );

    const weeklyChart = useMemo(() => mapChartData(weeklyReport?.chartData), [weeklyReport?.chartData]);
    const monthlyChart = useMemo(() => mapChartData(monthlyReport?.chartData), [monthlyReport?.chartData]);
    const monthlyBranchTotals = useMemo(
        () => monthlyReport?.branchPurchaseOrderTotals ?? [],
        [monthlyReport?.branchPurchaseOrderTotals]
    );
    const monthlyExpenseSummary = useMemo(
        () => monthlyReport?.expenseSummary ?? { meatExpenses: 0, snowExpenses: 0, totalExpenses: 0 },
        [monthlyReport?.expenseSummary]
    );
    const monthlyPaymentRows = useMemo(
        () => monthlyReport?.paymentSummary?.rows ?? [],
        [monthlyReport?.paymentSummary?.rows]
    );
    const totalBranchPurchaseOrders = useMemo(
        () => monthlyBranchTotals.reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
        [monthlyBranchTotals]
    );
    const branchPurchasePie = useMemo(
        () => mapPieChartData(monthlyReport?.branchPurchaseOrderPieChart),
        [monthlyReport?.branchPurchaseOrderPieChart]
    );
    const expensePie = useMemo(
        () => mapPieChartData(monthlyReport?.expensePieChart),
        [monthlyReport?.expensePieChart]
    );
    const monthYearLabel = useMemo(() => formatMonthYear(yearNum, monthNum), [yearNum, monthNum]);
    const activeFilterLabel = tab === TAB_WEEKLY ? `${monthYearLabel} · Week ${week}` : monthYearLabel;
    const loadingReport = tab === TAB_WEEKLY ? loadingWeeklyReport : loadingMonthlyReport;

    if (loadingReport) return <PapiverseLoading />;

    return (
        <section className="stack-md min-h-screen pb-12 animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label={tab === TAB_MONTHLY ? "Monthly Settlement Report" : "Payment Settlement"} />

            <div className="flex-center-y justify-between gap-3">
                <AppTabSwitcher
                    tabs={[...REPORT_TABS]}
                    selectedTab={tab}
                    setSelectedTab={(selectedTab) => setTab(selectedTab as SettlementReportTab)}
                    buttonClassName="w-55!"
                />

                <div
                    onClick={() => setOpenFilter(true)}
                    className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
                >
                    <CalendarDays size={18} />
                    <div className="origin-left truncate scale-x-110">{activeFilterLabel}</div>
                    <Badge className="ml-2 bg-darkbrown font-bold">{tab === TAB_WEEKLY ? "WEEKLY" : "MONTHLY"}</Badge>
                </div>
            </div>

            {tab === TAB_WEEKLY && (
                <div className="space-y-3">
                    {!weeklyRequestReady && (
                        <div className="rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-600 shadow-sm">
                            Select a valid year, month, and week to view the weekly settlement report.
                        </div>
                    )}

                    {weeklyRequestReady && weeklyReport && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Purchase Orders</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyReport.totalPurchaseOrders)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Meat Expenses</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyReport.meatExpenses)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Snow Expenses</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyReport.snowExpenses)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Expenses</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyReport.totalExpenses)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Difference</p>
                                    <p className={`mt-3 text-2xl font-semibold ${weeklyReport.difference < 0 ? "text-darkred" : weeklyReport.difference > 0 ? "text-darkgreen" : "text-slate-900"}`}>
                                        {formatDifference(weeklyReport.difference)}
                                    </p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Settlement Amount</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyReport.settlementAmount)}</p>
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-300 bg-slate-50 p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Weekly Settlement Decision</p>
                                <p className="mt-2 text-xl font-semibold text-slate-900">{readableSettlementText(weeklyReport.payer, weeklyReport.receiver)}</p>
                            </div>

                            <div className="table-wrapper">
                                <div className="thead grid grid-cols-2 bg-darkbrown/10!">
                                    <div className="th">Branch</div>
                                    <div className="th">PO Amount</div>
                                </div>

                                {weeklyReport.branchPurchaseOrders.length > 0 ? weeklyReport.branchPurchaseOrders.map((row, index) => (
                                    <div className="tdata grid grid-cols-2" key={`${row.branchName}-${index}`}>
                                        <div className="td font-semibold">{row.branchName}</div>
                                        <div className="td justify-between">
                                            <span>₱</span>
                                            <span>{formatToPeso(row.amount).slice(1)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="tdata grid grid-cols-2">
                                        <div className="td font-semibold">No branch purchase orders yet.</div>
                                        <div className="td">-</div>
                                    </div>
                                )}
                            </div>

                            <Card className="w-full bg-light p-4">
                                <div className="text-darkbrown font-bold text-xl">Weekly Settlement Chart</div>
                                <div className="text-sm text-gray">Computed weekly settlement chart from the backend response.</div>
                                <div className="mt-2 h-80 w-full">
                                    {weeklyChart.rows.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyChart.rows} margin={{ top: 12, right: 12, left: 8, bottom: 62 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" angle={-20} textAnchor="end" interval={0} height={74} tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                                <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                                <Legend />
                                                {weeklyChart.series.map((series) => (
                                                    <Bar
                                                        key={series.key}
                                                        dataKey={series.key}
                                                        name={series.label}
                                                        stackId={series.stackId}
                                                        fill={series.color}
                                                        radius={[6, 6, 0, 0]}
                                                    />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                            No weekly chart data available.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}

                    {weeklyRequestReady && !weeklyReport && (
                        <div className="rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-600 shadow-sm">
                            No weekly settlement report data found for the selected period.
                        </div>
                    )}
                </div>
            )}

            {tab === TAB_MONTHLY && (
                <div className="space-y-3">
                    {!monthlyRequestReady && (
                        <div className="rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-600 shadow-sm">
                            Select a valid year and month to view the monthly settlement report.
                        </div>
                    )}

                    {monthlyRequestReady && monthlyReport && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Branch PO</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(totalBranchPurchaseOrders)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Expenses</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(monthlyExpenseSummary.totalExpenses)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Ren To Pay</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(monthlyReport.totalRenToPay)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Jerry To Pay</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(monthlyReport.totalJerryToPay)}</p>
                                </div>
                                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Net Settlement</p>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(monthlyReport.netSettlementAmount)}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {monthlyReport.netPayer === "NONE" || monthlyReport.netReceiver === "NONE"
                                            ? "No settlement"
                                            : `${monthlyReport.netPayer} → ${monthlyReport.netReceiver}`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card className="w-full bg-light p-4">
                                    <div className="text-darkbrown font-bold text-xl">Branch PO Distribution</div>
                                    <div className="text-sm text-gray">Monthly purchase order split by branch.</div>
                                    <div className="mt-2 w-full">
                                        {branchPurchasePie.rows.length > 0 ? (
                                            <MonthlyPieChart rows={branchPurchasePie.rows} />
                                        ) : (
                                            <div className="flex min-h-72 w-full items-center justify-center text-sm text-gray">
                                                No branch PO pie chart data available.
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="w-full bg-light p-4">
                                    <div className="text-darkbrown font-bold text-xl">Expense Distribution</div>
                                    <div className="text-sm text-gray">Monthly expense split between MEAT and SNOW.</div>
                                    <div className="mt-2 w-full">
                                        {expensePie.rows.length > 0 ? (
                                            <MonthlyPieChart rows={expensePie.rows} />
                                        ) : (
                                            <div className="flex min-h-72 w-full items-center justify-center text-sm text-gray">
                                                No expense pie chart data available.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="table-wrapper">
                                    <div className="thead grid grid-cols-2 bg-darkbrown/10!">
                                        <div className="th">Branch</div>
                                        <div className="th">Amount</div>
                                    </div>

                                    {monthlyBranchTotals.length > 0 ? monthlyBranchTotals.map((row, index) => (
                                        <div className="tdata grid grid-cols-2" key={`${row.branchName}-${index}`}>
                                            <div className="td font-semibold">{row.branchName}</div>
                                            <div className="td justify-between">
                                                <span>₱</span>
                                                <span>{formatToPeso(row.amount).slice(1)}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="tdata grid grid-cols-2">
                                            <div className="td font-semibold">No branch totals available.</div>
                                            <div className="td">-</div>
                                        </div>
                                    )}
                                </div>

                                <div className="table-wrapper">
                                    <div className="thead grid grid-cols-2 bg-darkbrown/10!">
                                        <div className="th">Expense</div>
                                        <div className="th">Amount</div>
                                    </div>
                                    <div className="tdata grid grid-cols-2">
                                        <div className="td font-semibold">Meat Expenses</div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(monthlyExpenseSummary.meatExpenses).slice(1)}</span></div>
                                    </div>
                                    <div className="tdata grid grid-cols-2">
                                        <div className="td font-semibold">Snow Expenses</div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(monthlyExpenseSummary.snowExpenses).slice(1)}</span></div>
                                    </div>
                                    <div className="tdata grid grid-cols-2 bg-slate-50!">
                                        <div className="td font-semibold">Total Expenses</div>
                                        <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(monthlyExpenseSummary.totalExpenses).slice(1)}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-300 bg-white shadow-sm">
                                <div className="border-b border-slate-200 bg-darkbrown/5 px-4 py-3">
                                    <div className="text-darkbrown text-xl font-bold">JERRY AND REN PAYMENT</div>
                                </div>
                                <div className="grid gap-3 p-4 md:grid-cols-3">
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-darkbrown">Ren&apos;s Total To Pay</div>
                                        <div className="mt-2 text-xl font-semibold">{formatToPeso(monthlyReport.totalRenToPay)}</div>
                                    </div>
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-darkbrown">Jerry&apos;s Total To Pay</div>
                                        <div className="mt-2 text-xl font-semibold">{formatToPeso(monthlyReport.totalJerryToPay)}</div>
                                    </div>
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-darkbrown">Net Result</div>
                                        <div className="mt-2 text-xl font-semibold">
                                            {monthlyReport.netPayer === "NONE" || monthlyReport.netReceiver === "NONE"
                                                ? "No settlement"
                                                : `${monthlyReport.netPayer} → ${monthlyReport.netReceiver}`}
                                        </div>
                                        <div className="text-sm text-slate-500">{formatToPeso(monthlyReport.netSettlementAmount)}</div>
                                    </div>
                                </div>

                                <div className="table-wrapper border-0!">
                                    <div className="thead grid grid-cols-4 bg-darkbrown/10!">
                                        <div className="th">Weeks</div>
                                        <div className="th">Amount</div>
                                        <div className="th">Details</div>
                                        <div className="th">Payment</div>
                                    </div>

                                    {monthlyPaymentRows.length > 0 ? monthlyPaymentRows.map((row, index) => (
                                        <div className="tdata grid grid-cols-4" key={`${getPaymentSummaryWeekLabel(row, index)}-${index}`}>
                                            <div className="td font-semibold">{getPaymentSummaryWeekLabel(row, index)}</div>
                                            <div className="td justify-between">
                                                <span>₱</span>
                                                <span>{formatToPeso(getPaymentSummaryAmount(row)).slice(1)}</span>
                                            </div>
                                            <div className="td">{getPaymentSummaryDetails(row)}</div>
                                            <div className="td">{getPaymentSummaryPayment(row)}</div>
                                        </div>
                                    )) : (
                                        <div className="tdata grid grid-cols-4">
                                            <div className="td font-semibold">No payment summary rows available.</div>
                                            <div className="td">-</div>
                                            <div className="td">-</div>
                                            <div className="td">-</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="table-wrapper overflow-x-auto">
                                <div className="thead grid min-w-[1250px] grid-cols-10 bg-darkbrown/10!">
                                    <div className="th">Week</div>
                                    <div className="th">Date Range</div>
                                    <div className="th">Total PO</div>
                                    <div className="th">Meat Expenses</div>
                                    <div className="th">Snow Expenses</div>
                                    <div className="th">Total Expenses</div>
                                    <div className="th">Difference</div>
                                    <div className="th">Payer</div>
                                    <div className="th">Receiver</div>
                                    <div className="th">Settlement Amount</div>
                                </div>

                                {monthlyReport.weeks.length > 0 ? monthlyReport.weeks.map((row) => (
                                    <div className="tdata grid min-w-[1250px] grid-cols-10" key={`${row.year}-${row.month}-${row.weekNumber}`}>
                                        <div className="td font-semibold">{`Week ${row.weekNumber}`}</div>
                                        <div className="td">{formatWeekRange(row.weekStartDate, row.weekEndDate)}</div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(row.totalPurchaseOrders).slice(1)}</span></div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(row.meatExpenses).slice(1)}</span></div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(row.snowExpenses).slice(1)}</span></div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(row.totalExpenses).slice(1)}</span></div>
                                        <div className={`td ${row.difference < 0 ? "text-darkred" : row.difference > 0 ? "text-darkgreen" : "text-slate-900"}`}>{formatDifference(row.difference)}</div>
                                        <div className="td">{readableParty(row.payer, "-")}</div>
                                        <div className="td">{readableParty(row.receiver, "-")}</div>
                                        <div className="td justify-between"><span>₱</span><span>{formatToPeso(row.settlementAmount).slice(1)}</span></div>
                                    </div>
                                )) : (
                                    <div className="tdata grid min-w-[1250px] grid-cols-10">
                                        <div className="td font-semibold">No weekly settlement breakdown rows yet.</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                        <div className="td">-</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {monthlyRequestReady && !monthlyReport && (
                        <div className="rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-600 shadow-sm">
                            No monthly settlement report data found for the selected period.
                        </div>
                    )}
                </div>
            )}

            <SettlementReportFilterModal
                open={openFilter}
                setOpen={setOpenFilter}
                tab={tab}
                year={year}
                month={month}
                week={week}
                onApply={({ year: nextYear, month: nextMonth, week: nextWeek }) => {
                    setYear(nextYear);
                    setMonth(nextMonth);
                    setWeek(nextWeek);
                }}
            />
        </section>
    );
}

function SettlementReportFilterModal({
    open,
    setOpen,
    tab,
    year,
    month,
    week,
    onApply,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    tab: SettlementReportTab;
    year: string;
    month: string;
    week: string;
    onApply: (payload: { year: string; month: string; week: string }) => void;
}) {
    const [localYear, setLocalYear] = useState(year);
    const [localMonth, setLocalMonth] = useState(month);
    const [localWeek, setLocalWeek] = useState(week);
    const [monthYearCursor, setMonthYearCursor] = useState(new Date(Number(year) || new Date().getFullYear(), 0, 1));

    useEffect(() => {
        if (!open) return;
        setLocalYear(year);
        setLocalMonth(month);
        setLocalWeek(week);
        setMonthYearCursor(new Date(Number(year) || new Date().getFullYear(), 0, 1));
    }, [month, open, week, year]);

    const localYearNum = Number(localYear);
    const localMonthNum = Number(localMonth);
    const localWeekNum = Number(localWeek);

    const hasValidYear = Number.isInteger(localYearNum) && localYearNum >= 1 && localYearNum <= 9999;
    const hasValidMonth = Number.isInteger(localMonthNum) && localMonthNum >= 1 && localMonthNum <= 12;
    const hasValidWeek = Number.isInteger(localWeekNum) && localWeekNum >= 1 && localWeekNum <= 5;
    const maxWeekBucket = useMemo(
        () => getMaxWeekBucket(localYearNum, localMonthNum),
        [localYearNum, localMonthNum]
    );

    useEffect(() => {
        if (!hasValidWeek) return;
        if (localWeekNum <= maxWeekBucket) return;
        setLocalWeek(String(maxWeekBucket));
    }, [hasValidWeek, localWeekNum, maxWeekBucket]);

    const canApply = hasValidYear && hasValidMonth && (tab === TAB_MONTHLY || (hasValidWeek && localWeekNum <= maxWeekBucket));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>
                    <AppHeader label={tab === TAB_WEEKLY ? "Weekly Settlement Filters" : "Monthly Settlement Filters"} />
                </DialogTitle>

                <div className="space-y-4">
                    <div className="rounded-md border bg-white p-3">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
                        <input
                            type="number"
                            min={1}
                            max={9999}
                            value={localYear}
                            onChange={(event) => setLocalYear(event.target.value)}
                            className="w-full rounded-md border border-gray px-3 py-2 text-sm"
                            placeholder="e.g. 2026"
                        />
                    </div>

                    <div className="space-y-3 rounded-md border bg-white p-3">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, -1))}
                            >
                                Prev year
                            </button>
                            <div className="text-lg font-semibold text-slate-900">{format(monthYearCursor, "yyyy")}</div>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, 1))}
                            >
                                Next year
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }, (_, index) => {
                                const monthDate = new Date(monthYearCursor.getFullYear(), index, 1);
                                const active = String(index + 1) === localMonth && String(monthYearCursor.getFullYear()) === localYear;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            setLocalMonth(String(index + 1));
                                            setLocalYear(String(monthYearCursor.getFullYear()));
                                        }}
                                        className={`rounded-md border px-3 py-4 text-sm font-semibold transition ${
                                            active
                                                ? "border-darkbrown bg-darkbrown text-white"
                                                : "bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {format(monthDate, "MMMM")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {tab === TAB_WEEKLY && (
                        <div className="space-y-3 rounded-md border bg-white p-3">
                            <div className="text-sm font-medium text-gray-700">Week</div>
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: 5 }, (_, index) => {
                                    const weekValue = index + 1;
                                    const active = String(weekValue) === localWeek;
                                    const disabled = weekValue > maxWeekBucket;

                                    return (
                                        <button
                                            key={weekValue}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setLocalWeek(String(weekValue))}
                                            className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                                                active
                                                    ? "border-darkbrown bg-darkbrown text-white"
                                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                            } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                                        >
                                            {`W${weekValue}`}
                                        </button>
                                    );
                                })}
                            </div>
                            {maxWeekBucket < 5 && (
                                <div className="text-xs text-slate-500">Week 5 is not available for this month/year.</div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 rounded-md border bg-white p-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-darkgreen! hover:opacity-90"
                            disabled={!canApply}
                            onClick={() => {
                                if (!canApply) return;
                                onApply({
                                    year: localYear,
                                    month: localMonth,
                                    week: tab === TAB_WEEKLY ? localWeek : week,
                                });
                                setOpen(false);
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
