import { Claim } from "@/types/claims";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getDecodedToken() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('decodedToken');

    if (!tokenCookie) {
        return null;
    }

    try {
        return JSON.parse(tokenCookie.value);
    } catch {
        return null;
    }   
}

export async function requireAuth() {
    const token = await getDecodedToken();

    if (!token) {
        redirect('/auth');
    }

    return token;
}

export async function requireRole(allowedRoles: string[]) {
    const token = await requireAuth();

    if (!allowedRoles.includes(token.roles[0])) {
        redirect('/unauthorized');
    }

    return token;
}

export async function requirePermission(permission: string) {
    const token = await requireAuth();
        if (!token.permissions?.includes(permission)) {
            redirect('/unauthorized');
        }
        return token;
    }

    export function hasRole(token: Claim, roles: string[]): boolean {
    return roles.includes(token.roles[0]);
}