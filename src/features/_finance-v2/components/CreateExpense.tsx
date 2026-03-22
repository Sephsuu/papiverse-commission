import { AddButton, Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { parseExpenseCalendarDate, toExpenseDateTimeString } from "@/lib/expense-date";
import { handleChange } from "@/lib/form-handle";
import { cn } from "@/lib/utils";
import { ExpenseService } from "@/services/expense.service";
import { Expense, expenseFields, expenseInit } from "@/types/expense";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

const paymentModes = [
    { label: "Cash", value: "CASH" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Online Payment", value: "ONLINE_PAYMENT" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Debit Card", value: "DEBIT_CARD" },
];

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}

export function CreateExpense({ setOpen, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [expense, setExpense] = useState<Partial<Expense>>(() => {
        const spentAt = toExpenseDateTimeString(new Date());

        return {
            ...expenseInit,
            spentAt,
        };
    });
    const [totalInput, setTotalInput] = useState(
        expenseInit.total ? String(expenseInit.total) : ""
    );
    const [spentAtDate, setSpentAtDate] = useState<Date | undefined>(() =>
        parseExpenseCalendarDate(toExpenseDateTimeString(new Date()))
    );
    const [dateOpen, setDateOpen] = useState(false);

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
            spentAt: toExpenseDateTimeString(date, prev.spentAt),
        }));
        setDateOpen(false);
    }

    async function handleSubmit() {
        try {
            setProcess(true);
            let invalid = !expense.spentAt;
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
                setProcess(false);
                return
            }
            
            const data = await ExpenseService.createExpense(expense);
            if (data) {
                toast.success(`Expenditure for ${expense.purpose} added successfully.`);
                setReload(prev => !prev);
                setOpen(false);
                const nextSpentAt = toExpenseDateTimeString(new Date());
                setExpense({
                    ...expenseInit,
                    spentAt: nextSpentAt,
                });
                setSpentAtDate(parseExpenseCalendarDate(nextSpentAt));
                setTotalInput("");
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }
    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Add an Expenditure</div>      
                </DialogTitle>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <div>Expense</div>
                        <div className="flex border border-gray rounded-md">
                            <input
                                disabled
                                placeholder="₱"
                                className="border-0 w-10 placeholder:text-dark placeholder:text-center"
                            />
                            <Input 
                                className="border-0"
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*[.]?[0-9]{0,2}"
                                name="total"
                                value={ totalInput }
                                onChange={ (e) => handleTotalChange(e.target.value) }
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
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Mode of Payment</div>
                        <Select
                            value={ expense.modeOfPayment ?? expenseInit.modeOfPayment }
                            onValueChange={ (value) => setExpense(prev => ({
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
                                    {paymentModes.map((item, index) => (
                                        <SelectItem key={ index } value={ item.value }>{ item.label }</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Expenditure Purpose</div>
                        <Textarea 
                            className="border border-gray"
                            name="purpose"
                            value={ expense.purpose ?? "" }
                            onChange={ e => handleChange(e, setExpense) }
                        />
                    </div>
                </div>
                <form 
                    className="flex justify-end gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Add Expenditure"
                        loadingLabel="Adding Expenditure"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
