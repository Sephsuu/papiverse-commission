export async function requestData(
    url: string,
    method: string,
    headers?: HeadersInit,
    body?: unknown
) {
    // console.log('Endpoint:', url);
    // console.log('Method:', method);
    // console.log('Headers:', headers);
    // console.log('Body:', body);
    let finalHeaders: HeadersInit = headers || {};

    // ✅ If body is FormData → don't set Content-Type
    if (!(body instanceof FormData)) {
        finalHeaders = {
        "Content-Type": "application/json",
        ...finalHeaders,
        };
    }

    const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
    }
    const response = await res.json();

    // console.log('Response Body:', response);
    

    return response;
}