"use client"

import { FormLoader, PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SupplyService } from "@/services/supply.service";
import { Supply } from "@/types/supply";
import { useEffect, useState } from "react";
import { MeatOrder } from "./MeatOrder";
import { useSupplySelection } from "@/hooks/use-supply-selection";
import { SnowOrder } from "./SnowOrder";
import { SupplyItem } from "@/types/supplyOrder";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { useRouter } from "next/navigation";

export function EditOrderForm({ toEditItems, orderId, meatId, snowId, meatApproved, snowApproved }: { 
    toEditItems: SupplyItem[] 
    orderId: number
    meatId: string
    snowId: string
    meatApproved: boolean
    snowApproved: boolean
}) {
    const router = useRouter();
    const { claims, loading: authLoading } = useAuth();
    const { data, loading } = useFetchData<Supply>(SupplyService.getDeliverableSupplies);

    const {
        supplies,
        selectedItems,
        setSelectedItems,
        handleSelect,
        handleQuantityChange,
        handleRemove
    } = useSupplySelection(claims, data);

    const [onProcess, setProcess] = useState(false);
    const [tab, setTab] = useState("meat");

    useEffect(() => {
        setSelectedItems(toEditItems);
    }, [toEditItems, setSelectedItems]);

    async function handleSubmit() {
        try {
            setProcess(true);

            const meatOrder = selectedItems.filter(o => o.category === "MEAT");
            const snowOrder = selectedItems.filter(o => o.category === "SNOWFROST");

            if (!meatApproved && meatOrder.length === 0) {
                toast.info("Meat order cannot be empty.");
                return;
            }

            if (!snowApproved && snowOrder.length === 0) {
                toast.info("SnowFrost order cannot be empty.");
                return;
            }

            let meatUpdated = false;
            let snowUpdated = false;

            if (!meatApproved) {
                meatUpdated = await SupplyOrderService.updateMeatOrder(meatOrder, meatId);
            }

            if (!snowApproved) {
                snowUpdated = await SupplyOrderService.updateSnowOrder(snowOrder, snowId);
            }

            if (meatUpdated || snowUpdated) {
                toast.success("Supply order updated successfully.");
                window.location.href = `/inventory/supply-orders/${orderId}`;
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
            <AppHeader label="Edit Supply Order" />

            <MeatOrder
                supplies={supplies.filter(i => i.category === "MEAT")}
                selectedItems={selectedItems}
                setActiveForm={setTab}
                onSelect={handleSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                toEdit={true}
                className={ meatApproved ? "!hidden" : "" }
            />

            <SnowOrder
                supplies={supplies.filter(i => i.category === "SNOWFROST")}
                selectedItems={selectedItems}
                setActiveForm={setTab}
                onSelect={handleSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                toEdit={true}
                className={ snowApproved ? "!hidden" : "" }
            />

            <div className="w-full justify-end flex gap-2 mt-4">
                <Button
                    onClick={() => { history.back(); }}
                    variant="secondary"
                >
                    Back to Order
                </Button>

                <Button
                    onClick={ handleSubmit }
                    disabled={ onProcess }
                    className="!bg-darkgreen text-light hover:opacity-90"
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
