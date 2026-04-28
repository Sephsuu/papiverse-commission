export interface Expense {
    id: number;
    total: number;
    addedById: number;
    addedByUsername: string;
    addedByName: string;
    spentAt: string;
    modeOfPayment: string;
    orderCategory?: string;
    branchId?: number;
    purpose: string;
    customPurpose?: string;

}

export const expenseInit: Partial<Expense> = {
    total: 0,
    modeOfPayment: 'CASH',
    orderCategory: 'MEAT',
    purpose: ''
};

export const expenseFields: (keyof Expense)[] = [
    "total",
    "modeOfPayment",
    "purpose",  
];  
