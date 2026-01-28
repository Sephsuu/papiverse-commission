"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { PapiverseLoading } from "@/components/ui/loader";
import { DateRangePicker } from "@/features/dashboard/components/DataRangePicker";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { formatToPeso } from "@/lib/formatter";
import { SalesService } from "@/services/sales.service";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Fragment, useState } from "react";

const today = format(new Date(), "yyyy-MM-dd");
const pageKey = "branchRankingPage";

const columns = [
    { title: "Branch Name", style: "" },
    { title: "Total Sales", style: "" },
];

export function BranchRankingPage() {
    const [reload, setReload] = useState(false);
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);

    const { data: branches, loading } = useFetchData<{
        branchName: string;
        totalSales: number;
    }>(
        SalesService.getBranchRankings,
        [reload],
        [startDate, endDate]
    );

    const {
        page,
        setPage,
        size,
        paginated,
    } = usePagination(branches, 10, pageKey);

    if (loading) return <PapiverseLoading />;

    return (
        <section className="stack-md animate-fade-in-up">
            <AppHeader label="Branch Sales Ranking" />

            <div className="flex-center-y gap-2">
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                <Button
                    onClick={() => setReload(prev => !prev)}
                    className="bg-darkorange"
                    size="sm"
                >
                    <RefreshCcw /> Refresh
                </Button>
            </div>

            <div className="table-wrapper">
                {(!branches || branches.length === 0) ? (
                    <div className="py-10 text-center text-muted-foreground">
                        <p className="text-sm font-medium">No branch sales found</p>
                        <p className="text-xs">
                            Try adjusting the date range or click refresh.
                        </p>
                    </div>
                ) : (
                    <Fragment>
                        <div className="thead flex-center-y">
                            <div className="w-20 flex-center">#</div>
                            <div className="w-full grid grid-cols-2">
                                {columns.map((item, index) => (
                                    <div key={index} className={`th ${item.style}`}>
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {paginated.map((item, i) => (
                            <div
                                key={`${item.branchName}-${i}`}
                                className="tdata flex-center-y"
                            >
                                <div className="w-20 flex-center font-semibold">
                                    {(page + 1 - 1) * size + i + 1}
                                </div>
                                <div className="w-full grid grid-cols-2">
                                    <div className="td">{item.branchName}</div>
                                    <div className="td font-semibold">
                                        {formatToPeso(item.totalSales)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Fragment>
                )}
            </div>

            <TablePagination
                data={branches}
                paginated={paginated}
                page={page}
                size={size}
                setPage={setPage}
                pageKey={pageKey}
            />
        </section>
    );
}
