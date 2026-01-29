import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { BranchService } from "@/services/branch.service";
import { UserService } from "@/services/user.service";
import { Branch } from "@/types/branch";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Branch;
    setDelete: React.Dispatch<React.SetStateAction<Branch | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteBranch({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await BranchService.deleteBranch(toDelete.id!);
            toast.success(`Branch ${toDelete.name} deleted successfully.`)
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
                <ModalTitle 
                    label="Delete" 
                    spanLabel={ `${toDelete.name}?` } 
                    spanLabelClassName="!text-darkred"
                />
                    <form 
                        className="flex justify-end items-center gap-4"
                        onSubmit={ e => {
                            e.preventDefault();
                            handleDelete();
                        }}
                    >
                        <DialogClose>Close</DialogClose>
                        <DeleteButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Delete Branch"
                            loadingLabel="Deleting Branch"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}