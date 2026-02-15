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

export async function requestBlob(
  url: string,
  method: string,
  headers?: HeadersInit,
  body?: unknown,
  options?: { credentials?: RequestCredentials }
): Promise<{ blob: Blob; filename?: string; contentType?: string }> {
  const upperMethod = method.toUpperCase();

  // start with provided headers
  let finalHeaders: HeadersInit = { ...(headers || {}) };

  // ✅ Only set JSON content-type when sending JSON (POST/PUT/PATCH) and body is not FormData
  const hasBody = body !== undefined && body !== null;
  const isFormData = body instanceof FormData;

  if (hasBody && !isFormData && !["GET", "HEAD"].includes(upperMethod)) {
    finalHeaders = {
      "Content-Type": "application/json",
      ...finalHeaders,
    };
  }

  const res = await fetch(url, {
    method: upperMethod,
    headers: finalHeaders,
    body: isFormData ? body : hasBody ? JSON.stringify(body) : undefined,
    credentials: options?.credentials, // set only when needed
  });

  // 🔎 Debug (remove later)
  // console.log("EXPORT STATUS:", res.status);
  // console.log("EXPORT CT:", res.headers.get("content-type"));

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const err = await res.json();
        message = err?.error || err?.message || message;
      } else {
        const txt = await res.text();
        if (txt) message = txt;
      }
    } catch {}
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || undefined;

  // Try to extract filename from Content-Disposition
  const disposition = res.headers.get("content-disposition") || "";
  let filename: string | undefined;

  const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  const normalMatch = disposition.match(/filename\s*=\s*"?([^"]+)"?/i);

  if (utf8Match?.[1]) filename = decodeURIComponent(utf8Match[1]);
  else if (normalMatch?.[1]) filename = normalMatch[1];

  const blob = await res.blob();

  return { blob, filename, contentType };
}