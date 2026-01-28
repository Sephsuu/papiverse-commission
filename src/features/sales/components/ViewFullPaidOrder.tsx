"use client";

import { Dispatch, Fragment, SetStateAction, useMemo, useState } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PapiverseLoading } from "@/components/ui/loader";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { ArrowLeft, Inbox, Plus, RefreshCcw, X } from "lucide-react";

const pageKey = "ingestedSalesPage";

const columns = [
    { title: "Order ID", style: "" },
    { title: "Payment Mode", style: "" },
    { title: "Order Type", style: "" },
    { title: "Total Amount", style: "" },
    { title: "Products", style: "" },
];


export function ViewFullPaidOrder({
    paidOrders,
    selectedDay,
    setOpen,
    className,
    setView
}: {
    paidOrders: {
        orderId: string;
        cash: number;
        orderType: string;
        totalPaid: number;
        items: {
            productName: string;
            quantity: number;
        }[];
    }[];
    setView: Dispatch<SetStateAction<{
        orderId: string;
        cash: number;
        orderType: string;
        totalPaid: number;
        items: {
            productName: string;
            quantity: number;
        }[];
    }[] | undefined>>
    selectedDay: string;
    setOpen?: (i: boolean) => void;
    className?: string;
}) {
    const { setSearch, filteredItems: searchedItems } = useSearchFilter(
        paidOrders,
        ["orderId"]
    );

    const [paymentMode, setPaymentMode] = useState("ALL");
    const [orderType, setOrderType] = useState("ALL");

    const filteredItems = useMemo(() => {
        return searchedItems.filter(item => {
            const payment = item.cash !== 0 ? "Cash" : "Gcash";

            const matchPayment =
                paymentMode === "ALL" ||
                payment.toLowerCase() === paymentMode.toLowerCase();

            const matchOrderType =
                orderType === "ALL" ||
                item.orderType.toLowerCase() === orderType.toLowerCase();

            return matchPayment && matchOrderType;
        });
    }, [searchedItems, paymentMode, orderType]);

    const {
        page,
        setPage,
        size,
        paginated,
    } = usePagination(filteredItems, 5, pageKey);

    if (!paidOrders) return <PapiverseLoading />;

    return (
        <section className={`stack-md animate-fade-in-up ${className}`}>
            <div className="flex-center-y gap-3">
                <ArrowLeft 
                    className="w-8 h-8"
                    onClick={ () => setView(undefined) }
                />
                <AppHeader
                    label={`Ingested Orders — ${formatDateToWords(selectedDay)}`}
                />
            </div>

            {/* Search + Actions */}
            <div className="flex-center-y gap-2">
                <Input
                    placeholder="Search order ID"
                    onChange={e => setSearch(e.target.value)}
                />

                <Button
                    onClick={() => setOpen?.(true)}
                    className="bg-darkgreen"
                    size="sm"
                    disabled={paidOrders.length > 0}
                >
                    <Plus /> Insert Excel
                </Button>
            </div>

            {/* Filters */}
            <div className="flex-center-y gap-2">
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="bg-light h-8">
                        <SelectValue placeholder="Payment Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Payment Mode</SelectLabel>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Gcash">Gcash</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger className="bg-light h-8">
                        <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Order Type</SelectLabel>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="Dine-in">Dine-in</SelectItem>
                            <SelectItem value="Takeaway">Takeaway</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                {filteredItems.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                        <Inbox className="mx-auto h-10 w-10 opacity-40" />
                        <p className="text-sm font-medium">
                            No matching sales found
                        </p>
                        <p className="text-xs">
                            for {formatDateToWords(selectedDay)}
                        </p>
                    </div>
                ) : (
                    <Fragment>
                        <div className="thead flex-center-y">
                            <div className="w-16 flex-center">#</div>
                            <div className="w-full grid grid-cols-5">
                                {columns.map(col => (
                                    <div key={col.title} className="th">
                                        {col.title}
                                    </div>
                                ))}
                            </div>
                        </div>


                        {paginated.map((item, i) => (
                            <div
                                key={item.orderId}
                                className="tdata flex-center-y"
                            >
                                {/* Rank */}
                                <div className="w-16 flex-center font-semibold">
                                    {(page + 1 - 1) * size + i + 1}
                                </div>

                                <div className="w-full grid grid-cols-5">
                                    {/* Order ID */}
                                    <div className="td font-medium">
                                        {item.orderId}
                                    </div>

                                    {/* Payment Mode */}
                                    <div className="td">
                                        {item.cash !== 0 ? "Cash" : "Gcash"}
                                    </div>

                                    {/* Order Type */}
                                    <div className="td">
                                        {item.orderType}
                                    </div>

                                    {/* Total Amount */}
                                    <div className="td font-semibold text-darkgreen">
                                        {formatToPeso(item.totalPaid)}
                                    </div>

                                    {/* Products */}
                                    <div className="td">
                                        {item.items.map((p, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-center-y gap-1 py-1"
                                            >
                                                <span>{p.productName}</span>
                                                <X className="w-3 h-3" />
                                                {p.quantity}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </Fragment>
                )}
            </div>

            {/* Pagination */}
            <TablePagination
                data={filteredItems}
                paginated={paginated}
                page={page}
                size={size}
                setPage={setPage}
                pageKey={pageKey}
            />
        </section>
    );
}
