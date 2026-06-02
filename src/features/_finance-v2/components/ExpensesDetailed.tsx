'use client'

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { capitalizeWords, formatDateTime, formatToPeso } from "@/lib/formatter";
import { getCategoryIcon } from "@/hooks/use-helper";
import { Expense } from "@/types/expense";
import { CalendarDays, Check, Eye, EyeClosed, Ham, Plus, Snowflake, SquarePen, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppInput } from "@/components/shared/AppInput";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseCategory } from "@/types/expense";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { parseExpenseCalendarDate, toExpenseDateTimeString } from "@/lib/expense-date";
import { useCrudState } from "@/hooks/use-crud-state";
import { AppSelect } from "@/components/shared/AppSelect";
import { SectionLoading } from "@/components/ui/loader";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TABS = ['ALL', 'MEAT', 'SNOWFROST']
const FILTERS = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4']
const PAYMENT_METHODS = [
    { label: "Cash", value: "CASH" },
    { label: "BDO", value: "BDO" },
    { label: "EastWest", value: "EASTWEST" },
    { label: "GCash", value: "GCASH" },
    { label: "BPI", value: "BPI" },
    { label: "GoTyme", value: "GO_TYME" },
    { label: "Union Bank", value: "UNION_BANK" },
    { label: "Internal", value: "INTERNAL" },
];
const DEFAULT_PAYMENT_MODE = "CASH";

function normalizeOrderCategory(value?: string) {
    const normalized = (value ?? "").trim().toUpperCase();
    if (normalized === "SNOW") return "SNOWFROST";
    return normalized;
}

function getWeekFilterFromDate(date: Date) {
    const day = date.getDate();
    if (day >= 1 && day <= 7) return "WEEK 1";
    if (day >= 8 && day <= 15) return "WEEK 2";
    if (day >= 16 && day <= 22) return "WEEK 3";
    return "WEEK 4";
}

type Props = {
    expensesData: Expense[]
    filteredExpenses: Expense[];
    columns: Array<{ title: string; style: string }>;
    setSearch: (value: string) => void;
    setSize: Dispatch<SetStateAction<number>>;
    size: number;
    page: number;
    search: string;
    setPage: Dispatch<SetStateAction<number>>
    setUpdate: Dispatch<SetStateAction<Expense | undefined>>;
    setDelete: Dispatch<SetStateAction<Expense | undefined>>;
    pageKey: string;
    selectedMonth: string;
    selectedMonthLabel: string;
    setReload: Dispatch<SetStateAction<boolean>>;
};

type WeeklyExpenseResponse = {
    month: string;
    week: number;
    weekCode: string;
    weekRange: string;
    startDate: string;
    endDate: string;
    total: number;
    categories: Array<{
        expenseCategoryId: number;
        expenseCategoryName: string;
        orderCategory: string;
        total: number;
        items: Array<{
            expenseId: number;
            spentAt: string;
            amount: number;
            modeOfPayment: string;
            purpose: string;
            addedByUsername: string;
            isChecked?: boolean;
        }>;
    }>;
};

export function ExpensesDetailed({
    expensesData,
    filteredExpenses,
    columns,
    setSearch,
    setSize,
    size,
    page,
    search,
    setPage,
    setUpdate,
    setDelete,
    pageKey,
    selectedMonth,
    selectedMonthLabel,
    setReload,
}: Props) {
    const tabStorageKey = `${pageKey}-detailed-tab`;
    const categoryStorageKey = `${pageKey}-detailed-category`;
    const weekStorageKey = `${pageKey}-detailed-week`;
    const { claims } = useAuth();
    const [tab, setTab] = useState(() => {
        if (typeof window === "undefined") return TABS[0];
        const saved = sessionStorage.getItem(tabStorageKey);
        return saved && TABS.includes(saved) ? saved : TABS[0];
    })
    const [purpose, setPurpose] = useState(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem(categoryStorageKey) ?? "";
    })
    const [filter, setFilter] = useState(() => {
        if (typeof window === "undefined") return FILTERS[0];
        const saved = sessionStorage.getItem(weekStorageKey);
        return saved && FILTERS.includes(saved) ? saved : FILTERS[0];
    })
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    const [editRow, setEditRow] = useState<InlineEditRow | null>(null);
    const [weeklyDetail, setWeeklyDetail] = useState<WeeklyExpenseResponse | null>(null);
    const [pendingCheckExpense, setPendingCheckExpense] = useState<Expense | null>(null);
    const [pendingCheckedValue, setPendingCheckedValue] = useState<boolean | null>(null);
    const [createRows, setCreateRows] = useState<CreateExpenseRow[]>([
        { id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE, spentAtDate: new Date() },
    ]);
    const expenseCategoryOptions = useMemo(() => {
        const grouped = categories.reduce<Record<string, string[]>>((acc, item) => {
            if (item.active === false) return acc;
            const categoryKey = normalizeOrderCategory(item.orderCategory);
            if (!categoryKey) return acc;

            if (!acc[categoryKey]) acc[categoryKey] = [];
            if (!acc[categoryKey].includes(item.name)) acc[categoryKey].push(item.name);
            return acc;
        }, {
            MEAT: [],
            SNOWFROST: [],
        });

        return grouped;
    }, [categories]);
    const purposeOptions = useMemo(() => {
        const grouped = expensesData.reduce<Record<string, string[]>>((acc, item) => {
            const categoryKey = normalizeOrderCategory(item.orderCategory);
            const categoryName = item.expenseCategoryName?.trim();
            if (!categoryKey || !categoryName) return acc;

            if (!acc[categoryKey]) acc[categoryKey] = [];
            if (!acc[categoryKey].includes(categoryName)) acc[categoryKey].push(categoryName);
            return acc;
        }, {
            MEAT: [],
            SNOWFROST: [],
        });

        if (grouped.MEAT.length === 0) grouped.MEAT = ["CFS", "ATKINS", "BASILIA", "EASYTRIP/RFID", "JFQ", "JEN"];
        if (grouped.SNOWFROST.length === 0) grouped.SNOWFROST = ["JERRY", "REN", "JEN", "PAYROLL"];

        return grouped;
    }, [expensesData]);
    const allCategoryOptions = useMemo(() => {
        const names = categories
            .filter((item) => item.active !== false)
            .map((item) => item.name.trim())
            .filter(Boolean);
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [categories]);
    const allCategoryGroupedOptions = useMemo(() => {
        const groupMap = categories
            .filter((item) => item.active !== false)
            .reduce<Record<"MEAT" | "SNOWFROST", { label: string; value: string }[]>>((acc, item) => {
                const key = normalizeOrderCategory(item.orderCategory) === "SNOWFROST" ? "SNOWFROST" : "MEAT";
                const name = item.name.trim();
                if (!name) return acc;
                const uniqueValue = `${key}::${name}`;
                if (!acc[key].some((entry) => entry.value === uniqueValue)) {
                    acc[key].push({ label: name, value: uniqueValue });
                }
                return acc;
            }, { MEAT: [], SNOWFROST: [] });

        return [
            { groupLabel: "MEAT", items: groupMap.MEAT.sort((a, b) => a.label.localeCompare(b.label)) },
            { groupLabel: "SNOWFROST", items: groupMap.SNOWFROST.sort((a, b) => a.label.localeCompare(b.label)) },
        ].filter((group) => group.items.length > 0);
    }, [categories]);
    const visiblePurposeTabs = tab === "ALL"
        ? []
        : ["ALL", ...((expenseCategoryOptions[tab]?.length ? expenseCategoryOptions[tab] : purposeOptions[tab]) ?? [])];
    const selectedCategory = useMemo(
        () => categories.find((item) => (
            (tab === "ALL" || normalizeOrderCategory(item.orderCategory) === tab)
            && item.name.trim().toUpperCase() === purpose.trim().toUpperCase()
            && item.active !== false
        )),
        [categories, purpose, tab]
    );
    const selectedCategoryId = selectedCategory?.id
        ?? expensesData.find((item) => (
            (tab === "ALL" || normalizeOrderCategory(item.orderCategory) === tab)
            && item.expenseCategoryName?.trim().toUpperCase() === purpose.trim().toUpperCase()
        ))?.expenseCategoryId;
    const categoryFilteredExpenses = useMemo(() => {
        const rows = (weeklyDetail?.categories ?? []).flatMap((category) =>
            (category.items ?? []).map((item) => ({
                id: item.expenseId,
                total: Number(item.amount ?? 0),
                spentAt: item.spentAt,
                modeOfPayment: item.modeOfPayment,
                orderCategory: normalizeOrderCategory(category.orderCategory),
                expenseCategoryId: category.expenseCategoryId,
                expenseCategoryName: category.expenseCategoryName,
                addedByName: item.addedByUsername,
                purpose: item.purpose,
                isChecked: item.isChecked ?? false,
            }))
        ) as Expense[];

        const withTab = tab === "ALL" ? rows : rows.filter((item) => normalizeOrderCategory(item.orderCategory) === tab);
        const withPurpose = tab === "ALL" || purpose === "ALL"
            ? withTab
            : (purpose ? withTab.filter((item) => item.expenseCategoryName?.trim().toUpperCase() === purpose.trim().toUpperCase()) : withTab);
        return withPurpose;
    }, [weeklyDetail, tab, purpose]);
    const paginatedExpenses = useMemo(() => {
        const start = page * size;
        const end = start + size;
        return categoryFilteredExpenses.slice(start, end);
    }, [categoryFilteredExpenses, page, size]);
    const categorySummaryCards = useMemo(() => {
        const source = weeklyDetail?.categories ?? [];
        const filtered = tab === "ALL"
            ? source
            : source.filter((item) => normalizeOrderCategory(item.orderCategory) === tab);

        return filtered
            .map((item) => ({
                expenseCategoryId: item.expenseCategoryId,
                expenseCategoryName: item.expenseCategoryName,
                orderCategory: normalizeOrderCategory(item.orderCategory),
                total: Number(item.total ?? 0),
            }))
            .sort((a, b) => b.total - a.total);
    }, [weeklyDetail, tab]);
    const selectedCategoryTotal = useMemo(
        () => categoryFilteredExpenses.reduce((acc, item) => acc + Number(item.total ?? 0), 0),
        [categoryFilteredExpenses]
    );
    const hasInvalidRow = createRows.some((row) => row.amount <= 0 || row.description.trim() === "" || !row.modeOfPayment);
    const isCreateDisabled = !selectedCategoryId || isCreating || createRows.length === 0 || hasInvalidRow || (tab !== "ALL" && purpose === "ALL");
    const isUpdateDisabled = !editRow || editRow.total <= 0 || !editRow.modeOfPayment || isSavingEdit;

    function addCreateRow() {
        setCreateRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE, spentAtDate: new Date() },
        ]);
    }

    function removeCreateRow(id: string) {
        setCreateRows((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((row) => row.id !== id);
        });
    }

    function updateCreateRow(id: string, updates: Partial<CreateExpenseRow>) {
        setCreateRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
    }

    async function handleCreateExpense() {
        if (!claims?.branch?.branchId || !claims?.userId || !selectedCategoryId) {
            toast.error("Unable to resolve category or user context.");
            return;
        }

        try {
            setIsCreating(true);
            const nextActiveWeek = createRows[0]?.spentAtDate
                ? getWeekFilterFromDate(createRows[0].spentAtDate)
                : null;

            const resolvedOrderCategory =
                normalizeOrderCategory(selectedCategory?.orderCategory)
                || normalizeOrderCategory(categories.find((item) => item.id === selectedCategoryId)?.orderCategory)
                || (tab === "ALL" ? "MEAT" : tab);

            const payload: Partial<Expense>[] = createRows.map((row) => ({
                branchId: claims.branch.branchId,
                total: Number(row.amount),
                spentAt: toExpenseDateTimeString(row.spentAtDate ?? new Date()),
                expenseCategoryId: selectedCategoryId,
                orderCategory: resolvedOrderCategory,
                modeOfPayment: row.modeOfPayment,
                purpose: row.description.trim(),
                isChecked: false,
            }));

            await ExpenseService.createExpense(payload, claims.userId);
            toast.success(`${payload.length} expense${payload.length > 1 ? "s" : ""} created under ${purpose}.`);
            setCreateRows([{ id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE, spentAtDate: new Date() }]);
            if (nextActiveWeek && FILTERS.includes(nextActiveWeek)) {
                setFilter(nextActiveWeek);
            }
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setIsCreating(false);
        }
    }

    function startInlineEdit(expense: Expense) {
        setEditingExpenseId(expense.id);
        setEditRow({
            id: expense.id,
            total: Number(expense.total ?? 0),
            modeOfPayment: expense.modeOfPayment ?? DEFAULT_PAYMENT_MODE,
            spentAtDate: parseExpenseCalendarDate(expense.spentAt) ?? new Date(),
        });
    }

    function cancelInlineEdit() {
        setEditingExpenseId(null);
        setEditRow(null);
    }

    async function saveInlineEdit(expense: Expense) {
        if (!editRow || !claims?.branch?.branchId || !claims?.userId) return;

        try {
            setIsSavingEdit(true);
            const nextActiveWeek = getWeekFilterFromDate(editRow.spentAtDate ?? new Date());
            await ExpenseService.updateExpense(expense.id, {
                total: Number(editRow.total),
                spentAt: toExpenseDateTimeString(editRow.spentAtDate ?? new Date(), expense.spentAt),
                modeOfPayment: editRow.modeOfPayment,
                orderCategory: expense.orderCategory,
                expenseCategoryId: expense.expenseCategoryId,
                branchId: claims.branch.branchId,
                addedById: claims.userId,
                purpose: expense.purpose?.trim(),
                isChecked: expense.isChecked ?? false,
            });
            toast.success("Expense updated successfully.");
            if (FILTERS.includes(nextActiveWeek)) {
                setFilter(nextActiveWeek);
            }
            cancelInlineEdit();
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setIsSavingEdit(false);
        }
    }

    async function handleExpenseCheckedChange(expenseId: number, checked: boolean) {
        const currentExpense = categoryFilteredExpenses.find((expense) => expense.id === expenseId);
        if (!currentExpense || !claims?.branch?.branchId || !claims?.userId) return;

        setWeeklyDetail((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                categories: prev.categories.map((category) => ({
                    ...category,
                    items: (category.items ?? []).map((item) => (
                        item.expenseId === expenseId
                            ? { ...item, isChecked: checked }
                            : item
                    )),
                })),
            };
        });

        try {
            await ExpenseService.updateExpense(expenseId, {
                total: Number(currentExpense.total),
                spentAt: currentExpense.spentAt,
                modeOfPayment: currentExpense.modeOfPayment,
                orderCategory: currentExpense.orderCategory,
                branchId: claims.branch.branchId,
                expenseCategoryId: currentExpense.expenseCategoryId,
                purpose: currentExpense.purpose?.trim(),
                addedById: claims.userId,
                isChecked: checked,
            });
        } catch (error) {
            setWeeklyDetail((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    categories: prev.categories.map((category) => ({
                        ...category,
                        items: (category.items ?? []).map((item) => (
                            item.expenseId === expenseId
                                ? { ...item, isChecked: !checked }
                                : item
                        )),
                    })),
                };
            });
            toast.error(`${error}`);
        }
    }

    function openCheckConfirmation(expense: Expense) {
        if (editingExpenseId === expense.id) return;

        setPendingCheckExpense(expense);
        setPendingCheckedValue(!(expense.isChecked ?? false));
    }

    async function confirmExpenseCheckedChange() {
        if (!pendingCheckExpense || pendingCheckedValue === null) return;

        await handleExpenseCheckedChange(pendingCheckExpense.id, pendingCheckedValue);
        setPendingCheckExpense(null);
        setPendingCheckedValue(null);
    }

    useEffect(() => {
        if (tab === "ALL") {
            setPurpose((prev) => (prev ? prev : (allCategoryOptions[0] ?? "")));
            return;
        }

        if (visiblePurposeTabs.length === 0) {
            setPurpose("");
            return;
        }

        setPurpose((prev) => {
            if (visiblePurposeTabs.includes(prev)) return prev;

            const saved = typeof window !== "undefined" ? sessionStorage.getItem(categoryStorageKey) ?? "" : "";
            if (saved && visiblePurposeTabs.includes(saved)) return saved;

            return "ALL";
        });
    }, [tab, visiblePurposeTabs, allCategoryOptions]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(tabStorageKey, tab);
    }, [tab, tabStorageKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!purpose) return;
        sessionStorage.setItem(categoryStorageKey, purpose);
    }, [purpose, categoryStorageKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(weekStorageKey, filter);
    }, [filter, weekStorageKey]);

    useEffect(() => {
        let mounted = true;
        const weekNo = Number((filter ?? "").replace(/[^\d]/g, ""));
        if (!selectedMonth || !Number.isInteger(weekNo) || weekNo < 1) return;

        async function loadWeeklyDetail() {
            try {
                setIsWeeklyLoading(true);
                const response = await ExpenseService.getWeeklyExpenses(selectedMonth, weekNo) as WeeklyExpenseResponse;
                if (!mounted) return;
                setWeeklyDetail(response);
            } catch {
                if (!mounted) return;
                setWeeklyDetail(null);
            } finally {
                if (mounted) setIsWeeklyLoading(false);
            }
        }

        loadWeeklyDetail();
        return () => {
            mounted = false;
        };
    }, [selectedMonth, filter]);

    useEffect(() => {
        let mounted = true;

        async function loadCategories() {
            try {
                const response = await ExpenseService.getExpenseCategories("ALL", true);
                if (!mounted) return;
                setCategories(response ?? []);
            } catch {
                // Keep UI functional using fallback tab labels from current rows.
            }
        }

        loadCategories();
        return () => {
            mounted = false;
        };
    }, []);

    const [openCreate, setOpenCreate] = useState(true)
    
    return (
        <div className="space-y-2">
            <div className="mb-2 flex items-start justify-between gap-3">
                <div className="animate-fade-in-up" key={`header-${selectedMonth}-${filter}-${tab}`}>
                    <div className="font-bold text-xl">
                        Detailed Expenditures for <span className="text-darkbrown">
                            {selectedMonthLabel}
                            {weeklyDetail?.weekCode ? ` - ${weeklyDetail.weekCode}` : ""}
                            {weeklyDetail?.weekRange ? ` (${weeklyDetail.weekRange})` : ""}
                        </span>
                    </div>
                    <div className="text-sm text-gray">
                        {weeklyDetail
                            ? `${weeklyDetail.startDate} to ${weeklyDetail.endDate} · Total ${formatToPeso(Number(weeklyDetail.total ?? 0))}`
                            : "Expense entries and weekly spending breakdown for the selected month."}
                    </div>
                </div>
                <AppTabSwitcher
                    className="mt-auto"
                    tabs={TABS}
                    selectedTab={tab}
                    setSelectedTab={setTab}
                />
            </div>

            {tab !== "ALL" && (
            <div className="flex mt-4 animate-fade-in-up" key={`purpose-tabs-${tab}-${filter}`}>
                {visiblePurposeTabs.map((item) => {
                    const isActive = purpose === item
                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setPurpose(item)}
                            className={`group relative w-40 pb-4 text-center text-sm font-medium transition-colors
                                ${isActive ? "text-darkbrown font-semibold" : "text-slate-500 hover:text-darkbrown"}
                            `}
                        >
                            <span className="block truncate">{item.replace('_', ' ')}</span>
                            <span
                                className={`absolute bottom-0 left-0 h-0.5 bg-darkbrown transition-all duration-300
                                    ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-orange-100"}
                                `}
                            />
                        </button>
                    )
                })}
            </div>
            )}
            
            {tab !== 'ALL' && (
                <Separator className="bg-slate-400 -mt-2" />
            )}
            
            <div className="flex-center-y gap-2 animate-fade-in-up" key={`filters-${selectedMonth}-${filter}-${tab}`}>
                <TableFilter
                    setSearch={setSearch}
                    search={search}
                    searchPlaceholder="Search for an expense"
                    setSize={setSize}
                    size={size}
                    filters={FILTERS}
                    filter={filter}
                    setFilter={setFilter}
                    removeAdd
                    className="w-full"
                />
                <Button
                    onClick={ () => setOpenCreate(prev => !prev) }
                    className={`${openCreate ? 'bg-gray!' : 'bg-darkgreen!'} text-light shadow-xs hover:opacity-90`}
                >
                    {openCreate ? <EyeClosed /> : <Eye />}
                    {openCreate ? 'Hide' : 'Show'} Create Expense
                </Button>
            </div>

            {openCreate && (
            <form
                className="animate-fade-in-up"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!isCreateDisabled) {
                        handleCreateExpense();
                    }
                }}
            >
                {createRows.map((row, index) => (
                    <div className="tdata grid grid-cols-6" key={row.id}>
                        <div className="td">
                            <div className="w-full flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">SPENT AT</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-start border-slate-300 bg-white font-normal">
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {format(row.spentAtDate ?? new Date(), "MMM dd, yyyy")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={row.spentAtDate}
                                            onSelect={(date) => date && updateCreateRow(row.id, { spentAtDate: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="td">
                            <div className="w-full flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">EXPENSE CATEGORY</span>
                                {tab === "ALL" ? (
                                    <AppSelect
                                        items={[]}
                                        groupedItems={allCategoryGroupedOptions}
                                        value={
                                            purpose
                                                ? `${normalizeOrderCategory(
                                                    categories.find((item) => item.name.trim().toUpperCase() === purpose.trim().toUpperCase() && item.active !== false)?.orderCategory
                                                ) || "MEAT"}::${purpose}`
                                                : ""
                                        }
                                        onChange={(value) => {
                                            const [, categoryName = ""] = value.split("::");
                                            setPurpose(categoryName);
                                        }}
                                        triggerClassName="border-slate-300 bg-white"
                                    />
                                ) : (
                                    <span className="text-gray">
                                        {purpose === "ALL" ? "Select a purpose tab above" : purpose}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="td">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">DESCRIPTION</span>
                                <AppInput
                                    inputClassName="border-slate-300"
                                    value={row.description}
                                    onChange={(e) => updateCreateRow(row.id, { description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="td">
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">PAYMENT METHOD</span>
                                <AppSelect
                                    items={PAYMENT_METHODS}
                                    value={row.modeOfPayment}
                                    onChange={(value) => updateCreateRow(row.id, { modeOfPayment: value })}
                                    triggerClassName="border-slate-300 bg-white"
                                />
                            </div>
                        </div>
                        <div className="td">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">EXPENDITURE</span>
                                <AppInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    labelCharacter="₱"
                                    inputClassName="border-slate-300"
                                    value={row.amount === 0 ? "" : row.amount}
                                    onChange={(e) => updateCreateRow(row.id, { amount: Number(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="td flex-center">
                            <Button
                                type="button"
                                disabled={createRows.length <= 1}
                                onClick={() => removeCreateRow(row.id)}
                                className="bg-darkred! disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
                <div className="flex gap-2 mt-2">
                    <Button type="button" onClick={addCreateRow} className="bg-darkbrown!">
                        <Plus /> Add Row
                    </Button>
                    <Button
                        type="submit"
                        disabled={isCreateDisabled}
                        className="bg-darkgreen! disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? "Creating..." : `Create ${createRows.length} Expense${createRows.length > 1 ? "s" : ""}`}
                    </Button>
                </div>
            </form>
            )}

            <section className="w-full">
                {isWeeklyLoading ? (
                    <SectionLoading />
                ) : (
                    <>
                {categorySummaryCards.length > 0 && (
                    <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5 animate-fade-in-up" key={`cards-${selectedMonth}-${filter}-${tab}`}>
                        {categorySummaryCards.map((item) => (
                            <div
                                key={`${item.expenseCategoryId}-${item.expenseCategoryName}-${item.orderCategory}`}
                                className={`rounded-md border border-slate-300 p-4 shadow-sm ${item.orderCategory === 'MEAT' ? 'bg-darkbrown/5' : 'bg-blue/5'}`}
                            >
                                <div className="flex-center-y justify-between">
                                    <div className="text-sm font-semibold text-darkbrown truncate">{item.expenseCategoryName}</div>
                                    {item.orderCategory === 'MEAT' ? (
                                        <Ham className="text-darkbrown w-4 h-4" />
                                    ) : (
                                        <Snowflake className="text-blue w-4 h-4" />
                                    )}
                                </div>
                                <div className="mt-3 text-xl font-bold text-slate-900">{formatToPeso(item.total)}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="table-wrapper animate-fade-in-up" key={`thead-${selectedMonth}-${filter}-${tab}`}>
                    <div className="thead grid grid-cols-7">
                        {columns.map((item, index) => (
                            <div key={index} className={`th ${item.style}`}>{item.title}</div>
                        ))}
                    </div>
                </div>

                <div className="animate-fade-in-up" key={`${selectedMonth}-${filter}-${tab}-${page}`}>
                    {paginatedExpenses.length > 0 ? (
                        paginatedExpenses.map((expense) => ( 
                            <div className={`tdata grid grid-cols-7 max-md:w-300! ${expense.isChecked ? 'bg-darkgreen/8!' : '' }`} key={expense.id}>
                                <div className="td col-span-2 gap-3">
                                    {getCategoryIcon(normalizeOrderCategory(expense.orderCategory))}
                                    <div className="truncate font-semibold">{expense.addedByName}</div>
                                </div>
                                <div className="td">
                                    <div className="min-w-0 w-full flex flex-col gap-1">
                                        <div className="truncate text-xs font-semibold text-darkbrown">{expense.expenseCategoryName ?? "LEGACY"}</div>
                                        <div className="truncate">{expense.purpose}</div>
                                    </div>
                                </div>
                                <div className="td">
                                    {editingExpenseId === expense.id && editRow ? (
                                        <div className="flex flex-col gap-1 w-full">
                                            <span className="text-xs tracking-wider font-semibold text-darkbrown">PAYMENT METHOD</span>
                                            <AppSelect
                                                items={PAYMENT_METHODS}
                                                value={editRow.modeOfPayment}
                                                onChange={(value) => setEditRow((prev) => prev ? { ...prev, modeOfPayment: value } : prev)}
                                                triggerClassName="border-slate-300 bg-white"
                                            />
                                        </div>
                                    ) : (
                                        capitalizeWords((expense.modeOfPayment ?? "").replace(/_/g, " "))
                                    )}
                                </div>
                                <div className="td">
                                    {editingExpenseId === expense.id && editRow ? (
                                        <div className="flex flex-col gap-1 w-full">
                                            <span className="text-xs tracking-wider font-semibold text-darkbrown">Spent At</span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button type="button" variant="outline" className="w-full justify-start border-slate-300 bg-white font-normal">
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                        {format(editRow.spentAtDate ?? new Date(), "MMM dd, yyyy")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={editRow.spentAtDate}
                                                        onSelect={(date) => date && setEditRow((prev) => prev ? { ...prev, spentAtDate: date } : prev)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ) : (
                                        formatDateTime(expense.spentAt).split(",")[0]
                                    )}
                                </div>
                                <div className="td justify-between">
                                    <div className={editingExpenseId === expense.id && editRow ? 'hidden' : ''}>₱</div>
                                    {editingExpenseId === expense.id && editRow ? (
                                        <div className="flex flex-col gap-1 w-full">
                                            <span className="text-xs tracking-wider font-semibold text-darkbrown">EXPENDITURE</span>
                                            <AppInput
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                labelCharacter="₱"
                                                inputClassName="border-slate-300"
                                                value={editRow.total === 0 ? "" : editRow.total}
                                                onChange={(e) => setEditRow((prev) => prev ? { ...prev, total: Number(e.target.value) || 0 } : prev)}
                                            />
                                        </div>
                                    ) : (
                                        <div>{formatToPeso(expense.total).slice(1)}</div>
                                    )}
                                </div>
                                <div className="td justify-center gap-2">
                                    {editingExpenseId === expense.id ? (
                                        <>
                                            <Button
                                                type="button"
                                                disabled={isUpdateDisabled}
                                                onClick={() => saveInlineEdit(expense)}
                                                className="bg-darkgreen!"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={cancelInlineEdit}
                                                className="bg-darkred!"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex-center-y gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openCheckConfirmation(expense)}
                                                aria-label={expense.isChecked ? "Uncheck expense" : "Check expense"}
                                            >
                                                <Checkbox
                                                    checked={expense.isChecked ?? false}
                                                    className="bg-white border-slate-400 pointer-events-none mt-1.5"
                                                />
                                            </button>
                                            <button onClick={() => startInlineEdit(expense)}><SquarePen className="h-4 w-4 text-darkgreen" /></button>
                                            <button onClick={() => setDelete(expense)}><Trash2 className="h-4 w-4 text-darkred" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="my-2 text-center text-sm">There are no expenses for this category yet.</div>
                    )}
                </div>
                <div className="mt-2 rounded-md flex-center-y justify-between p-3 bg-light border-slate-300 border animate-fade-in-up" key={`total-${selectedMonth}-${filter}-${tab}`}>
                    <div className="text-md text-gray font-semibold">{tab === "ALL" ? "Overall Expenses:" : "Category Total:"}</div>
                    <div className="text-darkbrown text-lg font-bold">{formatToPeso(selectedCategoryTotal)}</div>
                </div>
                    </>
                )}
            </section>

            {!isWeeklyLoading && categoryFilteredExpenses.length > 0 && (
                <TablePagination
                    data={categoryFilteredExpenses}
                    paginated={paginatedExpenses}
                    page={page}
                    size={size}
                    setPage={setPage}
                    search={search}
                    filter={`${tab}:${purpose}:${filter}`}
                    pageKey={pageKey}
                />
            )}

            <AlertDialog
                open={Boolean(pendingCheckExpense)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingCheckExpense(null);
                        setPendingCheckedValue(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingCheckedValue ? "Check expense?" : "Uncheck expense?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingCheckedValue
                            ? `This will mark ${pendingCheckExpense?.expenseCategoryName ?? "this expense"}${
                                pendingCheckExpense?.purpose
                                    ? ` for ${pendingCheckExpense.purpose}`
                                    : ""
                                } as checked.`
                            : `This will mark ${pendingCheckExpense?.expenseCategoryName ?? "this expense"}${
                                pendingCheckExpense?.purpose
                                    ? ` for ${pendingCheckExpense.purpose}`
                                    : ""
                                } as unchecked.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-darkgreen! hover:opacity-90"
                            onClick={confirmExpenseCheckedChange}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
type CreateExpenseRow = {
    id: string;
    description: string;
    amount: number;
    modeOfPayment: string;
    spentAtDate: Date;
};

type InlineEditRow = {
    id: number;
    total: number;
    modeOfPayment: string;
    spentAtDate: Date;
};
