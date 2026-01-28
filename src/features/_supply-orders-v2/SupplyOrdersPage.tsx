"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "./components/DatePicker";
import { useEffect, useState } from "react";
import { MonthPicker } from "./components/MonthPicker";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { mockSupplyOrders } from "@/mocks/mockSupplyOrders";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { SupplyOrder } from "@/types/supplyOrder";
import { EmptyState } from "@/components/custom/EmptyState";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";

const pageKey = "supplyOrderPage";

const statusList = ["PENDING", "APPROVED", "DELIVERED", "CANCELLED"];

const columns = [
    { title: 'Order ID' , style: '' },
    { title: 'Branch Name' , style: '' },
    { title: 'Status' , style: 'text-center' },
    { title: 'Total Amount' , style: '' },
    { title: 'Date Requested' , style: 'flex justify-end mr-4' },
]

export function SupplyOrdersPage() {
    const [reload, setReload] = useState(false);

    const [date, setDate] = useState<string>(""); 
    const [month, setMonth] = useState<string>("");
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    
    const [orders, setOrders] = useState<SupplyOrder[]>([]);

    const branchOptions = Array.from(
        new Set(mockSupplyOrders.map((o) => o.branchName))
    );

    useEffect(() => {
        const filteredOrders = mockSupplyOrders.filter((order) => {
            if (selectedBranch !== "all" && order.branchName !== selectedBranch) {
                return false;
            }

            if (selectedStatus !== "all" && order.status !== selectedStatus) {
                return false;
            }

            if (date && order.orderDate !== date) {
                return false;
            }

            if (month) {
                const orderMonth = order.orderDate.slice(0, 7);
                    const selectedMonth = month.slice(0, 7);
                    if (orderMonth !== selectedMonth) {
                    return false;
                }
            }

            return true;
        });
        setOrders(filteredOrders);
    }, [mockSupplyOrders, reload]);

    const { page, setPage, size, setSize, paginated } = usePagination(orders, 10, pageKey);


    return (
        <section className="stack-md py-2 animate-fade-in-up"> 
            <AppHeader label="Purchase Orders List" />

            <Separator className="bg-gray-300 my-2" />

            <div className="row-md">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                        <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent className="min-w-80 max-w-100">
                        <SelectGroup>
                            <SelectLabel>Branches</SelectLabel>
                            <SelectItem value="all">All branches</SelectItem>
                            <Separator className="bg-gray-300" />
                            {branchOptions.map((branch) => (
                                <SelectItem key={branch} value={branch}>
                                {branch}
                                </SelectItem>
                            ))}
                            </SelectGroup>
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="min-w-80 max-w-100">
                        <SelectItem value="all">All statuses</SelectItem>
                        <Separator className="bg-gray-300" />
                        {statusList.map((item) => (
                        <SelectItem key={item} value={item}>
                            {item}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DatePicker 
                    date={date}
                    setDate={setDate}
                />

                <MonthPicker 
                    date={month}
                    setDate={setMonth}
                />

                <Button
                    className="bg-darkgreen! shadow-sm hover:opacity-90"
                    onClick={() => setReload(prev => !prev)}
                >
                    <RefreshCcw />
                    Refresh
                </Button>

            </div>

            <div className="table-wrapper">
                <div className={`thead grid grid-cols-${columns.length}`}>
                    {columns.map((item) => (
                        <div 
                            key={item.title}
                            className="th"
                        >
                            {item.title}
                        </div>
                    ))}
                </div>

                <div 
                    className="animate-fade-in-up" 
                    key={`${page}-${reload ? "1" : "0"}`}
                >
                    {paginated.map((item) => (
                        <div className={`tdata grid grid-cols-${columns.length}`} key={item.orderId}>

                            <div className="td">
                                <Link 
                                    href={`/inventory/supply-orders/${item.orderId}`}
                                    className="underline hover:text-darkbrown hover:font-bold"
                                >
                                    {item.orderId}
                                </Link>
                            </div>

                            <div className="td">{item.branchName}</div>

                            <div className="td">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <OrderStatusBadge status={item.status} />
                                    </TooltipTrigger>
                                    <TooltipContent 
                                        className="mb-2 bg-lightbrown font-bold"
                                        showArrow={false}
                                    >
                                            {item.status}
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="td justify-between">
                                <div>₱</div>
                                <div>{formatToPeso(item.completeOrderTotalAmount).slice(1,)}</div>
                            </div>

                            <div className="td">
                                {formatDateToWords(item.orderDate)}
                            </div>
                            
                        </div>
                    ))}
                </div>
            </div>

            {orders.length === 0 && (
                <EmptyState />
            )}

            <TablePagination 
                data={orders}
                paginated={paginated}
                page={page}
                setPage={setPage}
                size={size}
                pageKey={pageKey}
            />
            
        </section>
    )
}