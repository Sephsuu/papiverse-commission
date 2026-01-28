export type Branch = {
    branchName: string;
    streetAddress: string;
    barangay: string;
    city: string;
    province: string;
    zipCode: string;
    branchStatus: string;
    isInternal: boolean;

	branchId?: number;
};

export const branchInit: Branch = {
	branchName: "",
	streetAddress: "",
	barangay: "",
	city: "",
	province: "",
	zipCode: "",
	branchStatus: "",
	isInternal: false
};

export const branchFields: (keyof Branch)[] = [
    "branchName",
    "streetAddress",
    "barangay",
    "city",
    "province",
    "zipCode",
    "branchStatus",
];