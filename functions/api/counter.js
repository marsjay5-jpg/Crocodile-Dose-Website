// functions/api/counter.js
//
// Handles the site-wide visitor counter using Cloudflare KV.
// GET  /api/counter  -> increments the counter and returns the new count as JSON.

export async function onRequestGet(context) {
  const { env } = context;

  let count = 0;
  try {
    const stored = await env.CROC_KV.get("visitor_count");
    count = stored ? parseInt(stored, 10) : 133700; // starting number, matches the old fake counter
  } catch (err) {
    count = 133700;
  }

  count += 1;

  try {
    await env.CROC_KV.put("visitor_count", String(count));
  } catch (err) {
    // if the write fails, we still return the incremented number for this visitor
  }

  return new Response(JSON.stringify({ count }), {
    headers: { "Content-Type": "application/json" },
  });
}
