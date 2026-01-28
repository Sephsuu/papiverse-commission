import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton, UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modifier } from "@/types/modifier";
import { hasEmptyField } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ModifierGroupService } from "@/services/modifier.service";

interface Props {
    toUpdate: Modifier
    setUpdate: React.Dispatch<React.SetStateAction<Modifier | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateModifierGroup({ toUpdate, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [modifierGroup, setModifierGroup] = useState<Modifier>(toUpdate); 

    async function handleSubmit() {
        try {
            setProcess(true);
            if (hasEmptyField(modifierGroup)) return toast.warning('Please fill up all the fields');
            const data = await ModifierGroupService.updateModifierGroup(modifierGroup);
            if (data) toast.success(`Modifier ${toUpdate.name} updated successfully.`)
            setUpdate(undefined);
            setReload(prev => !prev);
        } catch(error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent className="overflow-y-auto">
                <ModalTitle label="Create Modifier Group" />
                <form 
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Group Name</div>
                            <Input    
                                className="w-full border-1 border-gray rounded-md max-md:w-full" 
                                name ="name"  
                                value={modifierGroup.name}
                                onChange={ e => handleChange(e, setModifierGroup)}
                            />  
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Description</div>
                            <Textarea    
                                className="w-full border-1 border-gray rounded-md max-md:w-full" 
                                name ="description"  
                                value={modifierGroup.description}
                                onChange={ e => handleChange(e, setModifierGroup)}
                            />  
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update Group"
                            loadingLabel="Updating Group"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}