import { ModalTitle } from "@/components/shared/ModalTitle";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { handleChange } from "@/lib/form-handle";
import { RawMaterialService } from "@/services/rawMaterial.service";
import { Supply } from "@/types/supply";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const units = ["bar","block","bottle","box","bundle","can","gallon","grams","kilograms","liter","milligrams","milliliters","oz","pack","piece","roll","serving","set","tray","tub"];

interface Props {
    toUpdate: Supply;
    setUpdate: React.Dispatch<React.SetStateAction<Supply | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    supplies: Supply[];
}

export function UpdateRawMaterial({ toUpdate, setUpdate, setReload, supplies }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [inventorySourceOpen, setInventorySourceOpen] = useState(false);
    const [rawMaterial, setRawMaterial] = useState<Supply>(toUpdate);
    const router = useRouter();
    const selectableSupplies = supplies.filter((item) => item.sku !== toUpdate.sku);
    const { search, setSearch, filteredItems } = useSearchFilter(selectableSupplies, ["name", "sku"]);

    const selectedInventorySource = selectableSupplies.find(
        (item) => item.sku === rawMaterial.inventorySourceSku
    );

    async function handleSubmit() {
        try {
            setProcess(true);

            const invalid =
                !rawMaterial.name?.trim() ||
                !rawMaterial.unitMeasurement ||
                (rawMaterial.unitQuantity ?? 0) <= 0 ||
                (rawMaterial.unitCost ?? 0) < 0 ||
                (rawMaterial.minStock ?? 0) <= 0;

            if (invalid) {
                toast.info("Please complete the required fields.");
                setProcess(false);
                return;
            }

            const data = await RawMaterialService.updateRawMaterial(rawMaterial);

            if (data) {
                toast.success(`Raw material ${rawMaterial.name} updated successfully!`);
                setReload(prev => !prev)
                setUpdate(undefined);
                router.refresh();
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setUpdate(undefined) }}>
            <DialogContent className="max-h-9/10 overflow-y-auto">
                <ModalTitle label="Update" spanLabel={toUpdate.name} />
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>SKU ID</div>
                            <Input
                                className="w-full border border-gray rounded-md max-md:w-full"
                                value={rawMaterial.sku}
                                disabled
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <div>Raw Material Name</div>
                            <Input
                                className="w-full border border-gray rounded-md max-md:w-full"
                                name="name"
                                value={rawMaterial.name}
                                onChange={(e) => handleChange(e, setRawMaterial)}
                            />
                        </div>

                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Unit Measurement</div>
                            <div className="flex border border-gray rounded-md max-md:w-full">
                                <Input
                                    className="w-full border-0"
                                    type="number"
                                    name="unitQuantity"
                                    value={rawMaterial.unitQuantity}
                                    onChange={(e) => handleChange(e, setRawMaterial)}
                                />
                                <Select
                                    value={rawMaterial.unitMeasurement}
                                    onValueChange={(value) => setRawMaterial((prev) => ({
                                        ...prev,
                                        unitMeasurement: value,
                                        convertedMeasurement: value,
                                    }))}
                                >
                                    <SelectTrigger className="w-full border-0">
                                        <SelectValue placeholder="Select Measurement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((item, index) => (
                                            <SelectItem value={item} key={index}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div>Unit Cost</div>
                            <div className="flex border border-gray rounded-md">
                                <input disabled value="₱" className="w-10 text-center" />
                                <Input
                                    type="number"
                                    className="w-full max-md:w-full"
                                    name="unitCost"
                                    value={rawMaterial.unitCost}
                                    onChange={(e) => handleChange(e, setRawMaterial)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div>Minimum Required Stock</div>
                            <div className="flex border border-gray rounded-md">
                                <Input
                                    type="number"
                                    className="w-full border-0 max-md:w-full"
                                    name="minStock"
                                    value={rawMaterial.minStock}
                                    onChange={(e) => handleChange(e, setRawMaterial)}
                                />
                                <Input
                                    className="w-full border-0"
                                    value={rawMaterial.unitMeasurement}
                                    readOnly
                                />
                            </div>
                        </div>

                        <Separator className="col-span-2 mt-4 bg-gray-300" />

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
                                                            setRawMaterial((prev) => ({
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
                                value={rawMaterial.stockFactor ?? ""}
                                onChange={(e) => handleChange(e, setRawMaterial)}
                                disabled={!rawMaterial.inventorySourceSku}
                            />
                        </div>

                        <div className="col-span-2 text-sm italic! text-center text-gray">
                            Leave it these fields blank if item has no source inventory
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton
                            type="submit"
                            onProcess={onProcess}
                            label="Update Raw Material"
                            loadingLabel="Updating Raw Material"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
