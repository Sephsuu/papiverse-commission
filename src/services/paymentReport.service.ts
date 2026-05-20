import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const url = `${BASE_URL}/payment-reports`

export class PaymentReportService {
    static async getMethodDeposits(month: string) {
        return await requestData(
            `${url}/payment-method-deposits?month=${month}`,
            'GET'
        )
    }

    static async getBranchDeposits(month: string) {
        return await requestData(
            `${url}/branch-deposits?month=${month}`,
            'GET'
        )
    }

    static async createPayment(payment: any) {
        return await requestData(
            `${url}`,
            'POST',
            undefined,
            payment
        )
    }

    static async updatePayment(payment: any) {
        return await requestData(
            `${url}/${payment.id}`,
            'POST',
            undefined,
            payment
        )
    }

    static async deletePayment(id: number) {
        return await requestData(
            `${url}/${id}/deletion`,
            'POST',
        )
    }
}