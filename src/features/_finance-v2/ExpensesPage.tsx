"use client"

import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher"
import {  PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { Expense, ExpenseMonthlyResponse, ExpensePaymentModeSummaryResponse } from "@/types/expense";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExpenseService } from "@/services/expense.service";
import { AppHeader } from "@/components/shared/AppHeader";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { CreateExpense } from "./components/CreateExpense";
import { UpdateExpense } from "./components/UpdateExpense";
import { DeleteExpense } from "./components/DeleteExpense";
import { useToday } from "@/hooks/use-today";
import { endOfMonth, format, isAfter, startOfMonth } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExpenseDateDialog } from "./components/ExpenseDateDialog";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExpensesOverview } from "./components/ExpensesOverview";
import { ExpensesSummary } from "./components/ExpensesSummary";
import { ExpensesDetailed } from "./components/ExpensesDetailed";

const pageKey = "expensesPage";
const expenseLayoutKey = "expensesPageLayout";
const expenseLayoutTabs = ["Overview", "Summary", "Detailed"];
const columns = [
    { title: "Added By", style: "col-span-2" },
    { title: "Category / Purpose", style: "" },
    { title: "Mode of Payment", style: "" },
    { title: "Spent At", style: "" },
    { title: "Total", style: "" },
    { title: "Actions", style: "" },
];
const weeklyBreakdownColumns = [
    { title: "Expense Category", style: "" },
    { title: "Week 1", style: "" },
    { title: "Week 2", style: "" },
    { title: "Week 3", style: "" },
    { title: "Week 4", style: "" },
    { title: "Total Expenses", style: "" },
]

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

function normalizeOrderCategory(value?: string) {
    const normalized = (value ?? "").trim().toUpperCase();
    if (normalized === "SNOW") return "SNOWFROST";
    return normalized;
}

type NormalizedCategoryBreakdown = {
    expenseCategoryId?: number | null;
    expenseCategoryName: string;
    orderCategory: string;
    week1: string | number;
    week2: string | number;
    week3: string | number;
    week4: string | number;
    total: string | number;
};

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
    const [, setEndDate] = useState(today);
    const [toggleDate, setToggleDate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<ExpenseMonthlyResponse | null>(null);
    const [paymentModeSummary, setPaymentModeSummary] = useState<ExpensePaymentModeSummaryResponse | null>(null);
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
                const [response, paymentResponse] = await Promise.all([
                    ExpenseService.getExpensesByDate(claims.branch.branchId, selectedMonth, 0, 1000) as Promise<ExpenseMonthlyResponse>,
                    ExpenseService.getPaymentModeSummary(claims.branch.branchId, selectedMonth, "ALL"),
                ]);
                if (!isMounted) return;
                setMonthlyData(response);
                setPaymentModeSummary(paymentResponse);
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
        "expenseCategoryName",
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
    const categoryBreakdown = useMemo<NormalizedCategoryBreakdown[]>(() => {
        if (monthlyData?.categoryWeeklyBreakdown?.length) {
            return monthlyData.categoryWeeklyBreakdown.map((item) => ({
                ...item,
                expenseCategoryName: item.expenseCategoryName?.trim() || "UNCATEGORIZED",
                orderCategory: normalizeOrderCategory(item.orderCategory),
            }));
        }

        return (monthlyData?.purposeWeeklyBreakdown ?? []).map((item) => ({
            expenseCategoryName: item.purpose?.trim() || "UNCATEGORIZED",
            orderCategory: normalizeOrderCategory(item.orderCategory),
            week1: item.week1,
            week2: item.week2,
            week3: item.week3,
            week4: item.week4,
            total: item.total,
        }));
    }, [monthlyData]);

    const meatBreakdown = useMemo(
        () => categoryBreakdown.filter((item) => item.orderCategory === "MEAT"),
        [categoryBreakdown]
    );
    const snowfrostBreakdown = useMemo(
        () => categoryBreakdown.filter((item) => item.orderCategory === "SNOWFROST"),
        [categoryBreakdown]
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
    const allocatedCategoryChartData = useMemo(
        () => [...categoryBreakdown]
            .map((item) => ({
                label: item.expenseCategoryName,
                total: toAmount(item.total),
                orderCategory: item.orderCategory,
            }))
            .filter((item) => item.total > 0)
            .sort((a, b) => b.total - a.total),
        [categoryBreakdown]
    );
    const paymentModeChartData = useMemo(
        () => (paymentModeSummary?.paymentModeSummary ?? [])
            .map((item) => ({
                modeOfPayment: item.modeOfPayment,
                total: Number(item.total ?? 0),
                percentage: Number(item.percentage ?? 0),
                count: Number(item.count ?? 0),
            }))
            .filter((item) => item.total > 0),
        [paymentModeSummary]
    );

    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 10, pageKey);

    const [open, setOpen] = useState(false);
    const [toUpdate, setUpdate] = useState<Expense | undefined>();
    const [toDelete, setDelete] = useState<Expense | undefined>(); 

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md pb-12 animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Krispy Papi Expenditures" />

            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={[...expenseLayoutTabs]}
                    selectedTab={selectedLayout}
                    setSelectedTab={(tab) => setSelectedLayout(tab as (typeof expenseLayoutTabs)[number])}
                />
                <div
                    onClick={() => setToggleDate(true)}
                    className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer"
                >
                    <CalendarDays />

                    <div className="scale-x-110 origin-left">{displayDate}</div>

                    <Badge className="bg-darkbrown font-bold ml-2">
                        {displayBadge}
                    </Badge>
                </div>
            </div>

            {selectedLayout !== expenseLayoutTabs[2] && (
                <div className="mb-2">
                    <div className="font-bold text-xl">{selectedLayout === expenseLayoutTabs[0] ? 'Expenses Overview' : 'Expenditure Summary'} for <span className="text-darkbrown">{format(parsedStartDate!, "MMMM yyyy")}</span></div>
                    <div className="text-sm text-gray">
                        Expense entries and weekly spending breakdown for the selected month.
                    </div>
                </div>
            )}

            {selectedLayout === expenseLayoutTabs[0] && (
                <ExpensesOverview
                    combinedWeekTotals={combinedWeekTotals}
                    meatTotals={meatTotals}
                    snowTotals={snowTotals}
                    allocatedWeeklyChartData={allocatedWeeklyChartData}
                    allocatedCategoryChartData={allocatedCategoryChartData}
                    paymentModeChartData={paymentModeChartData}
                />
            )}

            {selectedLayout === expenseLayoutTabs[1] && (
                <ExpensesSummary
                    weeklyBreakdownColumns={weeklyBreakdownColumns}
                    meatBreakdown={meatBreakdown}
                    snowfrostBreakdown={snowfrostBreakdown}
                    meatTotals={meatTotals}
                    snowTotals={snowTotals}
                    combinedWeekTotals={combinedWeekTotals}
                />
            )}

            {selectedLayout === expenseLayoutTabs[2] && (
                <ExpensesDetailed
                    columns={columns}
                    setSearch={setSearch}
                    setSize={setSize}
                    size={size}
                    page={page}
                    search={search}
                    expensesData={expensesData}
                    filteredExpenses={filteredItems}
                    setPage={setPage}
                    setUpdate={setUpdate}
                    setDelete={setDelete}
                    pageKey={pageKey}
                    selectedMonth={selectedMonth}
                    selectedMonthLabel={format(parsedStartDate!, "MMMM yyyy")}
                    setReload={setReload}
                />
            )}

            {open && (
                <CreateExpense
                    setOpen={ setOpen }
                    setReload={setReload}
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
