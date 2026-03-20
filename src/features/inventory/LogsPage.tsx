"use client"

import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { InventoryLog } from "@/types/inventory-log";
import { useEffect, useMemo, useState } from "react";
import { OrderLogs } from "./components/OrderLogs";
import { InputLogs } from "./components/InputLogs";
import { InventoryService } from "@/services/inventory.service";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AppHeader } from "@/components/shared/AppHeader";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/custom/EmptyState";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogsMonthPickerModal } from "./components/LogsMonthPickerModal";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const allTabs = ['INPUT', 'ORDER'];
const allEventTab = "ALL EVENTS";
const emptyEventLabel = "UNCATEGORIZED";
const monthOptions = [
    { label: "January", value: "january" },
    { label: "February", value: "february" },
    { label: "March", value: "march" },
    { label: "April", value: "april" },
    { label: "May", value: "may" },
    { label: "June", value: "june" },
    { label: "July", value: "july" },
    { label: "August", value: "august" },
    { label: "September", value: "september" },
    { label: "October", value: "october" },
    { label: "November", value: "november" },
    { label: "December", value: "december" },
];
type InventoryLogGroup = {
    date: string;
    logs: InventoryLog[];
};

export function LogsPage() {
    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const tabs = isFranchisor ? ['INPUT', 'ORDER'] : allTabs;

    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = searchParams.get("tab") ?? tabs[0];
    const initialEvent = searchParams.get("event") ?? allEventTab;
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${monthOptions[today.getMonth()].value}`;
    const [tab, setTab] = useState(initialTab);
    const [eventTab, setEventTab] = useState(initialEvent);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [monthPickerOpen, setMonthPickerOpen] = useState(false);

    const selectedYear = selectedMonth.split("-")[0];
    const selectedMonthValue = selectedMonth.split("-")[1];
    const selectedMonthLabel = useMemo(() => {
        const selected = monthOptions.find((month) => month.value === selectedMonthValue);
        return selected ? `${selected.label} ${selectedYear}` : "Select month";
    }, [selectedMonthValue, selectedYear]);
    const selectedMonthBadge = useMemo(() => selectedMonthValue.toUpperCase(), [selectedMonthValue]);

    const { data, loading } = useFetchData<InventoryLog>(
        InventoryService.getInventoryAudits,
        [claims.branch.branchId, tab, selectedMonthValue, selectedYear],
        [claims.branch.branchId, tab, selectedMonthValue, selectedYear],
    );

    const eventTabs = useMemo(() => {
        const values = new Set<string>();

        data.forEach((log) => {
            values.add(log.businessEvent?.trim() || emptyEventLabel);
        });

        return [allEventTab, ...Array.from(values)];
    }, [data]);

    useEffect(() => {
        if (!eventTabs.includes(eventTab)) {
            setEventTab(allEventTab);
        }
    }, [eventTab, eventTabs]);

    const eventFilteredItems = useMemo(() => {
        if (eventTab === allEventTab) return data;

        return data.filter(
            (log) => (log.businessEvent?.trim() || emptyEventLabel) === eventTab
        );
    }, [data, eventTab]);

    const filteredLogs = useMemo(() => {
        const getLogDate = (log: InventoryLog) => log.effectiveDate || log.dateTime;
        const getLogMonth = (log: InventoryLog) =>
            new Date(getLogDate(log)).toLocaleString("en-US", { month: "long" }).toLowerCase();

        return eventFilteredItems.filter((log) => {
            const logDate = new Date(getLogDate(log));
            return (
                !Number.isNaN(logDate.getTime()) &&
                String(logDate.getFullYear()) === selectedYear &&
                getLogMonth(log) === selectedMonthValue
            );
        });
    }, [eventFilteredItems, selectedMonth]);

    const filteredItems = useMemo<InventoryLogGroup[]>(() => {
        const grouped = new Map<string, InventoryLog[]>();

        filteredLogs.forEach((log) => {
            const groupDate = log.effectiveDate || log.dateTime.slice(0, 10);
            if (!groupDate) return;

            const currentLogs = grouped.get(groupDate) ?? [];
            currentLogs.push(log);
            grouped.set(groupDate, currentLogs);
        });

        return Array.from(grouped.entries())
            .map(([date, logs]) => ({
                date,
                logs: logs.sort((a, b) => b.dateTime.localeCompare(a.dateTime)),
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [filteredLogs]);

    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 100);
    const totalLogs = filteredItems.reduce((sum, group) => sum + group.logs.length, 0);
    const totalIn = filteredItems.reduce(
        (sum, group) => sum + group.logs.filter((log) => log.type === "IN").length,
        0
    );
    const totalOut = filteredItems.reduce(
        (sum, group) => sum + group.logs.filter((log) => log.type === "OUT").length,
        0
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tab);
        params.set("event", eventTab);

        router.replace(`/inventory/logs?${params.toString()}`);
    }, [tab, eventTab, router]);

    if (authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Logs" />

            <div className="flex-center-y justify-between">
                <AppTabSwitcher tabs={ tabs } selectedTab={ tab } setSelectedTab={ setTab } />

                <div className="flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
                    <div
                        onClick={() => setMonthPickerOpen(true)}
                        className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                    >
                        <CalendarDays className="h-4 w-4" />
                        <div className="scale-x-110 origin-left">{selectedMonthLabel}</div>
                        <Badge className="bg-darkbrown font-bold ml-2">
                            {selectedMonthBadge}
                        </Badge>
                    </div> 
                </div>
            </div>
        
            {!loading && eventTabs.length > 1 && (
                <>
                    <div className="flex mt-2">
                        {eventTabs.map((item) => {
                            const isActive = eventTab === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setEventTab(item)}
                                    className={`group relative w-40 pb-4 text-center text-sm font-medium transition-colors
                                        ${isActive ? "text-darkbrown font-semibold" : "text-slate-500 hover:text-darkbrown"}
                                    `}
                                >
                                    <span className="block truncate">{item.replace('_', ' ')}</span>
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 bg-darkbrown transition-all duration-300
                                            ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-orange-100"}
                                        `}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <Separator className="bg-slate-400 -mt-2" />
                </>
            )}

            {!loading && (
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-darkbrown">
                            Incoming Logs
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-darkgreen">{totalIn}</div>
                        <div className="text-sm text-slate-500">Entries marked as inventory in</div>
                    </div>
                    <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-darkbrown">
                            Outgoing Logs
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-darkred">{totalOut}</div>
                        <div className="text-sm text-slate-500">{totalLogs} total logs in the current result</div>
                    </div>
                </div>
            )}

            <LogsMonthPickerModal
                open={monthPickerOpen}
                selectedMonth={selectedMonth}
                setOpen={setMonthPickerOpen}
                setSelectedMonth={setSelectedMonth}
            />

            <div className="animate-fade-in-up" key={eventTab}>
                {loading ? (
                    <SectionLoading />
                ) : paginated.length === 0 ? (
                    <EmptyState message="No inventory logs match your current search or tab." />
                ) : tab === 'INPUT' ? (
                    <InputLogs logs={paginated} />
                ) : tab === 'ORDER' ? (
                    <OrderLogs logs={paginated} />
                ) : tab === 'SALES' ? (
                    !isFranchisor && <InputLogs logs={paginated} />
                ) : null}
            </div>

            {paginated.length > 0 && (
                <TablePagination 
                    data={ filteredItems }
                    paginated={ paginated }
                    page={ page }
                    size={ size }
                    setPage={ setPage }
                />
            )}
        </section>
    );
}
