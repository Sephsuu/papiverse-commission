import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SupplyOrderPaymentService } from "@/services/supplyOrderPayment.service";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function DeleteSupplyOrderPayment({
    toDelete,
    setDelete,
    setReload,
}: {
    toDelete: any;
    setDelete: Dispatch<SetStateAction<any | undefined>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await SupplyOrderPaymentService.deletePayment(toDelete.paymentId);
            toast.success(`Payment #${toDelete.paymentId} deleted successfully.`);
            setDelete(undefined);
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open={!!toDelete} onOpenChange={(open) => { if (!open) setDelete(undefined) }}>
            <DialogContent>
                <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
                    <DialogTitle className="text-sm">
                        Are you sure you want to delete payment <span className="text-darkred">#{toDelete.paymentId}</span>?
                    </DialogTitle>
                    <div className="flex justify-end items-end gap-4">
                        <DialogClose>Close</DialogClose>
                        <DeleteButton type="submit" onProcess={onProcess} label="Delete Payment" loadingLabel="Deleting Payment" />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
