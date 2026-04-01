"use client";

import { useEffect, useMemo, useState } from "react";
import { SupplyOrder } from "@/types/supplyOrder";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { AppHeader } from "@/components/shared/AppHeader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { PendingOrders } from "./PendingOrders";
import { TablePagination } from "@/components/shared/TablePagination";
import { PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { CompletedOrders } from "./CompletedOrders";
import { BranchService } from "@/services/branch.service";
import { RejectedOrders } from "./RejectedOrders";
import useNotifications from "@/hooks/use-notification";
import { useCrudState } from "@/hooks/use-crud-state";
import { NotificationSheet } from "@/components/shared/NotificationSheet";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { SupplyOrdersDatePicker, SupplyOrdersPeriodMode } from "./components/SupplyOrdersDatePicker";

const tabs = ['Pending', 'Completed']
type OrderShortageSummary = {
    name: string;
    unitMeasurement: string;
    requiredQuantity: number;
    availableQuantity: number;
    shortageQuantity: number;
    expectedDateAvailableQuantity?: number;
    expectedDateShortageQuantity?: number;
};

export function SupplyOrdersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reload, setReload] = useState(false);

    const initialTab = searchParams.get("tab") ?? tabs[0];
    const [tab, setTab] = useState(initialTab);
    const [toggleDate, setToggleDate] = useState(false);

    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const { open, setOpen, showNotif, setShowNotif } = useCrudState();
    const now = new Date();
    const defaultStartDate = format(startOfMonth(now), "yyyy-MM-dd");
    const defaultEndDate = format(endOfMonth(now), "yyyy-MM-dd");
    const [date, setDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [periodMode, setPeriodMode] = useState<SupplyOrdersPeriodMode>("MONTH"); 
    const isCommisary = claims.branch.branchId === 1;
    const fetchAll = useFetchData<SupplyOrder>(
        SupplyOrderService.getAllSupply, 
        [reload, claims, date, endDate],
        [date, endDate, 'commissary'],
        0, 1000,
        isFranchisor
    );
    const fetchByBranch = useFetchData<SupplyOrder>(
        SupplyOrderService.getSupplyOrderByBranch, 
        [reload, claims], 
        [claims.branch.branchId],
        0, 1000,
        !isFranchisor
    );
    
    const { data, loading } = isCommisary ? fetchAll : fetchByBranch;
    const { filteredNotifications } = useNotifications({ claims, type: "SUPPLY ORDER" });
    const { setSearch, filteredItems } = useSearchFilter(data, ['branchName', 'snowfrostCategory.snowFrostOrderId', 'meatCategory.meatOrderId']);
    const { data: branches, loading: branhesLoading } = useFetchData(BranchService.getAllBranches);
    
    const filters = ['All Branches', ...(branches?.map(b => b.name) ?? [])];
    const [filter, setFilter] = useState<string>('All Branches');
    const parsedDate = date ? new Date(date) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    const displayDate = useMemo(() => {
        if (!parsedDate || !parsedEndDate) return "Select period";
        if (periodMode === "DAY") return format(parsedDate, "MMMM dd, yyyy");
        if (periodMode === "WEEK") return `${format(parsedDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
        return format(parsedDate, "MMMM yyyy");
    }, [parsedDate, parsedEndDate, periodMode]);

    const displayBadge = useMemo(() => {
        if (!parsedDate) return null;
        if (periodMode === "DAY") return format(parsedDate, "EEEE").toUpperCase();
        if (periodMode === "WEEK") return "Sun-Sat";
        return "MONTH";
    }, [parsedDate, periodMode]);

    const filteredData = useMemo(() => {
        return filteredItems.filter((item) => {
            if (filter === 'All Branches') return true;

            return item.branchName === filter;
        });
    }, [filter, filteredItems]);

    const activeTabData = useMemo(() => {
        if (tab === 'Pending') {
            return filteredData.filter((item) =>
                item.status === 'PENDING' ||
                item.status === 'TO FOLLOW' ||
                item.status === 'TO_FOLLOW'
            );
        }

        if (tab === 'Completed') {
            return filteredData.filter((item) =>
                item.status === 'APPROVED' || item.status === 'DELIVERED'
            );
        }

        return filteredData.filter((item) => item.status === 'REJECTED');
    }, [filteredData, tab]);

    const orderShortages = useMemo(() => {
        return activeTabData.reduce<Record<number, { count: number; summary: OrderShortageSummary[] }>>((acc, order) => {
            if (tab !== "Pending" || !order.orderId) return acc;

            const shortages = (order.lowStocks ?? []).map((item) => ({
                name: item.rawMaterialName,
                unitMeasurement: item.unitMeasurement,
                requiredQuantity: item.requiredQuantity,
                availableQuantity: item.availableQuantity,
                shortageQuantity: item.shortageQuantity,
                expectedDateAvailableQuantity: item.expectedDateAvailableQuantity,
                expectedDateShortageQuantity: item.expectedDateShortageQuantity,
            }));

            if (shortages.length === 0) return acc;

            acc[order.orderId] = {
                count: shortages.length,
                summary: shortages,
            };

            return acc;
        }, {});
    }, [activeTabData, tab]);

    const shortageOrderCount = Object.keys(orderShortages).length;

    const { page, setPage, size, setSize, paginated } = usePagination(activeTabData, 10);

    useEffect(() => {
        if (open) {
            router.push("/inventory/supply-order-form");
        }
    }, [open, router]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tab);

        router.replace(`/inventory/supply-orders?${params.toString()}`);
    }, [tab, router]);

    if (loading || authLoading || branhesLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label='Supply Orders' />
            
            <div className="flex-center-y justify-between">
                <AppTabSwitcher
                    tabs={ tabs }
                    selectedTab={ tab }
                    setSelectedTab={ setTab }
                />
                <div
                    onClick={() => setToggleDate(true)}
                    className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                >
                    <CalendarDays />
                    <div className="scale-x-110 origin-left">
                        {displayDate}
                    </div>
                    <Badge className={`bg-darkbrown font-bold ml-2 ${periodMode !== "DAY" && "ml-4"}`}>
                        {displayBadge}
                    </Badge>
                </div>
            </div>

            <SupplyOrdersDatePicker
                date={date}
                mode={periodMode}
                open={toggleDate}
                setDate={setDate}
                setEndDate={setEndDate}
                setMode={setPeriodMode}
                setOpen={setToggleDate}
            />

            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for a supply order"
                size={ size }
                setSize={ setSize }
                removeAdd={ claims.roles[0] === 'FRANCHISOR' ? true : false }
                setOpen={ setOpen }
                buttonLabel="Order supplies"
                filter={ filter }
                filters={ filters }
                setFilter={ setFilter }
                removeFilter={ !isFranchisor }
                filteredNotifications={ filteredNotifications }
                setShowNotif={ setShowNotif }
            />

            {tab === "Pending" && shortageOrderCount > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">
                    <span className="font-semibold">{shortageOrderCount}</span> pending {shortageOrderCount === 1 ? "order has" : "orders have"} insufficient stock from the fetched order payload.
                </div>
            )}

            {tab === 'Pending' && (
                <PendingOrders 
                    claims={ claims }
                    paginated={ paginated } 
                    setReload={ setReload }
                    orderShortages={ orderShortages }
                />
            )}

            {tab === 'Completed' && (
                <CompletedOrders 
                    claims={ claims }
                    paginated={ paginated } 
                    setReload={ setReload }
                />
            )}

            {tab === 'Rejected' && (
                <RejectedOrders 
                    claims={ claims }
                    paginated={ paginated } 
                    setReload={ setReload }
                />
            )}

            <TablePagination
                data={ activeTabData }
                paginated={ paginated }
                size={ size }
                setPage={ setPage }
                page={ page }
            />

            {showNotif && (
                <NotificationSheet 
                    notifications={ filteredNotifications }
                    setOpen={ setShowNotif }
                />
            )}
        </section>
    );
}
