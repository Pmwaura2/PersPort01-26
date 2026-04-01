const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
const IMAGE_CONTENT_TYPES = ["image/"];
const VIDEO_CONTENT_TYPES = ["video/"];

const EXTENSION_CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".jfif", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".avif", "image/avif"],
  [".bmp", "image/bmp"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".ogg", "video/ogg"],
  [".mov", "video/quicktime"],
  [".m4v", "video/x-m4v"]
]);

export function inferContentType(fileName = "", fallbackType = "") {
  const normalizedFallback = String(fallbackType || "").trim().toLowerCase();
  if (normalizedFallback) {
    return normalizedFallback;
  }

  const normalizedName = String(fileName || "").trim().toLowerCase();
  const extension = normalizedName.includes(".")
    ? normalizedName.slice(normalizedName.lastIndexOf("."))
    : "";

  return EXTENSION_CONTENT_TYPES.get(extension) || "application/octet-stream";
}

export function inferMediaKind(fileName = "", contentType = "") {
  const normalizedType = String(contentType || "").trim().toLowerCase();
  const normalizedName = String(fileName || "").trim().toLowerCase();

  if (VIDEO_CONTENT_TYPES.some((prefix) => normalizedType.startsWith(prefix))) {
    return "video";
  }

  if (IMAGE_CONTENT_TYPES.some((prefix) => normalizedType.startsWith(prefix))) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.some((extension) => normalizedName.endsWith(extension))) {
    return "video";
  }

  return "image";
}

export function getDisplayName(pathname = "") {
  const normalized = String(pathname || "").trim();
  if (!normalized) {
    return "Untitled asset";
  }

  const segment = normalized.split("/").pop() || normalized;
  return segment.replace(/-[A-Za-z0-9]{8,}(?=\.)/, "");
}
