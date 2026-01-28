export type Branch = {
    name: string;
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
	name: "",
	streetAddress: "",
	barangay: "",
	city: "",
	province: "",
	zipCode: "",
	branchStatus: "",
	isInternal: false
};

export const branchFields: (keyof Branch)[] = [
    "name",
    "streetAddress",
    "barangay",
    "city",
    "province",
    "zipCode",
    "branchStatus",
];