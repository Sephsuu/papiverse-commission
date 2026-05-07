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

export interface ExpenseWeeklyBreakdown {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
}

export interface ExpensePurposeWeeklyBreakdown {
    purpose: string;
    orderCategory: string;
    week1: string;
    week2: string;
    week3: string;
    week4: string;
    total: number;
}

export interface ExpensePageResult {
    content: Expense[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ExpenseMonthlyResponse {
    branchId: number;
    month: string;
    category: string;
    totalExpenses: number;
    weeklyBreakdown: ExpenseWeeklyBreakdown;
    purposeWeeklyBreakdown: ExpensePurposeWeeklyBreakdown[];
    expenses: ExpensePageResult;
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
