import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDateToWords, getWeekday } from "@/lib/formatter";
import { InventoryLog } from "@/types/inventory-log";
import dayjs from "dayjs"
import { ArrowBigDown, ArrowBigUp, CalendarClock, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
    logs: {
        "date": string,
        "logs": InventoryLog[]
    }[];
}

export function OrderLogs({ logs }: Props) {    
    return(
        <section className="space-y-4 animate-fade-in-up">
            {logs.map((item) => (
                <Accordion key={item.date} type="multiple" className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-base font-semibold text-darkbrown">{formatDateToWords(item.date)}</div>
                                <div className="rounded-sm bg-dark px-2 py-0.5 text-[10px] font-semibold text-light">
                                    {getWeekday(item.date)}
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                {item.logs.length} order-related inventory events recorded
                            </div>
                        </div>

                        <div className="rounded-md bg-white px-3 py-2 shadow-xs">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Order ID</div>
                            <div className="font-semibold text-slate-900">{item.logs[0].order?.id ?? "Not linked"}</div>
                        </div>
                    </div>

                    <AccordionItem value={item.date} className="border-none">
                        <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                            <div className="grid w-full gap-2 text-sm sm:grid-cols-3">
                                <div>
                                    Source: <span className="font-semibold text-slate-900">{item.logs[0].source}</span>
                                </div>
                                <div>
                                    Direction:{" "}
                                    <span className="font-semibold text-slate-900">
                                        {item.logs[0].type === "IN" ? "INGOING" : "OUTGOING"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-darkbrown" />
                                    <span className="font-semibold text-slate-900">{item.logs[0].branchName}</span>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="bg-slate-50/40 px-4 pb-4">
                            <div className="space-y-3">
                                {item.logs.map((subItem) => (
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
                </Accordion>
            ))}
        </section>
    );
}
