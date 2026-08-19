const BRANDS = [
  { slug: "minigt", name: "Mini GT", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/minigt.jpg" },
  { slug: "tarmacworks", name: "Tarmac Works", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/tarmacworks.jpg" },
  { slug: "inno64", name: "Inno64", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/inno64.jpg" },
  { slug: "poprace", name: "PopRace", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/poprace.jpg" },
  { slug: "bburago", name: "Bburago", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/bburago.jpg" },
  { slug: "bbrmodels", name: "BBR Models", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/bbrmodels.jpg" },
  { slug: "cmmodel", name: "CM Model", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/cmmodel.jpg" },
  { slug: "hobbyjapan", name: "Hobby Japan", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/hobbyjapan.jpg" },
  { slug: "kaidohouse", name: "Kaido House", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/kaidohouse.jpg" },
  { slug: "lego", name: "Lego", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/lego.jpg" },
  { slug: "motorhelix", name: "Motorhelix", logo: "https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/motorhelix.jpg" },
  { slug: "arbox", name: "ARbox", logo: "/assets/brands/arbox.png" },
  { slug: "trendshobby", name: "Trends Hobby", logo: "/assets/brands/trends-hobby.png" },
  { slug: "americandiorama", name: "American Diorama", logo: "/assets/brands/american-diorama.png" },
  { slug: "gcd", name: "GCD", logo: "/assets/brands/gcd.png" },
  { slug: "tiny", name: "Tiny", logo: "/assets/brands/tiny.png" },
  { slug: "sparky", name: "Sparky", logo: "/assets/brands/sparky.png" },
  { slug: "uniquemodel", name: "Unique Model", logo: "/assets/brands/unique-model.png" },
  { slug: "pgm", name: "PGM", logo: "/assets/brands/pgm.png" },
  { slug: "kyosho", name: "Kyosho", logo: "/assets/brands/kyosho.png" },
  { slug: "bmcreations", name: "BM Creations", logo: "/assets/brands/bm-creations.png" }
];

// Matches /minigt, /MiniGT, /poprace, etc. at the root level (no hyphens).
// Falls through (context.next()) for anything that isn't a known brand slug,
// so it never shadows /current-stock, /new-arrivals, /faq, /admin-8822, /product/*.
export async function onRequest(context) {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const slug = decodeURIComponent(params.brand || "").trim().toLowerCase().replace(/[-\s]+/g, "");
  const brand = BRANDS.find((b) => b.slug === slug);
  if (!brand) return context.next();

  const pageUrl = new URL("/current-stock/", url.origin);
  const pageRes = await env.ASSETS.fetch(new Request(pageUrl.toString(), request));
  let html = await pageRes.text();

  html = html.replace(
    "</head>",
    `<script>window.__BRAND_ROUTE__=${JSON.stringify(brand.name)};window.__BRAND_LOGO__=${JSON.stringify(brand.logo)};</script></head>`
  );

  const title = `${brand.name} — 64CAST`;
  const description = `Shop ${brand.name} 1:64 diecast — current stock and pre-orders, checkout on WhatsApp.`;
  html = upsertMeta(html, "og:title", title, "property");
  html = upsertMeta(html, "og:description", description, "property");
  if (brand.logo) html = upsertMeta(html, "og:image", brand.logo, "property");
  html = upsertMeta(html, "twitter:title", title, "name");
  html = upsertMeta(html, "twitter:description", description, "name");
  html = html.replace(/<title[^>]*>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "public, max-age=300" }
  });
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function upsertMeta(html, key, content, attr) {
  const escaped = escapeHtml(content);
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escaped}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `${tag}\n</head>`);
}
