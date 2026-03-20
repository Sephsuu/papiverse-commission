export function sanitizeDecimalInput(value: string, maxDecimalPlaces = 2) {
    const sanitizedValue = value.replace(/[^\d.]/g, "");
    const [integerPart = "", ...decimalParts] = sanitizedValue.split(".");

    if (decimalParts.length === 0) return integerPart;

    return `${integerPart}.${decimalParts.join("").slice(0, maxDecimalPlaces)}`;
}

export function parseOptionalDecimal(value: string) {
    if (value === "" || value === ".") return undefined;

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
