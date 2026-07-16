# 64CAST — Audit Fix Package (deploy-fixes/)

Commit these files into the site repo (`64cast/64`, branch `main`) at the paths below. Cloudflare Pages will redeploy automatically.

## Files → repo destinations

| File here | Repo path | What changed |
|---|---|---|
| `index.html` | `index.html` | Homepage brand tiles now navigate to `/current-stock/?brand=<name>` instead of filtering in place |
| `shared/shop.js` | `shared/shop.js` | Reads `?brand=` query param → filters the listing to that brand (works alongside the existing slug routing) |
| `_redirects` | `_redirects` | Added `/current-stock/* /current-stock/ 200` so brand sub-routes like `/current-stock/mini-gt` stop 404ing |
| `current-stock/index.html` | `current-stock/index.html` | **REPLACED** old glass-rail page with the new shared-system page (shop.css/shop.js) — confirmed bottom filter drawer, brand auto-filter now works for `/mini-gt` etc. Correct title/OG/active menu |
| `pre-order/index.html` | `pre-order/index.html` | Same replacement, pre-order metadata |
| `new-arrivals/index.html` | `new-arrivals/index.html` | Fixed wrong metadata (title, og:url, h1, active menu link); removed SheetJS CDN tag (~900KB — shop.js lazy-loads it only for admin) |
| `worker.js` | Deploy to the `64cast-products-api` Worker | `ALLOWED_STATUSES` now accepts `chase`, `limited`, `new`, `comingsoon`, `lastone` — imports with those statuses are no longer silently rewritten to `currentstock` |
| `functions/product/model.js` | `functions/product/[model].js` — **rename on commit** (brackets required by Cloudflare Pages routing) | OG-preview fallback regex now also matches the homepage's `allProducts = [...]` catalog, so share cards survive API outages |

## After deploying, test
1. Click a brand tile on the homepage → lands on `/current-stock/?brand=Mini%20GT`, listing filtered to that brand.
2. `64cast.com/current-stock/mini-gt` — should also load (slug routing still works, no 404).
3. `/current-stock` and `/pre-order` — new flat design, filter drawer, cart, WhatsApp checkout.
4. Admin import a row with STATUS `chase` — should persist as `chase` (badge rendering on cards still uses the existing label map; extend `shop.js` TAGL/TAGC if you want distinct badge styling).

## Not included (recommended follow-ups, need testing against live data)
- `shared/shop.js` consolidation: a full admin app (all `adm*` code, ~40% of the file) is dead — `admin-8822` has its own inline app and `initAdmin` is never called. Interleaved with live code, so removal needs a tested pass, not a blind cut.
- `shared/shop.css`: remove `adm-*` classes, dedupe repeated selectors (`.btn-filters` ×4 etc.), and strip the ~80 `border-radius:0!important` / `backdrop-filter` patch layers into clean flat rules.
- FAQ page still uses the old glossy buttons (`glossW`/`glossO` gradients) — restyle flat when convenient.
- R2 `/PI/` orphan-image audit needs R2 + D1 access (script available on request).
- Bulk image autofill (`MODELNO-01..04.jpg`) does not exist in the admin panel yet — it's a new feature, say the word and I'll build it into `admin-8822`.
