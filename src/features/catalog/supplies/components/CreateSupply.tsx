import { AddButton } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { Supply, supplyFields, supplyInit } from "@/types/supply";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { handleChange } from "@/lib/form-handle";
import { SupplyService } from "@/services/supply.service";

const categories = ["MEAT", "SNOWFROST", "NONDELIVERABLES"];
const units = ["bar","block","bottle","box","bundle","can","gallon","grams","kilograms","liter","milligrams","milliliters","oz","pack","piece","roll","serving","set","tray","tub"]

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    supplies: Supply[]
}

export function CreateSupply({ setOpen, setReload, supplies }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [inventorySourceOpen, setInventorySourceOpen] = useState(false);

    const [supply, setSupply] = useState<Partial<Supply>>(supplyInit);
    const { search, setSearch, filteredItems } = useSearchFilter(supplies, ["name", "sku"]);

    const selectedInventorySource = supplies.find(
        (item) => item.sku === supply.inventorySourceSku
    );

    async function handleSubmit() {
        try{         
            setProcess(true);
            let invalid = false;
            for (const field of supplyFields) {
            const value = supply[field];
            if (value === "" || value === undefined || value === null) {
                invalid = true;
            }
            // if (typeof value === "number" && value === 0) {
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
            const data = await SupplyService.addSupply(supply);
            if (data) {
                toast.success(`Supply ${supply.name} registered successfully!`); 
                setReload(prev => !prev);
                setProcess(false);
                setOpen(!open);
            }   
        }
        catch(error){ toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent className="max-h-9/10 overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Create Supply</div>      
                </DialogTitle>
                <form className="flex flex-col gap-4" onSubmit={ e => {
                    e.preventDefault();
                    handleSubmit();
                }}
                >
                    <div className="grid grid-cols-2 gap-2">
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
                                        unitMeasurement: value,
                                        convertedMeasurement: value
                                    })) }
                                >
                                    <SelectTrigger className="w-full border-0">
                                        <SelectValue placeholder="Select Measurement" />
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
                        <div className="flex flex-col gap-1">
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
                            <div>Unit Cost</div>
                            <div className="flex border border-gray rounded-md">
                                <input disabled value="₱" className="w-10 text-center" /> 
                                <Input 
                                    type="number"
                                    className="w-full max-md:w-full" 
                                    name ="unitCost"  
                                    value={ supply.unitCost }
                                    onChange={ e => handleChange(e, setSupply) }
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

                        <div className="mt-2 flex flex-col gap-1">
                            <div>Inventory Source</div>
                            <Popover
                                open={inventorySourceOpen}
                                onOpenChange={(isOpen) => {
                                    setInventorySourceOpen(isOpen);

                                    if (!isOpen) {
                                        setSearch("");
                                    }
                                }}
                            >
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-md border border-gray px-3 py-1.5 text-left text-sm ${
                                            selectedInventorySource ? "text-foreground" : "text-muted-foreground"
                                        }`}
                                    >
                                        <span className="truncate">
                                            {selectedInventorySource
                                                ? `${selectedInventorySource.sku} - ${selectedInventorySource.name}`
                                                : "Select Source"}
                                        </span>
                                        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
                                    </button>
                                </PopoverTrigger>

                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] max-h-72 overflow-hidden p-0"
                                side="bottom"
                                align="center"
                                sideOffset={8}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <Command className="max-h-72">
                                    <CommandInput
                                        placeholder="Search for a supply"
                                        value={search}
                                        onValueChange={setSearch}
                                        autoFocus={false}
                                    />
                                    <ScrollArea className="h-60">
                                        <CommandList className="max-h-none overflow-visible">
                                            {filteredItems.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No items available for &quot;{search}&quot;
                                                </div>
                                            )}

                                            {filteredItems.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    onSelect={() => {
                                                        setSupply((prev) => ({
                                                            ...prev,
                                                            inventorySourceSku: item.sku ?? null,
                                                            stockFactor: prev.stockFactor ?? 1,
                                                        }));
                                                        setSearch("");
                                                        setInventorySourceOpen(false);
                                                    }}
                                                >
                                                    {item.sku} - {item.name}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </ScrollArea>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        </div>

                        <div className="mt-2 flex flex-col gap-1">
                            <div>Stock Factor</div>
                            <Input
                                type="number"
                                min="0"
                                step="0.001"
                                inputMode="decimal"
                                className="w-full border border-gray rounded-md max-md:w-full"
                                name="stockFactor"
                                value={supply.stockFactor ?? ""}
                                onChange={ e => handleChange(e, setSupply) }
                                disabled={!supply.inventorySourceSku}
                            />
                        </div>
                    
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Add Supply"
                            loadingLabel="Adding Supply"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
