"use client";

import * as React from "react";
import { format, isAfter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: {
    startDate: string;
    setStartDate: (i: string) => void;
    endDate: string;
    setEndDate: (i: string) => void;
}) {
    const toYMD = (d: Date | undefined) =>
        d ? format(d, "yyyy-MM-dd") : "";

    const displayDate = (iso: string) => {
        if (!iso) return "Select date";

        const date = new Date(iso);

        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return isMobile
            ? format(date, "MM/dd/yyyy") 
            : format(date, "PPP");        
    };


    const today = new Date();
    const currentYear = today.getFullYear();

    const fromYear = currentYear - 5;
    const toYear = currentYear;

    const disableFutureDates = (date: Date) => {
        return isAfter(date, today);
    };

    const handleStartChange = (date: Date | undefined) => {
        if (!date) return;

        if (endDate && isAfter(date, new Date(endDate))) {
            setEndDate(toYMD(date));
        }

        setStartDate(toYMD(date));
    };

    const handleEndChange = (date: Date | undefined) => {
        if (!date) return;

        if (startDate && isAfter(new Date(startDate), date)) {
            setStartDate(toYMD(date));
        }

        setEndDate(toYMD(date));
    };

    return (
        <div className="flex gap-2">
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[180px] justify-between text-left font-normal max-sm:w-[120px]",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        {displayDate(startDate)}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                    <Calendar
                        mode="single"
                        disabled={disableFutureDates}  
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={handleStartChange}
                        fromYear={fromYear}
                        toYear={toYear}
                    />
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[180px] justify-between text-left font-normal max-sm:w-[120px]",
                            !endDate && "text-muted-foreground"
                        )}
                    >
                        {displayDate(endDate)}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                    <Calendar
                        mode="single"
                        disabled={disableFutureDates}  
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={handleEndChange}
                        fromYear={fromYear}
                        toYear={toYear}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
