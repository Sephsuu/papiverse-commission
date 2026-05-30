"use client";

import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { CommissionOwnerService } from "@/services/commissionOwner.service";
import { CommissionOwnerProduct } from "@/types/commissionOwner";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface Props {
    ownerId: number;
    ownerName: string;
    toDelete: CommissionOwnerProduct;
    setDelete: Dispatch<SetStateAction<CommissionOwnerProduct | undefined>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}

export function DeleteAssignedCommissionProduct({
    ownerId,
    ownerName,
    toDelete,
    setDelete,
    setReload,
}: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await CommissionOwnerService.removeProductAssignment(ownerId, toDelete.raw_material_id);
            toast.success(`${toDelete.name} removed from ${ownerName}.`);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
            setDelete(undefined);
            setReload((prev) => !prev);
        }
    }

    return (
        <Dialog open={!!toDelete} onOpenChange={(open) => { if (!open) setDelete(undefined); }}>
            <DialogContent>
                <ModalTitle
                    label="Remove"
                    spanLabel={`${toDelete.name}?`}
                    spanLabelClassName="!text-darkred"
                />
                <div className="text-sm text-gray">
                    This will remove the product assignment from <span className="font-semibold text-dark">{ownerName}</span>.
                </div>
                <form
                    className="flex items-center justify-end gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDelete();
                    }}
                >
                    <DialogClose>Close</DialogClose>
                    <DeleteButton
                        type="submit"
                        onProcess={onProcess}
                        label="Remove Product"
                        loadingLabel="Removing"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
