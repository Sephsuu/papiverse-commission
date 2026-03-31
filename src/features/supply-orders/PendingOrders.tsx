"use client"

import { SupplyOrder } from "@/types/supplyOrder"
import { AlertTriangle, BadgeCheck, CalendarArrowUp, MessageSquare, MessageSquareMore, SquareMinus, TableOfContents, Truck } from "lucide-react";
import { TableDataTooltip } from "../users/components/TableDataTooltip";
import { formatDateTime, formatToPeso } from "@/lib/formatter";
import { Badge, OrderStatusBadge } from "@/components/ui/badge";
import { SectionLoading } from "@/components/ui/loader";
import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { AddRemarks } from "./AddRemarks";
import Link from "next/link";
import { Claim } from "@/types/claims";
import { getCategoryIcon } from "@/hooks/use-helper";

const columns = [
    { title: 'Branch Name' , style: '' },
    { title: 'Date Requested' , style: '' },
    { title: 'Status' , style: 'text-center' },
    { title: 'Order ID' , style: '' },
    { title: 'Total Amount' , style: '' },
]

export function PendingOrders({ claims, paginated, setReload, orderShortages }: {
    claims: Claim;
    paginated: SupplyOrder[];
    setReload: Dispatch<SetStateAction<boolean>>;
    orderShortages?: Record<number, {
        count: number;
        summary: {
            name: string;
            unitMeasurement: string;
            requiredQuantity: number;
            availableQuantity: number;
            shortageQuantity: number;
            expectedDateAvailableQuantity?: number;
            expectedDateShortageQuantity?: number;
        }[];
    }>;
}) {
    const [order, setOrder] = useState<SupplyOrder>();
    const [hoveredOrderId, setHoveredOrderId] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    function handleRowMouseMove(event: MouseEvent<HTMLDivElement>, orderId: number) {
        setHoveredOrderId(orderId);
        setHoverPosition({
            x: event.clientX + 12,
            y: event.clientY + 12,
        });
    }

    if (!paginated) return <SectionLoading />
    return (
        <section className="table-wrapper animate-fade-in-up">
            <div className="flex-center-y thead max-md:w-250!">
                <div className="th"><SquareMinus className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="th"><MessageSquareMore className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="grid grid-cols-5 w-full">
                    {columns.map((item, _) => (
                    <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>
            </div>
            {paginated && paginated.length === 0 && (
                <div className="w-full text-center my-2 text-sm">There are no pending supply orders as of now.</div>
            )}
            {paginated.map((item, i) => (
                item.orderId && orderShortages?.[item.orderId] ? (
                    <div
                        className="flex-center-y tdata max-md:w-250! bg-red-50! cursor-pointer"
                        key={i}
                        onMouseEnter={(event) => handleRowMouseMove(event, item.orderId!)}
                        onMouseMove={(event) => handleRowMouseMove(event, item.orderId!)}
                        onMouseLeave={() => setHoveredOrderId(null)}
                    >
                        <Link href={`/inventory/supply-orders/${item.orderId}`}>
                            <TableDataTooltip
                                element={<TableOfContents className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                                content="View Full Order"
                                className="mx-auto td"
                            />
                        </Link>
                        <TableDataTooltip
                            action={ () => setOrder(item) }
                            element={<MessageSquare className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                            content={ item.remarks || 'No remarks.'  }
                            className="mx-auto td"
                        />
                        <div className="grid grid-cols-5 w-full">
                            <div className="td">{ item.branchName }</div>
                            <div className="td flex-col gap-1.5 items-start! justify-center!">
                                <div className="flex-center-y">
                                    <CalendarArrowUp className="w-4 h-4" /> 
                                    <span className="ml-1.5">{ formatDateTime(item.orderDate) }</span>
                                </div>
                                <div className="flex-center-y">
                                    <Truck className="w-3.5 h-3.5 text-slate-500" /> 
                                    <span className="ml-1.5 text-xs text-slate-500">{ formatDateTime(item.expectedDelivery) }</span>
                                </div>
                            </div>
                            <div className="td flex gap-2">
                                <OrderStatusBadge className="text-xs!" status={ item.status } />
                                {claims.roles[0] === 'FRANCHISOR' && (
                                    <Badge className="bg-darkred px-2 py-0.5 text-[10px]">
                                        <AlertTriangle className="h-3 w-3" />
                                        {orderShortages[item.orderId].count} short
                                    </Badge>
                                )}
                            </div>
                            <div className="td flex-col items-start! justify-center! gap-2">
                                {item.meatCategory?.meatOrderId && (
                                    <div className="flex-center-y gap-2">
                                        {getCategoryIcon("MEAT")}
                                        <span>{ item.meatCategory.meatOrderId }</span>
                                    </div>
                                )}
                                {item.snowfrostCategory?.snowFrostOrderId && (
                                    <div className="flex-center-y gap-2">
                                        {getCategoryIcon("SNOWFROST")}
                                        <span>{ item.snowfrostCategory.snowFrostOrderId }</span>
                                    </div>
                                )}
                            </div>
                            <div className="td justify-between">
                                <div>₱</div>
                                <span>{ formatToPeso(item.completeOrderTotalAmount).slice(1,) }</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex-center-y tdata max-md:w-250!"
                        key={i}
                    >
                        <Link href={`/inventory/supply-orders/${item.orderId}`}>
                            <TableDataTooltip
                                element={<TableOfContents className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                                content="View Full Order"
                                className="mx-auto td"
                            />
                        </Link>
                        <TableDataTooltip
                            action={ () => setOrder(item) }
                            element={<MessageSquare className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                            content={ item.remarks || 'No remarks.'  }
                            className="mx-auto td"
                        />
                        <div className="grid grid-cols-5 w-full">
                            <div className="td">{ item.branchName }</div>
                            <div className="td flex-col gap-1.5 items-start! justify-center!">
                                <div className="flex-center-y">
                                    <CalendarArrowUp className="w-4 h-4" /> 
                                    <span className="ml-1.5">{ formatDateTime(item.orderDate) }</span>
                                </div>
                                <div className="flex-center-y">
                                    <Truck className="w-3.5 h-3.5 text-slate-500" /> 
                                    <span className="ml-1.5 text-xs text-slate-500">{ formatDateTime(item.expectedDelivery) }</span>
                                </div>
                            </div>
                            <div className="td flex gap-2">
                                <OrderStatusBadge className="text-xs!" status={ item.status } />
                                {claims.roles[0] === 'FRANCHISOR' && (
                                    <Badge className="bg-darkgreen px-2 py-0.5 text-[10px]">
                                        <BadgeCheck className="h-3 w-3" />
                                        Ready
                                    </Badge>
                                )}
                            </div>
                            <div className="td flex-col items-start! justify-center! gap-2">
                                {item.meatCategory?.meatOrderId && (
                                    <div className="flex-center-y gap-2">
                                        {getCategoryIcon("MEAT")}
                                        <span>{ item.meatCategory.meatOrderId }</span>
                                    </div>
                                )}
                                {item.snowfrostCategory?.snowFrostOrderId && (
                                    <div className="flex-center-y gap-2">
                                        {getCategoryIcon("SNOWFROST")}
                                        <span>{ item.snowfrostCategory.snowFrostOrderId }</span>
                                    </div>
                                )}
                            </div>
                            <div className="td justify-between">
                                <div>₱</div>
                                <span>{ formatToPeso(item.completeOrderTotalAmount).slice(1,) }</span>
                            </div>
                        </div>
                    </div>
                )
            ))}

            {order && (
                <AddRemarks 
                    claims={ claims }
                    order={ order }
                    setOrder={ setOrder }
                    setReload={ setReload }
                />
            )}

            {typeof document !== "undefined" && hoveredOrderId && orderShortages?.[hoveredOrderId] && createPortal(
                <div
                    className="pointer-events-none fixed z-[9999] w-80 rounded-md border bg-popover p-4 text-xs text-popover-foreground shadow-md animate-fade-in-up"
                    style={{
                        left: hoverPosition.x,
                        top: hoverPosition.y,
                    }}
                    key={hoveredOrderId}
                >
                    <div className="space-y-1 normal-case">
                        {orderShortages[hoveredOrderId].summary.map((shortage) => (
                            <div key={shortage.name} className="rounded-md border border-slate-200 bg-white/80 p-2">
                                <div className="font-semibold">{shortage.name}</div>
                                <div className="mt-1 flex items-center gap-1 text-slate-600">
                                    <span>Short now:</span>
                                    <span className="font-semibold text-darkred">
                                        {shortage.shortageQuantity.toFixed(2)} {shortage.unitMeasurement}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                    <span>Short on expected date:</span>
                                    <span className="font-semibold text-darkred">
                                        {(shortage.expectedDateShortageQuantity ?? 0).toFixed(2)} {shortage.unitMeasurement}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}

        </section>
    )
}
