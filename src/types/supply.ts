export type Supply = {
    id?: number;
    sku?: string;
    name?: string;
    isDeliverables?: boolean;
    unitQuantity?: number;
    unitMeasurement?: string;
    unitPriceInternal?: number;
    unitPriceExternal?: number;
    convertedQuantity?: number;
    convertedMeasurement?: string;
    category?: string;
    minStock?: number;
    unitPrice?: number; 
    unitCost: number;
    inventorySourceSku: string | null;
    stockFactor: number | null;
}

export const supplyInit: Partial<Supply> = {
    name: "",
    isDeliverables: true,
    unitQuantity: 0,
    unitMeasurement: "",
    convertedQuantity: 0,
    convertedMeasurement: "",
    unitPriceInternal: 0,
    unitPriceExternal: 0,
    unitCost: 0,
    category: "",
    minStock: 0,
    inventorySourceSku: null,
    stockFactor: null,
};

export const supplyFields: (keyof Supply)[] = [
    "name",
    "unitQuantity",
    "unitMeasurement",
    "unitPriceInternal",
    "unitPriceExternal",
    "unitCost",
    "category",
];