/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SupplyOrder {
    orderId?: number;
    branchName: string;
    orderDate: string;
    status: string;
    remarks: string;
    deliveryFee: number;
    completeOrderTotalAmount: number;

    meatCategory?: {
        meatOrderId: string;
        isApproved: boolean;
        categoryTotal: number;
        meatItems: {
            rawMaterialCode: string;
            rawMaterialName: string;
            unitMeasurement: string;
            quantity: number;
            price: number;
        } []
    }

    snowfrostCategory?: {
        snowFrostOrderId: string;
        isApproved: boolean;
        categoryTotal: number;
        snowFrostItems: {
            rawMaterialCode: string;
            rawMaterialName: string;
            unitMeasurement: string;
            quantity: number;
            price: number;
        } []
    }

    order?: {
        id: number,
        orderDestination: string;
    }
}

export interface SupplyItem {
    id?: number;
    category?: string;        
    sku?: string;          
    name?: string;           
    quantity?: any;        
    unitMeasurement?: string; 
    convertedMeasurement?: string;
    unitPrice?: number;
    unitQuantity?: number;
    type?: string;
    forTakeOut?: boolean;
}

export interface CompleteOrder {
    branchId: number;
    remarks: string;
    meatCategoryItemId: string;
    snowfrostCategoryItemId: string;
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