import { loadContentPayload, saveContentPayload } from "../lib/content-store.js";

export async function GET() {
  try {
    return Response.json(await loadContentPayload());
  } catch (error) {
    return Response.json({ error: "Content unavailable." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Editing is not configured for this deployment." }, { status: 503 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await saveContentPayload(payload);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Save failed." }, { status: 500 });
  }
}
