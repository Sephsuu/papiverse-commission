import { Modifier } from "./modifier";

export interface Product {
    id?: number;
    name: string;
    price: number;
    category: string;
    itemsNeeded: MaterialItem[];
    groups?: Modifier[];
}

export interface MaterialItem {
    id?: number;
    code?: string;
    name?: string,
    quantity?: number;
    unitMeasurement?: string;
    type?: string;
}

export const productInit: Product = {
    name: "",
    price: 0,
    category: "",
    itemsNeeded: [],
};

export const productFields: (keyof Product)[] = [
    "name",
    "price",
    "category",
    "itemsNeeded",
];