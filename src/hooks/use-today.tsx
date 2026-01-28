"use client";

import { useMemo } from "react";

export function useToday(inputDate?: string) {
    const dateObj = useMemo(() => {
        if (inputDate) {
            return new Date(inputDate + "T00:00:00+08:00");
        }

        const phNow = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );

        return phNow;
    }, [inputDate]);

    const day = String(dateObj.getDate()).padStart(2, "0");
    const monthNumber = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const monthShort = dateObj.toLocaleString("en-US", {
        month: "short",
        timeZone: "Asia/Manila",
    });

    const monthLong = dateObj.toLocaleString("en-US", {
        month: "long",
        timeZone: "Asia/Manila",
    });

    const dayShort = dateObj.toLocaleString("en-US", {
        weekday: "short",
        timeZone: "Asia/Manila",
    });

    const dayLong = dateObj.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "Asia/Manila",
    });

    return {
        dateObj,
        day,
        monthNumber,
        year,
        monthShort,
        monthLong,
        dayShort,
        dayLong,
    };
}
