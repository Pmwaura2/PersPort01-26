import { buildLogoutCookie } from "../lib/admin-auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  response.setHeader("Set-Cookie", buildLogoutCookie());
  response.status(200).json({ ok: true });
}
