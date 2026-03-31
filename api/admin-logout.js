import { buildLogoutCookie } from "../lib/admin-auth.js";

export function POST() {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": buildLogoutCookie()
      }
    }
  );
}
