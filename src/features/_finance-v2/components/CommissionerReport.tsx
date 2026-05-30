"use client";

import { useFetchData } from "@/hooks/use-fetch-data";
import { formatToPeso } from "@/lib/formatter";
import { CommissionOwnerService } from "@/services/commissionOwner.service";
import { MonthlyCommissionReportResponse } from "@/types/commissionOwner";
import { SectionLoading } from "@/components/ui/loader";

function toProperCase(text: string) {
  return text.charAt(0).toUpperCase() +
         text.slice(1).toLowerCase();
}

export function CommissionerReport({ month }: { month: string }) {
    const fetchCommissionReport = async (selectedMonth: string) => {
        const data = await CommissionOwnerService.getMonthlyCommissionReport(selectedMonth);
        return { content: [data] };
    };

    const { data, loading } = useFetchData<MonthlyCommissionReportResponse>(
        fetchCommissionReport,
        [month],
        [month],
        0,
        1000,
        !!month
    );

    const report = data[0] ?? {
        month,
        commissions: [],
    };

    const overall = report.commissions.reduce(
        (acc, curr) => ({
            gross: acc.gross + (curr.totals?.gross ?? 0),
            total_capital: acc.total_capital + (curr.totals?.total_capital ?? 0),
            net: acc.net + (curr.totals?.net ?? 0),
        }),
        { gross: 0, total_capital: 0, net: 0 }
    );

    if (loading) return <SectionLoading />

    return (
        <section className="stack-md animate-fade-in-up">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Gross</p>
                    <p className="mt-2 text-2xl font-semibold">{formatToPeso(overall.gross)}</p>
                    <p className="mt-1 text-sm text-slate-500">Total gross sales across all owners</p>

                </div>
                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Commission Capital</p>
                    <p className="mt-2 text-2xl font-semibold">{formatToPeso(overall.total_capital)}</p>
                    <p className="mt-1 text-sm text-slate-500">Sum of total capital across all owners</p>
                </div>
                <div className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Net Commission</p>
                    <p className="mt-2 text-2xl font-semibold">{formatToPeso(overall.net)}</p>
                    <p className="mt-1 text-sm text-slate-500">Overall net commission for selected month</p>
                </div>
            </div>

            <div className="space-y-3">
                {report.commissions.map((group) => (
                    <div key={group.person} className="rounded-md border border-slate-300 bg-white p-3 shadow-sm">
                        <div className="mb-3 grid gap-2 md:grid-cols-4">
                            <div className="rounded-md bg-light/50 p-3 text-sm border border-slate-200 shadow-xs">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-dark/50">Commissioner</div>
                                <div className="font-semibold text-xl mt-1 text-darkbrown">{toProperCase(group.person)}</div>
                            </div>
                            <div className="rounded-md bg-light/50 p-3 text-sm border border-slate-200 shadow-xs">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-darkbrown">Total Gross</div>
                                <div className="font-semibold text-xl mt-1">{formatToPeso(group.totals.gross)}</div>
                            </div>
                            <div className="rounded-md bg-light/50 p-3 text-sm border border-slate-200 shadow-xs">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-darkbrown">Total Capital</div>
                                <div className="font-semibold text-xl mt-1">{formatToPeso(group.totals.total_capital)}</div>
                            </div>
                            <div className="rounded-md bg-light/50 p-3 text-sm border border-slate-200 shadow-xs">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-darkbrown">Total Net Commission</div>
                                <div className="font-semibold text-xl mt-1 text-darkgreen">{formatToPeso(group.totals.net)}</div>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <div className="thead grid grid-cols-7">
                                <div className="th">Product</div>
                                <div className="th">Qty</div>
                                <div className="th">Capital</div>
                                <div className="th">SRP</div>
                                <div className="th">Gross</div>
                                <div className="th">Total Capital</div>
                                <div className="th">Net</div>
                            </div>

                            {group.items.length === 0 ? (
                                <div className="tdata text-sm text-gray p-4 text-center">No sales for this month</div>
                            ) : (
                                group.items.map((item, index) => (
                                    <div key={`${group.person}-${item.product}-${index}`} className="tdata grid grid-cols-7">
                                        <div className="td">{item.product}</div>
                                        <div className="td">{item.qty}</div>
                                        <div className="td justify-between"><span>₱</span>{formatToPeso(item.capital).slice(1,)}</div>
                                        <div className="td justify-between"><span>₱</span>{formatToPeso(item.srp).slice(1,)}</div>
                                        <div className="td justify-between"><span>₱</span>{formatToPeso(item.gross).slice(1,)}</div>
                                        <div className="td justify-between"><span>₱</span>{formatToPeso(item.total_capital).slice(1,)}</div>
                                        <div className="td justify-between font-semibold"><span>₱</span>{formatToPeso(item.net).slice(1,)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
