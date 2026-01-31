import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SupplyService } from "@/services/supply.service";
import { Supply } from "@/types/supply";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Supply;
    setDelete: React.Dispatch<React.SetStateAction<Supply | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteSupply({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await SupplyService.deleteSupply(toDelete.sku!);
            toast.success(`Supply ${toDelete.name} deleted successfully.`)
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setProcess(false); 
            setDelete(undefined);
            setReload(prev => !prev); 
        }
    }

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setDelete(undefined) } }>
            <DialogContent>
                    <ModalTitle 
                        label="Delete"
                        spanLabel={ `${toDelete.name}?` }
                        spanLabelClassName="!text-darkred"
                    />
                    <form 
                        onSubmit={ e => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="flex justify-end items-center gap-4"
                    >
                        <DialogClose>Close</DialogClose>
                        <DeleteButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Delete Supply"
                            loadingLabel="Deleting Supply"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}