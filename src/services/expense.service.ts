import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Expense } from "@/types/expense";

const url = `${BASE_URL}/financial-logs`;

export class ExpenseService {
    static async getExpensesByBranch(id: number) {
        return await requestData(
            `${url}/get-by-branch?branchId=${id}`,
            "GET"
        );
    }

    static async getExpenseById(id: number) {
        return await requestData(
            `${url}/get-expense?id=${id}`,
            "GET"
        );
    }

    static async createExpense(expense: Expense) {
        const payload = {
            ...expense,
            expense: Number(expense.expense),
            purpose: expense.purpose.toUpperCase(),
            date: new Date().toISOString().split("T")[0], 
        };

        return await requestData(
            `${url}/create`,
            "POST",
            undefined,
            payload
        );
    }

    static async updateExpense(expense: Expense) {
        const payload = {
            ...expense,
            expense: Number(expense.expense),
            purpose: expense.purpose.toUpperCase(),
        };

        return await requestData(
            `${url}/update`,
            "POST",
            undefined,
            payload
        );
    }

    static async deleteExpense(id: number) {
        return await requestData(
            `${url}/delete?id=${id}`,
            "POST"
        );
    }
}
