export type Supply = {
    id?: number;
    code?: string;
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
}

export const supplyInit: Supply = {
    code: "",
    name: "",
    isDeliverables: true,
    unitQuantity: 0,
    unitMeasurement: "",
    convertedQuantity: 0,
    convertedMeasurement: "",
    unitPriceInternal: 0,
    unitPriceExternal: 0,
    category: "",
    minStock: 0
};

export const supplyFields: (keyof Supply)[] = [
    "code",
    "name",
    "unitQuantity",
    "unitMeasurement",
    "unitPriceInternal",
    "unitPriceExternal",
    "category",
];