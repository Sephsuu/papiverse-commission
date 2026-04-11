"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
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
import { parseOptionalDecimal, sanitizeDecimalInput } from "@/lib/decimal-input";
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply";
import { CustomItemType, OTHER_ITEM_KEY, SupplyItem } from "@/types/supplyOrder";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
    onAddCustomItem: (category: string) => void;
    getItemCategory: (item: SupplyItem) => string | undefined;
    onQuantityChange: (itemKey: string, quantity: number) => void;
    onItemChange: (itemKey: string, patch: Partial<SupplyItem>) => void;
    onRemove: (itemKey: string) => void;
    toEdit?: boolean;
    className?: string;
}

export function MeatOrder({
    supplies,
    selectedItems,
    setActiveForm,
    onSelect,
    onAddCustomItem,
    getItemCategory,
    onQuantityChange,
    onItemChange,
    onRemove,
    toEdit,
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const customItemTypeOptions: { label: string; value: CustomItemType }[] = [
        { label: "OTHER", value: "OTHER" },
        { label: "REPLACEMENT", value: "REPLACEMENT" },
        { label: "LACKING", value: "LACKING" },
    ];

    function getItemKey(item: SupplyItem) {
        if (item.isOther) return item[OTHER_ITEM_KEY] ?? item.sku ?? "";
        return item.sku ?? item[OTHER_ITEM_KEY] ?? "";
    }

    function getGeneratedCustomName(type: CustomItemType, supplyName?: string) {
        if (!supplyName) return "";
        const prefix = type === "LACKING" ? "Lacking" : "Replacement";
        return `${prefix} ${supplyName}`;
    }

    function getResolvedCustomItemType(item: SupplyItem): CustomItemType {
        if (item.name?.toUpperCase().startsWith("LACKING")) return "LACKING";
        if (item.name?.toUpperCase().startsWith("REPLACEMENT")) return "REPLACEMENT";
        return item.customItemType ?? "OTHER";
    }

    const meatItems = useMemo(
        () => selectedItems.filter((i) => getItemCategory(i) === "MEAT"),
        [getItemCategory, selectedItems]
    );
    const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
    const [unitPriceInputs, setUnitPriceInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        setQuantityInputs((prev) => {
            const next: Record<string, string> = {};

            meatItems.forEach((item) => {
                const itemKey = getItemKey(item);
                if (!itemKey) return;
                next[itemKey] = prev[itemKey] ?? String(item.quantity ?? "");
            });

            return next;
        });
    }, [meatItems]);

    useEffect(() => {
        setUnitPriceInputs((prev) => {
            const next: Record<string, string> = {};

            meatItems.forEach((item) => {
                const itemKey = getItemKey(item);
                if (!itemKey) return;
                next[itemKey] = prev[itemKey] ?? String(item.unitPrice ?? "");
            });

            return next;
        });
    }, [meatItems]);

    const selectedSkus = new Set(meatItems.filter((i) => !i.isOther).map((i) => i.sku).filter(Boolean));

    const availableSupplies = supplies.filter(
        (s) => !selectedSkus.has(s.sku)
    );

    const { search, setSearch, filteredItems: filteredSupplies } =
        useSearchFilter(availableSupplies, ["name", "sku"]);

    const { filteredItems: filteredParentSupplies } =
        useSearchFilter(supplies, ["name", "sku"]);

    const handleSubmit = () => {
        setActiveForm("snow");
    };

    return (
        <section
            className={`stack-md animate-fade-in-up pb-120 overflow-hidden max-md:mt-12 ${className}`}
        >
            {toEdit ? (
                <div className="text-lg font-semibold">Edit Meat Order</div>
            ) : (
                <AppHeader label="Meat Order Form" />
            )}

            <div className="table-wrapper">
                <div className="thead grid max-md:w-250! grid-cols-8 bg-[#ead09f]!">
                    {columns.map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>
                            {item.title}
                        </div>
                    ))}
                </div>

                {meatItems.map((item) => {
                    const itemKey = getItemKey(item);
                    const resolvedCustomItemType = getResolvedCustomItemType(item);

                    return (
                        <div className="tdata grid grid-cols-8 max-md:w-250!" key={itemKey}>
                            <div className="td">
                                {item.isOther ? (
                                    <AppSelect
                                        items={customItemTypeOptions}
                                        value={resolvedCustomItemType}
                                        onChange={(value) => {
                                            const nextType = value as CustomItemType;
                                            onItemChange(itemKey, nextType === "OTHER"
                                                ? {
                                                    customItemType: "OTHER",
                                                    sku: undefined,
                                                    name: "",
                                                    unitMeasurement: undefined,
                                                    unitQuantity: undefined,
                                                    unitPrice: 0,
                                                }
                                                : {
                                                    customItemType: nextType,
                                                    sku: undefined,
                                                    name: "",
                                                    unitMeasurement: undefined,
                                                    unitQuantity: undefined,
                                                    unitPrice: 0,
                                                }
                                            );
                                        }}
                                        triggerClassName="border-0 px-2 bg-white"
                                        className="w-full"
                                        hideIcon
                                    />
                                ) : item.sku}</div>

                            <div className="td p-0!">
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*([.,][0-9]{0,3})?"
                                    value={quantityInputs[itemKey] ?? String(item.quantity ?? "")}
                                    onChange={(e) => {
                                        const value = sanitizeDecimalInput(e.target.value, 3);

                                        setQuantityInputs((prev) => ({
                                            ...prev,
                                            [itemKey]: value,
                                        }));

                                        if (value === "") {
                                            onQuantityChange(itemKey, 0);
                                            return;
                                        }

                                        const parsedValue = parseOptionalDecimal(value);
                                        onQuantityChange(itemKey, parsedValue ?? 0);
                                    }}
                                    className="text-[16px] font-semibold w-18 border-0 pl-2 mx-auto"
                                />
                            </div>

                            <div className="td col-span-2">
                                {item.isOther ? (
                                    resolvedCustomItemType === "OTHER" ? (
                                        <Input
                                            value={item.name ?? ""}
                                            onChange={(e) => onItemChange(itemKey, { name: e.target.value })}
                                            placeholder="Other item name"
                                            className="border border-slate-200"
                                        />
                                    ) : (
                                        <AppSelect
                                            items={filteredParentSupplies.map((supply) => ({
                                                label: `${resolvedCustomItemType === "LACKING" ? "Lacking" : "Replacement"} ${supply.name}`,
                                                value: supply.sku ?? "",
                                            }))}
                                            value={item.sku ?? ""}
                                            onChange={(value) => {
                                                const selectedSupply = supplies.find((supply) => supply.sku === value);
                                                if (!selectedSupply) return;

                                                onItemChange(itemKey, {
                                                    sku: selectedSupply.sku,
                                                    name: getGeneratedCustomName(resolvedCustomItemType, selectedSupply.name),
                                                    unitMeasurement: selectedSupply.unitMeasurement,
                                                    unitQuantity: selectedSupply.unitQuantity,
                                                    unitPrice: 0,
                                                });
                                            }}
                                            placeholder="Select parent inventory"
                                            triggerClassName="border-0 px-2 bg-white"
                                            className="w-full"
                                        />
                                    )
                                ) : (
                                    item.name
                                )}
                            </div>
                            <div className="td">
                                {item.isOther
                                    ? resolvedCustomItemType === "OTHER"
                                        ? "-"
                                        : item.unitMeasurement ?? ""
                                    : `${item.unitQuantity ?? ""} ${item.unitMeasurement ?? ""}`}
                            </div>
                            <div className="td">
                                {item.isOther ? (
                                    resolvedCustomItemType === "OTHER" ? (
                                        <div className="relative">
                                            <div className="absolute top-2 left-2">₱</div>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                pattern="[0-9]*([.,][0-9]{0,3})?"
                                                value={unitPriceInputs[itemKey] ?? String(item.unitPrice ?? "")}
                                                onChange={(e) => {
                                                    const value = sanitizeDecimalInput(e.target.value, 3);
                                                    setUnitPriceInputs((prev) => ({
                                                        ...prev,
                                                        [itemKey]: value,
                                                    }));
                                                    onItemChange(itemKey, { unitPrice: parseOptionalDecimal(value) ?? 0 });
                                                }}
                                                placeholder="0"
                                                className="border border-slate-200 pl-4.5"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute top-2 left-2">₱</div>
                                            <Input
                                                value="0"
                                                disabled
                                                className="pl-4.5 border border-slate-200 bg-slate-100"
                                            />
                                        </div>
                                    )
                                ) : (
                                    formatToPeso(item.unitPrice!)
                                )}
                            </div>
                            <div className="td">
                                {formatToPeso(item.unitPrice! * item.quantity!)}
                            </div>

                            <div className="flex td">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onRemove(itemKey)}
                                    className="h-fit! py-1 my-auto"
                                >
                                    <Trash2 className="text-darkred" />
                                </Button>
                            </div>
                        </div>
                    );
                })}

                <div className="tdata grid grid-cols-8">
                    <div className="col-span-8 flex items-center gap-3 py-2 pl-2">
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
                                <button className="rounded-md border border-slate-300 p-2 shadowm-sm">
                                    Select Item
                                </button>
                            </PopoverTrigger>

                            <PopoverContent 
                                className="w-72 p-0 ml-48"
                                side="bottom"
                                align="center"
                                sideOffset={8}
                                avoidCollisions={false}
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
                                                No items available for &quot;{search}&quot;
                                            </div>
                                        )}

                                        {filteredSupplies.map((item) => (
                                            <CommandItem
                                                key={item.sku}
                                                onSelect={() => {
                                                    onSelect(item.sku!);
                                                    setSearch("");
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

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onAddCustomItem("MEAT")}
                            className="h-full rounded-md border border-slate-300 p-2 shadowm-sm bg-light"
                        >
                            Add Custom Item
                        </Button>
                    </div>
                </div>
            </div>

            {!toEdit && (
                <div className="w-full justify-end flex gap-2">
                    {/* <Link href="/inventory?tab=summary"> */}
                    <Button 
                        onClick={() => {history.back()}}
                        variant="secondary"
                    >
                        Return
                    </Button>
                    {/* </Link> */}
                    <Button
                        onClick={handleSubmit}
                        className="bg-darkbrown text-light hover:opacity-90"
                    >
                        Proceed
                    </Button>
                </div>
            )}
        </section>
    );
}
