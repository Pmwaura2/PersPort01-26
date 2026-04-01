import { inferContentType } from "../lib/media-utils.js";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const source = requestUrl.searchParams.get("url") || "";

  if (!source) {
    return new Response("Missing image URL.", { status: 400 });
  }

  let sourceUrl;
  try {
    sourceUrl = new URL(source);
  } catch (error) {
    return new Response("Invalid image URL.", { status: 400 });
  }

  if (!["http:", "https:"].includes(sourceUrl.protocol)) {
    return new Response("Unsupported image URL.", { status: 400 });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      cache: "force-cache"
    });

    if (!upstream.ok) {
      return new Response("Image unavailable.", { status: upstream.status });
    }

    const contentType = inferContentType(sourceUrl.pathname, upstream.headers.get("content-type") || "");
    const headers = new Headers();
    headers.set("Content-Type", contentType.startsWith("image/") ? contentType : inferContentType(sourceUrl.pathname));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(upstream.body, {
      status: 200,
      headers
    });
  } catch (error) {
    return new Response("Image unavailable.", { status: 502 });
  }
}
