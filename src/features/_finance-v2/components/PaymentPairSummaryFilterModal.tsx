"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { addYears, format, isAfter, isSameMonth, startOfMonth } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

type SelectItem = { label: string; value: string };

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    groupItems: SelectItem[];
    selectedGroupId: number | null;
    selectedMonth: string;
    selectedYear: string;
    onApply: (payload: {
        groupId: number;
        month: string;
        year: string;
    }) => void;
}

export function PaymentPairSummaryFilterModal({
    open,
    setOpen,
    groupItems,
    selectedGroupId,
    selectedMonth,
    selectedYear,
    onApply,
}: Props) {
    const today = useMemo(() => new Date(), []);
    const [localGroupId, setLocalGroupId] = useState(String(selectedGroupId ?? ""));
    const [localMonth, setLocalMonth] = useState(selectedMonth || "");
    const [localYear, setLocalYear] = useState(selectedYear || "");
    const initialYear = Number(selectedYear) || today.getFullYear();
    const [monthYearCursor, setMonthYearCursor] = useState(new Date(initialYear, 0, 1));

    useEffect(() => {
        if (!open) return;
        const nextYear = Number(selectedYear) || today.getFullYear();
        setLocalGroupId(String(selectedGroupId ?? ""));
        setLocalMonth(selectedMonth || "");
        setLocalYear(selectedYear || "");
        setMonthYearCursor(new Date(nextYear, 0, 1));
    }, [open, selectedGroupId, selectedMonth, selectedYear, today]);

    const selectedMonthDate = useMemo(() => {
        const monthNum = Number(localMonth);
        const yearNum = Number(localYear);
        if (!monthNum || !yearNum) return undefined;
        return new Date(yearNum, monthNum - 1, 1);
    }, [localMonth, localYear]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>
                    <AppHeader label="Pair Summary Filters" />
                </DialogTitle>

                <div className="space-y-3">
                    <div className="grid gap-2 rounded-md bg-slate-100 p-1">
                        <div className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold shadow">
                            Configure group and month/year
                        </div>
                    </div>

                    <div className="rounded-md border bg-white p-3">
                        <div className="grid gap-3">
                            <AppSelect
                                label="Settlement Group"
                                groupLabel="Groups"
                                placeholder="Select group"
                                items={groupItems}
                                value={localGroupId}
                                onChange={setLocalGroupId}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 rounded-md border bg-white p-3">
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
                                const active = selectedMonthDate ? isSameMonth(selectedMonthDate, monthDate) : false;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => {
                                            setLocalMonth(String(index + 1));
                                            setLocalYear(String(monthYearCursor.getFullYear()));
                                        }}
                                        className={`rounded-md border px-3 py-4 text-sm font-semibold transition ${
                                            active
                                                ? "border-darkbrown bg-darkbrown text-white"
                                                : "bg-white text-slate-700"
                                        } ${disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"}`}
                                    >
                                        {format(monthDate, "MMMM")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 rounded-md border bg-white p-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-darkgreen! hover:opacity-90"
                            onClick={() => {
                                if (!localGroupId || !localMonth || !localYear) return;
                                onApply({
                                    groupId: Number(localGroupId),
                                    month: localMonth,
                                    year: localYear,
                                });
                                setOpen(false);
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
