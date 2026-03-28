export interface InventoryLog {
    id: number;
    inventoryId?: number;
    inventoryid?: number;
    rawMaterialCode: string;
    rawMaterialName: string;
    unitMeasurement: string;
    branchId: number | string;
    branchName?: string;
    quantityChanged: number;
    type: string;
    source: string;
    businessEvent?: string | null;
    unitCost?: number | null;
    sellingPrice?: number | null;
    capitalAmount?: number | null;
    salesAmount?: number | null;
    effectiveDate?: string | null;
    orderId: number | null;
    dateTime: string;
    order?: {
        id: number;
        orderDestination: string;
        meatOrderId?: string | null;
        snowOrderId?: string | null;
    } | null
}
