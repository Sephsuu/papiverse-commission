"use client"

import { Button } from "@/components/ui/button";
import {  PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { Expense } from "@/types/expense";
import { useState } from "react";;
import { ExpenseService } from "@/services/expense.service";
import { WeeklyExpenses } from "./WeeklyExpenses";
import { CreateExpense } from "./CreateExpense";
import { UpdateExpense } from "./UpdateExpense";
import { DeleteExpense } from "./DeleteExpense";
import { AppHeader } from "@/components/shared/AppHeader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { TableFilter } from "@/components/shared/TableFilter";

const tabs = [ 'Weekly'];

export default function ExpensesPage() {
    const [reload, setReload] = useState(false);
    const { claims, loading: authLoading } = useAuth();
    const { data, loading, error } = useFetchData<Expense>(
        ExpenseService.getExpensesByBranch, 
        [reload, claims.branch.branchId], 
        [claims.branch.branchId]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['purpose']);
    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredItems, 20);

    const [tab, setTab] = useState('Weekly')
    const [open, setOpen] = useState(false);
    const [toUpdate, setUpdate] = useState<Expense | undefined>();
    const [toDelete, setDelete] = useState<Expense | undefined>(); 

    if (loading || authLoading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Expenses" />
            <div className="w-fit flex-center bg-slate-50 shadow-sm rounded-full">
                {tabs.map((item, i) => (
                    <Button
                        key={i}
                        onClick={ () => setTab(item) }
                        className={`w-30 rounded-full !bg-slate-50 text-dark hover:opacity-50 ${tab === item && "!bg-darkbrown text-light hover:opacity-100"}`}
                    >
                        { item }
                    </Button>
                ))}
            </div>
            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for an expense"
                setSize={ setSize }
                size={ size }
                buttonLabel="Add an expense"
                setOpen={ setOpen }
            />

            {tab === 'Weekly' && (
                <WeeklyExpenses
                    setUpdate={ setUpdate }
                    setDelete={ setDelete }
                    branchId={ claims.branch.branchId }
                    search={ search }
                    reload={ reload }
                    setReload={ setReload }
                />
            )}

            {open && (
                <CreateExpense
                    claims={ claims }
                    setOpen={ setOpen }
                    setReload={ setReload }
                /> 
            )}

            {toUpdate && (
                <UpdateExpense
                    claims={ claims }
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setOpen={ setOpen }
                    setReload={ setReload }
                /> 
            )}

            {toDelete && (
                <DeleteExpense
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            )}

        </section>
    );
}