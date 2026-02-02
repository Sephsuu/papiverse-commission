import { ModalTitle } from "@/components/shared/ModalTitle";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleChange } from "@/lib/form-handle";
import { SupplyService } from "@/services/supply.service";
import { Supply, supplyFields } from "@/types/supply";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const categories = ["MEAT", "SNOWFROST", "NONDELIVERABLES"];
const units = ["bar","block","bottle","box","bundle","can","gallon","grams","kilograms","liter","milligrams","milliliters","oz","pack","piece","roll","serving","set","tray"]

interface Props {
    toUpdate: Supply;
    setUpdate: React.Dispatch<React.SetStateAction<Supply | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateSupply({ toUpdate, setUpdate, setReload }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);

    const [supply, setSupply] = useState<Supply>(toUpdate);

    async function handleSubmit() {
        try{         
            setProcess(true);
            let invalid = false;
            for (const field of supplyFields) {
            const value = supply[field];
            if (value === "" || value === undefined || value === null) {
                invalid = true;
            }
            // if (typeof value === "number") {
            //     if (supply.isDeliverables) {
            //         invalid = true;
            //     }
            // }
            }
            if (invalid) {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return;
            }
            const data = await SupplyService.updateSupply(supply);
            if (data) {
                toast.success(`Supply ${supply.name} updated successfully!`);   
                setReload(prev => !prev); 
                setUpdate(undefined);
            } 
        }
        catch(error){ toast.error(`${error}`) }
        finally { 
            
            setProcess(false);
        }
    }

    useEffect(() => {
        console.log(supply);
    }, [supply])
    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent className="h-9/10 overflow-y-auto">
                <ModalTitle label="Update" spanLabel={ toUpdate.name }/>
                <form 
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>SKU ID</div>
                            <Input    
                                className="w-full border border-gray rounded-md max-md:w-full" 
                                value={supply.sku}
                                disabled
                            />  
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Category</div>
                            <Select
                                value={ supply.category }
                                onValueChange={ (value) => setSupply(prev => ({
                                    ...prev,
                                    category: value
                                })) }
                            >
                                <SelectTrigger className="w-full border border-gray">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((item, index) => (
                                        <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Supply Name</div>
                            <Input    
                                className="w-full border border-gray rounded-md max-md:w-full" 
                                name ="name"  
                                value={supply.name}
                                onChange={ e => handleChange(e, setSupply)}
                            />  
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Unit Measurement</div>
                            <div className="flex border border-gray rounded-md max-md:w-full">
                                <Input    
                                    className="w-full border-0" 
                                    type="number"
                                    name ="unitQuantity"  
                                    value={supply.unitQuantity}
                                    onChange={ e => handleChange(e, setSupply)}
                                />  
                                <Select
                                    value={ supply.unitMeasurement }
                                    onValueChange={ (value) => setSupply(prev => ({
                                        ...prev,
                                        unitMeasurement: value
                                    })) }
                                >
                                    <SelectTrigger className="w-full border-0">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((item, index) => (
                                            <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Converted Measurement</div>
                            <div className="flex border border-gray rounded-md max-md:w-full">
                                <Input    
                                    className="w-full border-0" 
                                    type="number"
                                    name ="convertedQuantity"  
                                    value={supply.convertedQuantity ?? 0}
                                    onChange={ e => handleChange(e, setSupply)}
                                />  
                                <Select
                                    value={ supply.convertedMeasurement }
                                    onValueChange={ (value) => setSupply(prev => ({
                                        ...prev,
                                        convertedMeasurement: value
                                    })) }
                                >
                                    <SelectTrigger className="w-full border-0">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((item, index) => (
                                            <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* <div className="flex flex-col gap-1">
                            <div>Internal Price</div>
                            <div className="flex border border-gray rounded-md">
                                <input disabled value="₱" className={`${!supply.isDeliverables && "text-gray"} w-10 text-center`} />
                                <Input 
                                    type="number"
                                    className="w-full max-md:w-full" 
                                    name ="unitPriceInternal"  
                                    value={ supply.isDeliverables ? supply.unitPriceInternal : 0 }
                                    onChange={ e => handleChange(e, setSupply) }
                                    disabled={ !supply.isDeliverables }
                                />
                            </div>
                        </div> */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>External Price</div>
                            <div className="flex border border-gray rounded-md">
                                <input disabled value="₱" className={`${!supply.isDeliverables && "text-gray"} w-10 text-center`} />
                                <Input 
                                    type="number"
                                    className="w-full max-md:w-full" 
                                    name ="unitPriceExternal"  
                                    value={ supply.isDeliverables ? supply.unitPriceExternal : 0 }
                                    onChange={ e => handleChange(e, setSupply) }
                                    disabled={ !supply.isDeliverables }
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                        <div>Delivery Type</div>
                        <Select
                            value={ supply.isDeliverables ? "true" : "false" }
                            onValueChange={ (value) => setSupply(prev => ({
                                ...prev,
                                isDeliverables: value === "true" ? true : false
                            })) }
                        >
                            <SelectTrigger className="w-full border-gray">
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">DELIVERABLES</SelectItem>
                                <SelectItem value="false">NON-DELIVERABLES</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Minimum Required Stock</div>
                        <div className="flex border border-gray rounded-md">
                            <Input 
                                type="number"
                                className="w-full border-0 max-md:w-full" 
                                name ="minStock"  
                                value={ supply.minStock }
                                onChange={ e => handleChange(e, setSupply) }
                            />
                            <Input 
                                className="w-full border-0"
                                value={ supply.unitMeasurement }
                                readOnly
                            />
                        </div>
                    </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update Supply"
                            loadingLabel="Updating Supply"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}