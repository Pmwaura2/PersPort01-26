import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");

export async function GET() {
  try {
    const raw = await readFile(CONTENT_PATH, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch (error) {
    return Response.json({ error: "Content unavailable." }, { status: 500 });
  }
}

export function POST() {
  return Response.json({ error: "Editing is unavailable here." }, { status: 501 });
}
