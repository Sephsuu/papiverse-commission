import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { DeleteButton } from "@/components/ui/button";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function ConfirmReject({ orderId, open, setOpen, setReload }: {
    orderId: number;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter();

    const [onProcess, setProcess] = useState(false);

    async function handleReject() {
        try {
            const data = await SupplyOrderService.updateOrderStatus(orderId, "REJECTED", false, false);
            if (data) {
                toast.success('Supply order has been rejected.')
                window.location.href = '/inventory/supply-orders'
            }
        } catch (error) {
            toast.error(`${error}`)
        } finally { setProcess(false) }
    }
    return (
        <AlertDialog open={ open } onOpenChange={ setOpen }>
            <AlertDialogContent>
                <ModalTitle label="Are you sure to reject order?" isAlertDialog />
                <form 
                    className="flex-center-y gap-4 justify-end"
                    onSubmit={  e => {
                        e.preventDefault();
                        handleReject();
                    }}
                >
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <DeleteButton 
                        type="submit"
                        onProcess={onProcess}
                        label="Yes, I'm sure"
                        loadingLabel="Rejecting Order"
                    />
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}