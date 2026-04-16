import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Inventory } from "@/types/inventory";

const url = `${BASE_URL}/inventory`;

export class InventoryService {
	static async getInventoryByBranch(id: number, page: number, size: number, rawMaterialType?: string) {
		return await requestData(
			`${url}/get-by-branch?id=${id}&page=${page}&size=${size}&rawMaterialType=${rawMaterialType ?? 'PRODUCT'}`,
			"GET"
		);
	}

	static async getInventoryBranchBreakdown(id: number, page: number, size: number, rawMaterialType?: string) {
		return await requestData(
			`${url}/get-by-branch-breakdown?id=${id}&page=${page}&size=${size}&rawMaterialType=${rawMaterialType ?? 'PRODUCT'}`,
			"GET",
		);
	}

	static async getInventoryAudits(id: number, source: string, month: string, year: string, rawMaterialType: string, page?: number, size?: number) {
		return await requestData(
			`${url}/get-audits?branchId=${id}&source=${source}&month=${month}&year=${year}&page=${page}&size=${size}&rawMaterialType=${rawMaterialType ?? 'PRODUCT'}`,
			"GET"
		);
	}

	static async getItemAudits(id: number, code: string, page: number, size: number) {
		return await requestData(
			`${url}/get-item-audit?branchId=${id}&code=${code}&page=${page}&size=${size}`,
			"GET"
		);
	}

	static async getTransactionSummary(id: number, date: string, rawMaterialType: string) {
		return await requestData(
			`${url}/get-transaction-summary?id=${id}&start=${date}&end=${date}&rawMaterialType=${rawMaterialType ?? 'PRODUCT'}`,
			"GET",
		);
	}

	static async getItemAuditByDate(id: number, type: string, sku: string, date: string) {
		return await requestData(
			`${url}/get-item-audit-by-date`,
			"POST",
			undefined,
			{
				id: id,
				sku: sku,
				type: type,
				start: date,
				end: date,
				page: 0,
				size: 1000,
			}
		);
	}

	static async getCommissaryFinanceReport(id: number, startDate: string, endDate: string) {
		return await requestData(
			`${url}/get-commissary-finance-report?id=${id}&start=${startDate}&end=${endDate}`,
			"GET",
		);
	}

	static async getCommissaryFinanceBreakdown(id: number, startDate: string, endDate: string) {
		return await requestData(
			`${url}/get-commissary-finance-breakdown?id=${id}&start=${startDate}&end=${endDate}`,
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

	static async createInventory(inventory: Inventory) {
		return await requestData(
			`${url}/create`,
			"POST",
			undefined,
			inventory
		);
	}

	static async updateInventory(inventory: Inventory) {
		return await requestData(
			`${url}/update`,
			"POST",
			undefined,
			inventory
		);
	}

	static async deleteInventory(id: number) {
		return await requestData(
			`${url}/delete?id=${id}`,
			"POST"
		);
	}

	static async createInventoryInput(inventory: Inventory) {
		return await requestData(
			`${url}/process-transaction-input`,
			"POST",
			undefined,
			{
				rawMaterialCode: inventory.sku,
				branchId: inventory.branchId,
				changedQuantity: inventory.changedQuantity,
				type: inventory.type,
				unitType: inventory.unitType,
				source: 'INPUT',
				effectiveDate: inventory.effectiveDate,
				unitCost: inventory.unitCost,
			}
		);
	}

	static async createInventoryOrder(inventory: Inventory) {
		return await requestData(
			`${url}/process-transaction-order`,
			"POST",
			undefined,
			inventory
		);
	}
}
