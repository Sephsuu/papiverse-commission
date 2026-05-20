'use client'

import { AppHeader } from "@/components/shared/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCrudState } from "@/hooks/use-crud-state";
import { CommissionOwnerService } from "@/services/commissionOwner.service";
import { CommissionOwner } from "@/types/commissionOwner";
import { format, parseISO } from "date-fns";
import { CalendarDays, Plus, UserRound } from "lucide-react";
import { CreateCommissionOwner } from "./components/CreateCommissionOwner";
import { useMemo, useState } from "react";
import { InventoryReportPeriodMode } from "./components/DatePickerModal";
import { CommissionOwnerDatePickerModal } from "./components/CommissionOwnerDatePickerModal";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { AssignedCommissionerProducts } from "./components/AssignedCommissionerProducts";
import { CommissionerReport } from "./components/CommissionerReport";

const TABS = ['COMMISSIONER REPORT', 'ASSIGNED PRODUCTS']

export function CommissionReportPage() {
    const [tab, setTab] = useState(TABS[0])
    const [reload, setReload] = useState(false)
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [mode, setMode] = useState<InventoryReportPeriodMode>("MONTH");
    const [selectedOwner, setSelectedOwner] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { open, setOpen } = useCrudState()

    const { data: owners } = useFetchData<CommissionOwner>(
        CommissionOwnerService.getCommissionOwners,
        [reload],
        []
    );

    const ownerOptions = useMemo(
        () =>
            owners.map((owner) => ({
                label: owner.name,
                value: String(owner.id),
            })),
        [owners]
    );
    const selectedOwnerName =
        ownerOptions.find((item) => item.value === selectedOwner)?.label || "Select Owner";
    const displayDate = useMemo(() => {
        if (!date) return "Select period";

        const start = parseISO(date);
        const end = endDate ? parseISO(endDate) : start;

        if (mode === "DAY") {
            return format(start, "MMMM dd, yyyy");
        }

        if (mode === "WEEK") {
            return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
        }

        if (mode === "MONTH") {
            return format(start, "MMMM yyyy");
        }

        return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
    }, [date, endDate, mode]);
    const displayBadge =
        mode === "DAY"
            ? "Daily"
            : mode === "WEEK"
              ? "Weekly"
              : mode === "MONTH"
                ? "Monthly"
                : "Quarterly";
    const reportMonth = format(parseISO(date), "yyyy-MM");

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader 
                label="Commission Report" 
            />
                
            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={TABS}
                    selectedTab={tab}
                    setSelectedTab={setTab}
                    buttonClassName="w-50!"
                />

                <Button
                    onClick={() => setOpen(true)}
                    className="ms-auto bg-darkgreen! hover:opacity-90"
                >
                    <Plus /> Add Commission Owner
                </Button>
            </div>

            {tab === TABS[1] && (
                <div
                    onClick={() => setFilterOpen(true)}
                    className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
                >
                    <UserRound size={18} />
                    <div className="truncate">
                        {selectedOwner ? selectedOwnerName : "ALL"}
                    </div>
                    <span className="text-slate-400">|</span>
                    <CalendarDays size={18} />
                    <div className="origin-left truncate scale-x-110">{displayDate}</div>
                    <Badge className={`ml-2 bg-darkbrown font-bold ${mode !== "DAY" && "ml-4"}`}>
                        {displayBadge}
                    </Badge>
                </div>
            )}

            <CommissionOwnerDatePickerModal
                date={date}
                mode={mode}
                setDate={setDate}
                setEndDate={setEndDate}
                open={isFilterOpen}
                setOpen={setFilterOpen}
                setMode={setMode}
                ownerOptions={ownerOptions}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
            />

            {tab === TABS[0] && (
                <CommissionerReport month={reportMonth} />
            )}

            {tab === TABS[1] && (
                <AssignedCommissionerProducts
                    owners={owners}
                    selectedOwner={selectedOwner}
                    setReload={setReload}
                />
            )}       

            {open && (
                <CreateCommissionOwner
                    setOpen={setOpen}
                    setReload={setReload}
                />
            )}
        </section>
    )
}
