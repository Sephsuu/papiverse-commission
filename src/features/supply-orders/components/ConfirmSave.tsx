import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { UpdateButton } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SupplyOrder } from "@/types/supplyOrder";
import { MoveRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function ConfirmSave({ setOpen, order, meatApproved, snowApproved, onProcess, handleSubmit }: {
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
                        <div className="text-center">Snowfrost Order Approval</div>
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