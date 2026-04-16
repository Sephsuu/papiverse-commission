import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDateToWords, getWeekday } from "@/lib/formatter";
import { InventoryLog } from "@/types/inventory-log";
import dayjs from "dayjs"
import { ArrowBigDown, ArrowBigUp, CalendarArrowUp, CalendarClock, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
    logs: {
        "date": string,
        "logs": InventoryLog[]
    }[];
}

export function OrderLogs({ logs }: Props) {    
    return(
        <section className="space-y-4 animate-fade-in-up">
            {logs.map((item) => {
                const groupedOrders = Object.values(
                    item.logs.reduce<Record<string, { key: string; logs: InventoryLog[] }>>((acc, log) => {
                        const orderKey = String(log.order?.id ?? `unlinked-${log.id}`);

                        if (!acc[orderKey]) {
                            acc[orderKey] = { key: orderKey, logs: [] };
                        }

                        acc[orderKey].logs.push(log);
                        return acc;
                    }, {})
                );

                return (
                    <div key={item.date} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="text-base font-semibold text-darkbrown">{formatDateToWords(item.date)}</div>
                                    <div className="rounded-sm bg-dark px-2 py-0.5 text-[10px] font-semibold text-light">
                                        {getWeekday(item.date)}
                                    </div>
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                    {item.logs.length} order-related inventory events across {groupedOrders.length} order{groupedOrders.length > 1 ? "s" : ""}
                                </div>
                            </div>

                            <div className="rounded-md bg-white px-3 py-2 shadow-xs">
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Orders Recorded</div>
                                <div className="font-semibold text-slate-900">{groupedOrders.length}</div>
                            </div>
                        </div>

                        <Accordion type="multiple" className="bg-slate-50/40 px-4 py-4">
                            {groupedOrders.map((group) => {
                                const firstLog = group.logs[0];
                                const orderLabel = firstLog.order?.meatOrderId || firstLog.order?.snowOrderId || `Order #${firstLog.order?.id ?? "N/A"}`;

                                return (
                                    <AccordionItem
                                        key={`${item.date}-${group.key}`}
                                        value={`${item.date}-${group.key}`}
                                        className="mb-2 overflow-hidden rounded-xl border border-slate-200 bg-light shadow-xs last:mb-0"
                                    >
                                        <AccordionTrigger className="px-4 py-4 text-left hover:no-underline data-[state=open]:bg-lightbrown/10">
                                            <div className="grid w-full gap-3 lg:grid-cols-[1.3fr_1fr_1fr]">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="truncate text-sm font-semibold text-slate-900">
                                                            {orderLabel}
                                                        </span>
                                                        <Badge className="bg-light text-darkbrown">
                                                            {group.logs.length} item{group.logs.length > 1 ? "s" : ""}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex-center-y mt-1 text-xs text-slate-500">
                                                        <CalendarArrowUp className="w-3 h-3 mr-1" />
                                                        {formatDateToWords(firstLog.dateTime ?? 'No date available')}
                                                        <Truck className="w-3 h-3 mr-1 ml-2.5" />
                                                        {formatDateToWords(firstLog.effectiveDate ?? 'No date available')}
                                                    </div>
                                                </div>

                                                <div className="text-sm">
                                                    Source: <span className="font-semibold text-slate-900">{firstLog.source}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Truck className="h-4 w-4 text-darkbrown" />
                                                    <span className="font-semibold text-slate-900">{firstLog.order?.orderDestination}</span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="border-t border-slate-100 bg-lightbrown/5 px-4 pb-4 pt-4">
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-md bg-white px-3 py-3">
                                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Order ID</div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {firstLog.order?.id ?? "Not linked"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-white px-3 py-3">
                                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Meat PO</div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {firstLog.order?.meatOrderId ?? "Not available"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-white px-3 py-3">
                                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Snow PO</div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {firstLog.order?.snowOrderId ?? "Not available"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-white px-3 py-3">
                                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Destination</div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {firstLog.order?.orderDestination ?? "Not available"}
                                                    </div>
                                                </div>
                                            </div>

                                            {firstLog.order?.id && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="my-2 border-lightbrown/60 bg-white text-darkbrown hover:bg-lightbrown/20"
                                                    >
                                                        <Link href={`/inventory/supply-orders/${firstLog.order.id}`}>
                                                            View Order
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {group.logs.map((subItem) => (
                                                    <div
                                                        key={subItem.id}
                                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                                                    >
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="truncate font-semibold text-slate-900">
                                                                        {subItem.rawMaterialName}
                                                                    </div>
                                                                    <Badge
                                                                        className={
                                                                            subItem.type === "IN"
                                                                                ? "bg-emerald-100 text-darkgreen"
                                                                                : "bg-red-100 text-darkred"
                                                                        }
                                                                    >
                                                                        {subItem.type === "IN" ? "INGOING" : "OUTGOING"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="mt-1 text-xs text-slate-500">
                                                                    {subItem.rawMaterialCode} • {subItem.unitMeasurement}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                                {subItem.type === "IN" ? (
                                                                    <ArrowBigUp className="h-4 w-4 text-darkgreen" fill="#014421" />
                                                                ) : (
                                                                    <ArrowBigDown className="h-4 w-4 text-darkred" fill="#731c13" />
                                                                )}
                                                                <span className={subItem.type === "IN" ? "text-darkgreen" : "text-darkred"}>
                                                                    {subItem.quantityChanged} {subItem.unitMeasurement}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            <div className="rounded-md bg-slate-50 px-3 py-3">
                                                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                                    <Package className="h-4 w-4" />
                                                                    Order Destination
                                                                </div>
                                                                <div className="mt-2 font-medium text-slate-900">
                                                                    {subItem.order?.orderDestination ?? "Not available"}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md bg-slate-50 px-3 py-3">
                                                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                                    <CalendarClock className="h-4 w-4" />
                                                                    Timestamp
                                                                </div>
                                                                <div className="mt-2 font-medium text-slate-900">
                                                                    {dayjs(subItem.dateTime).format("ddd, MMM D, YYYY h:mm A")}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md bg-slate-50 px-3 py-3">
                                                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                                                    Business Event
                                                                </div>
                                                                <div className="mt-2 font-medium text-slate-900">
                                                                    {subItem.businessEvent ?? "Order movement"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                );
            })}
        </section>
    );
}
