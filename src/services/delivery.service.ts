import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Branch } from "@/types/branch";

const url = `${BASE_URL}/delivery`;

export class DeliveryService {
    static async getDeliveryFeeByBranch(id: number) {
        return await requestData(
            `${url}/find-by-id?branchId=${id}`,
            "GET"
        );
    }
}