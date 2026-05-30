import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import {
    AssignProductsRequest,
    MonthlyCommissionReportResponse,
    CreateCommissionOwnerRequest,
    UpdateCommissionOwnerRequest,
} from "@/types/commissionOwner";

const commissionOwnersUrl = `${BASE_URL}/commission-owners`;

export class CommissionOwnerService {
    static async getCommissionOwners() {
        return await requestData(commissionOwnersUrl, "GET");
    }

    static async createCommissionOwner(payload: CreateCommissionOwnerRequest) {
        return await requestData(
            commissionOwnersUrl,
            "POST",
            undefined,
            payload
        );
    }

    static async updateCommissionOwner(
        ownerId: number,
        payload: UpdateCommissionOwnerRequest
    ) {
        return await requestData(
            `${commissionOwnersUrl}/${ownerId}`,
            "PUT",
            undefined,
            payload
        );
    }

    static async deleteCommissionOwner(ownerId: number) {
        const res = await fetch(`${commissionOwnersUrl}/${ownerId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || "Request failed");
        }
    }

    static async getAvailableProducts(ownerId: number) {
        return await requestData(
            `${commissionOwnersUrl}/${ownerId}/available-products`,
            "GET"
        );
    }

    static async assignProductsToOwner(
        ownerId: number,
        payload: AssignProductsRequest
    ) {
        return await requestData(
            `${commissionOwnersUrl}/${ownerId}/product-assignments`,
            "POST",
            undefined,
            payload
        );
    }

    static async removeProductAssignment(ownerId: number, rawMaterialId: number) {
        const res = await fetch(
            `${commissionOwnersUrl}/${ownerId}/product-assignments/${rawMaterialId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || "Request failed");
        }
    }

    static async getMonthlyCommissionReport(month: string): Promise<MonthlyCommissionReportResponse> {
        return await requestData(`${BASE_URL}/commission-reports?month=${month}`, "GET");
    }
}
