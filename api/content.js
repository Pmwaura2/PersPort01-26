import {
  loadContentPayload,
  loadLocalContentPayload,
  saveContentPayload
} from "../lib/content-store.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const payload = source === "repo"
      ? await loadLocalContentPayload()
      : await loadContentPayload();

    return Response.json(payload);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Content unavailable." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Editing is not configured for this deployment." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "restore-defaults") {
    try {
      const payload = await loadLocalContentPayload();
      await saveContentPayload(payload);
      return Response.json({ ok: true, restored: true });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Restore failed." },
        { status: 500 }
      );
    }
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await saveContentPayload(payload);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Save failed." },
      { status: 500 }
    );
  }
}
