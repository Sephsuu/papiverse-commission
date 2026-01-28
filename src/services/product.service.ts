import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Product } from "@/types/products";
import { Supply } from "@/types/supply";
import { Modifier } from "@/types/modifier";

const url = `${BASE_URL}/products`;

export class ProductService {
    static async getAllProducts() {
        return await requestData(
            `${url}/get-all`,
            'GET'
        );
    }

    static async getProductById(id: number) {
        return await requestData(
            `${url}/get-by-code?code=${id}`,
            'GET'
        );
    }

    static async getGroupProduct(id: number)  {
        return await requestData(
            `${BASE_URL}/product-link/get-products?group_id=${id}`,
            'GET',
        )
    }

    static async addProduct(product: Product) {
        return await requestData(
            `${url}/create`,
            'POST',
            undefined,
            product
        );
    }

    static async linkProductGroup(productModifier: { groupId: number, productId: number }[]) {
        return await requestData(
            `${BASE_URL}/product-link/create`,
            'POST',
            undefined,
            productModifier
        )
    }

    static async updateProduct(supply: Supply) {
        return await requestData(
            `${url}/update`,
            'POST',
            undefined,
            supply
        );
    }

    static async deleteProductLink(toDeleteModifier: { groupId: number, productId: number}[]) {
        return await requestData(
            `${BASE_URL}/product-link/delete-links`,
            'POST',
            undefined,
            toDeleteModifier
        )
    }

    static async deleteProduct(id: number) {
        return await requestData(
            `${url}/delete?id=${id}`,
            'POST'
        );
    }
}
