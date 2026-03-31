import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  readCookieValue,
  verifyAdminSession
} from "./lib/admin-auth.js";

export const config = {
  matcher: ["/admin.html", "/api/content", "/api/upload", "/api/admin-logout"]
};

export default async function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/content" && request.method === "GET") {
    return;
  }

  if (!isAdminAuthConfigured()) {
    return unauthorizedResponse(request, "Sign-in required.");
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const token = readCookieValue(cookieHeader, ADMIN_SESSION_COOKIE);

  if (token && (await verifyAdminSession(token))) {
    return;
  }

  return unauthorizedResponse(request, "Sign-in required.");
}

function unauthorizedResponse(request, message) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: message }, { status: 401 });
  }

  const loginUrl = new URL("/admin-login.html", request.url);
  loginUrl.searchParams.set("next", url.pathname);
  loginUrl.searchParams.set("message", message);
  return Response.redirect(loginUrl);
}
