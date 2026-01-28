"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Claim } from "@/types/claims";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SalesService } from "@/services/sales.service";
import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SalesCalendar({
    claims,
    className,
    selectedDay,
    setSelectedDay
}: {
    claims: Claim
    className?: string;
    selectedDay: string;
    setSelectedDay: (i: string) => void;
}) {
    const today = new Date();
    const isMobile = useIsMobile();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());    

    const { data, loading } = useFetchData<{ day: string, ingested: boolean }>(
        SalesService.getSalesCalendar,
        [currentMonth, currentYear],
        [claims.branch.branchId, currentMonth + 1, currentYear]
    )

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const emptyDays = Array.from({ length: firstDay });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePrev = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNext = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const toYMD = (y: number, m: number, d: number) => {
        return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    };

    if (loading) return <SectionLoading className="col-span-3 max-md:col-span-5" />
    return (
        <section className={`${className}`}>
            <div className="flex-center-y gap-1 text-lg font-bold">Sales Calendar</div>

            <div className="bg-slate-50 my-2 p-4 rounded-md shadow-sm">
                {/* HEADER */}
                <div className="flex justify-between items-center p-4">
                    <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded transition">
                        <ChevronLeft />
                    </button>

                    <h2 className="font-semibold text-lg">
                        {monthNames[currentMonth]} {currentYear}
                    </h2>

                    <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded transition">
                        <ChevronRight />
                    </button>
                </div>

                {/* WEEKDAY HEADER */}
                <div className="grid grid-cols-7 text-center font-medium text-gray-600">
                    {weekDays.map((day) => (
                        <div key={day} className="py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* CALENDAR GRID */}
                <div className="grid grid-cols-7 text-center">
                    {/* Empty placeholders */}
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {/* Day cells */}
                    {days.map((day) => {
                        const dateStr = toYMD(currentYear, currentMonth, day);

                        const isToday =
                            day === today.getDate() &&
                            currentMonth === today.getMonth() &&
                            currentYear === today.getFullYear();

                        const isSelected = selectedDay === dateStr;

                        const dayOfWeek = (firstDay + day - 1) % 7;
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                            <div
                                key={day}
                                onClick={() => setSelectedDay(dateStr)}
                                className={`
                                    cursor-pointer text-start p-2 m-1 aspect-square rounded-lg border shadow-sm transition select-none
                                    ${isSelected ? "bg-darkbrown text-white font-bold" : ""}
                                    ${!isSelected && isToday ? "bg-green-100 font-bold" : ""}
                                    ${!isSelected && !isToday ? "bg-slate-100 hover:bg-green-100" : ""}
                                    ${isWeekend && !isSelected ? "text-darkred" : ""}
                                `}
                            >
                                {isMobile ? (
                                    <><div className="text-4xl font-bold">
                                        {String(day).padStart(2, "0")}
                                    </div>
                                    <div className="font-bold tracking-wider">
                                        DONE
                                    </div></>
                                ) : (
                                    <><div className="text-[2vw] font-bold">
                                        {String(day).padStart(2, "0")}
                                    </div>
                                    { data && data.length > 0 && (
                                        <div className="text-[1vw] font-bold tracking-wider">
                                            {data?.find(i => String(i.day) === String(day))?.ingested && "DONE"}
                                        </div>
                                    )}</>
                                )}
                                
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
