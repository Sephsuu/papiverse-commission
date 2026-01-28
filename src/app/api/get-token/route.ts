
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('decodedToken');

    if (!tokenCookie) {
        return new Response(JSON.stringify({ error: 'No decodedToken cookie found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let decodedToken;
    try {
        decodedToken = JSON.parse(tokenCookie.value);
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid cookie value' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(decodedToken), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}