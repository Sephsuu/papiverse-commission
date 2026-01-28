import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton, UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import { PositionService } from "@/services/employee.service";
import { Positiion } from "@/types/employee";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function UpdatePosition({ toUpdate, setUpdate, setReload }: {
    toUpdate: Positiion
    setUpdate: Dispatch<SetStateAction<Positiion | undefined>>
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    const [onProcess, setProcess] = useState(false);
    const [position, setPosition] = useState(toUpdate)

    async function handleSubmit() {
        try {
            setProcess(true);
            if (position.name === '') {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return
            }
            const data = await PositionService.updatePosition(position);
            if (data)  {
                toast.success(`Position ${position.name} updated successfully.`);
                setReload(prev => !prev);
                setUpdate(undefined);
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false); }
    }

    return (
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent>
                <ModalTitle label="Update" spanLabel={`${toUpdate.name}`} />
                <div className="flex flex-col gap-1">
                    <div>Position Name</div>
                    <Input    
                        className="w-full border border-gray max-md:w-full" 
                        name ="name"  
                        value={position.name}
                        onChange={ e => handleChange(e, setPosition)}
                    />
                </div>
                <form
                    onSubmit={ e => {
                        e.preventDefault(),
                        handleSubmit();
                    } } 
                    className="flex justify-end gap-4 mt-2"
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <UpdateButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Update Position"
                        loadingLabel="Updating Position"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}