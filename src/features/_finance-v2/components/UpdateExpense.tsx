import { Button, UpdateButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { parseExpenseCalendarDate, toExpenseDateTimeString } from "@/lib/expense-date";
import { cn } from "@/lib/utils";
import { ExpenseService } from "@/services/expense.service";
import { Expense, ExpenseCategory, expenseFields } from "@/types/expense";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const paymentModes = [
    { label: "Cash", value: "CASH" },
    { label: "BDO", value: "BDO" },
    { label: "EastWest", value: "EASTWEST" },
    { label: "GCash", value: "GCASH" },
    { label: "BPI", value: "BPI" },
    { label: "GoTyme", value: "GO_TYME" },
    { label: "Union Bank", value: "UNION_BANK" },
    { label: "Internal", value: "INTERNAL" },
    { label: "Bank Transfer (Legacy)", value: "BANK_TRANSFER" },
    { label: "Online Payment (Legacy)", value: "ONLINE_PAYMENT" },
    { label: "Credit Card (Legacy)", value: "CREDIT_CARD" },
    { label: "Debit Card (Legacy)", value: "DEBIT_CARD" },
];

const orderCategoryOptions = [
    { label: "Meat", value: "MEAT" },
    { label: "Snowfrost", value: "SNOWFROST" },
];

interface Props {
    toUpdate: Expense;
    setUpdate: React.Dispatch<React.SetStateAction<Expense | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

function normalizeOrderCategory(value?: string) {
    const normalized = (value ?? "").trim().toUpperCase();
    if (normalized === "SNOW") return "SNOWFROST";
    return normalized;
}

export function UpdateExpense({ toUpdate, setUpdate, setReload }: Props) {
    const { claims } = useAuth();
    const initialOrderCategory = normalizeOrderCategory(toUpdate.orderCategory) || "MEAT";
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);
    const [expense, setExpense] = useState<Partial<Expense>>({
        total: toUpdate.total,
        spentAt: toUpdate.spentAt,
        modeOfPayment: toUpdate.modeOfPayment,
        orderCategory: initialOrderCategory,
        expenseCategoryId: toUpdate.expenseCategoryId,
        purpose: toUpdate.purpose,
        isChecked: toUpdate.isChecked ?? false,
    });
    const [totalInput, setTotalInput] = useState(String(toUpdate.total ?? ""));
    const [spentAtDate, setSpentAtDate] = useState<Date | undefined>(() =>
        parseExpenseCalendarDate(toUpdate.spentAt)
    );
    const [dateOpen, setDateOpen] = useState(false);
    const filteredCategories = useMemo(
        () => categories.filter((item) => normalizeOrderCategory(item.orderCategory) === normalizeOrderCategory(expense.orderCategory) && item.active !== false),
        [categories, expense.orderCategory]
    );

    useEffect(() => {
        let mounted = true;

        async function loadCategories() {
            try {
                setCategoriesLoading(true);
                const response = await ExpenseService.getExpenseCategories("ALL", true);
                if (!mounted) return;

                const sorted = [...(response ?? [])].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
                setCategories(sorted);
            } catch (error: any) {
                const message = error?.message || error?.error || "Failed to load expense categories";
                toast.error(message);
            } finally {
                if (mounted) setCategoriesLoading(false);
            }
        }

        loadCategories();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (categories.length === 0) return;

        setExpense((prev) => {
            const resolvedOrderCategory = normalizeOrderCategory(prev.orderCategory) || "MEAT";
            const resolvedFromId = prev.expenseCategoryId
                ? categories.find((item) => item.id === prev.expenseCategoryId)
                : undefined;

            if (resolvedFromId) {
                const categoryOrder = normalizeOrderCategory(resolvedFromId.orderCategory) || resolvedOrderCategory;
                if (categoryOrder === prev.orderCategory && prev.expenseCategoryId === resolvedFromId.id) return prev;
                return {
                    ...prev,
                    orderCategory: categoryOrder,
                    expenseCategoryId: resolvedFromId.id,
                };
            }

            const legacyCategoryName = toUpdate.expenseCategoryName?.trim() || toUpdate.purpose?.trim();
            const fromLegacyCategory = legacyCategoryName
                ? categories.find((item) => (
                    normalizeOrderCategory(item.orderCategory) === resolvedOrderCategory
                    && item.name.trim().toUpperCase() === legacyCategoryName.toUpperCase()
                ))
                : undefined;
            const fallback = fromLegacyCategory ?? categories.find((item) => normalizeOrderCategory(item.orderCategory) === resolvedOrderCategory);

            if (!fallback) return prev;
            if (prev.expenseCategoryId === fallback.id && prev.orderCategory === resolvedOrderCategory) return prev;

            return {
                ...prev,
                orderCategory: resolvedOrderCategory,
                expenseCategoryId: fallback.id,
            };
        });
    }, [categories, toUpdate.expenseCategoryName, toUpdate.purpose]);

    function handleTotalChange(value: string) {
        const sanitizedValue = sanitizeDecimalInput(value);

        setTotalInput(sanitizedValue);
        setExpense((prev) => ({
            ...prev,
            total: parseOptionalDecimal(sanitizedValue),
        }));
    }

    function handleSpentAtChange(date?: Date) {
        if (!date) return;

        setSpentAtDate(date);
        setExpense((prev) => ({
            ...prev,
            spentAt: toExpenseDateTimeString(date, prev.spentAt ?? toUpdate.spentAt),
        }));
        setDateOpen(false);
    }

    function handleCategoryChange(id: string) {
        const parsedId = Number(id);
        const selected = categories.find((item) => item.id === parsedId);

        setExpense((prev) => ({
            ...prev,
            expenseCategoryId: parsedId,
            orderCategory: normalizeOrderCategory(selected?.orderCategory) || prev.orderCategory || "MEAT",
        }));
    }

    async function handleSubmit() {
        try {
            setProcess(true);

            let invalid = !expense.spentAt || !expense.expenseCategoryId;
            for (const field of expenseFields) {
                const value = expense[field];

                if (
                    value === undefined ||
                    value === null ||
                    (typeof value === "string" && value.trim() === "") ||
                    (field === "total" && Number(value) <= 0)
                ) {
                    invalid = true;
                }
            }

            if (invalid) {
                toast.info("Please fill up all fields!");
                return;
            }

            const selectedCategory = categories.find((item) => item.id === expense.expenseCategoryId);
            const data = await ExpenseService.updateExpense(toUpdate.id, {
                total: Number(expense.total),
                spentAt: expense.spentAt,
                modeOfPayment: expense.modeOfPayment,
                orderCategory: normalizeOrderCategory(selectedCategory?.orderCategory ?? expense.orderCategory),
                expenseCategoryId: expense.expenseCategoryId,
                branchId: claims.branch.branchId,
                addedById: claims.userId,
                purpose: expense.purpose?.trim(),
                isChecked: expense.isChecked ?? false,
            });

            if (data) {
                toast.success(`Expenditure for ${expense.purpose} updated successfully.`);
                setReload((prev) => !prev);
                setUpdate(undefined);
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setUpdate(undefined) }}>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Update Expenditure</div>
                </DialogTitle>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>Expense</div>
                            <div className="relative border border-gray rounded-md">
                                <div className="absolute top-1/2 -translate-y-1/2 mx-2">₱</div>
                                <Input
                                    className="pl-8 border-0"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.]?[0-9]{0,2}"
                                    name="total"
                                    value={totalInput}
                                    onChange={(e) => handleTotalChange(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div>Expense Date</div>
                            <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "justify-start border border-gray text-left font-normal",
                                            !spentAtDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {spentAtDate ? format(spentAtDate, "PPP") : <span>Select expense date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={spentAtDate}
                                        onSelect={handleSpentAtChange}
                                        captionLayout="dropdown"
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <div>Mode of Payment</div>
                            <Select
                                value={expense.modeOfPayment ?? ""}
                                onValueChange={(value) => setExpense((prev) => ({
                                    ...prev,
                                    modeOfPayment: value,
                                }))}
                            >
                                <SelectTrigger className="w-full border border-gray">
                                    <SelectValue placeholder="Select Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Payment Methods</SelectLabel>
                                        {paymentModes.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <div>Order Category</div>
                            <Select
                                value={normalizeOrderCategory(expense.orderCategory) || "MEAT"}
                                onValueChange={(value) => {
                                    const normalized = normalizeOrderCategory(value) || "MEAT";
                                    const fallbackCategory = categories.find((item) => normalizeOrderCategory(item.orderCategory) === normalized);

                                    setExpense((prev) => ({
                                        ...prev,
                                        orderCategory: normalized,
                                        expenseCategoryId: fallbackCategory?.id,
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full border border-gray">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        {orderCategoryOptions.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <div>Expense Category</div>
                            <Select
                                value={expense.expenseCategoryId ? String(expense.expenseCategoryId) : ""}
                                onValueChange={handleCategoryChange}
                                disabled={categoriesLoading || filteredCategories.length === 0}
                            >
                                <SelectTrigger className="w-full border border-gray">
                                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select Expense Category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Expense Categories</SelectLabel>
                                        {filteredCategories.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <div>Expenditure Purpose</div>
                            <Textarea
                                className="border border-gray"
                                value={expense.purpose ?? ""}
                                onChange={(e) =>
                                    setExpense((prev) => ({
                                        ...prev,
                                        purpose: e.target.value,
                                    }))
                                }
                                placeholder="Enter the actual purpose/detail (e.g., Supplier Payment)"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton
                            type="submit"
                            onProcess={onProcess}
                            label="Update Expenditure"
                            loadingLabel="Updating Expenditure"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
