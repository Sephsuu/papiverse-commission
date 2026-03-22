import { Button, UpdateButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { parseExpenseCalendarDate, toExpenseDateTimeString } from "@/lib/expense-date";
import { cn } from "@/lib/utils";
import { ExpenseService } from "@/services/expense.service";
import { Expense } from "@/types/expense";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

const paymentModes = [
    { label: "Cash", value: "CASH" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Online Payment", value: "ONLINE_PAYMENT" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Debit Card", value: "DEBIT_CARD" },
];

interface Props {
    toUpdate: Expense;
    setUpdate: React.Dispatch<React.SetStateAction<Expense | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateExpense({ toUpdate, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [expense, setExpense] = useState<Partial<Expense>>({
        total: toUpdate.total,
        spentAt: toUpdate.spentAt,
        modeOfPayment: toUpdate.modeOfPayment,
        purpose: toUpdate.purpose,
    });
    const [totalInput, setTotalInput] = useState(String(toUpdate.total ?? ""));
    const [spentAtDate, setSpentAtDate] = useState<Date | undefined>(() =>
        parseExpenseCalendarDate(toUpdate.spentAt)
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
            spentAt: toExpenseDateTimeString(date, prev.spentAt ?? toUpdate.spentAt),
        }));
        setDateOpen(false);
    }

    async function handleSubmit() {
        try {
            setProcess(true);

            if (
                !expense.spentAt ||
                !expense.modeOfPayment ||
                !expense.purpose?.trim() ||
                expense.total === undefined ||
                Number(expense.total) <= 0
            ) {
                toast.info("Please fill up all fields!");
                return;
            }

            const data = await ExpenseService.updateExpense(toUpdate.id, {
                total: Number(expense.total),
                spentAt: expense.spentAt,
                modeOfPayment: expense.modeOfPayment,
                purpose: expense.purpose.trim(),
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
                            <div>Total</div>
                            <div className="flex rounded-md border border-gray">
                                <input
                                    disabled
                                    value="₱"
                                    className="w-10 border-0 text-center"
                                />
                                <Input
                                    className="border-0"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.]?[0-9]{0,2}"
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
                                        {paymentModes.map((item, index) => (
                                            <SelectItem key={index} value={item.value}>
                                                {item.label}
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
                                onChange={(e) => setExpense((prev) => ({
                                    ...prev,
                                    purpose: e.target.value,
                                }))}
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
