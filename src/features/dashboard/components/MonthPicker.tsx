"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
    startDate,
    endDate,
    setStartDate,
    setEndDate,
}: {
    startDate: string;
    endDate: string;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const today = new Date();
    const currentYear = today.getFullYear();

    const years = useMemo(
        () => Array.from({ length: 6 }, (_, i) => currentYear - 5 + i),
        [currentYear]
    );

    const initial = startDate ? new Date(startDate) : today;
    const [year, setYear] = useState(initial.getFullYear());

    const handleSelectMonth = (monthIndex: number) => {
        const y = year;
        const m = monthIndex + 1;

        const start = `${y}-${String(m).padStart(2, "0")}-01`;
        const lastDay = new Date(y, m, 0).getDate();
        const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        setStartDate(start);
        setEndDate(end);
        setOpen(false);
    };

    const displayLabel = startDate
        ? format(new Date(startDate), "MMMM yyyy")
        : "Select month";

    const selectedMonthIndex = startDate ? new Date(startDate).getMonth() : null;
    const selectedYear = startDate ? new Date(startDate).getFullYear() : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[220px] justify-between text-left font-normal",
                        !startDate && "text-muted-foreground",
                    )}
                >
                    {displayLabel}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[260px] p-3 space-y-3">
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
