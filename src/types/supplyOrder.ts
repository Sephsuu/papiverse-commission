/* eslint-disable @typescript-eslint/no-explicit-any */

export const OTHER_ITEM_KEY: unique symbol = Symbol("otherItemKey");
export const OTHER_ITEM_CATEGORY: unique symbol = Symbol("otherItemCategory");

export interface LowStockItem {
    rawMaterialId: number;
    rawMaterialCode: string;
    rawMaterialName: string;
    unitMeasurement: string;
    requiredQuantity: number;
    availableQuantity: number;
    shortageQuantity: number;
    expectedDeliveryDate?: string;
    expectedDateAvailableQuantity?: number;
    expectedDateShortageQuantity?: number;
}

export interface OtherCategoryItem {
    itemName: string;
    quantity: number;
    sourceCategory: string;
    totalPrice: number;
    unitPrice: number;
}

export interface SupplyOrder {
    orderId?: number;
    branchName: string;
    branchId?: number;
    orderDate: string;
    status: string;
    remarks: string;
    deliveryFee: number;
    deliveryType: string;
    completeOrderTotalAmount: number;
    internalShipment: boolean;
    expectedDelivery: string;
    message?: string | null;

    meatCategory?: {
        meatOrderId: string;
        isApproved: boolean;
        categoryTotal: number;
        meatItems: {
            rawMaterialCode?: string;
            rawMaterialName?: string;
            unitMeasurement?: string;
            quantity: number;
            price: number;
            isOther?: boolean;
        } []
    }

    snowfrostCategory?: {
        snowFrostOrderId: string;
        isApproved: boolean;
        categoryTotal: number;
        snowFrostItems: {
            rawMaterialCode?: string;
            rawMaterialName?: string;
            unitMeasurement?: string;
            quantity: number;
            price: number;
            isOther?: boolean;
        } []
    }

    othersCategory?: {
        othersItems: OtherCategoryItem[];
        othersTotal: number;
    }

    order?: {
        id: number,
        orderDestination: string;
    }

    lowStocks?: LowStockItem[];
}

export interface SupplyItem {
    category?: string;        
    sku?: string;          
    name?: string;           
    isOther?: boolean;
    quantity?: any;        
    unitMeasurement?: string; 
    convertedMeasurement?: string;
    unitPrice?: number;
    unitQuantity?: number;
    forTakeOut?: boolean;
    [OTHER_ITEM_KEY]?: string;
    [OTHER_ITEM_CATEGORY]?: string;
}

export interface CompleteOrder {
    branchId: number;
    remarks: string;
    meatCategoryItemId: string | null;
    snowfrostCategoryItemId: string | null;
    deliveryFee: number;
}

interface OrderItem {
    sku?: string;
    quantity?: number;
}   

export interface CategoryOrder {
    id: string;
    branchId: number;
    categoryitems: OrderItem[];
}

export interface BranchPurchaseItem {
    dateRange: {
        startDate: string;
        endDate: string;
    }
    items: {
        name: string
        sku: string
        unitMeasurement: string
        branches: {
            branchName: string;
            toralOrder: number;
        }[]
    }
}
