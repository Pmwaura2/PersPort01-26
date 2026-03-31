import {
  buildSessionCookie,
  createAdminSession,
  getExpectedAdminUsername,
  isAdminAuthConfigured
} from "../lib/admin-auth.js";

export async function POST(request) {
  if (!isAdminAuthConfigured()) {
    return Response.json({ error: "Sign-in unavailable." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const expectedUsername = getExpectedAdminUsername();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (username !== expectedUsername || password !== expectedPassword) {
    return Response.json({ error: "Access denied." }, { status: 401 });
  }

  const sessionToken = await createAdminSession(username);
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": buildSessionCookie(sessionToken)
      }
    }
  );
}
