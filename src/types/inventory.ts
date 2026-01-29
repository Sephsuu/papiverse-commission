import { Supply } from "./supply";

export interface Inventory {
    id?: number;
    orderId?: number;
    sku?: string;
    name?: string;
    unitPrice?: number;
    unitMeasurement?: string;
    convertedQuantity?: number;
    convertedMeasurement?: string;
    category?: string;
    quantity?: number;
    branchId?: number;
    stockLevel?: string; 
    minStock?: number;

    changedQuantity?: number;
    rawMaterialCode?: string;
    type?: string;
    source?: string;
    unitType?: string;
}

export interface DetailedCommissary {
    totalOut: number;
    totalIn: number;
    currentInventory: number;
    stockLevel: string;
    previousInventory: number;
     
    rawMaterial: Partial<Supply>
}

export const inventoryInit: Inventory = {
    rawMaterialCode: "",
    changedQuantity: 0,
    branchId: 1,
    type: "",
    source: "",
};

export const inventoryUpdate : Inventory = {
    rawMaterialCode : "",
    branchId : 0,
    changedQuantity : 0,
    type : "IN",
    source : "INPUT"

}

export const inventoryFields: (keyof Inventory)[] = [
    "changedQuantity",
    "branchId",
];