export interface Expense {
    id: number;
    total: number;
    addedById: number;
    addedByUsername: string;
    addedByName: string;
    spentAt: string;
    modeOfPayment: string;
    purpose: string;

}

export const expenseInit: Partial<Expense> = {
    total: 0,
    modeOfPayment: 'CASH',
    purpose: ''
};

export const expenseFields: (keyof Expense)[] = [
    "total",
    "modeOfPayment",
    "purpose",  
];  
