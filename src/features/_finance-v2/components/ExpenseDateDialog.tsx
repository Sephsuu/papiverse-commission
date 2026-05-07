"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    addYears,
    endOfMonth,
    format,
    isAfter,
    isSameMonth,
    startOfMonth,
} from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

type ExpenseDateDialogProps = {
    date: string;
    selectedMonth: string;
    open: boolean;
    setDate: (value: string) => void;
    setSelectedMonth: (value: string) => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export function ExpenseDateDialog({
    date,
    selectedMonth,
    open,
    setDate,
    setSelectedMonth,
    setOpen,
}: ExpenseDateDialogProps) {
    const today = useMemo(() => new Date(), []);
    const selectedDate = useMemo(() => (date ? new Date(date) : undefined), [date]);
    const baseDate = selectedDate ?? today;
    const [periodAnchor, setPeriodAnchor] = useState<Date | undefined>(selectedDate);
    const [monthYearCursor, setMonthYearCursor] = useState(new Date(baseDate.getFullYear(), 0, 1));

    useEffect(() => {
        if (!open) return;

        const nextBaseDate = selectedDate ?? today;
        setPeriodAnchor(selectedDate);
        setMonthYearCursor(new Date(nextBaseDate.getFullYear(), 0, 1));
    }, [open, selectedDate, today]);

    const selectedRange = useMemo(() => {
        if (!periodAnchor) return null;

        const start = startOfMonth(periodAnchor);
        const rawEnd = endOfMonth(periodAnchor);
        return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
    }, [periodAnchor, today]);

    const rangeLabel = useMemo(() => {
        if (!selectedRange) return "Select a period";

        return format(selectedRange.start, "MMMM yyyy");
    }, [selectedRange]);

    const handleApply = () => {
        if (!periodAnchor) return;

        setDate(format(periodAnchor, "yyyy-MM-dd"));
        setSelectedMonth(format(periodAnchor, "yyyy-MM"));
        setOpen(false);
    };

    const handleMonthPick = (monthIndex: number) => {
        const nextMonth = new Date(monthYearCursor.getFullYear(), monthIndex, 1);
        if (isAfter(startOfMonth(nextMonth), today)) return;

        setPeriodAnchor(nextMonth);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto">
                <DialogTitle className="space-y-4">
                    <AppHeader label="Expense Date Filter" />

                    <div className="rounded-2xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-700">
                        Monthly filter only ({selectedMonth})
                    </div>
                </DialogTitle>

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Selected period</div>
                            <div className="text-sm text-slate-600">{rangeLabel}</div>
                        </div>

                        <Button
                            type="button"
                            className="bg-darkgreen! hover:opacity-90"
                            disabled={!selectedRange}
                            onClick={handleApply}
                        >
                            Apply filter
                        </Button>
                    </div>

                    <div className="space-y-4">
                       
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, -1))}
                            >
                                Prev year
                            </button>
                            <div className="text-lg font-semibold text-slate-900">
                                {format(monthYearCursor, "yyyy")}
                            </div>
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                                onClick={() => setMonthYearCursor(addYears(monthYearCursor, 1))}
                                disabled={monthYearCursor.getFullYear() >= today.getFullYear()}
                            >
                                Next year
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 12 }, (_, index) => {
                                const monthDate = new Date(monthYearCursor.getFullYear(), index, 1);
                                const disabled = isAfter(startOfMonth(monthDate), today);
                                const active = periodAnchor ? isSameMonth(periodAnchor, monthDate) : false;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleMonthPick(index)}
                                        className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
                                            active
                                                ? "border-darkbrown bg-light text-darkbrown shadow-sm"
                                                : "border-slate-200 bg-white text-slate-700"
                                        } ${disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"}`}
                                    >
                                        {format(monthDate, "MMMM")}
                                    </button>
                                );
                            })}
                        </div>
                        
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
