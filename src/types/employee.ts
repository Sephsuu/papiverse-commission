export interface Employee {
    id?: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    branchId: number;
    position: string;
}

export interface Positiion {
    id: number;
    name: string;
}

export const employeeInit: Employee = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    branchId: 0,
    position: "",
};

export const employeeFields: (keyof Employee)[] = [
    "firstName",
    "lastName",
    "email",
    "position"
];  

