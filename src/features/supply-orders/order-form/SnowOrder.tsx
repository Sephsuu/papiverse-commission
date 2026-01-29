"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply";
import { SupplyItem } from "@/types/supplyOrder";
import { Snowflake, Trash2 } from "lucide-react";
import { Fragment } from "react";
import { toast } from "sonner";

const columns = [
    { title: 'SKU ID', style: '' },
    { title: 'Qty', style: '' },
    { title: 'Supply Name', style: 'col-span-2' },
    { title: 'Unit', style: '' },
    { title: 'Unit Price', style: '' },
    { title: 'Total', style: '' },
    { title: 'Remove', style: '' },
]

interface Props {
    supplies: Supply[];
    selectedItems: SupplyItem[];
    setActiveForm: (i: string) => void;
    onSelect: (i: string) => void;
    onQuantityChange: (sku: string, quantity: number) => void;
    onRemove: (i: string) => void;
    toEdit?: false | boolean
    className?: string;
}

export function SnowOrder({ supplies, selectedItems, setActiveForm, onSelect, onQuantityChange, onRemove, toEdit, className }: Props) {
    const { search, setSearch, filteredItems: filteredSupplies } = useSearchFilter(supplies, ['name', 'sku'])

    const handleSubmit = async () => {
        if (selectedItems.filter(i => i.category === 'SNOWFROST').length > 0) {
            return setActiveForm("receipt");
        } else {
            toast.info("SNOW ORDER CANNOT BE EMPTY.")
        }
    };

    return(
        <section className={`stack-md animate-fade-in-up ${className}`}>
            {toEdit ? (
                <div className="text-lg font-semibold">Edit Snow Order</div>
            ) : (
                <AppHeader label="Snow Order Form" />
            )}

            <div>
                <div className="thead grid grid-cols-8 bg-[#c4d1ef]!">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>

                {selectedItems.filter(i => i.category === 'SNOWFROST').map((item, index) => (
                    <div className="tdata grid grid-cols-8" key={index}>
                        <div className="td">{ item.sku }</div>
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
                                className="text-[16px] font-semibold w-18 border-0 pl-2"
                            />
                        </div>
                        <div className="td col-span-2">{ item.name }</div>
                        <div className="td">{item.unitQuantity} { item.unitMeasurement }</div>
                        <div className="td">{ formatToPeso(item.unitPrice!) }</div>
                        <div className="td">{ formatToPeso(item.unitPrice! * item.quantity!) }</div>
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
                <div className="tdata grid grid-cols-8">
                    <Select onValueChange={ onSelect }>
                        <SelectTrigger className="p-0 pl-2 m-0 border-0 shadow-none mx-auto w-fit">
                            <SelectValue placeholder="Select Item">Select Item</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <Input
                                    placeholder="Search for a supply"
                                    onChange={ e => setSearch(e.target.value) }
                                />
                                <SelectLabel>Snow Supplies</SelectLabel>
                                {filteredSupplies.map((item) => (
                                    <SelectItem key={item.sku} value={item.sku!}>{item.sku} - {item.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!toEdit && (
                <div className="w-full justify-end flex gap-2">
                    <Button 
                        onClick={ () => setActiveForm('meat') }
                        variant="secondary"
                    >
                        Back to Meat Order
                    </Button>
                    <Button 
                        onClick={ () => handleSubmit() } 
                        className="bg-darkbrown! text-light hover:opacity-90"
                    >
                        Proceed
                    </Button>
                </div>
            )}
        </section>
    );
}