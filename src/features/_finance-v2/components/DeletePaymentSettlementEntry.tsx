import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { PaymentSettlementService, SettlementEntryType } from "@/services/paymentSettlement.service";
import React, { useState } from "react";
import { toast } from "sonner";

type LedgerEntry = {
    id: number;
    fromPersonId: number;
    toPersonId: number;
    fromPerson?: { id: number; displayName: string };
    toPerson?: { id: number; displayName: string };
    fromPersonName?: string;
    toPersonName?: string;
    amount: number;
    entryType: SettlementEntryType;
    description: string;
    weekLabel?: string;
    recordedAt?: string;
};

interface Props {
    toDelete: LedgerEntry;
    setDelete: React.Dispatch<React.SetStateAction<LedgerEntry | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeletePaymentSettlementEntry({ toDelete, setDelete, setReload }: Props) {
    const { claims } = useAuth();
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await PaymentSettlementService.softDeleteLedgerEntry(toDelete.id, {
                deletedBy: claims.username || `user-${claims.userId}`,
            });
            toast.success("Settlement entry deleted successfully.");
            setDelete(undefined);
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open={!!toDelete} onOpenChange={(open) => { if (!open) setDelete(undefined); }}>
            <DialogContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDelete();
                    }}
                >
                    <DialogTitle className="text-sm">
                        Are you sure you want to delete this settlement entry?
                    </DialogTitle>
                    <div className="mt-1 text-sm text-gray">
                        {toDelete.fromPerson?.displayName || toDelete.fromPersonName || "-"} to {toDelete.toPerson?.displayName || toDelete.toPersonName || "-"} ({toDelete.entryType})
                    </div>
                    <div className="mt-3 flex justify-end items-end gap-4">
                        <DialogClose>Close</DialogClose>
                        <DeleteButton
                            type="submit"
                            onProcess={onProcess}
                            label="Delete Entry"
                            loadingLabel="Deleting Entry"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
