import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Employee, Positiion } from "@/types/employee";

const url = `${BASE_URL}/employees`;
const positionsUrl = `${BASE_URL}/position`;

export class EmployeeService {
    static async getEmployeesByBranch(id: number) {
        return await requestData(
            `${url}/get-by-branch?branchId=${id}`,
            "GET"
        );
    }

    static async getEmployeeById(id: number) {
        return await requestData(
            `${url}/get-by-id?id=${id}`,
            "GET"
        );
    }

    static async createEmployee(employee: Employee, id: number) {
        const payload = {
            ...employee,
            branchId: id,
        };

        return await requestData(
            `${url}/create`,
            "POST",
            undefined,
            payload
        );
    }

    static async updateEmployee(employee: Employee) {
        return await requestData(
            `${url}/update`,
            "POST",
            undefined,
            employee
        );
    }

    static async deleteEmployee(id: number) {
        return await requestData(
            `${url}/delete-by-id?id=${id}`,
            "POST"
        );
    }
}

export class PositionService {
    static async getAllPositions() {
        return await requestData(
            `${positionsUrl}/get-all`,
            "GET"
        );
    }

    static async createPosition(position: Partial<Positiion>) {
        return await requestData(
            `${positionsUrl}/create`,
            "POST",
            undefined,
            position
        );
    }

    static async updatePosition(position: Partial<Positiion>) {
        return await requestData(
            `${positionsUrl}/update?id=${position.id}&name=${position.name}`,
            "POST",
            undefined,
            position
        );
    }
}
