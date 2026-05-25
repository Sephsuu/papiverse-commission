'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { useToday } from "@/hooks/use-today";
import { useEffect, useMemo, useState } from "react";
import { formatDateToWords } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { DatePickerModal, InventoryReportPeriodMode } from "./components/DatePickerModal";
import { MeatAndPowdersTabContent } from "./components/MeatAndPowdersTabContent";
import { SupplyReportTabContent } from "./components/SupplyReportTabContent";
import {
    endOfMonth,
    endOfQuarter,
    endOfWeek,
    format,
    isAfter,
    isSameDay,
    parseISO,
    startOfMonth,
    startOfQuarter,
    startOfWeek
} from "date-fns";
import { useSessionStorage } from "@/hooks/use-session-storage";

const SS_SD = 'supplyReportStartDate'
const SS_ED = 'supplyReportEndDate'
const YMD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TABS = ['Supply Report', 'Meat and Powders']

const isYmdDate = (value: unknown): value is string => (
    typeof value === "string" && YMD_DATE_PATTERN.test(value)
);

const clampFutureDate = (date: Date, todayDate: Date) => (
    isAfter(date, todayDate) ? todayDate : date
);

const inferPeriodModeFromDateRange = (
    startDate: string,
    endDate: string,
    today: string
): InventoryReportPeriodMode => {
    if (!isYmdDate(startDate) || !isYmdDate(endDate) || !isYmdDate(today)) {
        return "DAY";
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const todayDate = parseISO(today);

    if (isSameDay(start, end)) {
        return "DAY";
    }

    const weekStart = startOfWeek(start, { weekStartsOn: 0 });
    const weekEnd = clampFutureDate(endOfWeek(start, { weekStartsOn: 0 }), todayDate);
    if (isSameDay(start, weekStart) && isSameDay(end, weekEnd)) {
        return "WEEK";
    }

    const monthStart = startOfMonth(start);
    const monthEnd = clampFutureDate(endOfMonth(start), todayDate);
    if (isSameDay(start, monthStart) && isSameDay(end, monthEnd)) {
        return "MONTH";
    }

    const quarterStart = startOfQuarter(start);
    const quarterEnd = clampFutureDate(endOfQuarter(start), todayDate);
    if (isSameDay(start, quarterStart) && isSameDay(end, quarterEnd)) {
        return "QUARTER";
    }

    return "DAY";
};

export function SupplyReportPage() {
    const { today } = useToday();
    const { getSessionStorage, setSessionStorage } = useSessionStorage<string>();
    const [date, setDate] = useState(() => {
        const storedStartDate = getSessionStorage(SS_SD);
        return isYmdDate(storedStartDate) ? storedStartDate : today;
    });
    const [endDate, setEndDate] = useState(() => {
        const storedEndDate = getSessionStorage(SS_ED);
        return isYmdDate(storedEndDate) ? storedEndDate : today;
    });
    const [tab, setTab] = useState(TABS[0]);
    const [toggleDate, setToggleDate] = useState(false);
    const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>(() => (
        inferPeriodModeFromDateRange(date, endDate, today)
    ));

    useEffect(() => {
        setSessionStorage(SS_SD, date);
    }, [date, setSessionStorage]);

    useEffect(() => {
        setSessionStorage(SS_ED, endDate);
    }, [endDate, setSessionStorage]);

    useEffect(() => {
        setPeriodMode(inferPeriodModeFromDateRange(date, endDate, today));
    }, [date, endDate, today]);
    useEffect(() => {
        if (tab !== "Meat and Powders" || !isYmdDate(date) || !isYmdDate(today)) return;

        const start = startOfMonth(parseISO(date));
        const monthEnd = clampFutureDate(endOfMonth(start), parseISO(today));
        const normalizedStart = format(start, "yyyy-MM-dd");
        const normalizedEnd = format(monthEnd, "yyyy-MM-dd");

        if (date !== normalizedStart) setDate(normalizedStart);
        if (endDate !== normalizedEnd) setEndDate(normalizedEnd);
    }, [tab, date, endDate, today]);

    const startDate = date;
    const parsedDate = date ? new Date(date) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const activeMode: InventoryReportPeriodMode = tab === "Meat and Powders" ? "MONTH" : periodMode;
    const displayDate = useMemo(() => {
        if (!parsedDate || !parsedEndDate) return "Select period";

        if (activeMode === "DAY") return format(parsedDate, "MMMM dd, yyyy");
        if (activeMode === "WEEK") return `${format(parsedDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
        if (activeMode === "MONTH") return format(parsedDate, "MMMM yyyy");

        const quarterNumber = Math.floor(parsedDate.getMonth() / 3) + 1;
        return `Q${quarterNumber} ${format(parsedDate, "yyyy")}`;
    }, [parsedDate, parsedEndDate, activeMode]);
    const displayBadge = useMemo(() => {
        if (!parsedDate) return null;
        if (activeMode === "DAY") return format(parsedDate, "EEEE").toUpperCase();
        if (activeMode === "WEEK") return "Sun-Sat";
        if (activeMode === "MONTH") return "MONTH";
        return "QUARTER";
    }, [parsedDate, activeMode]);
    const selectedMonth = useMemo(() => startDate.slice(0, 7), [startDate]);

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Report" />

            <div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <AppTabSwitcher
                        tabs={TABS}
                        selectedTab={tab}
                        setSelectedTab={setTab}
                        buttonClassName="w-40!"
                    />

                    <div
                        onClick={() => setToggleDate(true)}
                        className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                    >
                        <CalendarDays />

                        <div className="scale-x-110 origin-left">
                            {displayDate}
                        </div>

                        <Badge className={`bg-darkbrown font-bold ml-2 ${activeMode !== "DAY" && "ml-4"}`}>
                            {displayBadge}
                        </Badge>
                    </div>

                </div>
            </div>

            <DatePickerModal
                date={date}
                mode={activeMode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={toggleDate}
                setOpen={setToggleDate}
                setMode={tab === "Meat and Powders" ? () => {} : setPeriodMode}
            />

            {tab === "Supply Report" && (
                <SupplyReportTabContent startDate={startDate} endDate={endDate} />
            )}
            {tab === "Meat and Powders" && (
                <MeatAndPowdersTabContent month={selectedMonth} />
            )}
        </section>
    )
}
