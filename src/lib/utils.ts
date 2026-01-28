/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasEmptyField<T extends Record<string, any>>(
    obj: T,
    exemptKeys: (keyof T)[] = []
): boolean {
    return Object.entries(obj).some(([key, value]) => {
        // Skip exempted keys
        if (exemptKeys.includes(key as keyof T)) return false;

        if (value === 0) return true;                 // number zero
        if (value === "") return true;                // empty string
        
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0
        ) return true;                                // empty object

        return false;
    });
}

export function updateField<T>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T,
    value: T[keyof T]
) {
    setState((prev) => ({
        ...prev,
        [key]: value,
    }));
}
