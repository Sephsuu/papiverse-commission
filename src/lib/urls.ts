export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
export const NEXT_URL = process.env.NEXT_PUBLIC_API_ASSETS;
export const IMPORTATION_URL = process.env.NEXT_PUBLIC_API_IMPORTATION;

export const MOCKS_URL = process.env.NEXT_PUBLIC_MOCKS_API;

const ensureSecureUrlOnHttpsPage = (url?: string) => {
    if (!url || typeof window === "undefined") return url;

    try {
        const parsedUrl = new URL(url, window.location.origin);

        if (
            window.location.protocol === "https:" &&
            parsedUrl.protocol === "http:"
        ) {
            parsedUrl.protocol = "https:";
        }

        return parsedUrl.toString();
    } catch {
        return url;
    }
};

export const MESSAGING_URL = ensureSecureUrlOnHttpsPage(
    process.env.NEXT_PUBLIC_API_MESSAGING
);
export const WEBSOCKET_URL = ensureSecureUrlOnHttpsPage(
    process.env.NEXT_PUBLIC_API_WEBSOCKET
);
