import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");

export default async function handler(request, response) {
  if (request.method === "GET") {
    try {
      const raw = await readFile(CONTENT_PATH, "utf-8");
      response.status(200).json(JSON.parse(raw));
    } catch (error) {
      response.status(500).json({ error: "Content unavailable." });
    }
    return;
  }

  response.status(501).json({ error: "Editing is unavailable here." });
}
