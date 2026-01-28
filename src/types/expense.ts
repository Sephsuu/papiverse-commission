export interface Expense {
    id?: number;
    spenderId: number;
    firstName?: string;
    lastName?: string;
    paymentMode: string;
    expense: number;
    purpose: string;
    date: string;
    branchId?: number;
}

export const expenseInit: Expense = {
    spenderId: 0,
    paymentMode: "",
    expense: 0,
    purpose: "",
    date: "",
};

export const expenseFields: (keyof Expense)[] = [
    "spenderId",
    "paymentMode",
    "expense",  
    "purpose",
];  