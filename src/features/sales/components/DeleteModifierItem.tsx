import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ModifierItemService } from "@/services/modifier.service";
import { SupplyService } from "@/services/supply.service";
import { ModifierItem } from "@/types/modifier";
import { Supply } from "@/types/supply";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: ModifierItem;
    setDelete: React.Dispatch<React.SetStateAction<ModifierItem | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteModifierItem({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    
    async function handleDelete() {
        try {
            setProcess(true);
            await ModifierItemService.deleteModifierItem(toDelete.id);
            toast.success(`Modifier item ${toDelete.name} deleted successfully.`)
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
                            label="Delete Item"
                            loadingLabel="Deleting Item"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}