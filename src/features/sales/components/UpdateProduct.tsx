import { ModalTitle } from "@/components/shared/ModalTitle";
import { UpdateButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModalLoader } from "@/components/ui/loader";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { handleChange } from "@/lib/form-handle";
import { ModifierGroupService } from "@/services/modifier.service";
import { ProductService } from "@/services/product.service";
import { SupplyService } from "@/services/supply.service";
import { Modifier } from "@/types/modifier";
import { Product, productFields } from "@/types/products";
import { SupplyItem } from "@/types/supplyOrder";
import { link } from "fs";
import { Plus, Salad, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const categories = ["A'LA CARTE", "AFFORDABLE RICE MEALS", "ALL IN RICE BOWL", "BIG EVENT? WE GOT YOU", "BILAO BLOW OUT", "BINALOT NI PAPI", "BITES", "BURGERS", "CHEF'S PASTA", "CHEF'S PASTA 4-5 PAX", "COMBO A", "COMBO B", "COMBO C", "COMBO D", "COMBO E", "CRUNCHICKEN", "CRUNCHY BAGNET", "DINNER NIGHT TIME", "EXTRAS", "GRILLED SIZZLING BBQ DEALS", "KOPI NI PAPI", "KRISPY DELIGHTS", "KRISPY SISIG", "OVERLOAD SARAP", "PAPI FRIES", "PAPI'S FRUIT SODA", "PREMIUM BUNDLE DEALS", "QUENCHERS", "SALAD BLENDS", "SALO SALO SPECIAL", "SIGNATURE PLATES", "SIZZLING MEALS", "SNOWFROST HALO MIX", "SULIT RICE MIX", "ULTIMATE BUNDLE DEALS", "UNLI DEALS"];

interface Props {
    toUpdate: Product;
    setUpdate: React.Dispatch<React.SetStateAction<Product | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateProduct({ toUpdate, setUpdate, setReload }: Props) {
    console.log(toUpdate);
    
    const [onProcess, setProcess] = useState(false);
    const [product, setProduct] = useState<Product>(toUpdate);
    const [selectedItems, setSelectedItems] = useState<SupplyItem[]>(toUpdate.itemsNeeded);
    const [selectedGroups, setSelectedGroups] = useState<Modifier[]>(toUpdate.groups!);
    const [removedGroups, setRemovedGroups] = useState<{productId: number, groupId: number}[]>([]);
        
    const { data: supplies, loading } = useFetchData(SupplyService.getAllSupplies);
    const { data: products, loading: productsLoading } = useFetchData(ProductService.getAllProducts);
    const { data: modifiers, loading: modifierLoading } = useFetchData<Modifier>(ModifierGroupService.getAllModifierGroups);

    const { setSearch, filteredItems } = useSearchFilter(supplies, ['name', 'code']);
    const { setSearch: setSearchProduct, filteredItems: filteredProducts } = useSearchFilter(products, ['name']);
    const { setSearch: setSearchGroup, filteredItems: filteredGroups } = useSearchFilter(modifiers, ['name']);    

    const availableGroups = filteredGroups.filter(
        (group) => !selectedGroups.some((selected) => selected.id === group.id)
    );

    const handleSelect = async (code: string) => {
        if (!selectedItems.find((item: SupplyItem) => item.sku === code)) {
            const selectedItem = supplies.find(item => item.code === code);
            if (selectedItem) {
            setSelectedItems([
                ...selectedItems,
                { id: selectedItem.id, sku: selectedItem.code, name: selectedItem.name, quantity: 1, unitMeasurement: selectedItem.convertedMeasurement, unitPrice: selectedItem.unitPrice, category: selectedItem.category, type: "RAW", forTakeOut: false }
            ]);
            } else {
                console.warn(`Item with code ${code} not found.`);
            }
        }
    };

    const handleProductSelect = async (id: number) => {
        if (!selectedItems.find((item: SupplyItem) => item.id === id)) {
            const selectedItem = products.find(item => item.id === id);
            if (selectedItem) {
            setSelectedItems([
                ...selectedItems,
                { id: selectedItem.id, sku: "", name: selectedItem.name, quantity: 1, type: "PRODUCT", forTakeOut: false }
            ]);
            } else {
                console.warn(`Item with code ${id} not found.`);
            }
        }
    };

    const handleGroupSelect = (id: number) => {
        const isAlreadySelected = selectedGroups.some(group => group.id === id);
        if (isAlreadySelected) {
            setSelectedGroups(prev => prev.filter(group => group.id !== id));
            setRemovedGroups(prev => [
                ...prev,
                { groupId: id, productId: toUpdate.id! }
            ]);
        } else {
            setSelectedGroups(prev => [
                ...prev,
                modifiers.find(group => group.id === id)!
            ]);
            setRemovedGroups(prev =>
                prev.filter(r => r.groupId !== id)
            );
        }
    };

    const handleQuantityChange = async (id: number, quantity: number | string | null) => {
        setSelectedItems(selectedItems.map((item: SupplyItem) => 
            item.id === id 
                ? { ...item, quantity: quantity } 
                : item
        ));
    };

    const handleRemove = async (id: number) => {
        setSelectedItems(selectedItems.filter((item: SupplyItem) => item.id !== id));
    };

    const handleForTakeout = async (id: number) => {
        const foundItem = selectedItems.find(i => i.id === id);
        setSelectedItems(prev => 
            prev.map(item =>
                item.id === id
                    ? { ...item, forTakeOut: foundItem!.forTakeOut ? false : true } 
                    : item
            )
        )
    }

    async function handleSubmit() {
        try {
            setProcess(true);
            setProduct(prev => ({
                ...prev,
                itemsNeeded: selectedItems
            }))
            for (const field of productFields) {
                if (product[field] === "" || product[field] === undefined || product[field] === 0) {
                    toast.info("Please fill up all fields!");
                    return; 
                }
            }
            // if (selectedItems.length <= 0) return toast.info("Please fill up all fields!");
            const updatedData = {
                ...product,
                itemsNeeded: selectedItems
            }
            
            const originalGroupIds = (toUpdate.groups ?? [])
                .map(g => g.id)
                .filter((id): id is number => id !== undefined);

            const selectedGroupIds = selectedGroups
                .map(g => g.id)
                .filter((id): id is number => id !== undefined);

            const addedGroupIds = selectedGroupIds.filter(id => !originalGroupIds.includes(id));
            const removedGroupIds = originalGroupIds.filter(id => !selectedGroupIds.includes(id));

            const addedGroupsPayload = addedGroupIds.map(groupId => ({
                groupId,
                productId: toUpdate.id!
            }));

            const removedGroupsPayload = removedGroupIds.map(groupId => ({
                groupId,
                productId: toUpdate.id!
            }));

            if (addedGroupsPayload.length > 0) {
                const linkData = await ProductService.linkProductGroup(addedGroupsPayload);
                if (linkData) toast.success('Modifier group added sucessfully.');
                if (!linkData) return toast.error('Cannot create link on products and modifier group.');
            }

            if (removedGroupsPayload.length > 0) {
                const removedData = await ProductService.deleteProductLink(removedGroupsPayload);
                if (removedData) toast.success('Modifier group removed sucessfully.');
                if (!removedData) return toast.error('Cannot delete link on products and modifier group.');
            }

            const productChanged = JSON.stringify(updatedData) !== JSON.stringify(toUpdate);
            const groupsChanged = addedGroupIds.length > 0 || removedGroupIds.length > 0;

            if (productChanged || groupsChanged) {
                const data = await ProductService.updateProduct(updatedData);
                setUpdate(undefined);
                setReload(prev => !prev);
                if (data) return toast.success(`Product ${toUpdate.name} updated successfully.`);
                if (!data) return toast.error('Cannot update product.');
            } else return toast.info('No data has been changed.')
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    if (loading || productsLoading || modifierLoading) return <ModalLoader />
    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined)} }>
            <DialogContent className="overflow-y-auto">
                <ModalTitle
                    label="Update"
                    spanLabel={toUpdate.name}
                />
                <form 
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Product Name</div>
                            <Input    
                                className="w-full border-1 border-gray rounded-md max-md:w-full" 
                                name ="name"  
                                value={product.name}
                                onChange={ e => handleChange(e, setProduct)}
                            />  
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Category</div>
                            <Select
                                value={ product.category }
                                onValueChange={ (value) => setProduct(prev => ({
                                    ...prev,
                                    category: value
                                })) }
                            >
                                <SelectTrigger className="w-full border-1 border-gray">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((item, index) => (
                                        <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Price</div>
                            <div className="flex border-1 border-gray rounded-md max-md:w-full">
                                <input disabled value="₱" className="text-center w-10" />
                                <Input    
                                    className="w-full border-0" 
                                    type="number"
                                    name ="price"  
                                    value={product.price}
                                    onChange={ e => handleChange(e, setProduct)}
                                /> 
                            </div>  
                        </div>

                        <div className="relative col-span-2 border-1 rounded-md shadow-xs mt-4 px-2 pb-2 h-50 overflow-y-auto overflow-x-scroll">
                            <div className="flex-center-y sticky top-0 left-0 bg-white">
                                <Select onValueChange={ handleSelect }>
                                    <SelectTrigger 
                                        hideIcon={ true }
                                        className="flex items-center justify-center border-0 w-full hover:underline"
                                    >
                                        <Plus strokeWidth={ 2 } className="w-5 h-5 text-dark" />
                                        <div className="text-dark">Supplies</div>
                                    </SelectTrigger>
                                    <SelectContent className="relative">
                                        <SelectGroup>
                                            <div className="sticky top-0 z-10 bg-white">
                                                <Input
                                                    placeholder="Search for a supply"
                                                    className="!bg-white !text-black shadow-sm"
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <SelectLabel>All Supplies</SelectLabel>
                                            {filteredItems.map((item) => (
                                                <SelectItem key={item.code} value={item.code!}>{item.code} - {item.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(value) => handleProductSelect(Number(value))}>
                                    <SelectTrigger 
                                        hideIcon={ true }
                                        className="flex items-center justify-center border-0 w-full hover:underline"
                                    >
                                        <Plus strokeWidth={ 2 } className="w-5 h-5 text-dark" />
                                        <div className="text-dark">Products</div>
                                    </SelectTrigger>
                                    <SelectContent className="relative">
                                        <SelectGroup>
                                            <div className="sticky top-0 z-10 bg-white">
                                                <Input
                                                    placeholder="Search for a product"
                                                    className="!bg-white !text-black shadow-sm"
                                                    onChange={(e) => setSearchProduct(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <SelectLabel>All Products</SelectLabel>
                                            {filteredProducts.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(value) => handleGroupSelect(Number(value))}>
                                    <SelectTrigger 
                                        hideIcon={ true }
                                        className="flex items-center justify-center border-0 w-full hover:underline"
                                    >
                                        <Plus strokeWidth={ 2 } className="w-5 h-5 text-dark" />
                                        <div className="text-dark">Modifiers</div>
                                    </SelectTrigger>
                                    <SelectContent className="relative">
                                        <SelectGroup>
                                            <div className="sticky top-0 z-10 bg-white">
                                                <Input
                                                    placeholder="Search for a product"
                                                    className="!bg-white !text-black shadow-sm"
                                                    onChange={(e) => setSearchGroup(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <SelectLabel>All Groups</SelectLabel>
                                            {availableGroups.map((item) => (
                                                <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="">
                                {selectedItems.map((item, index) => (
                                    <div className="w-130 flex tdata" key={index}>
                                        <div className="w-full grid grid-cols-3">
                                            <div className="td">{ item.name }</div>
                                            <div className="w-50 td flex-center-y gap-2">
                                                <X className="w-3 h-3" />
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={item.quantity ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        // Allow empty
                                                        if (value === "") {
                                                            handleQuantityChange(item.id!, "");
                                                            return;
                                                        }

                                                        // Allow decimal point patterns: . | .digits | digits | digits. | digits.digits
                                                        if (/^\d*\.?\d*$/.test(value)) {
                                                            handleQuantityChange(item.id!, value);
                                                        }
                                                        // If regex fails, the input is rejected (no state update = no render)
                                                    }}
                                                    onKeyDown={(e) => {
                                                        // Allow navigation and deletion keys
                                                        if (
                                                            e.key === 'Backspace' ||
                                                            e.key === 'Delete' ||
                                                            e.key === 'ArrowLeft' ||
                                                            e.key === 'ArrowRight' ||
                                                            e.key === 'Tab'
                                                        ) {
                                                            return;
                                                        }
                                                    }}
                                                    className="basis-1/2 text-sm pl-2 py-1 bg-white h-8 appearance-none
                                                        [&::-webkit-outer-spin-button]:appearance-none
                                                        [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <div>
                                                    { item.type === 'PRODUCT' ?
                                                        <Tooltip>
                                                            <TooltipTrigger><Salad className="w-4 h-4 text-darkbrown inline-block -mt-1 mr-1" /></TooltipTrigger>
                                                            <TooltipContent>Product Item</TooltipContent>
                                                        </Tooltip>
                                                        : item.unitMeasurement ?? 'N/A'
                                                    }
                                                </div>
                                            </div>  
                                            <div className="td text-xs flex-center">
                                                <Checkbox
                                                    className="mr-1 bg-white shadow-sm"
                                                    checked={ item.forTakeOut! }
                                                    onCheckedChange={ () => handleForTakeout(item.id!) }
                                                >

                                                </Checkbox>
                                                Take-out
                                            </div>          
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={ () => handleRemove(item.id!) }
                                            className="w-10 flex-center td underline text-darkred !text-[12px]"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {selectedGroups.length > 0 && (
                                    <div className="text-xs my-4">Modifier Groups</div>
                                )}
                                {selectedGroups.map((item) => (
                                    <div className="w-130 flex tdata" key={item.id}>
                                        <div className="w-full grid grid-cols-2">
                                            <div className="td">{ item.name }</div>
                                            <div className="td">
                                                <Trash2 
                                                    className="w-4 h-4 cursor-pointer text-darkred"
                                                    onClick={() => {
                                                        setSelectedGroups(selectedGroups.filter(g => g.id !== item.id));
                                                        setRemovedGroups(prev => [
                                                            ...prev,
                                                            {
                                                                groupId: item.id!,
                                                                productId: toUpdate.id!
                                                            }
                                                        ]);
                                                    }}
                                                        
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update Product"
                            loadingLabel="Updating Product"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}