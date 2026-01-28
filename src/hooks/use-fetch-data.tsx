/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useFetchData<T>(
    fetchFn: (...args: any[]) => Promise<T | { content: T[] }>,
    deps: any[] = [],
    args: any[] = [], 
    page = 0,
    size = 1000,
    enabled = true,
) {
    const [items, setItems] = useState<T | T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                const result = await fetchFn(...args, page, size);

                if (!isMounted) return;

                if (result && typeof result === "object" && "content" in result) {
                    const res = result as { content: T[] };
                    setItems(res.content);
                } else {
                    setItems(result as T);
                }
            } catch (err: any) {
                const message = err?.message || err?.error || "Failed to fetch data";
                setError(message);
                toast.error(message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (!fetchFn) return;
        if (!args || args.some(a => a === undefined || a === null || a === 0)) {
            setLoading(false);
            return;
        }

        fetchData();
        return () => {
            isMounted = false;
        };
        }, [page, size, ...deps]);

    const data = Array.isArray(items) ? items : [];
    return { data, loading, error };
}
