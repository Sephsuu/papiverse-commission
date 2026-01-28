"use client";

import * as React from "react";
import { format, isAfter } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  date,
  setDate,
}: {
  date: string;
  setDate: (value: string) => void;
}) {
    const toYMD = (d: Date | undefined) =>
        d ? format(d, "yyyy-MM-dd") : "";

    const displayDate = (iso: string) => {
        if (!iso) return "Filter by day";

        const parsed = new Date(iso);
        const isMobile =
        typeof window !== "undefined" && window.innerWidth < 768;

        return isMobile
        ? format(parsed, "MM/dd/yyyy")
        : format(parsed, "PPP");
    };

    const today = new Date();
    const currentYear = today.getFullYear();

    const fromYear = currentYear - 5;
    const toYear = currentYear;

    const disableFutureDates = (d: Date) => isAfter(d, today);

    const handleChange = (d: Date | undefined) => {
        if (!d) return;
        setDate(toYMD(d));
    };

    const clearDate = () => {
        setDate("");
    };

    return (
        <Popover>
        <PopoverTrigger className="w-full shadow-sm shadow-lightbrown rounded-md">
            <Button
                variant="outline"
                className={cn(
                    "w-full justify-between text-left font-normal",
                    !date && "text-muted-foreground"
                )}
            >
            {displayDate(date)}
            <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
        </PopoverTrigger>

        <PopoverContent className="p-2 space-y-2">
            {/* Clear filter */}
            <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={clearDate}
            >
            <X className="mr-2 h-3 w-3" />
            All dates
            </Button>

            <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={handleChange}
            disabled={disableFutureDates}
            fromYear={fromYear}
            toYear={toYear}
            />
        </PopoverContent>
        </Popover>
    );
}
