import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const url = `${BASE_URL}/finance`

export class FinanceService {
    static async weeklySalesReport(month: string, scope: string) {
        return await requestData(
            `${url}/internal-branch-weekly-sales-report?month=${month}&scope=${scope}`,
            'GET'
        )
    }

    static async getSupplyFinanceReport(id: number, startDate: string, endDate: string) {
        return await requestData(
            `${url}/get-commissary-finance-report-try?id=${id}&start=${startDate}&end=${endDate}`,
            "GET",
        );
    }

    static async getSupplyFinanceBreakdown(id: number, startDate: string, endDate: string, category: string) {
        return await requestData(
            `${url}/get-commissary-finance-breakdown-try?id=${id}&start=${startDate}&end=${endDate}&category=${category}`,
            "GET",
        );
    }

    static async getRawMaterialFinanceReport(id: number, startDate: string, endDate: string) {
        return await requestData(
            `${url}/get-commissary-raw-material-finance-report?id=${id}&start=${startDate}&end=${endDate}`,
            "GET",
        );
    }

    static async getRawMaterialFinanceBreakdown(id: number, startDate: string, endDate: string) {
        return await requestData(
            `${url}/get-commissary-raw-material-finance-breakdown?id=${id}&start=${startDate}&end=${endDate}`,
            "GET",
        );
    }	
}