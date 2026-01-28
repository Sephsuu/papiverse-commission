import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const url = `${BASE_URL}/user`; 

export class UserService {
    static async getAllUsers(page: number, size: number) {
        return await requestData(
            `${url}/get-users?page=${page}&size=${size}`,
            'GET'
        )
    } 

    static async getUserById(id: number) {
        return await requestData(
            `${url}/find-user?id=${id}`,
            'GET'
        )
    }

    static async updateUser(user: object) {
        return await requestData(
            `${url}/update`,
            'POST',
            undefined,
            user
        )
    }

    static async adminUpdate(user: object) {
        return await requestData(
            `${url}/update-admin`,
            'POST',
            undefined,
            user
        )
    }

    static async deleteUser(id: number) {
        return await requestData(
            `${url}/delete-user?id=${id}`,
            'POST',
        )
    }

    static async fileUpload(file: File, id: number) {
        const formData = new FormData();
        formData.append('file', file);
        return await requestData(
            `${url}/${id}/profile-picture`,
            'POST',
            undefined,
            formData
        )
    }

}