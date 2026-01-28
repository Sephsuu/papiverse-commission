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

    const handleSelect = async (code: string) => {
        if (!selectedItems.find((item: SupplyItem) => item.code === code)) {
            const selectedItem = supplies.find((item) => item.code === code);
            if (selectedItem) {
                setSelectedItems([
                ...selectedItems,
                {
                    code,
                    name: selectedItem.name,
                    quantity: 1,
                    unitMeasurement: selectedItem.unitMeasurement,
                    unitPrice: selectedItem.unitPrice,
                    category: selectedItem.category,
                },
                ]);
            } else {
                console.warn(`Item with code ${code} not found.`);
            }
        }
    };

    const handleQuantityChange = async (code: string, quantity: number) => {
        setSelectedItems(
        selectedItems.map((item: SupplyItem) =>
            item.code === code ? { ...item, quantity: Number(quantity) || 0 } : item
        )
        );
    };

    const handleRemove = async (code: string) => {
        setSelectedItems(
        selectedItems.filter((item: SupplyItem) => item.code !== code)
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