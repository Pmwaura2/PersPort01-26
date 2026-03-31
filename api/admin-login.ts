import {
  buildSessionCookie,
  createAdminSession,
  getExpectedAdminUsername,
  isAdminAuthConfigured
} from "../lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return Response.json(
      {
        error: "Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in Vercel before using hosted admin login."
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const expectedUsername = getExpectedAdminUsername();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (username !== expectedUsername || password !== expectedPassword) {
    return Response.json({ error: "Invalid admin credentials." }, { status: 401 });
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
