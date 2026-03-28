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
    unitCost?: number;
    effectiveDate?: string;
}

export interface InventoryBreakdown {
    inventoryId: number;
    sku: string;
    name: string;
    category: string;
    unitMeasurement: string;
    quantity: number;
    externalPrice: number;
    unitCost: number;
    itemValue: number;
    itemCost: number;
    itemNetProfit: number;
    stockLevel: number;
}

export interface InventoryTransactionSummaryItem {
    name: string;
    sku: string;
    totalIn: number;
    totalOut: number;
    unitMeasurement: string;
    category: string;
    currentInventory: number;
    previousInventory: number;
}

export interface InventoryTransactionSummary {
    branchId: number;
    branchName: string;
    from: string;
    to: string;
    summary: InventoryTransactionSummaryItem[],
}

export interface InventoryReportBreakdown {
    branchId: number;
    branchName: string;
    startDate: string;
    endDate: string;
    totalCapital: number;
    totalSales: number;
    totalProfit: number;
    totalExpenses: number;
    items: {
        rawMaterialId: number;
        sku: string;
        rawMaterialName: string;
        category: string;
        unitMeasurement: string;
        producedQuantity: number;
        soldQuantity: number;
        capital: number;
        sales: number;
        profit: number;
        currentStock: number;
        stockLevel: string;
    } []
}

export interface InventoryItemAudit {
    id: number;
    inventoryid: number;
    rawMaterialCode: string;
    rawMaterialName: string;
    branchId: number;
    branchName: string;
    quantityChanged: number;
    unitMeasurement: string;
    type: string;
    source: string;
    order: {
        id: number;
        orderDestination: string;
    };
    dateTime: string;
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
