import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Supply } from "@/types/supply";

const url = `${BASE_URL}/raw-materials`;

export class RawMaterialService {
  static async getAllRawMaterials(page: number, size: number) {
    return await requestData(
      `${url}/get-all?page=${page}&size=${size}&type=RAW_MATERIAL`,
      "GET"
    );
  }

  static async createRawMaterial(rawMaterial: Partial<Supply>) {
    const payload = {
      ...rawMaterial,
      inventorySourceSku: rawMaterial.inventorySourceSku,
      stockFactor:
        rawMaterial.stockFactor === null || rawMaterial.stockFactor === undefined
          ? null
          : Number(rawMaterial.stockFactor),
      unitQuantity: Number(rawMaterial.unitQuantity),
      unitCost: Number(rawMaterial.unitCost),
      minStock: Number(rawMaterial.minStock),
      convertedMeasurement: rawMaterial.unitMeasurement,
      convertedQuantity: Number(rawMaterial.unitQuantity),
      isDeliverables: false,
      unitPriceInternal: null,
      unitPriceExternal: null,
      category: null,
      type: "RAW_MATERIAL",
    };

    return await requestData(
      `${url}/create`,
      "POST",
      undefined,
      payload
    );
  }

  static async updateRawMaterial(rawMaterial: Partial<Supply>) {
    const payload = {
      ...rawMaterial,
      inventorySourceSku: rawMaterial.inventorySourceSku,
      stockFactor:
        rawMaterial.stockFactor === null || rawMaterial.stockFactor === undefined
          ? null
          : Number(rawMaterial.stockFactor),
      unitQuantity: Number(rawMaterial.unitQuantity),
      unitCost: Number(rawMaterial.unitCost),
      minStock: Number(rawMaterial.minStock),
      convertedMeasurement: rawMaterial.unitMeasurement,
      convertedQuantity: Number(rawMaterial.unitQuantity),
      isDeliverables: false,
      unitPriceInternal: null,
      unitPriceExternal: null,
      category: null,
      type: "RAW_MATERIAL",
    };

    return await requestData(
      `${url}/update`,
      "POST",
      undefined,
      payload
    );
  }

  static async deleteRawMaterial(sku: string) {
    return await requestData(
      `${url}/delete-by-code?code=${sku}`,
      "POST"
    );
  }
}
