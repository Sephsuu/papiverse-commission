"use client";

import { useCallback } from "react";

export function useSessionStorage<T>() {

    const setSessionStorage = useCallback((
        key: string,
        value: T
    ) => {
        try {
            sessionStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            console.error(
                "[useSessionStorage] Failed to set item:",
                error
            );
        }
    }, []);

    const getSessionStorage = useCallback((
        key: string
    ): T | null => {
        try {
            const item =
                sessionStorage.getItem(key);

            return item
                ? JSON.parse(item)
                : null;
        } catch (error) {
            console.error(
                "[useSessionStorage] Failed to get item:",
                error
            );

            return null;
        }
    }, []);

    const removeSessionStorage = useCallback((
        key: string
    ) => {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error(
                "[useSessionStorage] Failed to remove item:",
                error
            );
        }
    }, []);

    const clearSessionStorage = useCallback(() => {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error(
                "[useSessionStorage] Failed to clear storage:",
                error
            );
        }
    }, []);

    return {
        setSessionStorage,
        getSessionStorage,
        removeSessionStorage,
        clearSessionStorage,
    };
}