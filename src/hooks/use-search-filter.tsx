/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";

function getValueByPath(obj: any, path: string) {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function useSearchFilter<T>(
    items: T[] = [],
    keys: string[] = []   // 🔹 Accept keys as parameter
) {
    const [search, setSearch] = useState("");

    const filteredItems = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return items;

        return items.filter((item) =>
            keys.some((key) => {
                const value = getValueByPath(item, key); // 🔹 Support nested key
                return String(value ?? "").toLowerCase().includes(query);
            })
        );
    }, [search, items, keys]);

  return { search, setSearch, filteredItems };
}
