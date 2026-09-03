// /api/inhand — stores the Inhand-site product list in Cloudflare KV.
// Bindings required (Cloudflare dashboard → Pages project → Settings):
//   KV namespace binding:  INHAND_KV
//   Environment variable:  INHAND_KEY  (any secret string; paste the same value in the admin panel)
const KEY = "inhand-list";
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-admin-key",
  "access-control-allow-methods": "GET, POST, OPTIONS"
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store", ...CORS }
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  if (!env.INHAND_KV) return json({ error: "INHAND_KV binding missing", models: [] }, 500);
  const raw = await env.INHAND_KV.get(KEY);
  let models = [];
  try { models = JSON.parse(raw || "[]"); } catch (e) { models = []; }
  return json({ models: Array.isArray(models) ? models : [] });
}

export async function onRequestPost({ request, env }) {
  if (!env.INHAND_KV) return json({ error: "INHAND_KV binding missing" }, 500);
  const key = request.headers.get("x-admin-key") || "";
  if (!env.INHAND_KEY || key !== env.INHAND_KEY) return json({ error: "Bad admin key" }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "Bad JSON" }, 400); }
  const list = Array.isArray(body) ? body : (body && (body.models || body.list)) || [];
  const models = list
    .map(x => String(typeof x === "string" ? x : (x && (x["MODEL NO."] || x.model || x.modelNo)) || "").trim())
    .filter(Boolean);

  await env.INHAND_KV.put(KEY, JSON.stringify(models));
  return json({ ok: true, count: models.length, models });
}
