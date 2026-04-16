"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { addYears, format, isAfter, isSameMonth, startOfMonth } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

const monthOptions = [
    { label: "January", value: "january" },
    { label: "February", value: "february" },
    { label: "March", value: "march" },
    { label: "April", value: "april" },
    { label: "May", value: "may" },
    { label: "June", value: "june" },
    { label: "July", value: "july" },
    { label: "August", value: "august" },
    { label: "September", value: "september" },
    { label: "October", value: "october" },
    { label: "November", value: "november" },
    { label: "December", value: "december" },
];

type LogsMonthPickerModalProps = {
    open: boolean;
    selectedMonth: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setSelectedMonth: (value: string) => void;
};

export function LogsMonthPickerModal({
    open,
    selectedMonth,
    setOpen,
    setSelectedMonth,
}: LogsMonthPickerModalProps) {
    const today = useMemo(() => new Date(), []);
    const selectedDate = useMemo(() => {
        const [year, monthName] = selectedMonth.split("-");
        const monthIndex = monthOptions.findIndex((month) => month.value === monthName);
        if (!year || monthIndex < 0) return today;

        return new Date(Number(year), monthIndex, 1);
    }, [selectedMonth, today]);
    const [monthYearCursor, setMonthYearCursor] = useState(
        new Date(selectedDate.getFullYear(), 0, 1)
    );

    useEffect(() => {
        if (!open) return;
        setMonthYearCursor(new Date(selectedDate.getFullYear(), 0, 1));
    }, [open, selectedDate]);

    const handleMonthPick = (monthIndex: number) => {
        const monthDate = new Date(monthYearCursor.getFullYear(), monthIndex, 1);
        if (isAfter(startOfMonth(monthDate), today)) return;

        setSelectedMonth(`${monthYearCursor.getFullYear()}-${monthOptions[monthIndex].value}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-w-xl overflow-y-auto">
                <DialogTitle className="space-y-4">
                    <AppHeader label="Select month" />
                 
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, -1))}
                            >
                                Prev year
                            </button>
                            <div className="text-lg font-semibold text-slate-900">
                                {format(monthYearCursor, "yyyy")}
                            </div>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, 1))}
                                disabled={monthYearCursor.getFullYear() >= today.getFullYear()}
                            >
                                Next year
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }, (_, index) => {
                                const monthDate = new Date(monthYearCursor.getFullYear(), index, 1);
                                const disabled = isAfter(startOfMonth(monthDate), today);
                                const active = isSameMonth(selectedDate, monthDate);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleMonthPick(index)}
                                        className={`rounded-md border px-3 py-4 text-sm font-semibold transition ${
                                            active
                                                ? "border-darkbrown bg-light text-darkbrown"
                                                : "bg-white text-slate-700"
                                        } ${disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"}`}
                                    >
                                        {format(monthDate, "MMMM")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogTitle>
            </DialogContent>
        </Dialog>
    );
}
