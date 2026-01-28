import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import { EmployeeService, PositionService } from "@/services/employee.service";
import { Claim } from "@/types/claims";
import { Employee, employeeFields, Positiion } from "@/types/employee";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchData } from "@/hooks/use-fetch-data";
import { ModalLoader } from "@/components/ui/loader";

interface Props {
    claims: Claim;
    toUpdate: Employee;
    setUpdate: React.Dispatch<React.SetStateAction<Employee | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateEmployee({ claims, toUpdate, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [employee, setEmployee] = useState<Employee>(toUpdate);

    const { data: positions, loading: loadingPositions, error } = useFetchData<Positiion>(
        PositionService.getAllPositions, 
    );

    async function handleSubmit() {
        try {
            setProcess(true);
            for (const field of employeeFields) {
                    if (employee[field] === "" || employee[field] === undefined || employee[field] === 0) {
                        toast.info("Please fill up all fields!");
                        return; 
                    }
                }
            const data = await EmployeeService.updateEmployee(employee);
            if (data) toast.success(`${employee.firstName} ${employee.lastName} updated successfully.`)
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setReload(prev => !prev);
            setProcess(false); 
            setUpdate(undefined);
        }
    }

    if (loadingPositions) return <ModalLoader />
    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined); } }>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Edit <span className="text-darkorange">{ `${toUpdate.firstName} ${toUpdate.lastName}` }</span></div>      
                </DialogTitle>
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
                    <UpdateButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Update Employee"
                        loadingLabel="Updating Employee"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}