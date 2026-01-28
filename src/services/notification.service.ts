
import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const url = `${BASE_URL}/notifications`

export class NotificationService {
    static async getNotifcationByUserBranch(userId: number, branchId: number) {
        return await requestData(
            `${url}/initial-feed/${userId}/${branchId}`, 
            "GET",
        );
    }

    static async bulkDelete(toDelete: { toDelete: number[] }) {
        return await requestData(
            `${url}/delete-bulk`, 
            "POST",
            undefined,
            toDelete
        );
    }

}

