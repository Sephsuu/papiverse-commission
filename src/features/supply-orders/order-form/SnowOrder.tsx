"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply";
import { SupplyItem } from "@/types/supplyOrder";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const columns = [
    { title: "SKU ID", style: "" },
    { title: "Qty", style: "" },
    { title: "Supply Name", style: "col-span-2" },
    { title: "Unit", style: "" },
    { title: "Unit Price", style: "" },
    { title: "Total", style: "" },
    { title: "Remove", style: "" },
];

interface Props {
    supplies: Supply[];
    selectedItems: SupplyItem[];
    setActiveForm: (i: string) => void;
    onSelect: (sku: string) => void;
    onQuantityChange: (sku: string, quantity: number) => void;
    onRemove: (sku: string) => void;
    toEdit?: boolean;
    className?: string;
}

export function SnowOrder({
    supplies,
    selectedItems,
    setActiveForm,
    onSelect,
    onQuantityChange,
    onRemove,
    toEdit,
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    /** selected SNOW skus */
    const selectedSkus = new Set(
        selectedItems
            .filter((i) => i.category === "SNOWFROST")
            .map((i) => i.sku)
    );

    /** available snow supplies */
    const availableSupplies = supplies.filter(
        (s) => !selectedSkus.has(s.sku)
    );

    const { search, setSearch, filteredItems: filteredSupplies } =
        useSearchFilter(availableSupplies, ["name", "sku"]);

    const handleSubmit = () => {
        if (
            selectedItems.some((i) => i.category === "SNOWFROST") ||
            selectedItems.some((i) => i.category === "MEAT")
        ) {
            setActiveForm("receipt");
        } else {
            toast.info("PLEASE FILL UP EITHER SNOW OR MEAT FORM.");
        }
    };

    return (
        <section
            className={`stack-md animate-fade-in-up pb-120 overflow-hidden max-md:mt-12 ${className}`}
        >
            {toEdit ? (
                <div className="text-lg font-semibold">Edit Snow Order</div>
            ) : (
                <AppHeader label="Snow Order Form" />
            )}

            <div className="table-wrapper">
                <div className="thead grid grid-cols-8 bg-[#c4d1ef]! max-md:w-250!">
                    {columns.map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>
                            {item.title}
                        </div>
                    ))}
                </div>

                {selectedItems
                    .filter((i) => i.category === "SNOWFROST")
                    .map((item, index) => (
                        <div className="tdata grid grid-cols-8 max-md:w-250!" key={index}>
                            <div className="td">{item.sku}</div>

                            <div className="td p-0!">
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            onQuantityChange(item.sku!, 0);
                                            return;
                                        }
                                        let num = Number(value);
                                        if (num < 1) {
                                            num = 1;
                                        }
                                        num = Number(String(num));
                                        onQuantityChange(item.sku!, num);
                                    }}
                                    className="text-[16px] font-semibold w-18 border-0 pl-2 mx-auto"
                                />
                            </div>

                            <div className="td col-span-2">{item.name}</div>
                            <div className="td">
                                {item.unitQuantity} {item.unitMeasurement}
                            </div>
                            <div className="td">
                                {formatToPeso(item.unitPrice!)}
                            </div>
                            <div className="td">
                                {formatToPeso(item.unitPrice! * item.quantity!)}
                            </div>

                            <div className="flex td">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onRemove(item.sku!)}
                                    className="h-fit! py-1 my-auto"
                                >
                                    <Trash2 className="text-darkred" />
                                </Button>
                            </div>
                        </div>
                    ))}

                {/* Select snow item */}
                <div className="tdata grid grid-cols-8">
                    <Popover 
                        open={open}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen);

                            if (!isOpen) {
                                setSearch("");
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <button className="p-2 border rounded-md mx-auto">
                                Select Item
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="bottom"
                            align="center"
                            sideOffset={8}
                            avoidCollisions={false}
                            className="w-72 p-0 ml-48"
                            onOpenAutoFocus={(e) => e.preventDefault()} 
                        >
                            <Command>
                                <CommandInput
                                    placeholder="Search for a supply"
                                    value={search}
                                    onValueChange={setSearch}
                                    autoFocus={false}
                                />

                                <CommandList>
                                    {filteredSupplies.length === 0 && (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            No items available for "{search}"
                                        </div>
                                    )}

                                    {filteredSupplies.map((item) => (
                                        <CommandItem
                                            key={item.sku}
                                            onSelect={() => {
                                                onSelect(item.sku!);
                                                setOpen(false);
                                            }}
                                        >
                                            {item.sku} - {item.name}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {!toEdit && (
                <div className="w-full justify-end flex gap-2">
                    <Button
                        onClick={() => setActiveForm("meat")}
                        variant="secondary"
                    >
                        Back to Meat Order
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-darkbrown! text-light hover:opacity-90"
                    >
                        Proceed
                    </Button>
                </div>
            )}
        </section>
    );
}
