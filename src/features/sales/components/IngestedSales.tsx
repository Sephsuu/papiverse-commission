"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { Inbox, Plus, X } from "lucide-react";

const columns = [
    { title: "Order ID", style: "" },
    { title: "Products", style: "" }
];

export function IngestedSales({
    paidOrders,
    selectedDay,
    setView,
    setOpen,
    className
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
    selectedDay: string;
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
    setOpen?: (i: boolean) => void;
    className?: string;
}) {
    const { setSearch, filteredItems: searchedItems } = useSearchFilter(paidOrders, ["orderId"]);

    const [paymentMode, setPaymentMode] = useState<string>("ALL");
    const [orderType, setOrderType] = useState<string>("ALL");

    const filteredItems = useMemo(() => {
        return searchedItems.filter(item => {
            const itemPaymentMode = item.cash !== 0 ? "Cash" : "Gcash";

            const matchesPayment =
                paymentMode === "ALL" ||
                itemPaymentMode.toLowerCase() === paymentMode.toLowerCase();

            const matchesOrderType =
                orderType === "ALL" ||
                item.orderType.toLowerCase() === orderType.toLowerCase();

            return matchesPayment && matchesOrderType;
        });
    }, [searchedItems, paymentMode, orderType]);

    return (
        <section className={`py-2 space-y-2 ${className}`}>
            <div className="text-lg font-semibold">
                Ingested Orders on
                <span className="text-darkbrown"> {formatDate(selectedDay)}</span>
            </div>

            <div className="flex-center-y gap-2">
                <Input
                    placeholder="Search for a paid order"
                    onChange={e => setSearch(e.target.value)}
                />
                <Button
                    onClick={() => setOpen?.(true)}
                    className="!bg-darkgreen hover:opacity-90"
                    size="sm"
                    disabled={paidOrders.length > 0}
                >
                    <Plus /> Insert Excel
                </Button>
            </div>

            <div className="flex-center-y gap-2">
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="bg-light !h-8">
                        <SelectValue placeholder="Select Payment Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Payment Modes</SelectLabel>
                            <SelectItem value="ALL">All Payment Methods</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Gcash">Gcash</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger className="bg-light !h-8">
                        <SelectValue placeholder="Select Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Order Types</SelectLabel>
                            <SelectItem value="ALL">All Order Types</SelectItem>
                            <SelectItem value="Dine-in">Dine-in</SelectItem>
                            <SelectItem value="Takeaway">Takeaway</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <button
                    onClick={ () => setView(paidOrders) }
                    className="text-sm ms-auto hover:font-semibold hover:underline"
                >
                    View Full
                </button>
            </div>

            <ScrollArea className="table-wrapper h-[120vh]">
                <div className="thead grid grid-cols-2 sticky top-0">
                    {columns.map(item => (
                        <div className="td" key={item.title}>
                            {item.title}
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 ? (
                    <div className="flex-center flex-col w-full bg-light h-100 rounded-b-md">
                        <Inbox className="w-30 h-30 text-gray-300" strokeWidth={2} />
                        <div className="text-gray text-center text-sm">
                            No matching sales found for {formatDateToWords(selectedDay)}
                        </div>
                    </div>
                ) : (
                    filteredItems.map((item, i) => (
                        <div
                            className="tdata grid grid-cols-2 !border-gray !border-b-1"
                            key={i}
                        >
                            <div className="td border-r-1">
                                <div className="font-semibold text-xs">ORDER ID</div>
                                <div>{item.orderId}</div>

                                <div className="font-semibold text-xs mt-2">PAYMENT TYPE</div>
                                <div>{item.cash !== 0 ? "Cash" : "G-cash"}</div>

                                <div className="font-semibold text-xs mt-2">ORDER TYPE</div>
                                <div>{item.orderType}</div>

                                <div className="font-semibold text-xs mt-3">TOTAL AMOUNT</div>
                                <div className="font-bold text-darkgreen">
                                    {formatToPeso(item.totalPaid)}
                                </div>
                            </div>

                            <div className="td">
                                {item.items.map((subItem, i) => (
                                    <div className="flex-center-y gap-1 py-1" key={i}>
                                        <p>{subItem.productName}</p>
                                        <X className="w-3 h-3" />
                                        {subItem.quantity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </ScrollArea>
        </section>
    );
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
