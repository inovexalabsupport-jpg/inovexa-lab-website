
function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = new TextEncoder().encode(payload);
  return base64url(await crypto.subtle.sign("HMAC", key, data));
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return Response.json(
      { error: "Admin login is not configured." },
      { status: 500 }
    );
  }

  const origin = request.headers.get("Origin");
  const site = new URL(request.url).origin;

  if (origin !== site) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof body.password !== "string" ||
    body.password.length > 200 ||
    body.password !== env.ADMIN_PASSWORD
  ) {
    return Response.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
    )
  );

  const token = payload + "." + await sign(payload, env.ADMIN_SESSION_SECRET);

  return Response.json(
    { success: true, message: "Login successful." },
    {
      status: 200,
      headers: {
        "Set-Cookie": `inovexa_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=3600`,
        "Cache-Control": "no-store"
      }
    }
  );
}
