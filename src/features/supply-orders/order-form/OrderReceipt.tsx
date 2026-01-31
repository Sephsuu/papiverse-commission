"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { OrderStatusBadge } from "@/components/ui/badge";
import { AddButton, Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { PapiverseLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";
import { DeliveryService } from "@/services/delivery.service";
import { SupplyOrderService } from "@/services/supplyOrder.service";

import { Claim } from "@/types/claims";
import { Delivery } from "@/types/delivery";
import { SupplyItem } from "@/types/supplyOrder";
import { Ham, Snowflake } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

const tabs = ['Meat Order', 'Snow Order']

export function OrderReceipt({ claims, setActiveForm, selectedItems }: {
    claims: Claim;
    setActiveForm: (i: string) => void;
    selectedItems: SupplyItem[];
}) {
    const { data: delivery, loading, error } = useFetchOne<Delivery>(DeliveryService.getDeliveryFeeByBranch, [], [claims.branch.branchId]);

    const router = useRouter()
    const [tab, setTab] = useState('Meat Order');
    const [open, setOpen] = useState(false);
    const [onProcess, setProcess] = useState(false);
    
    const meatReceipt =
        selectedItems.filter((s) => s.category === "MEAT").length > 0
            ? selectedItems.filter((s) => s.category === "MEAT")
            : null;

    const snowFrostReceipt =
        selectedItems.filter((s) => s.category === "SNOWFROST").length > 0
            ? selectedItems.filter((s) => s.category === "SNOWFROST")
            : null;


    const totalMeatAmount = (meatReceipt ?? []).reduce(
        (acc, supply) => acc + supply.unitPrice! * supply.quantity!,
        0
    );

    const totalSnowFrostAmount = (snowFrostReceipt ?? []).reduce(
        (acc, supply) => acc + supply.unitPrice! * supply.quantity!,
        0
    );

    async function handleSubmit() {
        try {
            setProcess(true);

            let meatFinal: { id: string } | null = null;
            let snowFinal: { id: string } | null = null;

            if (meatReceipt && meatReceipt.length > 0) {
            const meatOrder = {
                id: "",
                branchId: claims.branch.branchId,
                categoryItems: meatReceipt,
            };
            meatFinal = await SupplyOrderService.createMeatOrder(meatOrder);
            }

            if (snowFrostReceipt && snowFrostReceipt.length > 0) {
            const snowOrder = {
                id: "",
                branchId: claims.branch.branchId,
                categoryItems: snowFrostReceipt,
            };
            snowFinal = await SupplyOrderService.createSnowOrder(snowOrder);
            }

            const orderSupply = {
            branchId: claims.branch.branchId,
            remarks: "",
            meatCategoryItemId: meatFinal?.id ?? null,
            snowfrostCategoryItemId: snowFinal?.id ?? null,
            deliveryFee: delivery ? delivery.deliveryFee : 0,
            };

            const data = await SupplyOrderService.createSupplyOrder(orderSupply);

            if (data) {
            toast.success("Supply Order Created");
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
            router.push("supply-orders");
        }
    }


    if (loading) return <PapiverseLoading />
    return(
        <section className="stack-md animate-fade-in-up pb-12 overflow-hidden max-md:mt-12">
            <AppHeader label="Supply Order Receipt" />
            <div className="w-fit flex-center bg-slate-50 shadow-sm rounded-full">
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

            <Orders
                tab={ tab }
                orders={
                    tab === 'Meat Order'
                        ? (meatReceipt ?? [])
                        : (snowFrostReceipt ?? [])
                }
                delivery={ delivery! }
                meatTotal={ totalMeatAmount }
                snowTotal={ totalSnowFrostAmount }
            />
        
            <div className="flex justify-end gap-2 mt-2">
                <Button 
                    onClick={ () => setActiveForm("snow") } 
                    variant="secondary"
                    className="px-4"
                >
                    Back to Order Form
                </Button>
                <Button 
                    onClick={ () => setOpen(true) }
                    className="px-4 bg-darkgreen! hover:opacity-90"
                >
                    Order Supplies
                </Button>
            </div>

            {open && (
                <ConfirmOrder 
                    setOpen={ setOpen }
                    handleSubmit={ handleSubmit }
                    onProcess={ onProcess }
                />
            )}

        </section>
    );
}

function Orders({ tab, orders, delivery, meatTotal, snowTotal }: {
    tab: string;
    orders: SupplyItem[];
    delivery: Delivery;
    meatTotal: number;
    snowTotal: number;
}) {
    const columns = [
        { title: 'No.', style: 'text-center' },
        { title: 'Supply Name', style: '' },
        { title: 'Qty', style: 'text-center' },
        { title: 'Unit', style: '' },
        { title: 'Unit Price', style: '' },
        { title: 'Total Amount', style: '' },
    ]
    
    return (
        <div className="p-4 bg-white rounded-md shadow-sm relative animate-fade-in-up" key={tab}>
            <Image src="/images/kp_logo.png" alt="KP Logo" width={60} height={60} className="top-2 right-2 absolute" />
            <div className="flex justify-center items-center gap-2 max-sm:mt-6">
                { tab === 'Meat Order' ? <Ham /> : <Snowflake /> }
                <div className="font-semibold">{ tab } Receipt</div>
            </div>
            <div className="text-center text-sm text-gray">Please review carefully your order form.</div>

            <div className="grid grid-cols-2 gap-1 mt-2 max-sm:grid-cols-1 max-sm:gap-1.5">
                <div className="text-sm">
                    <span className="font-bold">Order ID: </span>
                    <span className="text-gray">Order the supplies first</span>
                </div>
                <div className="text-sm ms-auto max-sm:ms-0">
                    <span className="font-bold">To: </span>KP Comissary
                </div>
                <div className="text-sm flex-center-y gap-2">
                    <span className="font-bold">Status: </span>
                    <OrderStatusBadge className="scale-110 bg-slate-200 text-dark!" status="NO STATUS" />
                </div>
                <div className="text-sm ms-auto inline-block max-sm:ms-0"><span className="font-bold">Date</span> { formatDateToWords(new Date().toLocaleDateString() ) }</div>
                <div className="text-sm"><span className="font-bold">Tel No: </span>{ "09475453783" }</div>
                <div className="text-sm ms-auto max-sm:ms-0"><span className="font-bold">Delivery within: </span> Branch Name</div>
            </div>

            <div className="mt-4">
                <div className="thead grid grid-cols-[60px_1fr_60px_1fr_1fr_1fr]">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>
                {orders.length > 0 ? 
                    orders.map((supply, index) => (
                        <div className="tdata grid grid-cols-[60px_1fr_60px_1fr_1fr_1fr]" key={ index }>
                            <div className="td mx-auto">{ index + 1 }</div>
                            <div className="td">{ supply.name }</div>
                            <div className="td text-center">{ supply.quantity }</div>
                            <div className="td">{ supply.unitMeasurement }</div>
                            <div className="td">{ formatToPeso(supply.unitPrice!) }</div>
                            <div className="td">{ formatToPeso(supply.unitPrice! * supply.quantity!) }</div>
                        </div>  
                    ))
                : (
                    <div className="text-sm text-gray font-semibold text-center py-6">You have no items for { tab }.</div>
                )}
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Meat Order <span className="font-semibold text-dark">+ { formatToPeso(meatTotal) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Snow Order <span className="font-semibold text-dark">+ { formatToPeso(snowTotal) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Delivery Fee <span className="font-semibold text-dark">+ { formatToPeso(delivery ? delivery.deliveryFee : 0) }</span>
                </div> 
                <Separator className="my-4 bg-gray" />
                <div className="text-gray text-end mx-4">
                    Complete Order Total:  <span className="ml-2 font-semibold text-darkbrown inline-block scale-x-120">{ formatToPeso(meatTotal + snowTotal + (delivery ? delivery.deliveryFee : 0)) }</span>
                </div>
            </div>
        </div>
    )
}

function ConfirmOrder({ setOpen, handleSubmit, onProcess }: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    handleSubmit: () => void;
    onProcess: boolean;
}) {
    return (
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <ModalTitle label="Order the following supplies?"/>
                <form 
                    className="flex justify-end gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <DialogClose>Cancel</DialogClose>
                    <AddButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Order Supplies"
                        loadingLabel="Ordering Supplies"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}