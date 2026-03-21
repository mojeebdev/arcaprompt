export async function GET() {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return new Response("Key not configured", { status: 500 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain",
      
      "X-Robots-Tag": "noindex",
    },
  });
}