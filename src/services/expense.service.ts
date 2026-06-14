import { BASE_URL } from "@/lib/urls";
import { getPhilippineTimeISO } from "@/lib/formatter";
import { requestData } from "./_config";
import { Expense, ExpenseCategory, ExpensePaymentModeSummaryResponse } from "@/types/expense";

const url = `${BASE_URL}/financial-logs`;
const expensesUrl = `${BASE_URL}/expenses`

export class ExpenseService {
    static async getExpensesByDate(branchId: number, month: string, page: number, size: number) {
        return await requestData(
            `${expensesUrl}/range?branchId=${branchId}&month=${month}&page=${page}&size=${size}`,
            "GET",
        );
    }

    static async getExpenseById(id: number) {
        return await requestData(
            `${url}/get-expense?id=${id}`,
            "GET"
        );
    }

    static async getExpenseCategories(category = "ALL", activeOnly = true) {
        return await requestData(
            `${expensesUrl}/categories?category=${category}&activeOnly=${activeOnly}`,
            "GET",
        ) as ExpenseCategory[];
    }

    static async getWeeklyExpenses(month: string, week: number) {
        return await requestData(
            `${expensesUrl}/weekly?month=${month}&week=${week}`,
            "GET",
        )
    }

    static async getPaymentModeSummary(branchId: number, month: string, category = "ALL") {
        return await requestData(
            `${expensesUrl}/payment-mode-summary?branchId=${branchId}&month=${month}&category=${category}`,
            "GET",
        ) as ExpensePaymentModeSummaryResponse;
    }

    static async createExpense(expenses: Partial<Expense> | Partial<Expense>[], userId: number) {
        const expenseList = Array.isArray(expenses) ? expenses : [expenses];
        const payload = expenseList.map((expense) => ({
            ...expense,
            total: Number(expense.total),
            spentAt: expense.spentAt ?? getPhilippineTimeISO(),
            isChecked: expense.isChecked ?? false,
        }));

        return await requestData(
            `${expensesUrl}?userId=${userId}`,
            "POST",
            undefined,
            payload
        );
    }

    static async createExpenseCategory(category: {
        name: string,
        orderCategory: string,
        active: boolean,
        sortOrder: number
    }) {
        return await requestData(
            `${expensesUrl}/categories`,
            "POST",
            undefined,
            category
        );
    }

    static async updateExpense(id: number, expense: Partial<Expense>) {
        return await requestData(
            `${expensesUrl}/${id}`,
            "PUT",
            undefined,
            {
                ...expense,
                total: Number(expense.total),
                isChecked: expense.isChecked ?? false,
            }
        );
    }

    static async deleteExpense(id: number) {
        return await requestData(
            `${expensesUrl}/${id}`,
            "DELETE",
        );
    }
}
