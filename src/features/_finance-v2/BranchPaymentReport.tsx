'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one"
import { formatToPeso } from "@/lib/formatter";
import { PaymentReportService } from "@/services/paymentReport.service";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { BranchPaymentMonthPickerModal } from "./components/BranchPaymentMonthPickerModal";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";

const TAB_BRANCH_PAYMENT = "Branch Payment";
const TAB_PAYMENT_METHODS = "Payment Methods";
const TABS = [TAB_BRANCH_PAYMENT, TAB_PAYMENT_METHODS] as const;
type PaymentReportTab = (typeof TABS)[number];

type WeekMap = {
    week_1: number;
    week_2: number;
    week_3: number;
    week_4: number;
};

type PaymentMethodRow = {
    paymentMode: string;
    weeks: WeekMap;
    total: number;
};

type PaymentMethodDepositsReport = {
    month: string;
    totalDeposits: number;
    rows: PaymentMethodRow[];
    weeklyChartData: {
        labels: string[];
        datasets: { label: string; data: number[]; stack: string | null }[];
    };
};

type BranchDepositsRow = {
    branchId: number;
    branchName: string;
    totalDeposits: number;
};

type BranchDepositsReport = {
    month: string;
    branchCount: number;
    totalDeposits: number;
    rows: BranchDepositsRow[];
    chartData?: {
        labels: string[];
        datasets: { label: string; data: number[]; stack: string | null }[];
    };
};

export function BranchPaymentReportPage() {
    const brownPalette = [
        "#2F1B12",
        "#3A2216",
        "#45291A",
        "#51301E",
        "#5C3722",
        "#673E26",
        "#72452A",
        "#7D4C2E",
        "#885332",
        "#935A36",
    ];
    const [tab, setTab] = useState<PaymentReportTab>(TABS[0])
    const [month, setMonth] = useState("2026-05");
    const [openFilter, setOpenFilter] = useState(false);
    const { data: methodReport, loading: loadingMethodReport } = useFetchOne<PaymentMethodDepositsReport | null>(
        async (selectedMonth: string) => {
            if (tab !== TAB_PAYMENT_METHODS) return null;
            return await PaymentReportService.getMethodDeposits(selectedMonth);
        },
        [month, tab],
        [month],
    );
    const { data: branchReport, loading: loadingBranchReport } = useFetchOne<BranchDepositsReport | null>(
        async (selectedMonth: string) => {
            if (tab !== TAB_BRANCH_PAYMENT) return null;
            return await PaymentReportService.getBranchDeposits(selectedMonth);
        },
        [month, tab],
        [month]
    );

    const safeMethodReport: PaymentMethodDepositsReport = methodReport ?? {
        month,
        totalDeposits: 0,
        rows: [],
        weeklyChartData: { labels: [], datasets: [] },
    };
    const safeBranchReport: BranchDepositsReport = branchReport ?? {
        month,
        branchCount: 0,
        totalDeposits: 0,
        rows: [],
        chartData: { labels: [], datasets: [] },
    };

    const activeReportMonth = tab === TAB_PAYMENT_METHODS
        ? (safeMethodReport.month ?? month)
        : (safeBranchReport.month ?? month);
    const displayMonth = useMemo(
        () => format(new Date(`${activeReportMonth}-01`), "MMMM yyyy"),
        [activeReportMonth]
    );
    const weekColumns: (keyof WeekMap)[] = ["week_1", "week_2", "week_3", "week_4"];
    const weeklyTotals = useMemo(() => {
        return safeMethodReport.rows.reduce(
            (acc, row) => ({
                week_1: acc.week_1 + (row.weeks.week_1 ?? 0),
                week_2: acc.week_2 + (row.weeks.week_2 ?? 0),
                week_3: acc.week_3 + (row.weeks.week_3 ?? 0),
                week_4: acc.week_4 + (row.weeks.week_4 ?? 0),
            }),
            { week_1: 0, week_2: 0, week_3: 0, week_4: 0 }
        );
    }, [safeMethodReport.rows]);
    const paymentModeChartData = useMemo(() => {
        return safeMethodReport.rows.map((row) => ({
            paymentMode: row.paymentMode.replaceAll("_", " "),
            total: row.total ?? 0,
        }));
    }, [safeMethodReport.rows]);
    const branchChartData = useMemo(() => {
        const fromRows = safeBranchReport.rows.map((row) => ({
            branchName: row.branchName,
            totalDeposits: row.totalDeposits ?? 0,
        }));
        if (fromRows.length > 0) return fromRows;

        const labels = safeBranchReport.chartData?.labels ?? [];
        const dataset = safeBranchReport.chartData?.datasets?.[0]?.data ?? [];
        return labels.map((label, index) => ({
            branchName: label,
            totalDeposits: Number(dataset[index] ?? 0),
        }));
    }, [safeBranchReport.rows, safeBranchReport.chartData]);
    const topBranch = useMemo(() => {
        if (safeBranchReport.rows.length === 0) return null;
        return [...safeBranchReport.rows].sort((a, b) => (b.totalDeposits ?? 0) - (a.totalDeposits ?? 0))[0];
    }, [safeBranchReport.rows]);
    const lowestBranch = useMemo(() => {
        if (safeBranchReport.rows.length === 0) return null;
        return [...safeBranchReport.rows].sort((a, b) => (a.totalDeposits ?? 0) - (b.totalDeposits ?? 0))[0];
    }, [safeBranchReport.rows]);
    const branchDepositsLabel = safeBranchReport.chartData?.datasets?.[0]?.label ?? "Branch Deposits";
    const loadingReport = tab === TAB_PAYMENT_METHODS ? loadingMethodReport : loadingBranchReport;

    if (loadingReport) return <PapiverseLoading />

    return (
        <section className="stack-md pb-12 animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Branch Payment Report" />
            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={[...TABS]}
                    selectedTab={tab}
                    setSelectedTab={(selectedTab) => setTab(selectedTab as PaymentReportTab)}
                    buttonClassName="w-35!"
                />
                <div
                    onClick={() => setOpenFilter(true)}
                    className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
                >
                    <CalendarDays size={18} />
                    <div className="origin-left truncate scale-x-110">{displayMonth}</div>
                    <Badge className="ml-2 bg-darkbrown font-bold">MONTHLY</Badge>
                </div>
            </div>

            <BranchPaymentMonthPickerModal
                open={openFilter}
                setOpen={setOpenFilter}
                month={month}
                setMonth={setMonth}
            />

            {tab === TAB_PAYMENT_METHODS && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Week 1 Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyTotals.week_1)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Week 2 Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyTotals.week_2)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Week 3 Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyTotals.week_3)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Week 4 Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(weeklyTotals.week_4)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Payments</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(safeMethodReport.totalDeposits ?? 0)}</p>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="thead grid grid-cols-6 bg-darkbrown/10!">
                            <div className="th">Payment Method</div>
                            <div className="th">Week 1</div>
                            <div className="th">Week 2</div>
                            <div className="th">Week 3</div>
                            <div className="th">Week 4</div>
                            <div className="th">Total</div>
                        </div>
                        <div className="divide-y divide-slate-200 bg-white">
                            {safeMethodReport.rows.length > 0 ? safeMethodReport.rows.map((row) => (
                                <div key={row.paymentMode} className="tdata grid grid-cols-6">
                                    <div className="td font-semibold">{row.paymentMode.replace('_', ' ')}</div>
                                    {weekColumns.map((week) => (
                                        <div className="td justify-between" key={week}>
                                            <span>₱</span>
                                            <span>{formatToPeso(row.weeks[week]).slice(1)}</span>
                                        </div>
                                    ))}
                                    <div className="td justify-between font-semibold">
                                        <span>₱</span>
                                        <span>{formatToPeso(row.total).slice(1)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="tdata grid grid-cols-6">
                                    <div className="td font-semibold">No payment method deposits yet.</div>
                                    <div className="td">-</div>
                                    <div className="td">-</div>
                                    <div className="td">-</div>
                                    <div className="td">-</div>
                                    <div className="td">-</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="w-full bg-light p-4">
                        <div>
                            <div className="text-darkbrown font-bold text-xl">Payment Modes Chart</div>
                            <div className="text-sm text-gray">
                                Each payment mode has its own vertical bar
                            </div>
                        </div> 
                        <div className="h-72 w-full mt-2">
                            {paymentModeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={paymentModeChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="paymentMode" />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                        <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                        <Legend />
                                        <Bar dataKey="total" name="Total Deposits">
                                            {paymentModeChartData.map((entry, index) => (
                                                <Cell
                                                    key={`${entry.paymentMode}-${index}`}
                                                    fill={brownPalette[index % brownPalette.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                    There are no payment method deposits yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </>
            )}

            {tab === TAB_BRANCH_PAYMENT && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Overall Total Deposits</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(safeBranchReport.totalDeposits ?? 0)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Top Depositing Branch</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{topBranch?.branchName ?? "-"}</p>
                            <p className="mt-1 text-sm text-slate-500">{formatToPeso(topBranch?.totalDeposits ?? 0)}</p>
                        </div>
                        <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Lowest Depositing Branch</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{lowestBranch?.branchName ?? "-"}</p>
                            <p className="mt-1 text-sm text-slate-500">{formatToPeso(lowestBranch?.totalDeposits ?? 0)}</p>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="thead grid grid-cols-2 bg-darkbrown/10!">
                            <div className="th">Branch Name</div>
                            <div className="th">Total Deposits</div>
                        </div>
                        <div className="divide-y divide-slate-200 bg-white">
                            {safeBranchReport.rows.length > 0 ? safeBranchReport.rows.map((row) => (
                                <div key={row.branchId} className="tdata grid grid-cols-2">
                                    <div className="td font-semibold">{row.branchName}</div>
                                    <div className="td justify-between font-semibold">
                                        <span>₱</span>
                                        <span>{formatToPeso(row.totalDeposits).slice(1)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="tdata grid grid-cols-2">
                                    <div className="td font-semibold">No branch deposits yet.</div>
                                    <div className="td">-</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="w-full bg-light p-4">
                        <div>
                            <div className="text-darkbrown font-bold text-xl">Branch Deposits Chart</div>
                            <div className="text-sm text-gray">
                                Each branch has its own vertical bar.
                            </div>
                        </div> 
                        <div className="h-72 w-full mt-2">
                            {branchChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={branchChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="branchName" />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                        <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                        <Legend />
                                        <Bar dataKey="totalDeposits" name={branchDepositsLabel}>
                                            {branchChartData.map((entry, index) => (
                                                <Cell
                                                    key={`${entry.branchName}-${index}`}
                                                    fill={brownPalette[index % brownPalette.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                    There are no branch deposits yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </>
            )}
        </section>
    )
}
