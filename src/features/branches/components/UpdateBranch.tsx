import { AddButton, Button, UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleChange } from "@/lib/form-handle";
import { BranchService } from "@/services/branch.service";
import { Branch, branchFields, branchInit } from "@/types/branch";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const status = ['OPEN', 'UNDER RENOVATION/CONSTRUCTION', 'ACTIVE', 'INACTIVE']; 

interface Props {
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    toUpdate: Branch;
    setUpdate: React.Dispatch<React.SetStateAction<Branch | undefined>>;
}

export function UpdateBranch({setReload, toUpdate, setUpdate }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [branch, setBranch] = useState<Branch>(toUpdate);

    async function handleSubmit() {
        try{         
            setProcess(true);
            for (const field of branchFields) {
                if (
                    branch[field] === "" ||
                    branch[field] === null ||
                    branch[field] === undefined
                ) {
                    toast.info("Please fill up all fields!");
                return; 
                }
            }
            const data = await BranchService.updateBranch(branch);
            if (data) {
                toast.success(`Branch ${branch.name} updated successfully!`);   
                setReload(prev => !prev);
                setProcess(false);
                setUpdate(undefined); 
            }
        }
        catch(error){ toast.error(`${error}`) }
    }

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent className="h-9/10 overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Edit <span className="text-darkorange">{ toUpdate.name }</span></div>      
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
                                    status : value
                                }))}
                            >
                                <SelectTrigger className="w-full border border-gray" name="status">
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
                                    <Label htmlFor="r2">External False</Label>
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
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update Branch"
                            loadingLabel="Updating Branch"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}