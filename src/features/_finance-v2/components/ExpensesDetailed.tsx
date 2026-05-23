'use client'

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { capitalizeWords, formatDateTime, formatToPeso } from "@/lib/formatter";
import { getCategoryIcon } from "@/hooks/use-helper";
import { Expense } from "@/types/expense";
import { Check, Eye, EyeClosed, Plus, SquarePen, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppInput } from "@/components/shared/AppInput";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseCategory } from "@/types/expense";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { endOfMonth } from "date-fns";
import { toExpenseDateTimeString } from "@/lib/expense-date";
import { useCrudState } from "@/hooks/use-crud-state";
import { AppSelect } from "@/components/shared/AppSelect";

const TABS = ['MEAT', 'SNOWFROST']
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

function getWeekLabelFromSpentAt(spentAt?: string) {
    if (!spentAt) return "N/A";
    const date = new Date(spentAt);
    if (Number.isNaN(date.getTime())) return "N/A";
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
    setReload: Dispatch<SetStateAction<boolean>>;
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
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    const [editRow, setEditRow] = useState<InlineEditRow | null>(null);
    const [createRows, setCreateRows] = useState<CreateExpenseRow[]>([
        { id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE },
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
    const visiblePurposeTabs = (expenseCategoryOptions[tab]?.length ? expenseCategoryOptions[tab] : purposeOptions[tab]) ?? [];
    const selectedCategory = useMemo(
        () => categories.find((item) => (
            normalizeOrderCategory(item.orderCategory) === tab
            && item.name.trim().toUpperCase() === purpose.trim().toUpperCase()
            && item.active !== false
        )),
        [categories, purpose, tab]
    );
    const selectedCategoryId = selectedCategory?.id
        ?? expensesData.find((item) => (
            normalizeOrderCategory(item.orderCategory) === tab
            && item.expenseCategoryName?.trim().toUpperCase() === purpose.trim().toUpperCase()
        ))?.expenseCategoryId;
    const categoryFilteredExpenses = useMemo(() => {
        const base = filteredExpenses
            .filter((item) => normalizeOrderCategory(item.orderCategory) === tab)
            .filter((item) => (purpose ? item.expenseCategoryName?.trim().toUpperCase() === purpose.trim().toUpperCase() : true));

        if (filter === "WEEK 1") return base.filter((item) => getWeekLabelFromSpentAt(item.spentAt) === "WEEK 1");
        if (filter === "WEEK 2") return base.filter((item) => getWeekLabelFromSpentAt(item.spentAt) === "WEEK 2");
        if (filter === "WEEK 3") return base.filter((item) => getWeekLabelFromSpentAt(item.spentAt) === "WEEK 3");
        if (filter === "WEEK 4") return base.filter((item) => getWeekLabelFromSpentAt(item.spentAt) === "WEEK 4");
        return base;
    }, [filteredExpenses, purpose, tab, filter]);
    const paginatedExpenses = useMemo(() => {
        const start = page * size;
        const end = start + size;
        return categoryFilteredExpenses.slice(start, end);
    }, [categoryFilteredExpenses, page, size]);
    const selectedCategoryTotal = useMemo(
        () => categoryFilteredExpenses.reduce((acc, item) => acc + Number(item.total ?? 0), 0),
        [categoryFilteredExpenses]
    );
    const hasInvalidRow = createRows.some((row) => row.amount <= 0 || row.description.trim() === "" || !row.modeOfPayment);
    const isCreateDisabled = !selectedCategoryId || isCreating || createRows.length === 0 || hasInvalidRow;
    const isUpdateDisabled = !editRow || editRow.total <= 0 || !editRow.modeOfPayment || isSavingEdit;

    function getWeekDate(selectedMonthValue: string, weekFilter: string) {
        const monthStart = new Date(`${selectedMonthValue}-01T00:00:00`);
        if (Number.isNaN(monthStart.getTime())) return new Date();

        const startDay = weekFilter === "WEEK 1"
            ? 1
            : weekFilter === "WEEK 2"
                ? 8
                : weekFilter === "WEEK 3"
                    ? 16
                    : 23;
        const endDay = weekFilter === "WEEK 1"
            ? 7
            : weekFilter === "WEEK 2"
                ? 15
                : weekFilter === "WEEK 3"
                    ? 22
                    : endOfMonth(monthStart).getDate();

        const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), startDay);
        const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), endDay);
        const today = new Date();

        if (today >= startDate && today <= endDate) return today;
        if (today > endDate) return endDate;
        return startDate;
    }

    function addCreateRow() {
        setCreateRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE },
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

            const spentAtDate = getWeekDate(selectedMonth, filter);
            const payload: Partial<Expense>[] = createRows.map((row) => ({
                branchId: claims.branch.branchId,
                total: Number(row.amount),
                spentAt: toExpenseDateTimeString(spentAtDate),
                expenseCategoryId: selectedCategoryId,
                orderCategory: tab,
                modeOfPayment: row.modeOfPayment,
                purpose: row.description.trim(),
            }));

            await ExpenseService.createExpense(payload, claims.userId);
            toast.success(`${payload.length} expense${payload.length > 1 ? "s" : ""} created under ${purpose}.`);
            setCreateRows([{ id: crypto.randomUUID(), description: "", amount: 0, modeOfPayment: DEFAULT_PAYMENT_MODE }]);
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
            await ExpenseService.updateExpense(expense.id, {
                total: Number(editRow.total),
                spentAt: expense.spentAt,
                modeOfPayment: editRow.modeOfPayment,
                orderCategory: expense.orderCategory,
                expenseCategoryId: expense.expenseCategoryId,
                branchId: claims.branch.branchId,
                addedById: claims.userId,
                purpose: expense.purpose?.trim(),
            });
            toast.success("Expense updated successfully.");
            cancelInlineEdit();
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setIsSavingEdit(false);
        }
    }

    useEffect(() => {
        if (visiblePurposeTabs.length === 0) {
            setPurpose("");
            return;
        }

        setPurpose((prev) => {
            if (visiblePurposeTabs.includes(prev)) return prev;

            const saved = typeof window !== "undefined" ? sessionStorage.getItem(categoryStorageKey) ?? "" : "";
            if (saved && visiblePurposeTabs.includes(saved)) return saved;

            return visiblePurposeTabs[0];
        });
    }, [tab, visiblePurposeTabs]);

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
            <AppTabSwitcher 
                tabs={TABS}
                selectedTab={tab}
                setSelectedTab={setTab}
            />

            <div className="flex mt-4">
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
            <Separator className="bg-slate-400 -mt-2" />
            
            <div className="flex-center-y gap-2">
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
                className="space-y-2"
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
                            <div className="flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">WEEK NO.</span>
                                <span className="text-gray">{filter}</span>
                            </div>
                        </div>
                        <div className="td">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs tracking-wider font-semibold text-darkbrown">EXPENSE CATEGORY</span>
                                <span className="text-gray">{purpose}</span>
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
                <div className="flex gap-2">
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
                <div className="table-wrapper">
                    <div className="thead grid grid-cols-7">
                        {columns.map((item, index) => (
                            <div key={index} className={`th ${item.style}`}>{item.title}</div>
                        ))}
                    </div>
                </div>

                <div className="animate-fade-in-up" key={`${page}`}>
                    {paginatedExpenses.length > 0 ? (
                        paginatedExpenses.map((expense) => (
                            <div className="tdata grid grid-cols-7 max-md:w-300!" key={expense.id}>
                                <div className="td col-span-2 gap-3">
                                    {getCategoryIcon(normalizeOrderCategory(expense.orderCategory))}
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold">{expense.addedByName}</div>
                                        <div className="truncate text-xs text-gray">@{expense.addedByUsername}</div>
                                    </div>
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
                                <div className="td">{getWeekLabelFromSpentAt(expense.spentAt)}</div>
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
                                        <>
                                            <button onClick={() => startInlineEdit(expense)}><SquarePen className="h-4 w-4 text-darkgreen" /></button>
                                            <button onClick={() => setDelete(expense)}><Trash2 className="h-4 w-4 text-darkred" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="my-2 text-center text-sm">There are no expenses for this category yet.</div>
                    )}
                </div>
                <div className="mt-2 rounded-md flex-center-y justify-between p-3 bg-light border-slate-300 border">
                    <div className="text-md text-gray font-semibold">Category Total:</div>
                    <div className="text-darkbrown text-lg font-bold">{formatToPeso(selectedCategoryTotal)}</div>
                </div>
            </section>

            {categoryFilteredExpenses.length > 0 && (
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
        </div>
    );
}
type CreateExpenseRow = {
    id: string;
    description: string;
    amount: number;
    modeOfPayment: string;
};

type InlineEditRow = {
    id: number;
    total: number;
    modeOfPayment: string;
};
