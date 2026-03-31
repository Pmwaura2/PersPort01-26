import {
  buildSessionCookie,
  createAdminSession,
  getExpectedAdminUsername,
  isAdminAuthConfigured
} from "../lib/admin-auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!isAdminAuthConfigured()) {
    response.status(503).json({
      error: "Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in Vercel before using hosted admin login."
    });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const expectedUsername = getExpectedAdminUsername();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (username !== expectedUsername || password !== expectedPassword) {
    response.status(401).json({ error: "Invalid admin credentials." });
    return;
  }

  const sessionToken = await createAdminSession(username);
  response.setHeader("Set-Cookie", buildSessionCookie(sessionToken));
  response.status(200).json({ ok: true });
}
