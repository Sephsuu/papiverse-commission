import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModalLoader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchData } from "@/hooks/use-fetch-data";
import { handleChange } from "@/lib/form-handle";
import { EmployeeService, PositionService } from "@/services/employee.service";
import { Claim } from "@/types/claims";
import { Employee, employeeFields, employeeInit, Positiion } from "@/types/employee";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
    claims: Claim;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateEmployee({ claims, setOpen, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [employee, setEmployee] = useState<Employee>(employeeInit);

    const { data: positions, loading: loadingPositions, error } = useFetchData<Positiion>(
        PositionService.getAllPositions, 
    );

    async function handleSubmit() {
        try {
            setProcess(true);
            let invalid = false;
            for (const field of employeeFields) {
                if (!employee[field]) {
                    invalid = true;
                }
            }
            if (invalid) {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return
            }
            const data = await EmployeeService.createEmployee(employee, claims.branch.branchId);
            if (data)  {
                toast.success(`${employee.firstName} ${employee.lastName} added successfully.`);
                setReload(prev => !prev);
                setOpen(!open);
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false); }
    }

    if (loadingPositions) return <ModalLoader />
    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <ModalTitle label="All Employees" />
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                        <div>First Name</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="firstName"  
                            value={employee.firstName}
                            onChange={ e => handleChange(e, setEmployee)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Middle Name</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="middleName"  
                            placeholder="(optional)"
                            value={employee.middleName}
                            onChange={ e => handleChange(e, setEmployee)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Last Name</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="lastName"  
                            value={employee.lastName}
                            onChange={ e => handleChange(e, setEmployee)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>E-mail Address</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="email"  
                            value={employee.email}
                            onChange={ e => handleChange(e, setEmployee)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Position</div>
                        <Select
                            value={ employee.position }
                            onValueChange={ (value) => setEmployee(prev => ({
                                ...prev,
                                position: value
                            })) }
                        >
                            <SelectTrigger className="w-full border-gray">
                                <SelectValue placeholder="Select Position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((item) => (
                                    <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <form 
                    className="flex justify-end gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Add Employee"
                        loadingLabel="Adding Employee"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}