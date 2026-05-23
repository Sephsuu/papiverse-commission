export interface Expense {
    id: number;
    total: number;
    addedById: number;
    addedByUsername: string;
    addedByName: string;
    spentAt: string;
    modeOfPayment: string;
    expenseCategoryId?: number;
    expenseCategoryName?: string;
    orderCategory?: string;
    branchId?: number;
    purpose: string;
    customPurpose?: string;

}

export interface ExpenseCategory {
    id: number;
    name: string;
    orderCategory: string;
    active: boolean;
    sortOrder?: number;
}

type BreakdownAmount = string | number;

export interface ExpenseWeeklyBreakdown {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
}

export interface ExpensePurposeWeeklyBreakdown {
    purpose: string;
    orderCategory: string;
    week1: BreakdownAmount;
    week2: BreakdownAmount;
    week3: BreakdownAmount;
    week4: BreakdownAmount;
    total: BreakdownAmount;
}

export interface ExpenseCategoryWeeklyBreakdown {
    expenseCategoryId?: number | null;
    expenseCategoryName: string;
    orderCategory: string;
    week1: BreakdownAmount;
    week2: BreakdownAmount;
    week3: BreakdownAmount;
    week4: BreakdownAmount;
    total: BreakdownAmount;
    count?: number;
}

export interface ExpenseActualPurposeWeeklyBreakdown {
    purpose: string;
    expenseCategoryName?: string;
    orderCategory: string;
    week1: BreakdownAmount;
    week2: BreakdownAmount;
    week3: BreakdownAmount;
    week4: BreakdownAmount;
    total: BreakdownAmount;
    count?: number;
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
    categoryWeeklyBreakdown?: ExpenseCategoryWeeklyBreakdown[];
    actualPurposeWeeklyBreakdown?: ExpenseActualPurposeWeeklyBreakdown[];
    categorySummary?: unknown[];
    purposeSummary?: unknown[];
    orderCategorySummary?: unknown[];
    weeklyTotals?: ExpenseWeeklyBreakdown;
    expenses: ExpensePageResult;
}

export interface ExpensePaymentModeSummaryItem {
    modeOfPayment: string;
    total: number;
    percentage: number;
    count: number;
}

export interface ExpenseWeeklyPaymentModeBreakdownItem {
    week: string;
    range: string;
    total: number;
    count: number;
    modes: Array<{
        modeOfPayment: string;
        total: number;
        count: number;
    }>;
}

export interface ExpensePaymentModeSummaryResponse {
    branchId: number;
    month: string;
    category: string;
    grandTotal: number;
    paymentModeSummary: ExpensePaymentModeSummaryItem[];
    weeklyPaymentModeBreakdown: ExpenseWeeklyPaymentModeBreakdownItem[];
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
