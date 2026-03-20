import { AppSelect } from "@/components/shared/AppSelect";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { UpdateButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export function UpdateShipment({setOpen, setReload, orderId, internalShipment, deliveryType}: {
    setOpen: Dispatch<SetStateAction<boolean>>
    setReload: Dispatch<SetStateAction<boolean>>
    orderId: number,
    internalShipment: boolean,
    deliveryType: string;
}) {
    const [onProcess, setProcess] = useState(false);
    const [intShip, setIntShip] = useState(internalShipment);
    const [delType, setDelType] = useState(deliveryType);

    useEffect(() => {
        if (intShip) setDelType("DELIVERY");
        // else setDelType(); 
    }, [intShip]);

    useEffect(() => {
        console.log(intShip, delType);
        
    }, [intShip, delType])

    const handleSubmit = async () => {
        try {
            setProcess(true);

            if (delType === "") {
                toast.warning("Please select delivery type.")
                return;
            }

            const data = await SupplyOrderService.updateShipmentType({
                orderId,
                isInternal: intShip,
                type: delType
            });

            if (data) {
                toast.success('Shipment type updated successfully');
                setReload(prev => !prev);
                setOpen(false);
            }
        } catch (error) {
            toast.error(String(error))
        } finally { setProcess(false) }
    }

    return (
        <AlertDialog open onOpenChange={setOpen}>
            <AlertDialogContent>
                <ModalTitle label="Update Shipment" isAlertDialog />
                <div className="flex-center flex-col mt-4 gap-6">
                    <div className="flex-center-y gap-1.5">
                        <Switch id="intShip" checked={intShip} onCheckedChange={setIntShip} />
                        <label htmlFor="intShip" className="cursor-pointer select-none">
                            Internal Shipping
                        </label>
                    </div>

                    {!intShip && (
                        <AppSelect
                            label="Select Delivery Type"
                            items={["LALAMOVE", "PICKUP"]}
                            value={delType}
                            onChange={(value) => setDelType(value)}
                            placeholder="Delivery Type"
                            className="flex-center w-50 gap-2"
                            
                        />

                        // <div className="flex">
                        //     <div>
                        //         <Chec
                        //         <Label></Label>
                        //     </div>
                        // </div>
                    )}
                </div>

                <form 
                    className="flex-center-y justify-end gap-2 mt-4"
                    onSubmit={e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <AlertDialogCancel onClick={ () => setOpen(prev => !prev) }>Cancel</AlertDialogCancel>
                    <UpdateButton
                        type="submit"
                        onProcess={ onProcess }
                        label="Save Approval"
                        loadingLabel="Saving Approval"
                    />
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}