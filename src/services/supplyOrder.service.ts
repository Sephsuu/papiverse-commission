import { BASE_URL } from "@/lib/urls";
import { requestBlob, requestData } from "./_config";
import { CompleteOrder, SupplyItem, SupplyOrder } from "@/types/supplyOrder";
import { log } from "node:console";

const url = `${BASE_URL}/supply-order`;
const meatUrl = `${BASE_URL}/meat-order`
const snowUrl = `${BASE_URL}/snow-order`

function mapCategoryItems(items: SupplyItem[]) {
    return items.map((item) => {
        if (item.isOther) {
            return {
                isOther: true,
                name: item.name,
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
            };
        }

        return {
            sku: item.sku,
            quantity: Number(item.quantity) || 0,
        };
    });
}

export class SupplyOrderService {
    static async getAllSupply(start: string, end: string, type: string) {
        return await requestData(
            `${url}/get-all?start=${start}&end=${end}&type=${type}`, 
            "GET"
        );
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

    static async createMeatOrder(meat: { id: string; branchId: number; categoryItems: SupplyItem[] }) {
        return await requestData(
            `${meatUrl}/create`,
            'POST',
            undefined,
            {
                ...meat,
                categoryItems: mapCategoryItems(meat.categoryItems),
            }
        )
    }

    static async createSnowOrder(snow: { id: string; branchId: number; categoryItems: SupplyItem[] }) {
        return await requestData(
            `${snowUrl}/create`,
            'POST',
            undefined,
            {
                ...snow,
                categoryItems: mapCategoryItems(snow.categoryItems),
            }
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

    // static async exportForm(id: number, type: string, category: string) {
    //     return await requestData(
    //         `${url}/export?orderId=${id}&type=${type}&category=${category}`,
    //         "GET"
    //     );
    // }

    static async exportForm(
        orderId: number,
        type: string,
        category: string,
    ) {


        const res = await fetch(
        `${url}/export?orderId=${orderId}&type=${type}&category=${category}`,
        {
            method: "GET",
            // ✅ if your backend auth is cookie/session
            credentials: "include",

            // ✅ if your backend auth is Bearer token instead, use this and remove credentials
            // headers: {
            //   Accept: "application/pdf",
            //   Authorization: `Bearer ${localStorage.getItem("token")}`,
            // },

            headers: {
            Accept: "application/pdf",
            },
        }
        );

        if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to export PDF");
        }

        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `order-${orderId}-${type}-${category}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(blobUrl);

        return { message: "success" };
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

    static async updateExpectedDeliveryDate(expDel: string, orderId: number) {
        return await requestData(
            `${url}/update-expected?newExpected=${expDel}&id=${orderId}`,
            "POST",
        )
    }

    static async updateShipmentType(updatedShipment: Record<any, any>) {
        return await requestData(
            `${url}/update-type`,
            "POST",
            undefined,
            updatedShipment
        )
    }

    static async updateMeatOrder(meatOrder: SupplyItem[], id: string) {
        const payload = {
            id: id,
            categoryItems: mapCategoryItems(meatOrder),
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
            categoryItems: mapCategoryItems(snowOrder),
        };

        return await requestData(
            `${BASE_URL}/snow-order/update`,
            "POST",
            undefined,
            payload
        );
    }
}
