"use client";

import { useState, useMemo, useEffect } from "react";

export function usePagination<T>(items: T[] = [], defaultSize: number = 20, pageKey?: string) {
    const [page, setPage] = useState(0); // 0-based index
    const [size, setSize] = useState(defaultSize); // items per page

    useEffect(() => {
        setPage(0);
    }, [size]);

    useEffect(() => {
        if (!pageKey) return;

        const saved = localStorage.getItem(pageKey);
        if (saved !== null) {
            setPage(Number(saved));
        }
    }, [pageKey]);

    useEffect(() => {
        if (pageKey) {
            localStorage.setItem(pageKey, String(page));
        }
    }, [page, pageKey]);

    const paginated = useMemo(() => {
        if (!items) return [];
        const start = page * size;
        const end = start + size;
        return items.slice(start, end);
    }, [items, page, size]);

    const totalPages = Math.ceil(items.length / size);

    return {
        page,
        setPage,
        size,
        setSize,
        paginated,
        totalPages,
    };
}
