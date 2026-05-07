"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { PapiverseLoading } from "@/components/ui/loader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { CreatePaymentSettlementGroup } from "@/features/_finance-v2/components/CreatePaymentSettlementGroup";
import { CreatePaymentSettlementEntry } from "@/features/_finance-v2/components/CreatePaymentSettlementEntry";
import { PaymentPairSummaryFilterModal } from "@/features/_finance-v2/components/PaymentPairSummaryFilterModal";
import { PaymentPairSummarySelector } from "@/features/_finance-v2/components/PaymentPairSummarySelector";
import { PaymentSettlementService, SettlementEntryType } from "@/services/paymentSettlement.service";
import { formatToPeso } from "@/lib/formatter";
import { Plus } from "lucide-react";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { TableFilter } from "@/components/shared/TableFilter";
import { useCrudState } from "@/hooks/use-crud-state";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Person = { id: number; displayName: string };
type Group = { id: number; name: string; description?: string; people?: Person[] };
type LedgerEntry = {
    id: number;
    fromPersonId: number;
    toPersonId: number;
    fromPerson?: { id: number; displayName: string };
    toPerson?: { id: number; displayName: string };
    fromPersonName?: string;
    toPersonName?: string;
    amount: number;
    entryType: SettlementEntryType;
    description: string;
    weekLabel?: string;
    recordedAt?: string;
};
type WeeklyRow = {
    weekLabel: string;
    personToPay?: string;
    personToReceive?: string;
    totalAmount: number;
    displayText: string;
};
type PairSummary = {
    settlementGroupId?: number;
    settlementGroupName?: string;
    personA?: { id: number; displayName: string };
    personB?: { id: number; displayName: string };
    weeklyRows?: WeeklyRow[];
    finalPersonToPay?: string;
    finalPersonToReceive?: string;
    finalAmount?: number;
    isSettled?: boolean;
};

const WEEK_LABELS = ["WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4"];

export function PaymentSettlementPage() {
    const entryTypeFilters = ["All", "DEBT", "PAYMENT"];
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [openCreateEntry, setOpenCreateEntry] = useState(false);
    const [openPairFilter, setOpenPairFilter] = useState(false);
    const [reload, setReload] = useState(false);

    const [personAId, setPersonAId] = useState(0);
    const [personBId, setPersonBId] = useState(0);
    const [month, setMonth] = useState("4");
    const [year, setYear] = useState("2026");
    const [filter, setFilter] = useState(entryTypeFilters[0]);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("groupId");
    const lastSyncedUrlRef = useRef("");
    const lastAppliedGroupParamRef = useRef<string | null>(null);

    const emptyFetchOne = async () => null;

    const { data: groups, loading: loadingGroups } = useFetchData<Group>(
        PaymentSettlementService.getSettlementGroups as any,
        [reload],
        [],
        0,
        1000,
        true
    );

    const { data: selectedGroup, loading: loadingGroup } = useFetchOne<Group | null>(
        selectedGroupId ? (PaymentSettlementService.getSettlementGroupById as any) : emptyFetchOne,
        [selectedGroupId],
        selectedGroupId ? [selectedGroupId] : []
    );

    const { data: ledger, loading: loadingLedger } = useFetchData<LedgerEntry>(
        PaymentSettlementService.getLedgerEntriesByGroup as any,
        [selectedGroupId, reload],
        selectedGroupId ? [selectedGroupId, reload] : [],
        0,
        1000,
        Boolean(selectedGroupId)
    );

    const { data: summary, loading: loadingSummary } = useFetchOne<PairSummary | null>(
        (selectedGroupId && personAId && personBId)
            ? (() => PaymentSettlementService.getPairSummary(selectedGroupId, {
                personAId,
                personBId,
                month: month ? Number(month) : undefined,
                year: year ? Number(year) : undefined,
            }) as any)
            : emptyFetchOne,
        [selectedGroupId, personAId, personBId, month, year],
        []
    );

    useEffect(() => {
        if (!groups?.length) return;
        if (lastAppliedGroupParamRef.current === groupParam) return;
        lastAppliedGroupParamRef.current = groupParam;

        const parsedGroupId = groupParam ? Number(groupParam) : NaN;
        const groupFromParam = Number.isFinite(parsedGroupId)
            ? groups.find((group) => group.id === parsedGroupId)
            : undefined;

        if (groupFromParam) {
            setSelectedGroupId(groupFromParam.id);
            return;
        }

        if (!selectedGroupId && groups[0]?.id) setSelectedGroupId(groups[0].id);
    }, [groupParam, groups, selectedGroupId]);

    useEffect(() => {
        if (!selectedGroupId) return;
        if (groupParam === String(selectedGroupId)) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("groupId", String(selectedGroupId));
        const nextUrl = `${pathname}?${params.toString()}`;
        if (lastSyncedUrlRef.current === nextUrl) return;
        lastSyncedUrlRef.current = nextUrl;
        router.replace(nextUrl);
    }, [groupParam, pathname, router, searchParams, selectedGroupId]);

    useEffect(() => {
        const people = selectedGroup?.people ?? [];
        if (people.length >= 2) {
            setPersonAId(people[0].id);
            setPersonBId(people[1].id);
            return;
        }
        setPersonAId(0);
        setPersonBId(0);
    }, [selectedGroupId, selectedGroup?.people]);

    function resolvePersonName(personId: number | string | undefined) {
        const normalizedId = String(personId ?? "");
        const person = selectedGroup?.people?.find((p) => String(p.id) === normalizedId);
        return person?.displayName;
    }

    const { open, setOpen } = useCrudState();
    const tableData = useMemo(
        () => (ledger ?? []).slice().sort((a, b) => new Date(a.recordedAt ?? "").getTime() - new Date(b.recordedAt ?? "").getTime()),
        [ledger]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(tableData, ["amount"]);
    const entryTypeFilteredItems = filteredItems.filter((item) => {
        if (filter === "DEBT") return item.entryType === "DEBT";
        if (filter === "PAYMENT") return item.entryType === "PAYMENT";
        return true;
    });
    const { page, setPage, size, setSize, paginated } = usePagination(entryTypeFilteredItems, 10, "paymentSettlementPage");

    const weeklyRows = useMemo(() => {
        const fromApi = summary?.weeklyRows ?? [];
        const byWeek = new Map(fromApi.map((row) => [row.weekLabel?.toUpperCase(), row]));
        const hasLoadedSummaryRows = fromApi.length > 0;

        return WEEK_LABELS.map((label) => {
            const hit = byWeek.get(label);
            if (hit) return hit;
            if (!hasLoadedSummaryRows) {
                return {
                    weekLabel: label,
                    personToPay: undefined,
                    personToReceive: undefined,
                    displayText: "-",
                    totalAmount: 0,
                };
            }
            const fallbackPayer = summary?.personB?.displayName || selectedGroup?.people?.find((p) => p.id === personBId)?.displayName || "Ren";
            const fallbackReceiver = summary?.personA?.displayName || selectedGroup?.people?.find((p) => p.id === personAId)?.displayName || "Jerry";
            return {
                weekLabel: label,
                personToPay: fallbackPayer,
                personToReceive: fallbackReceiver,
                displayText: `TO PAY BY ${fallbackPayer.toUpperCase()}`,
                totalAmount: 0,
            };
        });
    }, [personAId, personBId, selectedGroup?.people, summary]);

    const groupItems = useMemo(() => (groups ?? []).map((group) => ({ label: group.name, value: String(group.id) })), [groups]);
    const selectedGroupName = useMemo(() => (groups ?? []).find((group) => group.id === selectedGroupId)?.name ?? "Select Group", [groups, selectedGroupId]);
    const displayDate = useMemo(() => {
        const monthNum = Number(month);
        const yearNum = Number(year);
        if (!monthNum || !yearNum) return "Select Month & Year";
        return new Date(yearNum, monthNum - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }, [month, year]);

    if (loadingGroups || loadingGroup || loadingLedger || loadingSummary) return <PapiverseLoading />;

    return (
        <section className="stack-md min-h-screen pb-12 animate-fade-in-up overflow-hidden max-md:mt-12">
            <div className="flex-center-y justify-between">
                <AppHeader label="Payment Settlement" hidePapiverseLogo />
                <Button className="bg-darkgreen! hover:opacity-90!" onClick={() => setOpenCreateGroup(true)}>
                    <Plus /> Create Settlement Group
                </Button>
            </div>

            <PaymentPairSummarySelector
                selectedGroupName={selectedGroupName}
                displayDate={displayDate}
                onClick={() => setOpenPairFilter(true)}
            />

            <div className="flex-center-y justify-between gap-3 p-5 bg-slate-50 shadow-sm rounded-md border border-slate-300">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                        Settlement Summary
                    </p>
                    <div className="text-xl font-semibold">
                        {summary?.finalPersonToPay && summary?.finalPersonToReceive
                            ? `${summary.finalPersonToPay} pays ${summary.finalPersonToReceive}`
                            : "No final payer/receiver yet."}
                    </div>
                </div>
                <div className="text-2xl font-semibold text-darkbrown">{formatToPeso(summary?.finalAmount ?? 0)}</div>
            </div>

            <div className="table-wrapper">
                <div className="thead grid grid-cols-3 bg-darkbrown/10!">
                    <div className="th">Week</div><div className="th">Details</div><div className="th">Amount</div>
                </div>
                {weeklyRows.map((row) => (
                    <div className="tdata grid grid-cols-3" key={row.weekLabel}>
                        <div className="td font-semibold">{row.weekLabel}</div>
                        <div className="td">{(row.totalAmount ?? 0) > 0 ? row.displayText : "-"}</div>
                        <div className="td justify-between">
                            <span>₱</span>
                            <span>{formatToPeso(row.totalAmount || 0).replace("₱", "")}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <div className="text-darkbrown font-bold text-xl">Detailed Payment Settlement</div>
                <div className="text-sm text-gray">
                    Detailed payment settlement totals for the selected pair and month, shown in Philippine peso (₱).
                </div>
            </div>

            <TableFilter
                search={search}
                setSearch={setSearch}
                size={size}
                setSize={setSize}
                searchPlaceholder="Search for an amount"
                buttonLabel="Add an entry"
                setOpen={setOpen}
                filters={entryTypeFilters}
                filter={filter}
                setFilter={setFilter}
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-6 bg-darkbrown/10!">
                    <div className="th">Week</div><div className="th">From</div><div className="th">To</div><div className="th">Type</div><div className="th">Description</div><div className="th">Amount</div>
                </div>
                {paginated.map((item) => (
                    <div className="tdata grid grid-cols-6" key={item.id}>
                        <div className="td">{item.weekLabel || "-"}</div>
                        <div className="td">{item.fromPerson?.displayName || item.fromPersonName || resolvePersonName(item.fromPersonId) || item.fromPersonId}</div>
                        <div className="td">{item.toPerson?.displayName || item.toPersonName || resolvePersonName(item.toPersonId) || item.toPersonId}</div>
                        <div className="td">{item.entryType}</div>
                        <div className="td">{item.description || "-"}</div>
                        <div className="td justify-between">
                            <span>₱</span>
                            <span>{formatToPeso(item.amount || 0).replace("₱", "")}</span>
                        </div>
                    </div>
                ))}
                <TablePagination data={entryTypeFilteredItems} paginated={paginated} page={page} size={size} setPage={setPage} pageKey="paymentSettlementPage" />
            </div>

            {openCreateGroup && <CreatePaymentSettlementGroup setOpen={setOpenCreateGroup} setReload={setReload} />}

            {open && (
                <CreatePaymentSettlementEntry
                    setOpen={setOpen}
                    setReload={setReload}
                    settlementGroupId={selectedGroupId!}
                    people={selectedGroup?.people ?? []}
                />
            )}

            {openPairFilter && (
                <PaymentPairSummaryFilterModal
                    open={openPairFilter}
                    setOpen={setOpenPairFilter}
                    groupItems={groupItems}
                    selectedGroupId={selectedGroupId}
                    selectedMonth={month}
                    selectedYear={year}
                    onApply={({ groupId, month: nextMonth, year: nextYear }) => {
                        setSelectedGroupId(groupId);
                        setMonth(nextMonth);
                        setYear(nextYear);
                    }}
                />
            )}
        </section>
    );
}
