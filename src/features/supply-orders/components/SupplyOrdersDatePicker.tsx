"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    addYears,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isSameMonth,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export type SupplyOrdersPeriodMode = "DAY" | "WEEK" | "MONTH";

export function SupplyOrdersDatePicker({
    date,
    mode,
    open,
    setDate,
    setEndDate,
    setMode,
    setOpen,
}: {
    date: string;
    mode: SupplyOrdersPeriodMode;
    open: boolean;
    setDate: (value: string) => void;
    setEndDate: (value: string) => void;
    setMode: (value: SupplyOrdersPeriodMode) => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const toYMD = (value: Date) => format(value, "yyyy-MM-dd");
    const today = useMemo(() => new Date(), []);
    const selectedDate = useMemo(() => (date ? new Date(date) : undefined), [date]);
    const baseDate = selectedDate ?? today;
    const [periodMode, setPeriodMode] = useState<SupplyOrdersPeriodMode>(mode);
    const [periodAnchor, setPeriodAnchor] = useState<Date | undefined>(selectedDate);
    const [monthYearCursor, setMonthYearCursor] = useState(new Date(baseDate.getFullYear(), 0, 1));

    useEffect(() => {
        if (!open) return;

        const nextBaseDate = selectedDate ?? today;
        setPeriodMode(mode);
        setPeriodAnchor(selectedDate);
        setMonthYearCursor(new Date(nextBaseDate.getFullYear(), 0, 1));
    }, [mode, open, selectedDate, today]);

    const selectedRange = useMemo(() => {
        if (!periodAnchor) return null;

        if (periodMode === "DAY") {
            return { start: periodAnchor, end: periodAnchor };
        }

        if (periodMode === "WEEK") {
            const start = startOfWeek(periodAnchor, { weekStartsOn: 0 });
            const rawEnd = endOfWeek(periodAnchor, { weekStartsOn: 0 });
            return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
        }

        const start = startOfMonth(periodAnchor);
        const rawEnd = endOfMonth(periodAnchor);
        return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
    }, [periodAnchor, periodMode, today]);

    const rangeLabel = useMemo(() => {
        if (!selectedRange) return "Select a period";

        if (periodMode === "DAY") return format(selectedRange.start, "MMMM dd, yyyy");
        if (periodMode === "WEEK") return `${format(selectedRange.start, "MMM dd")} - ${format(selectedRange.end, "MMM dd, yyyy")}`;
        return format(selectedRange.start, "MMMM yyyy");
    }, [periodMode, selectedRange]);

    const applySelection = () => {
        if (!selectedRange) return;

        setDate(toYMD(selectedRange.start));
        setEndDate(toYMD(selectedRange.end));
        setMode(periodMode);
        setOpen(false);
    };

    const handleDayChange = (value: Date | undefined) => {
        if (!value) return;

        setDate(toYMD(value));
        setEndDate(toYMD(value));
        setMode("DAY");
        setOpen(false);
    };

    const handleMonthPick = (monthIndex: number) => {
        const nextMonth = new Date(monthYearCursor.getFullYear(), monthIndex, 1);
        if (isAfter(startOfMonth(nextMonth), today)) return;

        setPeriodAnchor(nextMonth);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>
                    <AppHeader label="Filter Supply Orders" hidePapiverseLogo />
                </DialogTitle>

                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1">
                        {[
                            { label: "Daily", value: "DAY" },
                            { label: "Weekly", value: "WEEK" },
                            { label: "Monthly", value: "MONTH" },
                        ].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setPeriodMode(item.value as SupplyOrdersPeriodMode)}
                                className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
                                    periodMode === item.value ? "bg-white shadow" : "opacity-70"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-md border bg-white p-3">
                        <div className="text-sm">
                            <div className="font-semibold">Selected period</div>
                            <div className="text-slate-600">{rangeLabel}</div>
                        </div>

                        {periodMode !== "DAY" && (
                            <Button
                                type="button"
                                className="bg-darkgreen! hover:opacity-90"
                                disabled={!selectedRange}
                                onClick={applySelection}
                            >
                                Apply
                            </Button>
                        )}
                    </div>

                    {periodMode === "DAY" || periodMode === "WEEK" ? (
                        <Calendar
                            mode="single"
                            selected={periodAnchor}
                            onSelect={periodMode === "DAY" ? handleDayChange : setPeriodAnchor}
                            disabled={(value) => isAfter(value, today)}
                            className="w-full"
                        />
                    ) : (
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
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
