import { AppHeader } from "@/components/shared/AppHeader";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Badge, OrderStatusBadge } from "@/components/ui/badge";
import { Button, DeleteButton, UpdateButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormLoader, PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { useSupplyOrderApproval } from "@/hooks/use-supply-order-approval";
import { formatCompactNumber, formatDateToWords, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { SupplyOrderService } from "@/services/supplyOrder.service"
import { Inventory } from "@/types/inventory";
import { SupplyItem, SupplyOrder } from "@/types/supplyOrder"
import { ArrowLeft, Ham, MoveRight, Snowflake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { EditOrderForm } from "./order-form/EditOrderForm";
import { EmptyState } from "@/components/ui/fallback";

const tabs = ['Meat Order', 'Snow Order']

const columns = [
    { title: 'No.', style: 'text-center' },
    { title: 'SKU ID', style: '' },
    { title: 'Supply Description', style: '' },
    { title: 'Qty', style: 'text-center' },
    { title: 'Unit Price', style: '' },
    { title: 'Total Amount', style: '' },
]

export function ViewOrderPage({ id }: { id: number }) {
    const [reload, setReload] = useState(false);
    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const { data, loading } = useFetchOne<SupplyOrder>(SupplyOrderService.getSupplyOrderById, [id, reload], [id]);
    const { data: inventories, loading: inventoryLoading } = useFetchData(InventoryService.getInventoryByBranch, [claims.branch.branchId, reload], [claims.branch.branchId])
    const { onProcess, enableSave, handleSubmit } = useSupplyOrderApproval(data!, claims, setReload);    
    
    const [tab, setTab] = useState('Meat Order');
    const [open, setOpen] = useState(false);
    const [toEdit, setEdit] = useState(false);
    const [toReject, setReject] = useState(false);
    const [meatApproved, setMeatApproved] = useState<boolean | undefined>(undefined);
    const [snowApproved, setSnowApproved] = useState<boolean | undefined>(undefined);

    const hasSnowfrost = Boolean(data?.snowfrostCategory);
    const hasMeat = Boolean(data?.meatCategory);

    const hasMissingCategory = !hasSnowfrost || !hasMeat;

    useEffect(() => {
        if (data) {
            setMeatApproved(data.meatCategory?.isApproved ?? false);
            setSnowApproved(data.snowfrostCategory?.isApproved ?? false);
        }
    }, [data]);    

    if (loading || authLoading || inventoryLoading) return <PapiverseLoading /> 
    if (toEdit) return <EditOrderForm 
        orderId={ data!.orderId! }
        meatId={data?.meatCategory?.meatOrderId ?? "No meat order"}
        snowId={data?.snowfrostCategory?.snowFrostOrderId ?? "No snow order"}
        meatApproved={ data!.meatCategory!.isApproved }
        snowApproved={ data!.snowfrostCategory!.isApproved }
        toEditItems={[
            ...(data?.meatCategory?.meatItems ?? []).map((item) => ({
                code: item.rawMaterialCode,
                quantity: item.quantity,
                name: item.rawMaterialName,
                unitMeasurement: item.unitMeasurement,
                unitPrice: item.price,
                category: "MEAT"
            })),
            ...(data?.snowfrostCategory?.snowFrostItems ?? []).map((item) => ({
                code: item.rawMaterialCode,
                quantity: item.quantity,
                name: item.rawMaterialName,
                unitMeasurement: item.unitMeasurement,
                unitPrice: item.price,
                category: "SNOWFROST"
            })),
        ]}

    />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <div className="flex-center-y gap-4">
                <ArrowLeft 
                    className="cursor-pointer"
                    onClick={() => {history.back()}}
                />
                <AppHeader 
                    label={ `${data!.meatCategory?.meatOrderId ?? "No Meat Order"} | ${data!.snowfrostCategory?.snowFrostOrderId ?? "No Snow Order"}`  } 
                    hidePapiverseLogo={true}
                />
            </div>
            <div className="flex justify-between items-center max-sm:grid! max-sm:gap-2!">
                <div className="flex-center bg-slate-50 shadow-sm rounded-full max-sm:w-fit max-sm:mx-auto">
                    {tabs.map((item, i) => (
                        <Button
                            key={i}
                            onClick={ () => setTab(item) }
                            className={`w-30 rounded-full bg-slate-50! text-dark hover:opacity-50 ${tab === item && "bg-darkbrown! text-light hover:opacity-100"}`}
                        >
                            { item }
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2 my-2">
                    {claims.roles[0] === 'FRANCHISOR' && (
                        <>
                            <Button 
                                className="bg-darkred! hover:opacity-90" 
                                onClick={ () => setReject(true) }
                                disabled={ ["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) || onProcess }
                            >
                                <FormLoader onProcess={ onProcess } label="Reject Order" loadingLabel="Rejecting Order" />
                            </Button>
                            {hasMissingCategory && (
                                <Button
                                    className="bg-darkorange! hover:opacity-90"
                                    disabled={ ["APPROVED", "TO_FOLLOW", "TO FOLLOW"].includes(data!.status!) || enableSave(hasMeat!, hasSnowfrost!) || onProcess}
                                    onClick={() => {
                                        setMeatApproved(hasMeat)
                                        setSnowApproved(hasSnowfrost)
                                        setOpen(true)
                                    }}
                                >
                                    <FormLoader
                                        onProcess={onProcess}
                                        label="To Follow Order"
                                        loadingLabel="Marking as to follow"
                                    />
                                </Button>
                            )}
                            <Button className="bg-darkgreen! hover:opacity-90" 
                                disabled={ ["APPROVED"].includes(data!.status!) || enableSave(meatApproved!, snowApproved!) || onProcess }
                                onClick={ () => setOpen(true) }
                            >
                                <FormLoader onProcess={ onProcess } label="Save Order" loadingLabel="Saving Order" />
                            </Button>
                        </>
                    )}

                </div>
            </div>

            <div className="relative p-4 bg-white rounded-md shadow-sm animate-fade-in-up" key={tab}>
                <div className="top-2 left-2 flex-center-y gap-2">
                    <Checkbox id="meat" 
                        className="border border-gray shadow-sm w-5 h-5 data-[state=checked]:bg-darkgreen" 
                        checked={ tab === 'Snow Order' ? snowApproved : meatApproved }
                        onCheckedChange={(checked: boolean) => { tab === 'Snow Order' ? setSnowApproved(checked) : setMeatApproved(checked)}}
                        disabled={ ["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) || !isFranchisor }
                    />
                    <label htmlFor="meat" className={`text-[16px] font-semibold ${["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) && "text-gray"}`}>
                        {tab === 'Snow Order' ? 
                            snowApproved ? 'Approved' : 'Not Approved'
                            : meatApproved ? 'Approved' : 'Not Approved'
                        }
                    </label>
                </div>
                <Image src="/images/kp_logo.png" alt="KP Logo" width={60} height={60} className="top-2 right-2 absolute" />
                <div className="flex justify-center items-center gap-2">
                    { tab === 'Snow Order' ? <Snowflake /> : <Ham /> }
                    <div className="font-semibold">{ tab } Receipt</div>
                </div>
                {claims.roles[0] === 'FRANCHISOR' ? 
                    <div className="text-center text-sm text-gray">Showing only the order form receipt for this { tab.toLowerCase() }.</div> 
                    : <div className="text-center text-sm text-gray">Please review carefully your order form.</div>
                }
                <div className="grid grid-cols-2 gap-1 mt-2 max-sm:grid-cols-1 max-sm:gap-1.5">
                    <div className="text-sm"><span className="font-bold">Order ID: </span>
                        { tab === 'Snow Order' ? 
                            data!.snowfrostCategory?.snowFrostOrderId 
                            : data!.meatCategory?.meatOrderId
                        }
                    </div>
                    <div className="text-sm ms-auto max-sm:ms-0"><span className="font-bold">To: </span>{ "KP Comissary" }</div>
                    <div className="text-sm flex-center-y gap-2">
                        <span className="font-bold">Status: </span>
                        <OrderStatusBadge className="scale-110" status={ data!.status} />
                    </div>
                    <div className="text-sm ms-auto inline-block max-sm:ms-0"><span className="font-bold">Date:</span> { formatDateToWords(data!.orderDate) }</div>
                    <div className="text-sm"><span className="font-bold">Tel No: </span>{ "+63 123 456 7890" }</div>
                    <div className="text-sm ms-auto max-sm:ms-0"><span className="font-bold">Delivery within: </span>{ data!.branchName }</div>
                </div>

                <div className="mt-4 table-wrapper">
                    <div className="thead grid grid-cols-[60px_1fr_1fr_100px_1fr_1fr]">
                        {columns.map((item, _) => (
                            <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                        ))}
                    </div>
                    {tab === "Meat Order" ? (
                        data?.meatCategory ? (
                            <Orders
                            orders={data.meatCategory.meatItems}
                            inventories={inventories}
                            />
                        ) : (
                            <EmptyState message="No meat items in this order" />
                        )
                        ) : (
                        data?.snowfrostCategory ? (
                            <Orders
                            orders={data.snowfrostCategory.snowFrostItems}
                            inventories={inventories}
                            />
                        ) : (
                            <EmptyState message="No snowfrost items in this order" />
                        )
                    )}

                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Meat Order <span className="font-semibold text-dark">+ { data?.meatCategory ?  formatToPeso(data!.meatCategory!.categoryTotal) : formatToPeso(0) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Snow Order <span className="font-semibold text-dark">+ { data?.snowfrostCategory ?formatToPeso(data!.snowfrostCategory!.categoryTotal) : formatToPeso(0) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Delivery Fee <span className="font-semibold text-dark">+ { formatToPeso(data!.deliveryFee) }</span>
                </div>
                <Separator className="my-4 bg-gray" />
                <div className="text-gray text-end mx-4">
                    Complete Order Total:  <span className="ml-2 font-semibold text-darkbrown inline-block scale-x-120">{ formatToPeso(data!.completeOrderTotalAmount) }</span>
                </div>
            </div>

            {data?.remarks && (
                <div className="border border-dashed border-gray w-full bg-light p-4">
                    <span className="font-semibold">Commisary Remarks: </span> { data?.remarks }
                </div>
            )}

            {open && <ConfirmSave 
                setOpen={ setOpen }
                order={ data! }
                meatApproved={ meatApproved! }
                snowApproved={ snowApproved! }
                onProcess={ onProcess }
                handleSubmit={ handleSubmit }
            />}

            {toReject && <ConfirmReject
                orderId={ id }
                open={toReject}
                setOpen={setReject}
                setReload={setReload}
            />}
        </section>
    )
}

function Orders({ orders, inventories }: {
    orders: {
        rawMaterialCode: string;
        rawMaterialName: string;
        quantity: number;
        price: number;
    } [];
    inventories: Inventory[];
})  {
    return (
        <>
            {orders.map((item, i) => {
                const currentStock = inventories.find(i => i.sku === item.rawMaterialCode)?.quantity;
                return (
                    <div className="tdata grid grid-cols-[60px_1fr_1fr_100px_1fr_1fr]" key={i}>
                        <div className="td text-center">{ i + 1 }</div>
                        <div className="td">{ item.rawMaterialCode }</div>
                        <div className="td">{ item.rawMaterialName }</div>
                        <div className="td flex-center-y gap-2">
                            <Tooltip>
                                <TooltipTrigger>
                                    { formatCompactNumber(item.quantity) } 
                                </TooltipTrigger>
                                <TooltipContent>Quantity: { item.quantity }</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge className="text-[10px] rounded-full">{ formatCompactNumber(currentStock!) }</Badge>
                                </TooltipTrigger>
                                <TooltipContent>Current Stock: { currentStock }</TooltipContent>
                            </Tooltip>
                        </div>
                        
                        <div className="td">{ formatToPeso(item.price) }</div>
                        <div className="td">{ formatToPeso(item.price * item.quantity) }</div>
                    </div>
                )
            })}
        </>     
    )
}

function ConfirmSave({ setOpen, order, meatApproved, snowApproved, onProcess, handleSubmit }: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    order: SupplyOrder,
    meatApproved: boolean, 
    snowApproved: boolean,
    onProcess: boolean,
    handleSubmit: (i: boolean, j: boolean) => void;
}) {
    return (
        <AlertDialog open>
            <AlertDialogContent>
                <ModalTitle
                    label="Confirm Order Approval?"
                    isAlertDialog={true}
                />
                <form
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit(meatApproved, snowApproved);
                        setOpen(prev => !prev);
                    }}
                >
                    <div className="flex-center flex-col gap-2">
                        <div className="text-center">Meat Order Approval</div>
                        {order.meatCategory?.isApproved === meatApproved ?
                            <div className={`text-center font-bold ${meatApproved ? "text-darkgreen" : "text-darkred"}`}>
                                { meatApproved ? 'Approved' : 'Not Approved' }
                            </div> 
                            :
                            <div className="flex-center gap-2" >
                                <div className={`text-center font-bold ${order.meatCategory?.isApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { order.meatCategory?.isApproved ? 'Approved' : 'Not Approved' }
                                </div>
                                <MoveRight className="w-6 h-6" />
                                <div className={`text-center font-bold ${meatApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { meatApproved ? 'Approved' : 'Not Approved' }
                                </div>
                            </div>
                        }
                    </div>
                    <Separator className="h-2 bg-gray" />
                    <div className="flex-center flex-col gap-2">
                        <div className="text-center">Snow Order Approval</div>
                        {order.snowfrostCategory?.isApproved === snowApproved ?
                            <div className={`text-center font-bold ${snowApproved ? "text-darkgreen" : "text-darkred"}`}>
                                { snowApproved ? 'Approved' : 'Not Approved' }
                            </div> 
                            :
                            <div className="flex-center gap-2" >
                                <div className={`text-center font-bold ${order.snowfrostCategory?.isApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { order.snowfrostCategory?.isApproved ? 'Approved' : 'Not Approved' }
                                </div>
                                <MoveRight className="w-6 h-6" />
                                <div className={`text-center font-bold ${snowApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { snowApproved ? 'Approved' : 'Not Approved' }
                                </div>
                            </div>
                        }
                    </div>
                    <div className="flex-center-y justify-end gap-2">
                        <AlertDialogCancel onClick={ () => setOpen(prev => !prev) }>Cancel</AlertDialogCancel>
                        <UpdateButton
                            type="submit"
                            onProcess={ onProcess }
                            label="Save Approval"
                            loadingLabel="Saving Approval"
                        />
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function ConfirmReject({ orderId, open, setOpen, setReload }: {
    orderId: number;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    const [onProcess, setProcess] = useState(false);

    async function handleReject() {
        try {
            const data = await SupplyOrderService.updateOrderStatus(orderId, "REJECTED", false, false);
            if (data) {
                toast.success('Supply order has been rejected.');
                setOpen(false)
                setReload(prev => !prev);
            }
        } catch (error) {
            toast.error(`${error}`)
        } finally { setProcess(false) }
    }
    return (
        <Dialog open={ open } onOpenChange={ setOpen }>
            <DialogContent>
                <ModalTitle label="Are you sure to reject order?" />
                <form 
                    className="flex-center-y gap-4 justify-end"
                    onSubmit={  e => {
                        e.preventDefault();
                        handleReject();
                    }}
                >
                    <DialogClose>Cancel</DialogClose>
                    <DeleteButton 
                        type="submit"
                        onProcess={onProcess}
                        label="Yes, I'm sure"
                        loadingLabel="Rejecting Order"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SafeOrders({
    items,
    inventories,
    emptyLabel,
}: {
    items?: {
        rawMaterialCode: string;
        rawMaterialName: string;
        quantity: number;
        price: number;
    } [];
    inventories: Inventory[];
    emptyLabel: string;
}) {
    if (!items || items.length === 0) {
        return <p className="text-muted-foreground">{emptyLabel}</p>;
    }

    return <Orders orders={items} inventories={inventories} />;
}
