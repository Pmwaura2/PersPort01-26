import { readFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

const LOCAL_CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");
const CONTENT_BLOB_PATH = "content/site-content.json";

export async function loadContentPayload() {
  const localPayload = await loadLocalContentPayload();
  const blobPayload = await loadContentFromBlob();
  if (isCurrentEditableContent(blobPayload)) {
    return blobPayload;
  }

  return localPayload;
}

export async function saveContentPayload(payload) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const timestampedPayload = {
    ...payload,
    _meta: {
      ...(payload?._meta || {}),
      source: "admin",
      updatedAt: new Date().toISOString()
    }
  };

  const blob = await put(CONTENT_BLOB_PATH, JSON.stringify(timestampedPayload, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });

  return blob;
}

export async function loadLocalContentPayload() {
  const raw = await readFile(LOCAL_CONTENT_PATH, "utf-8");
  return JSON.parse(raw);
}

function isCurrentEditableContent(payload) {
  return Boolean(payload?._meta?.updatedAt);
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
