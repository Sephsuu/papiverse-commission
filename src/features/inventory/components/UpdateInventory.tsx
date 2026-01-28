import { AppSelect } from "@/components/shared/AppSelect";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import { InventoryService } from "@/services/inventory.service";
import { Inventory, inventoryFields } from "@/types/inventory";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    toUpdate: Inventory;
    setUpdate: React.Dispatch<React.SetStateAction<Inventory | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateInventory({ toUpdate, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [inventory, setInventory] = useState<Inventory>({ ...toUpdate, changedQuantity: 0, type: 'IN', unitType: 'BASE' });

    async function handleSubmit() {
        try{         
            setProcess(true);
            for (const field of inventoryFields) {
                if (
                    inventory[field] === '' ||
                    inventory[field] === null ||
                    inventory[field] === undefined ||
                    inventory[field] === 0
                ) {
                    toast.info("Please fill up all fields!");
                return; 
                }
            }
            const data = await InventoryService.createInventoryInput(inventory);
            if (data) {
                toast.success(`Supply ${inventory.name} updated successfully!`);  
                setReload(prev => !prev); 
                setUpdate(undefined);
            } 
        }
        catch(error){ toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    useEffect(() => {
        console.log(inventory);
        
    }, [inventory])

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent className="overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Update Inventory Quantity</div>      
                </DialogTitle>
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
                                className="w-full border-1 border-gray rounded-md max-md:w-full" 
                                value={ inventory.code }
                                disabled
                            />  
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Inventory Supply</div>
                            <Input    
                                className="w-full border-1 border-gray rounded-md max-md:w-full" 
                                value={ inventory.name }
                                disabled
                            />  
                        </div>                
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>Quantity Change</div>
                            <div className="flex border-1 border-gray rounded-md">
                                <Input    
                                    className="w-full border-1 border-none rounded-md max-md:w-full" 
                                    min={0.00001} 
                                    type="number"
                                    step="any"
                                    name="changedQuantity"  
                                    value={inventory.changedQuantity}
                                    onChange={ e => handleChange(e, setInventory)}
                                />  
                                <input disabled value={ inventory.unitType === 'BASE' ? inventory.unitMeasurement : inventory.convertedMeasurement } className={`w-20 text-center`} /> 
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Inventory Flow</div>
                            <AppSelect
                                items={ ['IN', 'OUT'] }
                                value={ inventory.type ?? 'IN' }
                                onChange={ (value) => setInventory(prev => ({
                                    ...prev,
                                    type: value
                                })) }
                            />   
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>Unit Type</div>
                            <AppSelect
                                items={ ['BASE', 'CONVERTED'] }
                                value={ inventory.unitType ?? 'BASE' }
                                onChange={ (value) => setInventory(prev => ({
                                    ...prev,
                                    unitType: value
                                })) }
                            />   
                        </div>
                        
                    </div>
                    
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update Inventory"
                            loadingLabel="Updating Inventory"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}