"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormLoader, PapiverseLoading } from "@/components/ui/loader";
import { Toaster } from "@/components/ui/sonner";
import { formatDateToWords, formatToPeso, getWeekday } from "@/lib/formatter";
import { Expense } from "@/types/expense";
import { Info, SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { UpdateExpense } from "./UpdateExpense";
import { ExpenseService } from "@/services/expense.service";

interface Props {
    setUpdate: React.Dispatch<React.SetStateAction<Expense | undefined>>;
    setDelete: React.Dispatch<React.SetStateAction<Expense | undefined>>;
    branchId: number;
    search: string;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WeeklyExpenses({ branchId, search, reload, setReload, setUpdate, setDelete }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ExpenseService.getExpensesByBranch(branchId);
                setExpenses(data);
            } catch (error) { toast.error(`${error}`) }
            finally { setLoading(false) }
        }
        fetchData();
    }, [reload]);

    useEffect(() => {
        const find = search.toLowerCase().trim();
        if (find !== '') {
            setFilteredExpenses(expenses.filter(
                (i) => i.firstName!.toLowerCase().includes(find) ||
                i.lastName!.toLowerCase().includes(find) ||
                i.purpose!.toLowerCase().includes(find)
            ))
        } else setFilteredExpenses(expenses);
    }, [search, expenses]);

    const groupedExpenses = filteredExpenses.reduce<Record<string, Expense[]>>((acc, expense) => {
        if (!acc[expense.date]) {
            acc[expense.date] = [];
        }
        acc[expense.date].push(expense);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedExpenses).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const totalExpenses = expenses.reduce((acc, curr) => (
        acc + curr.expense
    ), 0);

    if (loading) return <PapiverseLoading className="!h-fit mt-36" />
    return(
        <section className="w-full">            
            {sortedDates.map((date) => {
                const totalForDate = groupedExpenses[date].reduce((sum, expense) => sum + expense.expense, 0);
                return(
                    <div key={ date } className="table-wrapper">
                        <div className="thead grid bg-slate-200 p-2 rounded-sm shadow-sm">
                            <div className="flex justify-between mx-2">
                                <div className="flex gap-1 items-center">
                                    <div className="font-bold text-md">{formatDateToWords(date)}</div>
                                    <div className="bg-dark h-fit rounded-sm text-light px-2 font-semibold text-[10px]">{ getWeekday(date) }</div>
                                </div>
                                <div className="mr-4 font-semibold">Total: <span className="text-darkred">{ formatToPeso(totalForDate) }</span></div>
                            </div>

                            {groupedExpenses[date].map((expense, index) => (
                                <div key={index} className="grid grid-cols-7 px-4 py-2 bg-gray-100 rounded-sm my-0.5 shadown-sm max-md:grid-cols-4">
                                    <div className="flex gap-2 items-center col-span-2 max-md:col-span-1">
                                        <div className="w-8 h-8 bg-brown text-light flex items-center justify-center rounded-full font-semibold">{ expense.firstName![0] }{ expense.lastName![0] }</div>
                                        <div className="font-semibold text-sm">{ expense.firstName } { expense.lastName }</div>
                                    </div>
                                    <div className="col-span-3 max-md:col-span-1">
                                        <div className="text-md text-sm font-semibold">{expense.purpose}</div>
                                        <div className="text-xs text-gray font-semibold">{expense.paymentMode}</div>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-start">
                                        <div className="font-semibold">{ formatToPeso(expense.expense) }</div>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <button onClick={ () => setUpdate(expense) }><SquarePen className="w-4 h-4 text-darkgreen"/></button>
                                        <button><Info className="w-4 h-4"/></button>
                                        <button onClick={ () => setDelete(expense) }><Trash2 className="w-4 h-4 text-darkred"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            <div className="text-gray text-sm">Showing { filteredExpenses.length.toString() } of { filteredExpenses.length.toString() } results.</div>
  
        </section>
    );
}