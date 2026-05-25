export type Branch = {
    name: string;
    streetAddress: string;
    barangay: string;
    city: string;
    province: string;
    zipCode: string;
    status: string;
    pricingType: string;
    isInternal: boolean;
    deliveryFee?: number
    code?: string;

	id?: number;
};

export const branchInit: Branch = {
	name: "",
	streetAddress: "",
	barangay: "",
	city: "",
	province: "",
	zipCode: "",
	status: "",
    pricingType: "",
	isInternal: false,
    code : "",
    deliveryFee: 0,
};

export const branchFields: (keyof Branch)[] = [
    "name",
    "streetAddress",
    "barangay",
    "city",
    "province",
    "zipCode",
    "status",
];