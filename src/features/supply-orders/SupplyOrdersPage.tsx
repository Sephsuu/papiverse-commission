"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { log } from "node:console";
import { RejectedOrders } from "./RejectedOrders";
import useNotifications from "@/hooks/use-notification";
import { useCrudState } from "@/hooks/use-crud-state";
import { NotificationSheet } from "@/components/shared/NotificationSheet";

const tabs = ['Pending', 'Completed']

export function SupplyOrdersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reload, setReload] = useState(false);

    const initialTab = searchParams.get("tab") ?? tabs[0];
    const [tab, setTab] = useState(initialTab);

    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const { open, setOpen, showNotif, setShowNotif } = useCrudState();
    const isCommisary = claims.branch.branchId === 1;
    const fetchAll = useFetchData<SupplyOrder>(SupplyOrderService.getAllSupply, [reload, claims]);
    const fetchByBranch = useFetchData<SupplyOrder>(SupplyOrderService.getSupplyOrderByBranch, [reload, claims], [claims.branch.branchId]);
    
    const { data, loading, error } = isCommisary ? fetchAll : fetchByBranch;
    const { filteredNotifications } = useNotifications({ claims, type: "SUPPLY ORDER" });
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['branchName', 'snowfrostCategory.snowFrostOrderId', 'meatCategory.meatOrderId']);
    const { data: branches, loading: branhesLoading } = useFetchData(BranchService.getAllBranches);
    
    const filters = ['All Branches', ...(branches?.map(b => b.name) ?? [])];
    const [filter, setFilter] = useState<string>('All Branches');

    const filteredData = filteredItems.filter(i => {
        if (filter === 'All Branches') return true;
        return i.branchName === filter;
    });

    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredData, 100);

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
            <AppTabSwitcher
                tabs={ tabs }
                selectedTab={ tab }
                setSelectedTab={ setTab }
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

            {tab === 'Pending' && (
                <PendingOrders 
                    claims={ claims }
                    paginated={ paginated.filter(i => i.status === 'PENDING' || i.status === 'TO FOLLOW' || i.status === "TO_FOLLOW") } 
                    setReload={ setReload }
                />
            )}

            {tab === 'Completed' && (
                <CompletedOrders 
                    claims={ claims }
                    paginated={ paginated.filter(i => i.status === 'APPROVED' || i.status === 'DELIVERED') } 
                    setReload={ setReload }
                />
            )}

            {tab === 'Rejected' && (
                <RejectedOrders 
                    claims={ claims }
                    paginated={ paginated.filter(i => i.status === 'REJECTED') } 
                    setReload={ setReload }
                />
            )}

            <TablePagination
                data={ data }
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