import { MOCKS_URL } from "@/lib/urls"
import { requestData } from "./_config";
import { Announcement } from "@/types/announcement";

const url = `${MOCKS_URL}/api/v1/mocks`;

export class MocksService {
    static async getInventory1() {
        return await requestData(`${url}/inventory_1`, "GET");
    }
}