export interface CommissionOwnerProduct {
    raw_material_id: number;
    sku: string;
    name: string;
    category: string;
    capital: number;
    srp: number;
}

export interface CommissionOwner {
    id: number;
    name: string;
    assigned_products: CommissionOwnerProduct[];
}

export interface CreateCommissionOwnerRequest {
    name: string;
}

export interface UpdateCommissionOwnerRequest {
    name: string;
}

export interface AssignProductsRequest {
    rawMaterialIds: number[];
}

export interface CommissionReportItem {
    product: string;
    qty: number;
    capital: number;
    srp: number;
    gross: number;
    total_capital: number;
    net: number;
}

export interface CommissionReportGroup {
    person: string;
    items: CommissionReportItem[];
    totals: {
        gross: number;
        total_capital: number;
        net: number;
    };
}

export interface MonthlyCommissionReportResponse {
    month: string;
    commissions: CommissionReportGroup[];
}
