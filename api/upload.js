export function POST() {
  return Response.json({ error: "Uploads are unavailable here." }, { status: 501 });
}
