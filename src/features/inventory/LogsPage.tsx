"use client"

import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { InventoryLog } from "@/types/inventory-log";
import { useEffect, useState } from "react";
import { OrderLogs } from "./components/OrderLogs";
import { InputLogs } from "./components/InputLogs";
import { InventoryService } from "@/services/inventory.service";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppHeader } from "@/components/shared/AppHeader";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { TableFilter } from "@/components/shared/TableFilter";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { useRouter, useSearchParams } from "next/navigation";

const allTabs = ['INPUT', 'ORDER', 'SALES'];

export function LogsPage() {
    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const tabs = isFranchisor ? ['INPUT', 'ORDER'] : allTabs;

    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = searchParams.get("tab") ?? tabs[0];
    const [tab, setTab] = useState(initialTab);

    const { data, loading } = useFetchData<{
        date: string;
        logs: InventoryLog[]
    }>(
        InventoryService.getInventoryAudits,
        [claims.branch.branchId],
        [claims.branch.branchId, tab],
    );
    const { setSearch, filteredItems } = useSearchFilter(data, ['date', 'logs[].dateTime']);
    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 100);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tab);

        router.replace(`/inventory/logs?${params.toString()}`);
    }, [tab, router]);

    if (authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Logs" />

            <TableFilter 
                setSearch={ setSearch }
                searchPlaceholder="Search for an inventory log"
                size={ size }
                setSize={ setSize }
                removeAdd={true}
                removeFilter={true}
            />

            <AppTabSwitcher tabs={ tabs } selectedTab={ tab } setSelectedTab={ setTab } />

            {loading ? (
                <SectionLoading />
            ) : tab === 'INPUT' ? (
                <InputLogs logs={paginated} />
            ) : tab === 'ORDER' ? (
                <OrderLogs logs={paginated} />
            ) : tab === 'SALES' ? (
                !isFranchisor && <InputLogs logs={paginated} />
            ) : null}



            <TablePagination 
                data={ data }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
            />
        </section>
    );
}