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
import { ArrowLeft, CalendarSync } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AppSelect } from "@/components/shared/AppSelect";
import { ExpectedDeliveryDatePicker } from "../components/ExpectedDeliveryDatePicker";
import { formatDateToWords } from "@/lib/formatter";

const tabs = ['Meat Commissary', 'Snowfrost Commissary']

export function EditOrderForm({ setEdit, toEditItems, orderId, meatId, snowId, setReload, internalShipment, deliveryType, expectedDelivery }: { 
    setEdit: (i: boolean) => void
    toEditItems: SupplyItem[] 
    orderId: number
    meatId: string
    snowId: string
    setReload: Dispatch<SetStateAction<boolean>>
    internalShipment: boolean
    deliveryType: string
    expectedDelivery: string
    // meatApproved: boolean
    // snowApproved: boolean
}) {
    console.log('edit form', toEditItems);

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
    const [intShip, setIntShip] = useState(internalShipment);
    const initialDelType = internalShipment ? "DELIVERY" : (deliveryType || "");
    const [delType, setDelType] = useState(initialDelType);
    const initialExpDel = expectedDelivery ? expectedDelivery.slice(0, 10) : "";
    const [expDel, setExpDel] = useState(initialExpDel);
    const [openExpDel, setOpenExpDel] = useState(false);
    const hasDeliveryTypeError = !intShip && delType.trim() === "";

    useEffect(() => {
        setSelectedItems(toEditItems)
    }, [toEditItems])

    useEffect(() => {
        if (intShip) {
            setDelType("DELIVERY");
            return;
        }

        if (delType === "DELIVERY") {
            setDelType("");
        }
    }, [intShip, delType]);

    async function handleSubmit() {
        try {
            setProcess(true);

            const meatOrder = selectedItems.filter(o => o.category === "MEAT");
            const snowOrder = selectedItems.filter(o => o.category === "SNOWFROST");
            const shipmentChanged = intShip !== internalShipment || delType !== initialDelType;
            const deliveryDateChanged = expDel !== initialExpDel;

            if (expDel === "") {
                toast.warning("Please select expected delivery date.");
                return;
            }

            if (!intShip && delType.trim() === "") {
                toast.warning("Please select delivery type.");
                return;
            }

            if ((meatOrder.length === 0) && (snowOrder.length === 0) && !shipmentChanged && !deliveryDateChanged) {
                toast.info("Please fill out atleast one form");
                return;
            }

            let meatUpdated = false;
            let snowUpdated = false;
            let shipmentUpdated = false;
            let deliveryUpdated = false;

            if (meatOrder.length > 0) {
                meatUpdated = await SupplyOrderService.updateMeatOrder(meatOrder, meatId);
            }
            
            if (snowOrder.length > 0) {
                snowUpdated = await SupplyOrderService.updateSnowOrder(snowOrder, snowId);
            }

            if (shipmentChanged) {
                shipmentUpdated = await SupplyOrderService.updateShipmentType({
                    orderId,
                    isInternal: intShip,
                    type: intShip ? "DELIVERY" : delType
                });
            }

            if (deliveryDateChanged) {
                deliveryUpdated = await SupplyOrderService.updateExpectedDeliveryDate(expDel, orderId);
            }

            if (meatUpdated || snowUpdated || shipmentUpdated || deliveryUpdated) {
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

    function handleSaveDateSelection() {
        if (!expDel) {
            toast.warning("Please select expected delivery date.");
            return;
        }
        setOpenExpDel(false);
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

            <div className="rounded-md border bg-slate-50 p-4">
                <div className="grid grid-cols-[1fr_320px] gap-4 max-md:grid-cols-1">
                    <div className="rounded-md border border-slate-200 bg-white p-4 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-800">Shipment Setting</p>
                            </div>
                            <div className="flex-center-y gap-2">
                                <Switch id="intShip" checked={intShip} onCheckedChange={setIntShip} />
                                <label htmlFor="intShip" className="cursor-pointer select-none text-sm">
                                    Internal Shipping
                                </label>
                            </div>
                        </div>

                        {!intShip ? (
                            <div className="max-w-64">
                                <AppSelect
                                    label="Delivery Type"
                                    items={["LALAMOVE", "PICKUP"]}
                                    value={delType}
                                    onChange={(value) => setDelType(value)}
                                    placeholder="Delivery Type"
                                />
                                {hasDeliveryTypeError && (
                                    <p className="mt-1 text-xs text-darkred">Delivery type is required.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Delivery type is set to <span className="font-semibold text-gray-700">DELIVERY</span> for internal shipments.
                            </p>
                        )}
                    </div>

                    <div className="rounded-md border border-slate-200 bg-white p-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-800">Expected Delivery Date</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-between border-slate-300 bg-slate-50 text-left"
                            onClick={() => setOpenExpDel(true)}
                        >
                            <span>{expDel ? formatDateToWords(expDel) : "Select Delivery Date"}</span>
                            <CalendarSync className="size-4 text-gray-600" />
                        </Button>
                    </div>
                </div>

                <ExpectedDeliveryDatePicker
                    date={expDel || null}
                    setDate={setExpDel}
                    open={openExpDel}
                    setOpen={setOpenExpDel}
                    onProcess={false}
                    handleSubmit={handleSaveDateSelection}
                />
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
                    disabled={ onProcess || hasDeliveryTypeError }
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
