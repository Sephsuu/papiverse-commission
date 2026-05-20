'use client'

import { AppHeader } from "@/components/shared/AppHeader"
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher"
import { Badge } from "@/components/ui/badge"
import { PapiverseLoading } from "@/components/ui/loader"
import { useFetchOne } from "@/hooks/use-fetch-one"
import { formatToPeso } from "@/lib/formatter"
import { FinanceService } from "@/services/finance.service"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"
import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { WeeklySalesFilterModal, WeeklySalesScope } from "./components/WeeklySalesFilterModal"

type WeekMap = {
    week_1: number
    week_2: number
    week_3: number
    week_4: number
}

type WeeklyMetric = {
    weeks: WeekMap
    grand_total: number
}

type WeeklySalesReport = {
    month: string
    gross_products: WeeklyMetric
    less_expenses: WeeklyMetric
    breakdown: Record<string, {
        gross_sales: WeeklyMetric
        expenses: WeeklyMetric
        net: WeeklyMetric
    }>
}

export function WeeklySalesReportPage() {
    const [toggleFilter, setToggleFilter] = useState(false)
    const [month, setMonth] = useState("2026-05")
    const [scope, setScope] = useState<WeeklySalesScope>("ALL")

    const { data: report, loading } = useFetchOne<WeeklySalesReport>(
        FinanceService.weeklySalesReport,
        [month, scope],
        [month, scope]
    )
    const [selectedCategoryTab, setSelectedCategoryTab] = useState("MEAT")
    const weeklyGroupedChartData = useMemo(() => {
        if (!report) return []

        return [
            {
                weekLabel: "Week 1",
                grossSales: report.gross_products.weeks.week_1,
                expenses: report.less_expenses.weeks.week_1,
                netProfit: report.gross_products.weeks.week_1 - report.less_expenses.weeks.week_1,
            },
            {
                weekLabel: "Week 2",
                grossSales: report.gross_products.weeks.week_2,
                expenses: report.less_expenses.weeks.week_2,
                netProfit: report.gross_products.weeks.week_2 - report.less_expenses.weeks.week_2,
            },
            {
                weekLabel: "Week 3",
                grossSales: report.gross_products.weeks.week_3,
                expenses: report.less_expenses.weeks.week_3,
                netProfit: report.gross_products.weeks.week_3 - report.less_expenses.weeks.week_3,
            },
            {
                weekLabel: "Week 4",
                grossSales: report.gross_products.weeks.week_4,
                expenses: report.less_expenses.weeks.week_4,
                netProfit: report.gross_products.weeks.week_4 - report.less_expenses.weeks.week_4,
            },
        ].filter((item) => Math.abs(item.grossSales) > 0 || Math.abs(item.expenses) > 0 || Math.abs(item.netProfit) > 0)
    }, [report])
    const hasExpensesBarData = useMemo(
        () => weeklyGroupedChartData.some((item) => Math.abs(item.expenses) > 0),
        [weeklyGroupedChartData]
    )

    if (loading || !report) return <PapiverseLoading />

    const weekColumns: (keyof WeekMap)[] = ["week_1", "week_2", "week_3", "week_4"]
    const netWeeks: WeekMap = {
        week_1: report.gross_products.weeks.week_1 - report.less_expenses.weeks.week_1,
        week_2: report.gross_products.weeks.week_2 - report.less_expenses.weeks.week_2,
        week_3: report.gross_products.weeks.week_3 - report.less_expenses.weeks.week_3,
        week_4: report.gross_products.weeks.week_4 - report.less_expenses.weeks.week_4,
    }
    const netTotal = report.gross_products.grand_total - report.less_expenses.grand_total
    const getProfitTextClass = (value: number) => {
        if (value < 0) return "text-darkred"
        if (value > 0) return "text-darkgreen"
        return "text-slate-900"
    }
    const categoryTabs = Object.keys(report.breakdown).sort((a, b) => {
        if (a === "MEAT") return -1
        if (b === "MEAT") return 1
        return a.localeCompare(b)
    })
    const activeCategory = report.breakdown[selectedCategoryTab]
    const displayMonth = format(new Date(`${report.month}-01`), "MMMM yyyy")
    const categoryHeadBgClass = selectedCategoryTab === "SNOWFROST" ? "bg-blue/20!" : "bg-darkbrown/20!"

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Branch Weekly Sales Report" />

            <div
                onClick={() => setToggleFilter(true)}
                className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
            >
                <div className="truncate">{scope}</div>
                <span className="text-slate-400">|</span>
                <CalendarDays size={18} />
                <div className="origin-left truncate scale-x-110">{displayMonth}</div>
                <Badge className="ml-2 bg-darkbrown font-bold">MONTHLY</Badge>
            </div>

            <WeeklySalesFilterModal
                open={toggleFilter}
                setOpen={setToggleFilter}
                month={month}
                setMonth={setMonth}
                scope={scope}
                setScope={setScope}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Gross Sales</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(report.gross_products.grand_total)}</p>
                </div>
                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Less Expenses</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(report.less_expenses.grand_total)}</p>
                </div>
                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Net Total</p>
                    <p className={`mt-3 text-2xl font-semibold ${getProfitTextClass(netTotal)}`}>{formatToPeso(netTotal)}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="w-full rounded-md border border-slate-300 bg-light p-4 shadow-sm">
                    <div>
                        <div className="font-bold text-xl">Weekly Gross, Expenses, and Net for <span className="text-darkbrown">{scope} Branches</span></div>
                        <div className="text-sm text-gray">
                            Grouped bars per week for the selected month, shown in Philippine peso (₱).
                        </div>
                    </div> 
                    <div className="mt-2 h-72 w-full">
                        {weeklyGroupedChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyGroupedChartData} margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                    <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                    <Bar dataKey="grossSales" name="Gross Sales" fill="#653818" radius={[6, 6, 0, 0]} />
                                    {hasExpensesBarData && (
                                        <Bar dataKey="expenses" name="Expenses" fill="#bf3612" radius={[6, 6, 0, 0]} />
                                    )}
                                    <Bar dataKey="netProfit" name="Net Profit" fill="#2f855a" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                There is no weekly summary data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div>
                    <div className="text-darkbrown font-bold text-xl">Overall Monthly Summary</div>
                </div>
                <div key={`overall-${report.month}-${scope}`} className="table-wrapper animate-fade-in-up">
                <div className="thead grid grid-cols-6">
                    <div className="th">Metric</div>
                    <div className="th">Week 1</div>
                    <div className="th">Week 2</div>
                    <div className="th">Week 3</div>
                    <div className="th">Week 4</div>
                    <div className="th">Grand Total</div>
                </div>
                <div className="divide-y divide-slate-200 bg-white">
                    {[
                        { label: "Gross Sales", data: report.gross_products },
                        { label: "Less Expenses", data: report.less_expenses },
                        { label: "Net Profit", data: { weeks: netWeeks, grand_total: netTotal } },
                    ].map((row) => (
                        <div className="tdata grid grid-cols-6" key={row.label}>
                            <div className={`td text-darkbrown ${row.label === "Net Profit" ? "font-bold" : "font-semibold"}`}>{row.label}</div>
                            {weekColumns.map((week) => (
                                <div
                                    className={`td justify-between ${row.label === "Net Profit" ? `font-bold ${getProfitTextClass(row.data.weeks[week])}` : ""}`}
                                    key={week}
                                >
                                    <span>₱</span>
                                    <span>{formatToPeso(row.data.weeks[week]).slice(1)}</span>
                                </div>
                            ))}
                            <div className={`td justify-between font-semibold ${row.label === "Net Profit" ? `font-bold ${getProfitTextClass(row.data.grand_total)}` : ""}`}>
                                <span>₱</span>
                                <span>{formatToPeso(row.data.grand_total).slice(1)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>

            <div className="mt-3 space-y-3">
                <AppTabSwitcher
                    tabs={categoryTabs}
                    selectedTab={selectedCategoryTab}
                    setSelectedTab={setSelectedCategoryTab}
                />

                <div className="table-wrapper">
                    <div key={`category-${selectedCategoryTab}-${report.month}-${scope}`} className="animate-fade-in-up">
                    <div className={`thead grid grid-cols-6 ${categoryHeadBgClass}`}>
                        <div className="th">Category / Metric</div>
                        <div className="th">Week 1</div>
                        <div className="th">Week 2</div>
                        <div className="th">Week 3</div>
                        <div className="th">Week 4</div>
                        <div className="th">Grand Total</div>
                    </div>
                    <div className="divide-y divide-slate-200 bg-white">
                        {activeCategory && [
                            { key: `${selectedCategoryTab}-gross`, label: "Gross Sales", data: activeCategory.gross_sales },
                            { key: `${selectedCategoryTab}-expenses`, label: "Expenses", data: activeCategory.expenses },
                            { key: `${selectedCategoryTab}-net`, label: "Net Profit", data: activeCategory.net },
                        ].map((row) => (
                            <div className="tdata grid grid-cols-6" key={row.key}>
                                <div className={`td ${row.label === "Net Profit" ? "font-bold" : "font-medium"}`}>{row.label}</div>
                                {weekColumns.map((week) => (
                                    <div
                                        className={`td justify-between ${row.label === "Net Profit" ? `font-bold ${getProfitTextClass(row.data.weeks[week])}` : ""}`}
                                        key={week}
                                    >
                                        <span>₱</span>
                                        <span>{formatToPeso(row.data.weeks[week]).slice(1)}</span>
                                    </div>
                                ))}
                                <div className={`td justify-between font-semibold ${row.label === "Net Profit" ? `font-bold ${getProfitTextClass(row.data.grand_total)}` : ""}`}>
                                    <span>₱</span>
                                    <span>{formatToPeso(row.data.grand_total).slice(1)}</span>
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
