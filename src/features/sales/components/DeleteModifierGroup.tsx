import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ModifierGroupService } from "@/services/modifier.service";
import { Modifier } from "@/types/modifier";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Modifier;
    setDelete: React.Dispatch<React.SetStateAction<Modifier | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteModifierGroup({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    
    async function handleDelete() {
        try {
            setProcess(true);
            await ModifierGroupService.deleteModifierGroup(toDelete.id!);
            toast.success(`Modifier group ${toDelete.name} deleted successfully.`)
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
                            label="Delete Group"
                            loadingLabel="Deleting Group"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}