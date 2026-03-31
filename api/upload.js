import { put } from "@vercel/blob";

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Uploads are not configured for this deployment." }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    const blob = await put(`media/uploads/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true
    });

    return Response.json({ ok: true, path: blob.url });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
