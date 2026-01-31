import { capitalizeWords } from "@/lib/formatter";
import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Supply } from "@/types/supply";

const url = `${BASE_URL}/raw-materials`;

export class SupplyService {
  static async getAllSupplies(page: number, size: number) {
    return await requestData(
        `${url}/get-all?page=${page}&size=${size}`,
        "GET"
    );
  }

  static async getSupplyByCode(code: string) {
    return await requestData(
        `${url}/get-by-code?code=${code}`,
        "GET"
    );
  }

  static async getDeliverableSupplies(page: number, size: number) {
    return await requestData(
        `${url}/get-deliverables?page=${page}&size=${size}`,
        "GET"
    );
  }

  static async addSupply(supply: Supply) {
    const payload = {
        ...supply,
        name: capitalizeWords(supply.name!),
        minStock: Number(supply.minStock),
        convertedQuantity: Number(supply.convertedQuantity),
        unitQuantity: Number(supply.unitQuantity),
        unitPriceInternal: Number(supply.unitPriceInternal),
        unitPriceExternal: Number(supply.unitPriceExternal),
    };

    return await requestData(
        `${url}/create`,
        "POST",
        undefined,
        payload
    );
  }

  static async updateSupply(supply: Supply) {
    const payload = {
        ...supply,
        name: capitalizeWords(supply.name!),
        category: supply.isDeliverables ? supply.category : 'NONDELIVERABLES',
        unitQuantity: Number(supply.unitQuantity),
        unitPriceInternal: supply.isDeliverables ? Number(supply.unitPriceInternal) : 0,
        unitPriceExternal: supply.isDeliverables ? Number(supply.unitPriceExternal) : 0,
    };

    return await requestData(
        `${url}/update`,
        "POST",
        undefined,
        payload
    );
  }

  static async deleteSupply(code: string) {
    return await requestData(
        `${url}/delete-by-code?code=${code}`,
        "POST"
    );
  }
}
