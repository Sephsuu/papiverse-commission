"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHS = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Apr", value: 3 },
  { label: "May", value: 4 },
  { label: "Jun", value: 5 },
  { label: "Jul", value: 6 },
  { label: "Aug", value: 7 },
  { label: "Sep", value: 8 },
  { label: "Oct", value: 9 },
  { label: "Nov", value: 10 },
  { label: "Dec", value: 11 },
];

export function MonthPicker({
  date,
  setDate,
}: {
  date: string;
  setDate: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const years = useMemo(
        () => Array.from({ length: 6 }, (_, i) => currentYear - 5 + i),
        [currentYear]
    );

    const initial = date ? new Date(date) : today;
    const [year, setYear] = useState(initial.getFullYear());

    const handleSelectMonth = (monthIndex: number) => {
        const m = monthIndex + 1;
        const startOfMonth = `${year}-${String(m).padStart(2, "0")}-01`;
        setDate(startOfMonth);
        setOpen(false);
    };

    const clearMonth = () => {
        setDate("");
        setOpen(false);
    };

    const displayLabel = date
        ? format(new Date(date), "MMMM yyyy")
        : "Filter by month";

    const selectedMonthIndex = date ? new Date(date).getMonth() : null;
    const selectedYear = date ? new Date(date).getFullYear() : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full shadow-sm shadow-lightbrown rounded-md">
            <Button
            variant="outline"
            className={cn(
                "w-full justify-between text-left font-normal",
                !date && "text-muted-foreground"
            )}
            >
            {displayLabel}
            <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[260px] p-3 space-y-3">
            <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={clearMonth}
            >
            <X className="mr-2 h-3 w-3" />
            All months
            </Button>

            <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
                Year
            </span>

            <select
                className="h-8 rounded-md border px-2 text-xs"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
            >
                {years.map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
                ))}
            </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month) => {
                const isFuture =
                year > currentYear ||
                (year === currentYear && month.value > currentMonth);

                const isActive =
                selectedMonthIndex === month.value &&
                selectedYear === year;

                return (
                <Button
                    key={month.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    disabled={isFuture}
                    onClick={() => handleSelectMonth(month.value)}
                >
                    {month.label}
                </Button>
                );
            })}
            </div>
        </PopoverContent>
        </Popover>
    );
}
