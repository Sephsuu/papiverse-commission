"use client"

import { FormLoader, PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SupplyService } from "@/services/supply.service";
import { Supply } from "@/types/supply";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MeatOrder } from "./MeatOrder";
import { useSupplySelection } from "@/hooks/use-supply-selection";
import { SnowOrder } from "./SnowOrder";
import { SupplyItem } from "@/types/supplyOrder";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const tabs = ['Meat Commissary', 'Snowfrost Commissary']

export function EditOrderForm({ setEdit, toEditItems, orderId, meatId, snowId, setReload }: { 
    setEdit: (i: boolean) => void
    toEditItems: SupplyItem[] 
    orderId: number
    meatId: string
    snowId: string
    setReload: Dispatch<SetStateAction<boolean>>
    // meatApproved: boolean
    // snowApproved: boolean
}) {
    console.log('edit form', toEditItems);
        
    const router = useRouter();
    const { claims, loading: authLoading } = useAuth();
    const { data, loading } = useFetchData<Supply>(SupplyService.getDeliverableSupplies);

    const hasMeatOrder = meatId !== "No meat order";
    const hasSnowOrder = snowId !== "No snowfrost order"; 


    const {
        supplies,
        selectedItems,
        setSelectedItems,
        handleSelect,
        handleQuantityChange,
        handleRemove
    } = useSupplySelection(claims, data);

    const [onProcess, setProcess] = useState(false);
    const [tab, setTab] = useState(meatId === "No meat order" ? tabs[1] : tabs[0]);

    useEffect(() => {
        setSelectedItems(toEditItems)
    }, [toEditItems])

    async function handleSubmit() {
        try {
            setProcess(true);

            const meatOrder = selectedItems.filter(o => o.category === "MEAT");
            const snowOrder = selectedItems.filter(o => o.category === "SNOWFROST");

            if ((meatOrder.length === 0) && (snowOrder.length === 0)) {
                toast.info("Please fill out atleast one form");
                return;
            }

            let meatUpdated = false;
            let snowUpdated = false;

            if (meatOrder.length > 0) {
                meatUpdated = await SupplyOrderService.updateMeatOrder(meatOrder, meatId);
            }
            
            if (snowOrder.length > 0) {
                snowUpdated = await SupplyOrderService.updateSnowOrder(snowOrder, snowId);
            }

            if (meatUpdated || snowUpdated) {
                toast.success("Supply order updated successfully.");
                setReload(prev => !prev)
                setEdit(false)
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    if (loading || authLoading) return <PapiverseLoading />;

    return (
        <section className="animate-fade-in-up stack-md">
            <div className="flex-center-y gap-4">
                <ArrowLeft 
                    className="cursor-pointer"
                    onClick={() => setEdit(false)}
                />
                <AppHeader 
                    label="Edit Purchase Order" 
                    hidePapiverseLogo={true}
                />
            </div>

            <div className="w-fit flex-center bg-slate-50 shadow-sm rounded-full max-sm:w-fit max-sm:mx-auto">
                {tabs.map((item, i) => {
                    const isMeatTab = i === 0;
                    const isSnowTab = i === 1;

                    const disabled =
                        (isMeatTab && !hasMeatOrder) ||
                        (isSnowTab && !hasSnowOrder);

                    return (
                    <Button
                        key={i}
                        onClick={() => setTab(item)}
                        disabled={disabled}
                        className={[
                            "w-42 rounded-full bg-slate-50! text-dark hover:opacity-50",
                            tab === item ? "bg-darkbrown! text-light hover:opacity-100" : "",
                            disabled ? "opacity-40 cursor-not-allowed hover:opacity-40" : "",
                        ].join(" ")}
                    >
                        {item}
                    </Button>
                    );
                })}
            </div>


            {tab === tabs[0] && (
                <MeatOrder
                    supplies={supplies.filter(i => i.category === "MEAT")}
                    selectedItems={selectedItems}
                    setActiveForm={setTab}
                    onSelect={handleSelect}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    toEdit={true}
                    // className={ meatApproved ? "!hidden" : "" }
                />
            )}

            {tab === tabs[1] && (
                <SnowOrder
                    supplies={supplies.filter(i => i.category === "SNOWFROST")}
                    selectedItems={selectedItems}
                    setActiveForm={setTab}
                    onSelect={handleSelect}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    toEdit={true}
                    // className={ snowApproved ? "!hidden" : "" }
                />
            )}

            <div className="w-full justify-end flex gap-2 -mt-112 z-50">
                <Button
                    onClick={() => { history.back(); }}
                    variant="secondary"
                >
                    Back to Order
                </Button>

                <Button
                    onClick={ handleSubmit }
                    disabled={ onProcess }
                    className="bg-darkgreen! text-light hover:opacity-90"
                >
                    <FormLoader
                        onProcess={ onProcess }
                        label="Update Order"
                        loadingLabel="Updating Order"
                    />
                </Button>
            </div>
        </section>
    );
}
