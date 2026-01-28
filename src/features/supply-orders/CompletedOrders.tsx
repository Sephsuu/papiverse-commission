"use client"

import { SupplyOrder } from "@/types/supplyOrder"
import { Download, FileSpreadsheet, MessageSquare, MessageSquareMore, SquareMinus, TableOfContents, Truck } from "lucide-react";
import { TableDataTooltip } from "../users/components/TableDataTooltip";
import { formatDateTime, formatToPeso } from "@/lib/formatter";
import { OrderStatusBadge } from "@/components/ui/badge";
import { FormLoader, SectionLoading } from "@/components/ui/loader";
import { Dispatch, SetStateAction, useState } from "react";
import { AddRemarks } from "./AddRemarks";
import Link from "next/link";
import { Claim } from "@/types/claims";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { InventoryService } from "@/services/inventory.service";
import { toast } from "sonner";
import { ModalTitle } from "@/components/shared/ModalTitle";

const columns = [
    { title: 'Branch Name' , style: '' },
    { title: 'Date Requested' , style: '' },
    { title: 'Status' , style: 'text-center' },
    { title: 'Order ID' , style: '' },
    { title: 'Total Amount' , style: '' },
]

export function CompletedOrders({ claims, paginated, setReload }: {
    claims: Claim;
    paginated: SupplyOrder[];
    setReload: Dispatch<SetStateAction<boolean>>;
}) {
    const [order, setOrder] = useState<SupplyOrder>();
    const [onProcess, setProcess] = useState(false);
    const [isDelivered, setDelivered] = useState<number>()

    async function handleReceived(id: number, meatApproved: boolean, snowApproved: boolean) {
        try {
            setProcess(true);
            await SupplyOrderService.updateOrderStatus(id, "DELIVERED", meatApproved, snowApproved);
            await InventoryService.createInventoryOrder({
                branchId: claims.branch.branchId,
                type: "IN",
                source: "ORDER",
                orderId: id,
            });
            toast.success('Order successfully marked as DELIVERED and supplies are added to inventory.')
        } catch (error) {
            console.log(error);
        } finally {
            setReload(prev => !prev);
            setProcess(false);
            setDelivered(undefined);
        }
    }

    if (!paginated) return <SectionLoading />
    return (
        <section className="table-wrapper animate-fade-in-up">
            <div className="flex-center-y thead max-md:!w-250">
                <div className="th"><SquareMinus className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="th"><Truck className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="grid grid-cols-5 w-full">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>
            </div>
            {paginated && paginated.length === 0 && (
                <div className="w-full text-center my-2 text-sm">There are no completed supply orders as of now.</div>
            )}
            {paginated.map((item, i) => (
                <div className="flex-center-y tdata max-md:!w-250" key={i}>
                    <Link href={`/inventory/supply-orders/${item.orderId}`}>
                        <TableDataTooltip
                            element={<TableOfContents className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                            content="View Full Order"
                            className="mx-auto td"
                        />
                    </Link>
                    {claims.roles[0] === 'FRANCHISOR' ? (
                        <TableDataTooltip
                            action={ () => setOrder(item) }
                            element={<MessageSquare className="w-4 h-4 text-gray mx-auto" strokeWidth={3} />}
                            content={ item.remarks || 'No remarks.'  }
                            className="mx-auto td"
                        />
                    ) : (
                        <div className="td flex-center">
                            <Checkbox
                                id={ String(item.orderId!) } 
                                checked={ item.status === "DELIVERED" }
                                onCheckedChange={ () => setDelivered(item.orderId) } 
                                className="border-dark data-[state=checked]:bg-blue data-[state=checked]:border-blue" 
                                disabled={item.status === "REJECTED" || item.status === "DELIVERED"} 
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-5 w-full">
                        <div className="td">{ item.branchName }</div>
                        <div className="td-wrap">{ formatDateTime(item.orderDate) }</div>
                        <div className="td"><OrderStatusBadge className="mx-auto" status={ item.status } /></div>
                        <div className="td">
                            <div>{ item.meatCategory?.meatOrderId }</div>
                            <div>{ item.snowfrostCategory?.snowFrostOrderId }</div>
                        </div>
                        <div className="td">{ formatToPeso(item.completeOrderTotalAmount) }</div>
                    </div>
                </div>
            ))}

            {order && (
                <AddRemarks 
                    claims={ claims }
                    order={ order }
                    setOrder={ setOrder }
                    setReload={ setReload }
                />
            )}

            <Dialog open={ Boolean(isDelivered) } onOpenChange={ (open) => { if (!open) setDelivered(undefined) } }>
                <DialogContent>
                    <ModalTitle 
                        label="Order is" 
                        spanLabel="DELIVERED?"
                        spanLabelClassName="!text-blue"
                    />
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <Button 
                            onClick={ () => handleReceived(isDelivered!, true, true) }
                            disabled={ onProcess }
                            size="sm"
                            className="!bg-darkgreen hover:opacity-90"
                        >
                            {!onProcess && <Truck className="w-4 h-4 text-light" />}
                            <FormLoader onProcess={ onProcess } label="Yes, Order is Delivered" loadingLabel="Processing Order" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </section>
    )
}