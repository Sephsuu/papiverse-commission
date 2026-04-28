import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDateToWords, formatToPeso, getWeekday } from "@/lib/formatter";
import { InventoryLog } from "@/types/inventory-log";
import dayjs from "dayjs"
import { ArrowBigDown, ArrowBigUp, Boxes, CalendarClock, CircleDollarSign, ScanText } from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface Props {
    logs: {
        "date": string,
        "logs": InventoryLog[]
    }[];
}

export function InputLogs({ logs }: Props) {
    return(
        <section className="space-y-4 animate-fade-in-up">
            {logs.map((item) => {
                const inputCount = item.logs.filter((subItem) => subItem.type === "IN").length;
                const outputCount = item.logs.filter((subItem) => subItem.type === "OUT").length;
                const productionLogs = item.logs.filter(
                    (subItem) => (subItem.businessEvent ?? "").trim() === "PRODUCTION"
                );
                const totalCapital = productionLogs.reduce(
                    (sum, subItem) => sum + (subItem.capitalAmount ?? 0),
                    0
                );
                const totalSales = productionLogs.reduce(
                    (sum, subItem) => sum + (subItem.salesAmount ?? 0),
                    0
                );
                const totalProfit = totalSales - totalCapital;

                return (
                    <Accordion type="multiple" key={item.date} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-base font-semibold text-darkbrown">{formatDateToWords(item.date)}</div>
                                <div className="rounded-sm bg-dark px-2 text-[10px] font-semibold text-light">
                                    {getWeekday(item.date)}
                                </div>

                                <div className="ml-4 grid grid-cols-3 gap-2">
                                    <div className="space-x-2 p-2 border bg-white rounded-md">
                                        <span className="text-gray text-xs">Total Capital</span>
                                        <span className="text-sm font-semibold">{formatToPeso(Number(totalCapital.toFixed(2)))}</span>
                                    </div>
                                    <div className="space-x-2 p-2 border bg-white rounded-md">
                                        <span className="text-gray text-xs">Amount</span>
                                        <span className="text-sm font-semibold">{formatToPeso(Number(totalSales.toFixed(2)))}</span>
                                    </div>
                                    <div className="space-x-2 p-2 border bg-white rounded-md">
                                        <span className="text-gray text-xs">Projected Profit</span>
                                        <span className="text-sm font-semibold text-darkgreen">{formatToPeso(Number(totalProfit.toFixed(2)))}</span>
                                    </div>
                                </div>
                            </div>
                                
                            <div className="flex-center-y gap-4 my-auto sm:w-auto">
                                <div className="flex-center-y">
                                    <span className="text-darkgreen font-semibold">IN</span>
                                    <span className="ml-2 text-gray font-semibold">{inputCount}</span>
                                </div>
                                <div className="flex-center-y">
                                    <span className="text-darkred font-semibold">OUT</span>
                                    <span className="ml-2 text-gray font-semibold">{outputCount}</span>
                                </div>
                            </div>
                        </div>

                        <AccordionItem value={String(item.date)} className="border-none">
                            <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                                <div className="grid w-full gap-2 text-sm sm:grid-cols-3">
                                    <div>
                                        Source: <span className="font-semibold text-slate-900">{item.logs[0].source}</span>
                                    </div>
                                    <div>
                                        Branch: <span className="font-semibold text-slate-900">{item.logs[0].branchName}</span>
                                    </div>
                                    <div>
                                        Last activity:{" "}
                                        <span className="font-semibold text-slate-900">
                                            {dayjs(item.logs[0].dateTime).format("h:mm A")}
                                        </span>
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

                                                <div className="flex flex-col items-end gap-2">
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
                                                    <span className="text-gray text-xs">{dayjs(subItem.dateTime).format("ddd, MMM D, YYYY h:mm A")}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                                <div className="rounded-md bg-slate-50 px-3 py-3">
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                        <ScanText className="h-4 w-4" />
                                                        Event
                                                    </div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {subItem.businessEvent ?? "Manual inventory adjustment"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-slate-50 px-3 py-3">
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                        <CircleDollarSign className="h-4 w-4" />
                                                        Capital
                                                    </div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {(subItem.businessEvent ?? "").trim() === "PRODUCTION" && subItem.capitalAmount != null
                                                            ? `PHP ${subItem.capitalAmount.toFixed(2)}`
                                                            : "Not available"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-slate-50 px-3 py-3">
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                        <CircleDollarSign className="h-4 w-4" />
                                                        Sales
                                                    </div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {(subItem.businessEvent ?? "").trim() === "PRODUCTION" && subItem.salesAmount != null
                                                            ? `PHP ${subItem.salesAmount.toFixed(2)}`
                                                            : "Not available"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-slate-50 px-3 py-3">
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                        <CircleDollarSign className="h-4 w-4" />
                                                        Profit
                                                    </div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {(subItem.businessEvent ?? "").trim() === "PRODUCTION" &&
                                                        subItem.salesAmount != null &&
                                                        subItem.capitalAmount != null
                                                            ? `PHP ${(subItem.salesAmount - subItem.capitalAmount).toFixed(2)}`
                                                            : "Not available"}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-slate-50 px-3 py-3">
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                                                        <Boxes className="h-4 w-4" />
                                                        Effective Date
                                                    </div>
                                                    <div className="mt-2 font-medium text-slate-900">
                                                        {subItem.effectiveDate
                                                            ? formatDateToWords(subItem.effectiveDate)
                                                            : "Matches log timestamp"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            })}
        </section>
    );
}
