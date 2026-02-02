import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { CompleteOrder, SupplyItem, SupplyOrder } from "@/types/supplyOrder";

const url = `${BASE_URL}/supply-order`;
const meatUrl = `${BASE_URL}/meat-order`
const snowUrl = `${BASE_URL}/snow-order`

export class SupplyOrderService {
    static async getAllSupply() {
        return await requestData(`${url}/get-all`, "GET");
    }

    static async getSupplyOrderById(id: number) {
        return await requestData(
            `${url}/get-by-orderId?id=${id}`,
            "GET"
        );
    }

    static async getSupplyOrderByBranch(id: number) {
        return await requestData(
            `${url}/get-by-branch?id=${id}`,
            "GET"
        );
    }

    static async getDetailedCommissary(filter: string, date: string) {
        return await requestData(
            `${url}/view-out?filter=${filter}&date=${date}`,
            "GET"
        );
    }

    static async getBranchPurchaseItem(filter: string, date: string) {
        return await requestData(
            `${url}/view-detailed-out?filter=${filter}&date=${date}`,
            "GET"
        );
    }

    static async getAllBranchPurchaseItem(filter: string, date: string) {
        return await requestData(
            `${url}/view-detailed?filter=${filter}&date=${date}`,
            "GET"
        );
    }

    static async createMeatOrder(meat: object) {
        return await requestData(
            `${meatUrl}/create`,
            'POST',
            undefined,
            meat
        )
    }

    static async createSnowOrder(snow: object) {
        return await requestData(
            `${snowUrl}/create`,
            'POST',
            undefined,
            snow
        )
    }

    static async createSupplyOrder(order: CompleteOrder) {
        return await requestData(
            `${url}/create`,
            "POST",
            undefined,
            order
        );
    }

    static async addRemarks(id: number, remarks: string) {
        return await requestData(
            `${url}/add-remarks?id=${id}&remarks=${remarks}`,
            "POST"
        );
    }

    static async updateOrderStatus(
        id: number,
        newStatus: string,
        meatApproved?: boolean,
        snowApproved?: boolean
    ) {
        const params = new URLSearchParams({
            id: String(id),
            newStatus,
        });

        if (meatApproved !== undefined) {
            params.append("meatApproved", String(meatApproved));
        }

        if (snowApproved !== undefined) {
            params.append("snowApproved", String(snowApproved));
        }

        return requestData(
            `${url}/update-status?${params.toString()}`,
            "POST"
        );
    }



    static async updateMeatOrder(meatOrder: SupplyItem[], id: string) {
        const payload = {
            id: id,
            categoryItems: meatOrder,
        };

        return await requestData(
            `${BASE_URL}/meat-order/update`,
            "POST",
            undefined,
            payload
        );
    }

    static async updateSnowOrder(snowOrder: SupplyItem[], id: string) {
        const payload = {
            id: id,
            categoryItems: snowOrder,
        };

        return await requestData(
            `${BASE_URL}/snow-order/update`,
            "POST",
            undefined,
            payload
        );
    }
}
