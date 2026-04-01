import { list } from "@vercel/blob";
import { getDisplayName, inferMediaKind } from "../lib/media-utils.js";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Media library is not configured for this deployment." }, { status: 503 });
  }

  try {
    const { blobs } = await list({
      prefix: "media/uploads/",
      limit: 200
    });

    const items = blobs
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || "",
        uploadedAt: blob.uploadedAt || "",
        size: blob.size || 0,
        kind: inferMediaKind(blob.pathname, blob.contentType),
        name: getDisplayName(blob.pathname)
      }))
      .sort((left, right) => {
        const leftTime = Date.parse(left.uploadedAt || "") || 0;
        const rightTime = Date.parse(right.uploadedAt || "") || 0;
        return rightTime - leftTime;
      });

    return Response.json({ items });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Media library unavailable." },
      { status: 500 }
    );
  }
}
