import { Badge, OrderStatusLabel, QuantityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormLoader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { OrderModalSkeleton } from "@/components/ui/skeleton";
import { ToastError } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Claim } from "@/types/claims";
import { Inventory } from "@/types/inventory";
import { Supply } from "@/types/supply";
import { SupplyOrder } from "@/types/supplyOrder";
import { Ham, Snowflake } from "lucide-react";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    claims: Claim;
    editable?: true | boolean;
    toView: SupplyOrder;
    setToView: (i: SupplyOrder | undefined) => void;
    setReload: React.Dispatch<SetStateAction<boolean>>;
}

export function ViewOrderModal({ claims, editable = true, toView, setToView, setReload }: Props) {
    const [loading, setLoading] = useState(true); 
    const [onProcess, setProcess] = useState(false);
    const [reject, setReject] = useState(false);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [meatApproved, setMeatApproved] = useState<boolean>(toView.meatCategory!.isApproved);
    const [snowApproved, setSnowApproved] = useState<boolean>(toView.snowfrostCategory!.isApproved);

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const data = await InventoryService.getInventoryByBranch(claims.branch.branchId);
    //             setInventory(data);
    //             setLoading(false);
    //         } catch (error) { `${error}` }
    //     }
    //     fetchData();
    // }, []);

    function enableSave(meatApproved: boolean, snowApproved: boolean) {
        if (meatApproved !== toView.meatCategory!.isApproved || snowApproved !== toView.snowfrostCategory!.isApproved) {
            return false;
        }
        return true;
    }

    async function handleSubmit(meatApproved: boolean, snowApproved: boolean, isRejected = false) {
        try {
            setProcess(true);
            if (isRejected) {
                await SupplyOrderService.updateOrderStatus(toView.orderId!, "REJECTED", meatApproved, snowApproved)
                return toast.success(`Order ${toView.meatCategory!.meatOrderId} and ${toView.snowfrostCategory!.snowFrostOrderId} updated status to REJECTED`);
            }
            if (meatApproved && snowApproved) {      
                await SupplyOrderService.updateOrderStatus(toView.orderId!, "APPROVED", meatApproved, snowApproved)
                toast.success(`Order ${toView.meatCategory!.meatOrderId} and ${toView.snowfrostCategory!.snowFrostOrderId} updated status to APPROVED`);
                return await InventoryService.createInventoryOrder({
                    "branchId" : claims.branch.branchId,
                    "type" : "OUT",
                    "source" : "ORDER",
                    "orderId" : toView.orderId
                });
            }
            if (!meatApproved && !snowApproved) {
                await SupplyOrderService.updateOrderStatus(toView.orderId!, "PENDING", meatApproved, snowApproved)
                return toast.success(`Order ${toView.meatCategory!.meatOrderId} and ${toView.snowfrostCategory!.snowFrostOrderId} updated status to PENDING`);
            }
            if (meatApproved || snowApproved) {
                await SupplyOrderService.updateOrderStatus(toView.orderId!, "TO_FOLLOW", meatApproved, snowApproved)
                return toast.success(`Order ${toView.meatCategory!.meatOrderId} and ${toView.snowfrostCategory!.snowFrostOrderId} updated status to TO FOLLOW`);
            }
        } catch (error) { toast(<ToastError message={ String(error) } />) } 
        finally {
            setProcess(false);
            setToView(undefined);
            setReload(prev => !prev);
        }
    }

    return(
        <Dialog open onOpenChange={ open => { if (!open) setToView?.(undefined) } }>
            <DialogContent>
                {loading ? (
                    <OrderModalSkeleton />
                ) : (
                    <Fragment>
                        <DialogTitle className="text-sm text-gray">Order Information</DialogTitle>
                            <div className="h-[80vh] flex flex-col gap-5 overflow-y-auto">
                                <div className="flex justify-between items-center">
                                    <OrderStatusLabel status={ toView.status } />
                                    {editable && (
                                        <Button className="h-fit bg-darkgreen w-fit px-4 py-1 ms-auto" 
                                            disabled={ enableSave(meatApproved, snowApproved) }
                                            onClick={ () => handleSubmit(meatApproved, snowApproved) }
                                        >
                                            <FormLoader onProcess={ onProcess } label="Save Order" loadingLabel="Saving Order" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex justify-center items-center gap-1 mt-[-15px]">
                                        <Ham />
                                        <div className="text-md font-semibold">Meat Supply Order</div>
                                    </div>
                                    <div className="flex justify-center items-center gap-1">
                                        <Checkbox id="meat" 
                                            className="rounded-full border-gray data-[state=checked]:bg-darkgreen" 
                                            checked={ meatApproved }
                                            onCheckedChange={(checked: boolean) => setMeatApproved(checked)}
                                        />
                                        <label htmlFor="meat" className="text-sm font-semibold">
                                            {meatApproved ? 'Approved' : 'Approve'}
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold text-sm">Order No: <span className="font-normal">{ toView.meatCategory!.meatOrderId }</span></div>
                                        <div className="font-semibold text-sm">Order Date: <span className="font-normal">{ formatDateToWords(toView.orderDate) }</span></div>
                                        <div className="font-semibold text-sm">Delivery within: <span className="font-normal">{ toView.branchName }</span></div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold text-sm">To: <span className="font-normal">KP Comissary</span></div>
                                        <div className="font-semibold text-sm">Tel No: <span className="font-normal">{ "09475453783" }</span></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 border-t-1 border-gray">
                                    <div className="text-sm font-semibold pt-2">SKU ID</div>
                                    <div className="text-sm font-semibold pt-2">Item Name</div>
                                    <div className="text-sm font-semibold pt-2 pl-2">Qty</div>
                                    <div className="text-sm font-semibold pt-2">Unit Price</div>
                                    <div className="text-sm font-semibold pt-2">Amount</div>
                                </div>
                                {toView.meatCategory!.meatItems.length > 0 ? 
                                    toView.meatCategory!.meatItems.map((order, index) => {
                                        const currentStock = inventory.find(i => i.code === order.rawMaterialCode)?.quantity;
                                        return(
                                            <div className="grid grid-cols-5" key={ index }>
                                                <div className="text-sm font-semibold">{ order.rawMaterialCode }</div>
                                                <Tooltip>
                                                    <TooltipTrigger className="truncate text-sm text-start">{ order.rawMaterialName }</TooltipTrigger>
                                                    <TooltipContent>{ order.rawMaterialName }</TooltipContent>
                                                </Tooltip>
                                                <div className="text-sm font-semibold pl-2">{ order.quantity } <QuantityBadge stock={ currentStock! } className="scale-80" /></div>
                                                <div className="text-sm">{ formatToPeso(order.price) }</div>
                                                <div className="text-sm">{ formatToPeso(order.price * order.quantity) }</div>
                                            </div>
                                    )}) : (<div className="text-sm font-semibold text-center text-gray">You have no orders for MEAT category</div>)
                                }
                                <div className="grid grid-cols-5 border-t-1 border-gray py-1">
                                    <div className="col-span-4 text-sm font-semibold text-center">Total</div>
                                    <div className="text-sm font-semibold">{ formatToPeso(toView.meatCategory!.categoryTotal) }</div>
                                </div>
                                <Separator className="shadow-sm" />
                                <div className="flex justify-between items-center">
                                    <div className="flex justify-center items-center gap-1 mt-[-15px]">
                                        <Snowflake />
                                        <div className="text-md font-semibold">Snow Frost Supply Order</div>
                                    </div>
                                    <div className="flex justify-center items-center gap-1">
                                        <Checkbox id="snow" 
                                            className="rounded-full border-gray data-[state=checked]:bg-darkgreen" 
                                            checked={ snowApproved }
                                            onCheckedChange={(checked: boolean) => setSnowApproved(checked)}
                                        />
                                        <label htmlFor="snow" className="text-sm font-semibold">
                                            {snowApproved ? 'Approved' : 'Approve'}
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold text-sm">Order No: <span className="font-normal">{ toView.snowfrostCategory!.snowFrostOrderId }</span></div>
                                        <div className="font-semibold text-sm">Order Date: <span className="font-normal">{ formatDateToWords(toView.orderDate) }</span></div>
                                        <div className="font-semibold text-sm">Delivery within: <span className="font-normal">{ toView.branchName }</span></div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold text-sm">To: <span className="font-normal">KP Comissary</span></div>
                                        <div className="font-semibold text-sm">Tel No: <span className="font-normal">{ "09475453783" }</span></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 border-t-1 border-gray">
                                    <div className="text-sm font-semibold pt-2">SKU ID</div>
                                    <div className="text-sm font-semibold pt-2">Item Name</div>
                                    <div className="text-sm font-semibold pt-2 text-center">Qty</div>
                                    <div className="text-sm font-semibold pt-2">Unit Price</div>
                                    <div className="text-sm font-semibold pt-2">Amount</div>
                                </div>
                                {toView.snowfrostCategory!.snowFrostItems.length > 0 ?  
                                    toView.snowfrostCategory!.snowFrostItems.map((order, index) => {
                                        const currentStock = inventory.find(i => i.code === order.rawMaterialCode)?.quantity;
                                        return(
                                            <div className="grid grid-cols-5" key={ index }>
                                                <div className="text-sm font-semibold">{ order.rawMaterialCode }</div>
                                                <Tooltip>
                                                    <TooltipTrigger className="truncate text-sm text-start">{ order.rawMaterialName }</TooltipTrigger>
                                                    <TooltipContent>{ order.rawMaterialName }</TooltipContent>
                                                </Tooltip>
                                                <div className="text-sm font-semibold pl-2">{ order.quantity } <QuantityBadge stock={ currentStock! } className="scale-90" /></div>
                                                <div className="text-sm">{ formatToPeso(order.price) }</div>
                                                <div className="text-sm">{ formatToPeso(order.price * order.quantity) }</div>
                                            </div>
                                        )}) : (<div className="text-sm font-semibold text-center text-gray">You have no orders for SNOW FROST category</div>)
                                }
                                <div className="grid grid-cols-5 border-t-1 border-gray py-1">
                                    <div className="col-span-4 text-sm font-semibold text-center">Total</div>
                                    <div className="text-sm font-semibold">{ formatToPeso(toView.snowfrostCategory!.categoryTotal) }</div>
                                </div>
                                <Button onClick={ () => setReject(true) } className="!bg-darkred mt-2 hover:opacity-90">Reject Order</Button>
                            </div>
                    </Fragment>
                )
                }
            </DialogContent>
        </Dialog>
    );
}