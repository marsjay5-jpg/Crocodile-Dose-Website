// functions/api/guestbook.js
//
// Handles the real guestbook using Cloudflare KV.
// GET  /api/guestbook  -> returns the list of entries as JSON.
// POST /api/guestbook  -> adds a new entry. Expects JSON body: { name, message }

const MAX_ENTRIES = 100; // keep the most recent 100 so KV storage doesn't grow forever
const MAX_NAME_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 300;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function onRequestGet(context) {
  const { env } = context;

  let entries = [];
  try {
    const stored = await env.CROC_KV.get("guestbook_entries");
    entries = stored ? JSON.parse(stored) : [];
  } catch (err) {
    entries = [];
  }

  return new Response(JSON.stringify({ entries }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = escapeHtml((body.name || "Anonymous Crocodile").slice(0, MAX_NAME_LENGTH));
  const message = escapeHtml((body.message || "...").slice(0, MAX_MESSAGE_LENGTH));

  let entries = [];
  try {
    const stored = await env.CROC_KV.get("guestbook_entries");
    entries = stored ? JSON.parse(stored) : [];
  } catch (err) {
    entries = [];
  }

  entries.unshift({ name, message, date: new Date().toISOString() });
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(0, MAX_ENTRIES);
  }

  try {
    await env.CROC_KV.put("guestbook_entries", JSON.stringify(entries));
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to save entry" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, entries }), {
    headers: { "Content-Type": "application/json" },
  });
}
