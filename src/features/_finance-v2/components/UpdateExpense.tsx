import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { ExpenseService } from "@/services/expense.service";
import { Expense } from "@/types/expense";
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

function toDateTimeLocalValue(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function UpdateExpense({ toUpdate, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [expense, setExpense] = useState<Partial<Expense>>({
        total: toUpdate.total,
        spentAt: toDateTimeLocalValue(toUpdate.spentAt),
        modeOfPayment: toUpdate.modeOfPayment,
        purpose: toUpdate.purpose,
    });
    const [totalInput, setTotalInput] = useState(String(toUpdate.total ?? ""));

    function handleTotalChange(value: string) {
        const sanitizedValue = sanitizeDecimalInput(value);

        setTotalInput(sanitizedValue);
        setExpense((prev) => ({
            ...prev,
            total: parseOptionalDecimal(sanitizedValue),
        }));
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
                            <div>Spent At</div>
                            <Input
                                type="datetime-local"
                                value={expense.spentAt ?? ""}
                                onChange={(e) => setExpense((prev) => ({
                                    ...prev,
                                    spentAt: e.target.value,
                                }))}
                            />
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
