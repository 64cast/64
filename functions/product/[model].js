
const DEFAULT_PRODUCT_API_URL = "https://64cast-products-api.trailsec5.workers.dev";
const FALLBACK_IMAGE = "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/64_LOGO_Falcon.png";

export async function onRequest(context) {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const model = decodeURIComponent(params.model || "").trim();

  const origin = url.origin;
  // The product catalog is only embedded on the homepage (EMBEDDED_NEW_PRODUCT_LIST) —
  // current-stock/pre-order/new-arrivals pages fetch it client-side and have nothing to scrape.
  const indexUrl = new URL("/", origin);
  const indexRes = await env.ASSETS.fetch(new Request(indexUrl.toString(), request));
  let html = await indexRes.text();

  const fallback = {
    title: model ? `64CAST — ${model}` : "64CAST",
    description: "64CAST product preview.",
    image: FALLBACK_IMAGE,
    url: `${origin}/product/${encodeURIComponent(model)}`
  };

  let product = null;

  // Try the live API first — it's the freshest source. Fall back to the homepage's
  // embedded backup catalogue only if the live fetch fails or times out.
  const apiUrl = env.PRODUCT_API_URL || DEFAULT_PRODUCT_API_URL;
  try {
    const apiRes = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
    const data = await apiRes.json();
    const list = Array.isArray(data) ? data : (data.products || data.data || []);
    product = list.find((p) => productModel(p) === model) || null;
  } catch (e) {}

  if (!product) {
    try {
      const match =
        html.match(/EMBEDDED_NEW_PRODUCT_LIST\s*=\s*(\[[\s\S]*?\]);/) ||
        html.match(/PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        const list = JSON.parse(match[1]);
        product = list.find((p) => productModel(p) === model) || null;
      }
    } catch (e) {}
  }

  const meta = product ? buildMeta(product, origin, model) : fallback;

  html = upsertMeta(html, "property", "og:type", "product");
  html = upsertMeta(html, "property", "og:title", meta.title);
  html = upsertMeta(html, "property", "og:description", meta.description);
  html = upsertMeta(html, "property", "og:image", meta.image);
  html = upsertMeta(html, "property", "og:image:secure_url", meta.image);
  html = upsertMeta(html, "property", "og:url", meta.url);
  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:title", meta.title);
  html = upsertMeta(html, "name", "twitter:description", meta.description);
  html = upsertMeta(html, "name", "twitter:image", meta.image);
  html = html.replace("</head>", `<script>window.__PRODUCT_ROUTE_MODEL__=${JSON.stringify(model)};</script></head>`);

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=300"
    }
  });
}

function productModel(p) {
  return String((p && (p["MODEL NO."] || p.modelNo || p.model || p.MODEL)) || "").trim();
}
function productName(p) {
  return String((p && (p["PRODUCT NAME"] || p.name || p.productName || p.TITLE)) || "").trim();
}
function productBrand(p) {
  return String((p && (p.BRAND || p.brand)) || "").trim();
}
function productPrice(p) {
  const v = p && (p.PRICE || p.price || p.RATE || p.rate);
  const n = Number(v || 0);
  return n ? `AED ${Number.isInteger(n) ? n : n.toFixed(2)}` : "";
}
function productImage(p, origin) {
  const base = "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/";
  let img = String((p && (p.IMG1 || p.img1 || p.image || p.imageUrl || p["IMAGE URL"])) || "").trim();
  if (!img) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(img)) return img;
  return base + img.replace(/^\/+/, "");
}
function buildMeta(p, origin, model) {
  const brand = productBrand(p);
  const name = productName(p);
  const price = productPrice(p);
  const title = [brand, name].filter(Boolean).join(" — ") || `64CAST — ${model}`;
  const descParts = [];
  if (model) descParts.push(model);
  if (price) descParts.push(price);
  descParts.push("View product on 64CAST");
  return {
    title,
    description: descParts.join(" · "),
    image: productImage(p, origin),
    url: `${origin}/product/${encodeURIComponent(model)}`
  };
}
function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function upsertMeta(html, attr, key, content) {
  const escaped = escapeAttr(content);
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${escapeRegExp(key)}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escaped}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `${tag}\n</head>`);
}
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
