import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Branch } from "@/types/branch";

const url = `${BASE_URL}/branches`;

export class BranchService {
    static async getAllBranches(page: number, size: number) {
        return await requestData(
            `${url}/get-branches?page=${page}&size=${size}`,
            "GET"
        );
    }

    static async getBranchById(id: number) {
        return await requestData(
        `${url}/find-branch?id=${id}`,
        "GET"
        );
    }

    static async addBranch(branch: Branch) {
        const payload = {
            ...branch,
            branchName: `Krispy Papi ${branch.branchName}`,
            zipCode: Number(branch.zipCode),
        };

        return await requestData(
            `${url}/add`,
            "POST",
            undefined,
            payload
        );
    }

    static async updateBranch(branch: Branch) {
        const payload = {
            ...branch,
            zipCode: Number(branch.zipCode),
        };

        return await requestData(
            `${url}/update-branch`,
            "POST",
            undefined,
            payload
        );
    }

    static async deleteBranch(id: number) {
        return await requestData(
            `${url}/delete-by-id?id=${id}`,
            "POST"
        );
    }
}
