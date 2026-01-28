import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import { PositionService } from "@/services/employee.service";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function CreatePosition({ setOpen, setReload }: {
    setOpen: Dispatch<SetStateAction<boolean>>
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    const [onProcess, setProcess] = useState(false);
    const [position, setPosition] = useState({ name: '' })

    async function handleSubmit() {
        try {
            setProcess(true);
            if (position.name === '') {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return
            }
            const data = await PositionService.createPosition(position);
            if (data)  {
                toast.success(`Position ${position.name} added successfully.`);
                setReload(prev => !prev);
                setOpen(!open);
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false); }
    }

    return (
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <ModalTitle label="Create New Position" />
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
                    <AddButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Create Position"
                        loadingLabel="Creating Position"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}