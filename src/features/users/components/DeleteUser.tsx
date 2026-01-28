import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { UserService } from "@/services/user.service";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: User;
    setDelete: React.Dispatch<React.SetStateAction<User | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteUser({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await UserService.deleteUser(toDelete.id!);
            toast.success(`User ${toDelete?.firstName} ${toDelete.lastName} deleted successfully.`)
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
                    spanLabel={ `${toDelete.firstName} ${toDelete.lastName}?` } 
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
                            label="Delete User"
                            loadingLabel="Deleting User"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}