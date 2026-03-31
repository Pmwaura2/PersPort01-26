export default async function handler(request, response) {
  response.status(501).json({ error: "Uploads are unavailable here." });
}
