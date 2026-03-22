import { format } from "date-fns";

export function parseExpenseCalendarDate(value?: string | null) {
    if (!value) return undefined;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toExpenseDateTimeString(date: Date, referenceDateTime?: string | null) {
    const reference = referenceDateTime ? new Date(referenceDateTime) : new Date();
    const safeReference = Number.isNaN(reference.getTime()) ? new Date() : reference;

    const nextDate = new Date(date);
    nextDate.setHours(
        safeReference.getHours(),
        safeReference.getMinutes(),
        safeReference.getSeconds(),
        safeReference.getMilliseconds()
    );

    return format(nextDate, "yyyy-MM-dd'T'HH:mm");
}
