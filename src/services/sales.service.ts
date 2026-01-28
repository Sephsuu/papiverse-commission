import { BASE_URL, IMPORTATION_URL } from "@/lib/urls";
import { requestData } from "./_config";

const salesUrl = `${BASE_URL}/sales`;
const importationUrl = `${IMPORTATION_URL}/api`;


export class SalesService {
    static async getOverallSummary(start: string, end: string) {
        return await requestData(
            `${salesUrl}/get-overall?start=${start}&end=${end}`,
            'GET'
        )
    }

    static async getSalesByBranch(branchId: number, start: string, end: string) {
        return await requestData(
            `${salesUrl}/get-summary?branchId=${branchId}&start=${start}&end=${end}`,
            'GET'
        )
    }

    static async getPaidOrders(branchId: number, start: string, end: string, page: number, size: number) {
        return await requestData(
            `${salesUrl}/get-detailed?branchId=${branchId}&start=${start}&end=${end}&page=${page}&size=${size}`,
            'GET'
        )
    }

    static async generateFranchisorGraph(start: string, end: string, filter: string) {
        return await requestData(
            `${salesUrl}/generate-graph-franchisor?startDate=${start}&endDate=${end}&filter=${filter}`,
            'GET'
        )
    }

    static async generateGraph(branchId: number, start: string, end: string, filter: string) {
        return await requestData(
            `${salesUrl}/generate-graph?branchId=${branchId}&startDate=${start}&endDate=${end}&filter=${filter}`,
            'GET'
        )
    }

    static async getBranchRankings(start: string, end: string) {
        return await requestData(
            `${salesUrl}/branch-ranking?start=${start}&end=${end}`,
            'GET'
        )
    }

    static async getProductRanking(start: string, end: string) {
        return await requestData(
            `${salesUrl}/products-ranking?start=${start}&end=${end}`,
            'GET'
        )
    }

    static async getSalesCalendar(branchId: number, month: string, year: string) {
        return await requestData(
            `${salesUrl}/get-calendar?branchId=${branchId}&month=${month}&year=${year}`,
            'GET'
        )
    }

    static async readPaidOrders(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        
        return await requestData(
            `${importationUrl}/read-paid-orders`,
            'POST',
            undefined,
            formData
        )
    }

    static async uploadPaidOrders(branchId: number, file: File, isHistorical: boolean) {
        const formData = new FormData();
        formData.append('file', file);

        return await requestData(
            `${salesUrl}/upload?branchId=${branchId}&historical=${isHistorical}`,
            'POST',
            undefined,
            formData
        )
    }
}