import { Claim } from "@/types/claims";
import { Supply } from "@/types/supply";
import { OTHER_ITEM_CATEGORY, OTHER_ITEM_KEY, SupplyItem } from "@/types/supplyOrder";
import { useEffect, useState } from "react";

export function useSupplySelection(claims: Claim, supplyItems: Supply[]) {
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [selectedItems, setSelectedItems] = useState<SupplyItem[]>([]);

    function getItemKey(item: SupplyItem) {
        if (item.isOther) return item[OTHER_ITEM_KEY] ?? item.sku ?? "";
        return item.sku ?? item[OTHER_ITEM_KEY] ?? "";
    }

    function getItemCategory(item: SupplyItem) {
        if (item.category) return item.category;
        if (item.isOther && item[OTHER_ITEM_CATEGORY]) return item[OTHER_ITEM_CATEGORY];

        return supplies.find((supply) => supply.sku === item.sku)?.category;
    }

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
        if (!selectedItems.find((item: SupplyItem) => !item.isOther && item.sku === sku)) {
            const selectedItem = supplies.find((item) => item.sku === sku);
            if (selectedItem) {
                setSelectedItems((prev) => [
                    ...prev,
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

    const handleAddCustomItem = (category: string) => {
        const customKey = `other-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        setSelectedItems((prev) => [
            ...prev,
            {
                isOther: true,
                name: "",
                customItemType: "OTHER",
                quantity: 1,
                unitPrice: 0,
                [OTHER_ITEM_KEY]: customKey,
                [OTHER_ITEM_CATEGORY]: category,
            },
        ]);
    };

    const handleItemChange = (itemKey: string, patch: Partial<SupplyItem>) => {
        setSelectedItems((prev) =>
            prev.map((item: SupplyItem) =>
                getItemKey(item) === itemKey ? { ...item, ...patch } : item
            )
        );
    };

    const handleQuantityChange = async (itemKey: string, quantity: number) => {
        setSelectedItems((prev) =>
            prev.map((item: SupplyItem) =>
                getItemKey(item) === itemKey ? { ...item, quantity: Number(quantity) || 0 } : item
            )
        );
    };

    const handleRemove = async (itemKey: string) => {
        setSelectedItems((prev) =>
            prev.filter((item: SupplyItem) => getItemKey(item) !== itemKey)
        );
    };

    return {
        supplies,
        selectedItems,
        setSelectedItems,
        handleSelect,
        handleAddCustomItem,
        getItemCategory,
        handleItemChange,
        handleQuantityChange,
        handleRemove,
    };
}
