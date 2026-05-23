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
import { useFetchData } from "@/hooks/use-fetch-data";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { AssignedCommissionerProducts } from "./components/AssignedCommissionerProducts";
import { CommissionerReport } from "./components/CommissionerReport";
import { CommissionReportDatePeriodModal } from "./components/CommissionReportDatePeriodModal";
import { CommissionOwnerSelectorModal } from "./components/CommissionOwnerSelectorModal";

const TABS = ['COMMISSIONER REPORT', 'ASSIGNED PRODUCTS']

export function CommissionReportPage() {
    const [tab, setTab] = useState(TABS[0])
    const [reload, setReload] = useState(false)
    const [isDateFilterOpen, setDateFilterOpen] = useState(false);
    const [isOwnerFilterOpen, setOwnerFilterOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

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
        return format(parseISO(date), "MMMM yyyy");
    }, [date]);

    const reportMonth = useMemo(() => {
        if (!date) return format(new Date(), "yyyy-MM");
        return format(parseISO(date), "yyyy-MM");
    }, [date]);

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader 
                label="Commission Report" 
            />
                
            <AppTabSwitcher
                tabs={TABS}
                selectedTab={tab}
                setSelectedTab={setTab}
                buttonClassName="w-50!"
            />

            <div className="my-2 flex-center-y justify-between">
                {tab === TABS[0] && (
                    <div
                        onClick={() => setDateFilterOpen(true)}
                        className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
                    >
                        <CalendarDays size={18} />
                        <div className="origin-left truncate scale-x-110">{displayDate}</div>
                        <Badge className="ml-2 bg-darkbrown font-bold">Monthly</Badge>
                    </div>
                )}

                {tab === TABS[1] && (
                    <div
                        onClick={() => setOwnerFilterOpen(true)}
                        className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
                    >
                        <UserRound size={18} />
                        <div className="truncate">
                            {selectedOwnerName}
                        </div>
                    </div>
                )}

                <Button
                    onClick={() => setOpen(true)}
                    className="ms-auto bg-darkgreen! hover:opacity-90"
                >
                    <Plus /> Add Commission Owner
                </Button>
            </div>

            <CommissionReportDatePeriodModal
                date={date}
                setDate={setDate}
                setEndDate={setEndDate}
                open={isDateFilterOpen}
                setOpen={setDateFilterOpen}
            />

            <CommissionOwnerSelectorModal
                open={isOwnerFilterOpen}
                setOpen={setOwnerFilterOpen}
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
