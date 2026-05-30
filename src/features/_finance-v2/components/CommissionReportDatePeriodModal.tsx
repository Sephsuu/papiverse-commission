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

export function CommissionReportDatePeriodModal({
    date,
    setDate,
    setEndDate,
    open,
    setOpen,
}: {
    date: string;
    setDate: (value: string) => void;
    setEndDate: (value: string) => void;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const toYMD = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : "");
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
        if (!selectedRange) return;
        setDate(toYMD(selectedRange.start));
        setEndDate(toYMD(selectedRange.end));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>
                    <AppHeader label="Select period" />
                </DialogTitle>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 rounded-md border bg-white p-3">
                        <div className="text-sm">
                            <div className="font-semibold">Selected period</div>
                            <div className="text-slate-600">{rangeLabel}</div>
                        </div>
                        <Button
                            type="button"
                            className="bg-darkgreen! hover:opacity-90"
                            disabled={!selectedRange}
                            onClick={handleApply}
                        >
                            Apply
                        </Button>
                    </div>

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
                                const active = periodAnchor ? isSameMonth(periodAnchor, monthDate) : false;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setPeriodAnchor(monthDate)}
                                        className={`rounded-md border px-3 py-4 text-sm font-semibold transition ${
                                            active ? "border-darkbrown bg-darkbrown text-white" : "bg-white text-slate-700"
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
