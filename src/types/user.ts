export interface User {
    id?: number;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    dateOfBirth?: string;
    gender?: string;
    contactNumber?: string;
    position? : string;
    branchId?: string | undefined;
    role?: string;
    hasLoggedIn?: boolean;

    imageUrl?: string;
    confirmPassword?: string;
    branch?: {
        branchId: number;
        branchName: string;
        streetAddress: string;
        barangay : string;
        city : string;
        province : string;
        isInternal : boolean;
        branchStatus : string;
    }
}

export const userInit: User = {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    position: '',
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    branchId: "",
    role: "",
    branch: {
        branchId: 0,
        branchName: "",
        streetAddress: "",
        barangay : "",
        city : "",
        province : "",
        isInternal : false,
        branchStatus : ""
    }
};

export type editUser = Pick<User, 'id' | 'firstName' | 'middleName' | 'lastName' |
                    'dateOfBirth' | 'gender' | 'contactNumber' | 'position'>


export type userCredentials = Pick<User, 'id' | 'username' | 'email' | 'password'>

export const userFields: (keyof User)[] = [
    "email",
    "username",
    "firstName",
    "lastName",
    "position",
    "dateOfBirth",
    "gender",
    "contactNumber",
    "branchId",
    "role"
];

export const updateUserFields: (keyof User)[] = [
    "branchId",
    "role",
]