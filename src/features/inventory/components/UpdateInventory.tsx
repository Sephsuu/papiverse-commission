import { AppSelect } from "@/components/shared/AppSelect";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModalLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Inventory, inventoryFields } from "@/types/inventory";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

const tabs = ["NORMAL INPUT", "PRODUCTION INPUT"] as const;
const inventoryFlows = ["IN", "OUT"] as const;

interface Props {
    toUpdate: Inventory;
    setUpdate: React.Dispatch<React.SetStateAction<Inventory | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateInventory({ toUpdate, setUpdate, setReload }: Props) {
    const { loading: authLoading, isFranchisor } = useAuth();

    const [onProcess, setProcess] = useState(false);
    const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
    const [inventory, setInventory] = useState<Inventory>({
        ...toUpdate,
        changedQuantity: 0,
        type: 'IN',
        unitType: 'BASE',
        source: 'INPUT',
        unitCost: toUpdate.unitCost,
    });
    const [changedQuantityInput, setChangedQuantityInput] = useState("0");

    function handleChangedQuantityChange(value: string) {
        const sanitizedValue = sanitizeDecimalInput(value);

        setChangedQuantityInput(sanitizedValue);
        setInventory((prev) => ({
            ...prev,
            changedQuantity: parseOptionalDecimal(sanitizedValue),
        }));
    }

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
            if (
                tab === "PRODUCTION INPUT" &&
                inventory.type === "IN" &&
                (!inventory.unitCost || inventory.unitCost <= 0)
            ) {
                toast.info("Please provide a valid unit cost for production input!");
                return;
            }

            const payload: Inventory = {
                ...inventory,
                type: inventory.type,
                source: "INPUT",
                unitCost:
                    tab === "PRODUCTION INPUT" && inventory.type === "IN"
                        ? inventory.unitCost
                        : undefined,
            };

            const data = await InventoryService.createInventoryInput(payload);
            if (data) {
                toast.success(`Supply ${inventory.name} updated successfully!`);  
                setReload(prev => !prev); 
                setUpdate(undefined);
            } 
        }
        catch(error){ toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    if (authLoading) return <ModalLoader />
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

                {isFranchisor && (
                    <div className="mt-2 flex w-full">
                        {tabs.map((item) => {
                            const isActive = tab === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setTab(item)}
                                    className={`group relative w-full pb-4 text-center text-sm font-medium transition-colors
                                        ${isActive ? "text-darkbrown font-semibold" : "text-slate-500 hover:text-darkbrown"}
                                    `}
                                >
                                    <span className="block truncate">{item}</span>
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 bg-darkbrown transition-all duration-300
                                            ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-orange-100"}
                                        `}
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}

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
                                value={ inventory.sku }
                                disabled
                            />  
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Inventory Supply</div>
                            <Input    
                                className="w-full border border-gray rounded-md max-md:w-full" 
                                value={ inventory.name }
                                disabled
                            />  
                        </div>                
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>{tab === "PRODUCTION INPUT" ? "Produced Quantity" : "Quantity Change"}</div>
                            <div className="flex border border-gray rounded-md">
                                <Input    
                                    className="w-full border border-none rounded-md max-md:w-full" 
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.]?[0-9]{0,2}"
                                    name="changedQuantity"  
                                    value={changedQuantityInput}
                                    onChange={(e) => handleChangedQuantityChange(e.target.value)}
                                />  
                                <input disabled value={ inventory.unitType === 'BASE' ? inventory.unitMeasurement : inventory.convertedMeasurement } className={`w-20 text-center`} /> 
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Inventory Flow</div>
                            <AppSelect
                                items={ [...inventoryFlows] }
                                value={ inventory.type ?? "IN" }
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
                        {tab === "PRODUCTION INPUT" && inventory.type === "IN" && (
                            <div className="flex flex-col gap-1">
                                <div>Unit Cost</div>
                                <Input
                                    className="w-full border border-gray rounded-md max-md:w-full"
                                    value={inventory.unitCost ? formatToPeso(inventory.unitCost) : "Not available"}
                                    disabled
                                />
                            </div>
                        )}
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
