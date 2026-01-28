import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Expense } from "@/types/expense";

const url = `${BASE_URL}/inquiry`;

export class InquiryService {
    static async getInquiriesByStatus(status: string) {
        return await requestData(
            `${url}/get-all?status=${status}`,
            "GET",
        );
    }

    static async createInquiry(inquiry: Partial<Inquiry>) {
        return await requestData(
            `${url}/create`,
            "POST",
            undefined,
            inquiry
        );
    }

    static async updateInquiryStatus(id: number, status: string, userId: number) {
        return await requestData(
            `${url}/update-by-id?id=${id}&status=${status}&userId=${userId}`,
            "POST",
        );
    } 
}