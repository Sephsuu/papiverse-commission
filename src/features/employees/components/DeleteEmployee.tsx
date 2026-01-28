import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmployeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Employee;
    setDelete: React.Dispatch<React.SetStateAction<Employee | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteEmployee({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await EmployeeService.deleteEmployee(toDelete.id!);
            toast.success(`Employee ${toDelete?.firstName} ${toDelete.lastName} deleted successfully.`)
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
                    spanLabel={`${toDelete.firstName} ${toDelete.lastName}?`}
                    spanLabelClassName="text-darkred"
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
                        label="Delete Employee"
                        loadingLabel="Deleting Employee"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}