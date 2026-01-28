import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Inventory } from "@/types/inventory";

const url = `${BASE_URL}/inventory`;

export class InventoryService {
  static async getInventoryByBranch(id: number, page: number, size: number) {
    return await requestData(
        `${url}/get-by-branch?id=${id}&page=${page}&size=${size}`,
        "GET"
    );
  }

  static async getInventoryAudits(id: number, source: string, page: number, size: number) {
    return await requestData(
        `${url}/get-audits?branchId=${id}&source=${source}&page=${page}&size=${size}`,
        "GET"
    );
  }

  static async getItemAudits(id: number, code: string, page: number, size: number) {
    return await requestData(
        `${url}/get-item-audit?branchId=${id}&code=${code}&page=${page}&size=${size}`,
        "GET"
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
          rawMaterialCode: inventory.code,
          branchId: inventory.branchId,
          changedQuantity: inventory.changedQuantity,
          type: inventory.type,
          unitType: inventory.unitType,
          source: 'INPUT'
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
