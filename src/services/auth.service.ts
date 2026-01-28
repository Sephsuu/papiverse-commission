import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { User } from "@/types/user";

const url = `${BASE_URL}/auth`

export class AuthService {
    static async authenticateUser(credentials: object) {
        return await requestData(
            `${url}/login`,
            'POST',
            undefined,
            credentials
        )
    } 

    static async getCookie() {
        return await requestData(
            `/api/get-token`,
            'GET',
        )
    }

    static async setCookie(token: string) {
        return await requestData(
            `/api/set-token`,
            'POST',
            undefined,
            { token }
        )
    }

    static async deleteCookie() {
        return await requestData(
            `/api/delete-token`,
            'POST'
        )
    }

    static async registerUser(user: User) {
        delete user.branch

        return await requestData(
            `${url}/register`,
            'POST',
            undefined,
            user
        )
    }

    static async updateCredentials(credentials: object) {
        return await requestData(
            `${url}/update-credentials`,
            'POST',
            undefined,
            credentials
        )
    }

    static async resendCredential(id: number) {
        return await requestData(
            `${url}/resend-credentials?id=${id}`,
            'GET',
        )
    }
}