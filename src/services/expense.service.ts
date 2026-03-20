import { BASE_URL } from "@/lib/urls";
import { getPhilippineTimeISO } from "@/lib/formatter";
import { requestData } from "./_config";
import { Expense } from "@/types/expense";

const url = `${BASE_URL}/financial-logs`;
const expensesUrl = `${BASE_URL}/expenses`

export class ExpenseService {
    static async getExpensesByDate(startDate: string, endDate: string, page: number, size: number) {
        const token = localStorage.getItem('token');

        return await requestData(
            `${expensesUrl}/range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
            "GET",
            {"Authorization": `Bearer ${token}`}
        );
    }

    static async getExpenseById(id: number) {
        return await requestData(
            `${url}/get-expense?id=${id}`,
            "GET"
        );
    }

    static async createExpense(expense: Partial<Expense>) {
        const token = localStorage.getItem('token');
        const payload = {
            ...expense,
            total: Number(expense.total),
            spentAt: getPhilippineTimeISO(),
        };

        return await requestData(
            `${expensesUrl}/`,
            "POST",
            {"Authorization": `Bearer ${token}`},
            payload
        );
    }

    static async updateExpense(id: number, expense: Partial<Expense>) {
        const token = localStorage.getItem('token');

        return await requestData(
            `${expensesUrl}/${id}`,
            "PUT",
            {"Authorization": `Bearer ${token}`},
            {
                ...expense,
                total: Number(expense.total),
            }
        );
    }

    static async deleteExpense(id: number) {
        const token = localStorage.getItem('token');

        return await requestData(
            `${expensesUrl}/${id}`,
            "DELETE",
            {"Authorization": `Bearer ${token}`}
        );
    }
}
