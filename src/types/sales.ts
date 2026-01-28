export interface PaidOrder {
    saleId: number;
    orderId: string;
    orderType: string;
    orderStatus: string;
    totalPaid: number;
    cash: number;
    gacash: number;
    items?: {
        productName: string;
        quantity: number;
        lineTotal: number;
    }[];

    products?: {
        productName: string;
        qty: number;              // 👈 renamed
        lineTotal: number;
    }[];

    paymentTime: string;
}

interface Orders {
    date: string;
    orders: PaidOrder[]
}
