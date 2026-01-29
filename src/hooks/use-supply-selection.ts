import { Claim } from "@/types/claims";
import { Supply } from "@/types/supply";
import { SupplyItem } from "@/types/supplyOrder";
import { useEffect, useState } from "react";

export function useSupplySelection(claims: Claim, supplyItems: Supply[]) {
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [selectedItems, setSelectedItems] = useState<SupplyItem[]>([]);

    useEffect(() => {
        if (supplyItems?.length) {
            const fixedPrice = supplyItems.map((supply: Supply) => ({
            ...supply,
            unitPrice: claims.branch.isInternal
                ? supply.unitPriceInternal
                : supply.unitPriceExternal,
            }));
            setSupplies(fixedPrice);
        }
    }, [supplyItems, claims.branch.isInternal]);

    const handleSelect = async (sku: string) => {
        if (!selectedItems.find((item: SupplyItem) => item.sku === sku)) {
            const selectedItem = supplies.find((item) => item.sku === sku);
            if (selectedItem) {
                setSelectedItems([
                ...selectedItems,
                {
                    sku,
                    name: selectedItem.name,
                    quantity: 1,
                    unitMeasurement: selectedItem.unitMeasurement,
                    unitPrice: selectedItem.unitPrice,
                    category: selectedItem.category,
                },
                ]);
            } else {
                console.warn(`Item with sku ${sku} not found.`);
            }
        }
    };

    const handleQuantityChange = async (sku: string, quantity: number) => {
        setSelectedItems(
        selectedItems.map((item: SupplyItem) =>
            item.sku === sku ? { ...item, quantity: Number(quantity) || 0 } : item
        )
        );
    };

    const handleRemove = async (sku: string) => {
        setSelectedItems(
        selectedItems.filter((item: SupplyItem) => item.sku !== sku)
        );
    };

    return {
        supplies,
        selectedItems,
        setSelectedItems,
        handleSelect,
        handleQuantityChange,
        handleRemove,
    };
}