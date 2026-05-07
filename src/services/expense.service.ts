import { BASE_URL } from "@/lib/urls";
import { getPhilippineTimeISO } from "@/lib/formatter";
import { requestData } from "./_config";
import { Expense } from "@/types/expense";

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

    static async createExpense(expense: Partial<Expense>, userId: number) {
        const payload = {
            ...expense,
            total: Number(expense.total),
            spentAt: expense.spentAt ?? getPhilippineTimeISO(),
        };

        return await requestData(
            `${expensesUrl}?userId=${userId}`,
            "POST",
            undefined,
            payload
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
