import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExpenseService } from "@/services/expense.service";
import { Expense } from "@/types/expense";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Expense;
    setDelete: React.Dispatch<React.SetStateAction<Expense | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteExpense({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await ExpenseService.deleteExpense(toDelete.id!);
            toast.success(`Expense ${toDelete.purpose} deleted successfully.`)
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setProcess(false); 
            setDelete(undefined);
            setReload(prev => !prev); 
        }
    }

    return(
        <Dialog open={ !!toDelete } onOpenChange={ (open) => { if (!open) setDelete(undefined) } }>
            <DialogContent>
                <DialogTitle className="text-sm">Are you sure you want to delete expense <span className="text-darkred">{ toDelete.purpose }</span></DialogTitle>
                    <div className="flex justify-end items-end gap-4">
                        <DialogClose>Close</DialogClose>
                        <DeleteButton
                            type="submit"
                            onProcess={ onProcess }
                            label="Delete Expenditure"
                            loadingLabel="Deleting Expenditure"
                        />
                    </div>
            </DialogContent>
        </Dialog>
    );
}