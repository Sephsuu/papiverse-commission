"use client"

import { TablePagination } from "@/components/shared/TablePagination";
import {  PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { Expense } from "@/types/expense";
import { useEffect, useMemo, useState } from "react";
import { ExpenseService } from "@/services/expense.service";
import { AppHeader } from "@/components/shared/AppHeader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { CreateExpense } from "./components/CreateExpense";
import { UpdateExpense } from "./components/UpdateExpense";
import { DeleteExpense } from "./components/DeleteExpense";
import { useToday } from "@/hooks/use-today";
import { endOfMonth, endOfWeek, format, isAfter, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords, formatDateTime, formatDateToWords, formatToPeso } from "@/lib/formatter";
import { ExpenseDateDialog, ExpensePeriodMode } from "./components/ExpenseDateDialog";

const pageKey = "expensesPage";
const columns = [
    { title: "Added By", style: "col-span-2" },
    { title: "Purpose", style: "" },
    { title: "Mode of Payment", style: "" },
    { title: "Spent At", style: "" },
    { title: "Total", style: "" },
    { title: "Actions", style: "" },
];

function parseDateOnly(value: string) {
    return new Date(`${value}T00:00:00`);
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export function ExpensesPage() {
    const [reload, setReload] = useState(false);
    const { loading: authLoading } = useAuth();
    const { today } = useToday();
    const [date, setDate] = useState(today);
    const [mode, setMode] = useState<ExpensePeriodMode>("MONTH");
    const [startDate, setStartDate] = useState(format(startOfMonth(parseDateOnly(today)), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(today);
    const [toggleDate, setToggleDate] = useState(false);

    useEffect(() => {
        if (!date) return;

        const selectedDate = parseDateOnly(date);
        const todayDate = parseDateOnly(today);

        if (mode === "DAY") {
            setStartDate(date);
            setEndDate(date);
            return;
        }

        if (mode === "WEEK") {
            const weekEndDate = endOfWeek(selectedDate, { weekStartsOn: 0 });
            setStartDate(format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd"));
            setEndDate(format(isAfter(weekEndDate, todayDate) ? todayDate : weekEndDate, "yyyy-MM-dd"));
            return;
        }

        if (mode === "MONTH") {
            const monthEndDate = endOfMonth(selectedDate);
            setStartDate(format(startOfMonth(selectedDate), "yyyy-MM-dd"));
            setEndDate(format(isAfter(monthEndDate, todayDate) ? todayDate : monthEndDate, "yyyy-MM-dd"));
            return;
        }
    }, [date, mode, today]);

    const { data, loading } = useFetchData<Expense>(
        ExpenseService.getExpensesByDate, 
        [reload, startDate, endDate],
        [startDate, endDate],
    );
    const { search, setSearch, filteredItems } = useSearchFilter(data, [
        "purpose",
        "addedByName",
        "addedByUsername",
        "modeOfPayment",
        "spentAt",
    ]);
    const parsedStartDate = startDate ? parseDateOnly(startDate) : null;
    const parsedEndDate = endDate ? parseDateOnly(endDate) : null;
    const displayDate = parsedStartDate
        ? mode === "WEEK" && parsedEndDate
            ? `${format(parsedStartDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`
            : mode === "MONTH"
                ? format(parsedStartDate, "MMMM yyyy")
            : format(parsedStartDate, "MMMM dd, yyyy")
        : "Select date";
    const displayBadge = parsedStartDate
        ? mode === "WEEK"
            ? "SUN-SAT"
            : mode === "MONTH"
                ? "MONTHLY"
            : format(parsedStartDate, "EEEE").toUpperCase()
        : "PERIOD";

    const sortedExpenses = useMemo(
        () =>
            [...filteredItems].sort(
                (a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime()
            ),
        [filteredItems]
    );
    const { page, setPage, size, setSize, paginated } = usePagination(sortedExpenses, 20, pageKey);

    const [open, setOpen] = useState(false);
    const [toUpdate, setUpdate] = useState<Expense | undefined>();
    const [toDelete, setDelete] = useState<Expense | undefined>(); 

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Expenses" />

            <div className="flex-center-y justify-between">
                <div className="text-xl font-semibold">
                    Expenditures for 
                    <span className="text-darkbrown ml-1.5">
                        {mode === "WEEK"
                            ? `${formatDateToWords(startDate)} - ${formatDateToWords(endDate)}`
                            : mode === "MONTH"
                                ? format(parsedStartDate!, "MMMM yyyy")
                            : formatDateToWords(startDate)}
                    </span>
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

            
            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for an expense"
                setSize={ setSize }
                size={ size }
                buttonLabel="Add an expense"
                setOpen={ setOpen }
            />

            <section className="w-full">
                <div className="table-wrapper">
                    <div className="thead grid grid-cols-7 max-md:w-300!">
                        {columns.map((item, index) => (
                            <div key={index} className={`th ${item.style}`}>
                                {item.title}
                            </div>
                        ))}
                    </div>

                    <div className="animate-fade-in-up">
                        {paginated.length > 0 ? (
                            paginated.map((expense) => (
                                <div className="tdata grid grid-cols-7 max-md:w-300!" key={expense.id}>
                                    <div className="td col-span-2 gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-full bg-brown font-semibold text-light">
                                            {getInitials(expense.addedByName)}
                                        </div>
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
                    pageKey={ pageKey }
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
                mode={mode}
                open={toggleDate}
                setDate={setDate}
                setMode={setMode}
                setOpen={setToggleDate}
            />

        </section>
    );
}
