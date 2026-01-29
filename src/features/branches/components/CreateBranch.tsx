import { AddButton, Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleChange } from "@/lib/form-handle";
import { cn } from "@/lib/utils";
import { BranchService } from "@/services/branch.service";
import { Branch, branchFields, branchInit } from "@/types/branch";
import { User, userFields, userInit } from "@/types/user";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const status = ['Open', 'Under Renovation/Construction', 'Active', 'Inactive']; 

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateBranch({ setOpen, setReload }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);

    const [branch, setBranch] = useState<Branch>(branchInit);
    const [date, setDate] = useState<Date | undefined>();
    const [dateOpen, setDateOpen] = useState(false);

    async function handleSubmit() {
        try{         
            setProcess(true);
            let invalid = false;
            for (const field of branchFields) {
                if (!branch[field]) {
                    invalid = true;
                }
            }
            if (invalid) {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return
            }
            const data = await BranchService.addBranch(branch);
            if (data) {
                toast.success(`Branch ${branch.name} registered successfully!`);
                setReload(prev => !prev);
                setProcess(false);
                setOpen(!open);
            }    
        }
        catch(error){ toast.error(`${error}`) }
    }

    useEffect(() => {
        console.log(branch);
        
    }, [branch])

    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent className="h-9/10 overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Create Branch</div>      
                </DialogTitle>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 font-semibold">Branch Details</div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Branch Name</div>
                            <div className="flex border border-gray rounded-md max-md:w-full">
                                <input value="Krispy Papi" className="w-24 text-center border-0" readOnly />
                                <Input    
                                    className="w-full" 
                                    name ="name"  
                                    value={branch.name}
                                    onChange={ e => handleChange(e, setBranch)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Branch Status</div>
                            <Select 
                                value={ branch.status ?? "" }
                                onValueChange={ (value) => setBranch(prev => ({
                                    ...prev,
                                    status: value
                                }))}
                            >
                                <SelectTrigger className="w-full border border-gray" name="branchStatus">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        status.map((item, index) => (
                                            <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Branch Status</div>
                            <RadioGroup
                                className="mt-2 flex"
                                value={String(branch.isInternal)}              
                                name="isInternal"
                                onValueChange={(value) => {
                                    setBranch((prev) => ({
                                    ...prev,
                                    isInternal: value === "true",           
                                    }));
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" className="border border-dark" id="r1" />
                                    <Label htmlFor="r1">Internal Branch</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" className="border border-dark" id="r2" />
                                    <Label htmlFor="r2">External Branch</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="col-span-2 font-semibold mt-2">Location of the Branch</div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Street Address</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="streetAddress"  
                                value={branch.streetAddress}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Barangay</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="barangay"  
                                value={branch.barangay}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Municipality/City</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="city"  
                                value={branch.city}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Province</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="province"  
                                value={branch.province}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Code</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="code"  
                                value={branch.code}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Zip Code</div>
                            <Input    
                                className="w-full border border-gray max-md:w-full" 
                                name ="zipCode"  
                                value={branch.zipCode}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Add Branch"
                            loadingLabel="Adding Branch"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}