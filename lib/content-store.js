import { readFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

const LOCAL_CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");
const CONTENT_BLOB_PATH = "content/site-content.json";

export async function loadContentPayload() {
  const blobPayload = await loadContentFromBlob();
  if (blobPayload) {
    return blobPayload;
  }

  const raw = await readFile(LOCAL_CONTENT_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function saveContentPayload(payload) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const blob = await put(CONTENT_BLOB_PATH, JSON.stringify(payload, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });

  return blob;
}

async function loadContentFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const { blobs } = await list({
    prefix: CONTENT_BLOB_PATH,
    limit: 1
  });

  if (!blobs.length) {
    return null;
  }

  const response = await fetch(blobs[0].url, {
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
