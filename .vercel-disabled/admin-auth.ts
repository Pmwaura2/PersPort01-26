const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  issuedAt: number;
  username: string;
};

export function getExpectedAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "admin";
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionSecret());
}

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function readCookieValue(cookieHeader: string, key: string): string {
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === key) {
      return rest.join("=");
    }
  }
  return "";
}

export async function createAdminSession(username: string): Promise<string> {
  const payload = toBase64Url(
    JSON.stringify({
      issuedAt: Math.floor(Date.now() / 1000),
      username
    } satisfies SessionPayload)
  );
  const signature = await signValue(payload, getSessionSecret());
  return `${payload}.${signature}`;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = await signValue(payload, getSessionSecret());
  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.username || !parsed.issuedAt) {
      return false;
    }

    return now - parsed.issuedAt <= SESSION_TTL_SECONDS;
  } catch (error) {
    return false;
  }
}

export function buildSessionCookie(token: string): string {
  return [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

export function buildLogoutCookie(): string {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function toBase64Url(value: string): string {
  return bytesToBase64Url(encoder.encode(value));
}

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
