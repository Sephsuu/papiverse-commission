"use client"

import { TablePagination } from "@/components/shared/TablePagination";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import {  PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { Expense, ExpenseMonthlyResponse } from "@/types/expense";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExpenseService } from "@/services/expense.service";
import { AppHeader } from "@/components/shared/AppHeader";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { CreateExpense } from "./components/CreateExpense";
import { UpdateExpense } from "./components/UpdateExpense";
import { DeleteExpense } from "./components/DeleteExpense";
import { useToday } from "@/hooks/use-today";
import { endOfMonth, format, isAfter, startOfMonth } from "date-fns";
import { CalendarDays, CirclePlus, Plus, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords, formatDateTime, formatToPeso } from "@/lib/formatter";
import { ExpenseDateDialog } from "./components/ExpenseDateDialog";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCategoryIcon } from "@/hooks/use-helper";
import { Button } from "@/components/ui/button";

const pageKey = "expensesPage";
const expenseLayoutKey = "expensesPageLayout";
const expenseLayoutTabs = ["Overview", "Summary", "Detailed"];
const columns = [
    { title: "Added By", style: "col-span-2" },
    { title: "Purpose", style: "" },
    { title: "Mode of Payment", style: "" },
    { title: "Spent At", style: "" },
    { title: "Total", style: "" },
    { title: "Actions", style: "" },
];
const weeklyBreakdownColumns = [
    { title: "Purpose", style: "" },
    { title: "Week 1", style: "" },
    { title: "Week 2", style: "" },
    { title: "Week 3", style: "" },
    { title: "Week 4", style: "" },
    { title: "Total Expenses", style: "" },
]
const expenseCategoryFilters = ["All", "Meat", "Snow Frost"];

function parseDateOnly(value: string) {
    return new Date(`${value}T00:00:00`);
}

function toAmount(value: unknown) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
        if (value.trim().toUpperCase() === "N/A") return 0;
        const sanitized = value.replace(/[^\d.-]/g, "");
        const parsed = Number(sanitized);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

export function ExpensesPage() {
    const [reload, setReload] = useState(false);
    const { claims, loading: authLoading } = useAuth();
    const { today } = useToday();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = format(parseDateOnly(today), "yyyy-MM");
    const monthParam = searchParams.get("month");
    const selectedMonth = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : currentMonth;
    const [date, setDate] = useState(`${selectedMonth}-01`);
    const [startDate, setStartDate] = useState(format(startOfMonth(parseDateOnly(today)), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(today);
    const [toggleDate, setToggleDate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<ExpenseMonthlyResponse | null>(null);
    const [filter, setFilter] = useState(expenseCategoryFilters[0]);
    const [selectedLayout, setSelectedLayout] = useState(expenseLayoutTabs[0]);
    const lastReplacedMonthRef = useRef<string | null>(null);

    useEffect(() => {
        sessionStorage.setItem(expenseLayoutKey, selectedLayout);
    }, [selectedLayout]);

    function replaceMonthParam(nextMonth: string) {
        if (!nextMonth) return;
        if (monthParam === nextMonth) return;
        if (lastReplacedMonthRef.current === nextMonth) return;

        const currentQuery = searchParams.toString();
        const nextParams = new URLSearchParams(currentQuery);
        nextParams.set("month", nextMonth);
        const nextQuery = nextParams.toString();
        if (nextQuery === currentQuery) return;

        lastReplacedMonthRef.current = nextMonth;
        router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }

    useEffect(() => {
        const isValidMonthParam = Boolean(monthParam && /^\d{4}-\d{2}$/.test(monthParam));
        const safeMonth = isValidMonthParam ? monthParam! : currentMonth;
        const safeDate = `${safeMonth}-01`;

        if (!isValidMonthParam) {
            replaceMonthParam(safeMonth);
        }

        setDate((prev) => (prev === safeDate ? prev : safeDate));
    }, [currentMonth, monthParam, pathname, router, searchParams]);

    useEffect(() => {
        if (!date) return;

        const selectedDate = parseDateOnly(date);
        const todayDate = parseDateOnly(today);

        const monthEndDate = endOfMonth(selectedDate);
        setStartDate(format(startOfMonth(selectedDate), "yyyy-MM-dd"));
        setEndDate(format(isAfter(monthEndDate, todayDate) ? todayDate : monthEndDate, "yyyy-MM-dd"));
    }, [date, today]);

    useEffect(() => {
        if (monthParam === lastReplacedMonthRef.current) {
            lastReplacedMonthRef.current = null;
        }
    }, [monthParam]);

    useEffect(() => {
        if (!claims?.branch?.branchId || !selectedMonth) return;

        let isMounted = true;

        async function loadExpenses() {
            try {
                setLoading(true);
                const response = await ExpenseService.getExpensesByDate(claims.branch.branchId, selectedMonth, 0, 1000) as ExpenseMonthlyResponse;
                if (!isMounted) return;
                setMonthlyData(response);
            } catch (err: any) {
                const message = err?.message || err?.error || "Failed to fetch expenses";
                toast.error(message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadExpenses();
        return () => {
            isMounted = false;
        };
    }, [claims?.branch?.branchId, reload, selectedMonth]);

    const expensesData = monthlyData?.expenses?.content ?? [];

    const { search, setSearch, filteredItems } = useSearchFilter(expensesData, [
        "purpose",
        "addedByName",
        "addedByUsername",
        "modeOfPayment",
        "spentAt",
    ]);
    const parsedStartDate = startDate ? parseDateOnly(startDate) : null;
    const displayDate = parsedStartDate
        ? format(parsedStartDate, "MMMM yyyy")
        : "Select date";
    const displayBadge = parsedStartDate
        ? "MONTHLY"
        : "PERIOD";
    const meatBreakdown = useMemo(
        () => (monthlyData?.purposeWeeklyBreakdown ?? []).filter((item) => item.orderCategory === "MEAT"),
        [monthlyData]
    );
    const snowfrostBreakdown = useMemo(
        () => (monthlyData?.purposeWeeklyBreakdown ?? []).filter((item) => item.orderCategory === "SNOW" || item.orderCategory === "SNOWFROST"),
        [monthlyData]
    );
    const meatTotals = useMemo(() => {
        return meatBreakdown.reduce(
            (acc, item) => ({
                week1: acc.week1 + toAmount(item.week1),
                week2: acc.week2 + toAmount(item.week2),
                week3: acc.week3 + toAmount(item.week3),
                week4: acc.week4 + toAmount(item.week4),
                total: acc.total + toAmount(item.total),
            }),
            { week1: 0, week2: 0, week3: 0, week4: 0, total: 0 }
        );
    }, [meatBreakdown]);
    const snowTotals = useMemo(() => {
        return snowfrostBreakdown.reduce(
            (acc, item) => ({
                week1: acc.week1 + toAmount(item.week1),
                week2: acc.week2 + toAmount(item.week2),
                week3: acc.week3 + toAmount(item.week3),
                week4: acc.week4 + toAmount(item.week4),
                total: acc.total + toAmount(item.total),
            }),
            { week1: 0, week2: 0, week3: 0, week4: 0, total: 0 }
        );
    }, [snowfrostBreakdown]);
    const combinedWeekTotals = useMemo(
        () => ({
            week1: meatTotals.week1 + snowTotals.week1,
            week2: meatTotals.week2 + snowTotals.week2,
            week3: meatTotals.week3 + snowTotals.week3,
            week4: meatTotals.week4 + snowTotals.week4,
            total: meatTotals.total + snowTotals.total,
        }),
        [meatTotals, snowTotals]
    );
    const weeklyChartData = useMemo(
        () => [
            { label: "Week 1", meat: meatTotals.week1, snowfrost: snowTotals.week1, combined: combinedWeekTotals.week1 },
            { label: "Week 2", meat: meatTotals.week2, snowfrost: snowTotals.week2, combined: combinedWeekTotals.week2 },
            { label: "Week 3", meat: meatTotals.week3, snowfrost: snowTotals.week3, combined: combinedWeekTotals.week3 },
            { label: "Week 4", meat: meatTotals.week4, snowfrost: snowTotals.week4, combined: combinedWeekTotals.week4 },
        ],
        [meatTotals, snowTotals, combinedWeekTotals]
    );
    const allocatedWeeklyChartData = useMemo(
        () => weeklyChartData.filter((item) => toAmount(item.combined) > 0),
        [weeklyChartData]
    );
    const allocatedPurposeChartData = useMemo(() => {
        const purposeTotals = new Map<string, number>();

        (monthlyData?.purposeWeeklyBreakdown ?? []).forEach((item) => {
            const purpose = item.purpose?.trim();
            if (!purpose) return;

            const total = toAmount(item.total);
            purposeTotals.set(purpose, (purposeTotals.get(purpose) ?? 0) + total);
        });

        return Array.from(purposeTotals.entries())
            .map(([purpose, total]) => ({ purpose, total }))
            .filter((item) => item.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [monthlyData]);

    const categoryFilteredItems = useMemo(() => {
        return filteredItems.filter((item) => {
            if (filter === "Meat") return item.orderCategory === "MEAT";
            if (filter === "Snow Frost") return item.orderCategory === "SNOW";
            return true;
        });
    }, [filteredItems, filter]);

    const sortedExpenses = useMemo(
        () =>
            [...categoryFilteredItems].sort(
                (a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime()
            ),
        [categoryFilteredItems]
    );
    const { page, setPage, size, setSize, paginated } = usePagination(sortedExpenses, 10, pageKey);

    const [open, setOpen] = useState(false);
    const [createPrefill, setCreatePrefill] = useState<{
        purpose?: string;
        orderCategory?: string;
        weekRange?: { start: string; end: string };
    } | undefined>(undefined);
    const [toUpdate, setUpdate] = useState<Expense | undefined>();
    const [toDelete, setDelete] = useState<Expense | undefined>(); 
    
    function getWeekRange(monthValue: string, weekNumber: 1 | 2 | 3 | 4) {
        const monthStart = parseDateOnly(`${monthValue}-01`);
        const startDay = weekNumber === 1 ? 1 : weekNumber === 2 ? 8 : weekNumber === 3 ? 15 : 22;
        const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), startDay);
        const monthEnd = endOfMonth(monthStart);
        const endDay = weekNumber === 1 ? 7 : weekNumber === 2 ? 14 : weekNumber === 3 ? 21 : monthEnd.getDate();
        const end = new Date(monthStart.getFullYear(), monthStart.getMonth(), endDay);
        return {
            start: format(start, "yyyy-MM-dd"),
            end: format(end, "yyyy-MM-dd"),
        };
    }

    function openCreateFromWeeklyRow(purpose: string, orderCategory: string, weekNumber: 1 | 2 | 3 | 4) {
        setCreatePrefill({
            purpose,
            orderCategory,
            weekRange: getWeekRange(selectedMonth, weekNumber),
        });
        setOpen(true);
    }

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md pb-12 animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Expenses" />

            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={[...expenseLayoutTabs]}
                    selectedTab={selectedLayout}
                    setSelectedTab={(tab) => setSelectedLayout(tab as (typeof expenseLayoutTabs)[number])}
                />
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

            <div className="flex-center-y justify-between">
                <div className="mb-2">
                    <div className="font-bold text-xl">{selectedLayout === expenseLayoutTabs[0] ? 'Expenses Overview' : selectedLayout === expenseLayoutTabs[1] ? 'Expenditure Summary' : 'Detailed Expenditures'} for <span className="text-darkbrown">{format(parsedStartDate!, "MMMM yyyy")}</span></div>
                    <div className="text-sm text-gray">
                        Expense entries and weekly spending breakdown for the selected month.
                    </div>
                </div> 
                {(selectedLayout === expenseLayoutTabs[0] || selectedLayout === expenseLayoutTabs[2]) && (
                    <Button
                        className="bg-darkgreen! hover:opacity-90"
                        onClick={() => setOpen(!open)}
                    >   
                        <Plus /> Add expenses
                    </Button>
                )}
            </div>

            {selectedLayout === expenseLayoutTabs[0] && (
                <div className="animate-fade-in-up" key={selectedLayout}>
                    <div className="mb-2 grid gap-4 animate-fade-in-up md:grid-cols-2 xl:grid-cols-3">
                        {[
                            {
                                label: "Overall Expenses",
                                value: formatToPeso(combinedWeekTotals.total),
                                helper: "Total expenditure for selected month",
                            },
                            {
                                label: "MEAT Expenses",
                                value: formatToPeso(meatTotals.total),
                                helper: "Total MEAT category expenditure",
                            },
                            {
                                label: "SNOWFROST Expenses",
                                value: formatToPeso(snowTotals.total),
                                helper: "Total SNOWFROST category expenditure",
                            },
                        ].map((item) => (
                            <div key={item.label} className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
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
                    <Card className="w-full bg-light p-4">
                        <div>
                            <div className="text-darkbrown font-bold text-xl">Weekly Expenses Chart</div>
                            <div className="text-sm text-gray">
                                Weekly total expenses for the selected month, shown in Philippine peso (₱).
                            </div>
                        </div> 

                        <div className="h-52 w-full">
                            {allocatedWeeklyChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={allocatedWeeklyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                        <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                        <Bar dataKey="combined" name="COMBINED" fill="#653818" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="meat" name="MEAT" fill="#bf3612" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="snowfrost" name="SNOW FROST" fill="#007aa5" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                    There are no expenses yet.
                                </div>
                            )}
                        </div>
                    </Card> 

                    <Card className="mt-4 w-full bg-light p-4">
                        <div>
                            <div className="text-darkbrown font-bold text-xl">Expenses Allocated Per Purpose</div>
                            <div className="text-sm text-gray">
                                Purpose allocation for the selected month. Only purposes with allocated expenses are shown.
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            {allocatedPurposeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={allocatedPurposeChartData} margin={{ top: 12, right: 12, left: 8, bottom: 56 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="purpose"
                                            angle={-20}
                                            textAnchor="end"
                                            interval={0}
                                            height={72}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                        <Tooltip
                                            formatter={(value: number) => formatToPeso(Number(value))}
                                            labelFormatter={(label) => `Purpose: ${label}`}
                                        />
                                        <Bar dataKey="total" name="Allocated Expenses" fill="#2f855a" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-gray">
                                    There are no allocated purpose expenses yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>  
            )}

            {selectedLayout === expenseLayoutTabs[1] && (
                <div className="space-y-2 mb-4 animate-fade-in-up">
                    
                    <div className="table-wrapper" >
                        <div className="thead grid grid-cols-6 bg-darkbrown/10!">
                            {weeklyBreakdownColumns.map((item, index) => (
                                <div className="th" key={`meat-${item.title}`}>
                                    {index === 0 ? "MEAT Expenses" : item.title}
                                </div>
                            ))}
                        </div>

                        {meatBreakdown.map((item, idx) => (
                            <div className="tdata grid grid-cols-6" key={idx}>
                                <div className="td font-semibold">{item.purpose}</div>
                                <div className="td">
                                    <div className="flex-center-y justify-between gap-3 w-full">
                                        <div className="flex-center-y gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                                            <span className="text-xs text-slate-500">₱</span>
                                            <span>{item.week1 === "N/A" ? "N/A" : item.week1}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="flex-center-y rounded-md border border-darkgreen/30 bg-darkgreen/10 p-1 text-darkgreen hover:bg-darkgreen/15"
                                            aria-label={`Add week 1 expense for ${item.purpose}`}
                                            onClick={() => openCreateFromWeeklyRow(item.purpose, "MEAT", 1)}
                                        >
                                            <CirclePlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {[{ key: "week2", week: 2 }, { key: "week3", week: 3 }, { key: "week4", week: 4 }].map((weekItem) => (
                                    <div className="td" key={`${item.purpose}-${weekItem.key}`}>
                                        <div className="flex-center-y justify-between gap-3 w-full">
                                            <div className="flex-center-y gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                                                <span className="text-xs text-slate-500">₱</span>
                                                <span>{item[weekItem.key as keyof typeof item] === "N/A" ? "N/A" : item[weekItem.key as keyof typeof item]}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="flex-center-y rounded-md border border-darkgreen/30 bg-darkgreen/10 p-1 text-darkgreen hover:bg-darkgreen/15"
                                                aria-label={`Add week ${weekItem.week} expense for ${item.purpose}`}
                                                onClick={() => openCreateFromWeeklyRow(item.purpose, "MEAT", weekItem.week as 2 | 3 | 4)}
                                            >
                                                <CirclePlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="td justify-between font-semibold">
                                    <span>₱</span>
                                    <span>{formatToPeso(item.total).slice(1,)}</span>
                                </div>
                            </div>
                        ))}
                        {meatBreakdown.length === 0 && (
                            <div className="tdata grid grid-cols-6">
                                <div className="td font-semibold">No MEAT expenses yet.</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                            </div>
                        )}
                        <div className="tdata grid grid-cols-6 bg-darkbrown/5!">
                            <div className="td font-bold">MEAT Total</div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(meatTotals.week1).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(meatTotals.week2).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(meatTotals.week3).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(meatTotals.week4).slice(1,)}</span></div>
                            <div className="td justify-between font-bold"><span>₱</span><span>{formatToPeso(meatTotals.total).slice(1,)}</span></div>
                        </div>

                        <div className="thead grid grid-cols-6 bg-blue/10!">
                            {weeklyBreakdownColumns.map((item, index) => (
                                <div className="th" key={`snow-${item.title}`}>
                                    {index === 0 ? "SNOWFROST Expenses" : item.title}
                                </div>
                            ))}
                        </div>

                        {snowfrostBreakdown.map((item, idx) => (
                            <div className="tdata grid grid-cols-6" key={`snow-${idx}`}>
                                <div className="td font-semibold">{item.purpose}</div>
                                {[{ key: "week1", week: 1 }, { key: "week2", week: 2 }, { key: "week3", week: 3 }, { key: "week4", week: 4 }].map((weekItem) => (
                                    <div className="td" key={`snow-${item.purpose}-${weekItem.key}`}>
                                        <div className="flex-center-y justify-between gap-3 w-full">
                                            <div className="flex-center-y gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                                                <span className="text-xs text-slate-500">₱</span>
                                                <span>{item[weekItem.key as keyof typeof item] === "N/A" ? "N/A" : item[weekItem.key as keyof typeof item]}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="flex-center-y rounded-md border border-darkgreen/30 bg-darkgreen/10 p-1 text-darkgreen hover:bg-darkgreen/15"
                                                aria-label={`Add week ${weekItem.week} expense for ${item.purpose}`}
                                                onClick={() => openCreateFromWeeklyRow(item.purpose, "SNOW", weekItem.week as 1 | 2 | 3 | 4)}
                                            >
                                                <CirclePlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="td justify-between font-semibold">
                                    <span>₱</span>
                                    <span>{formatToPeso(item.total).slice(1,)}</span>
                                </div>
                            </div>
                        ))}
                        {snowfrostBreakdown.length === 0 && (
                            <div className="tdata grid grid-cols-6">
                                <div className="td font-semibold">No SNOWFROST expenses yet.</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                                <div className="td">-</div>
                            </div>
                        )}
                        <div className="tdata grid grid-cols-6 bg-blue/5!">
                            <div className="td font-bold">SNOWFROST Total</div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(snowTotals.week1).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(snowTotals.week2).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(snowTotals.week3).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(snowTotals.week4).slice(1,)}</span></div>
                            <div className="td justify-between font-bold"><span>₱</span><span>{formatToPeso(snowTotals.total).slice(1,)}</span></div>
                        </div>
                        <div className="tdata grid grid-cols-6 bg-green-50!">
                            <div className="td font-bold">Combined Weekly Total</div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(combinedWeekTotals.week1).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(combinedWeekTotals.week2).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(combinedWeekTotals.week3).slice(1,)}</span></div>
                            <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(combinedWeekTotals.week4).slice(1,)}</span></div>
                            <div className="td justify-between font-bold"><span>₱</span><span>{formatToPeso(combinedWeekTotals.total).slice(1,)}</span></div>
                        </div>
                        
                    </div>
                </div>
            )}

            {selectedLayout === expenseLayoutTabs[2] && (
                <div className="space-y-2">
                    <TableFilter
                        setSearch={ setSearch }
                        searchPlaceholder="Search for an expense"
                        setSize={ setSize }
                        size={ size }
                        buttonLabel="Add expenses"
                        setOpen={ setOpen }
                        filters={expenseCategoryFilters}
                        filter={filter}
                        setFilter={setFilter}
                    />

                    <section className="w-full">
                        <div className="table-wrapper">
                            <div className="thead grid grid-cols-7">
                                {columns.map((item, index) => (
                                    <div key={index} className={`th ${item.style}`}>
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="animate-fade-in-up" key={`${filter}-${page}`}>
                            {paginated.length > 0 ? (
                                paginated.map((expense) => (
                                    <div className="tdata grid grid-cols-7 max-md:w-300!" key={expense.id}>
                                        <div className="td col-span-2 gap-3">
                                            {getCategoryIcon(expense.orderCategory!)}
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold">{expense.addedByName}</div>
                                                <div className="truncate text-xs text-gray">@{expense.addedByUsername}</div>
                                            </div>
                                        </div>

                                        <div className="td">
                                            {expense.purpose}
                                        </div>

                                        <div className="td">
                                            {capitalizeWords(expense.modeOfPayment.replace(/_/g, " "))}
                                        </div>

                                        <div className="td">
                                            {formatDateTime(expense.spentAt)}
                                        </div>

                                        <div className="td justify-between">
                                            <div>₱</div>
                                            <div>{formatToPeso(expense.total).slice(1,)}</div>
                                        </div>

                                        <div className="td justify-center gap-2">
                                            <button onClick={() => setUpdate(expense)}>
                                                <SquarePen className="h-4 w-4 text-darkgreen" />
                                            </button>
                                            <button onClick={() => setDelete(expense)}>
                                                <Trash2 className="h-4 w-4 text-darkred" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="my-2 text-center text-sm">There are no expenses yet.</div>
                            )}
                        </div>
                    </section>

                    {sortedExpenses.length > 0 && (
                        <TablePagination
                            data={ sortedExpenses }
                            paginated={ paginated }
                            page={ page }
                            size={ size }
                            setPage={ setPage }
                            search={ search }
                            filter={ filter }
                            pageKey={ pageKey }
                        />
                    )}
                </div>
            )}

            {open && (
                <CreateExpense
                    setOpen={ setOpen }
                    setReload={setReload}
                    prefill={createPrefill}
                /> 
            )}

            {toUpdate && (
                <UpdateExpense
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                /> 
            )}

            {toDelete && (
                <DeleteExpense
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            )}

            <ExpenseDateDialog
                date={date}
                open={toggleDate}
                selectedMonth={selectedMonth}
                onApplyMonth={replaceMonthParam}
                setOpen={setToggleDate}
            />

        </section>
    );
}
