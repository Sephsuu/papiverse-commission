import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const url = `${BASE_URL}/supply-order-payments`

export class SupplyOrderPaymentService {
    static async getPaymentByOrder(id: number) {
        return await requestData(
            `${url}/supply-orders/${id}`,
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