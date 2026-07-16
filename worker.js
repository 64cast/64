/*
  64CAST Step 9 - secure inventory API Worker

  What this Worker provides:
  - Public GET inventory endpoint for the storefront.
  - POST admin-login: password stays in Cloudflare Worker secrets.
  - POST admin-verify: verifies the current bearer token.
  - POST update/delete/import/save-order: protected by Authorization: Bearer <token>.
  - POST create-pending-order: public endpoint created when checkout opens WhatsApp.
  - POST list/confirm/reject pending orders: protected admin order confirmation flow.
  - Storage support for either Cloudflare D1 binding `DB` or KV binding `PRODUCTS_KV`.

  Required secrets:
    ADMIN_PASSWORD
    ADMIN_TOKEN_SECRET

  Optional variables:
    ADMIN_ALLOWED_ORIGINS=https://64cast.com,https://www.64cast.com
    ADMIN_TOKEN_TTL_HOURS=8
    PRODUCTS_KV_KEY=products
*/

const DEFAULT_ALLOWED_ORIGINS = 'https://64cast.com,https://www.64cast.com';
const DEFAULT_TOKEN_TTL_HOURS = 8;
const DEFAULT_KV_KEY = 'products';
const DEFAULT_PENDING_KV_KEY = 'pending_orders';
const DEFAULT_COMMUNITY_KV_KEY = 'community_signups';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const PROTECTED_ACTIONS = new Set([
  'update',
  'delete',
  'import',
  'bulk-update',
  'replace',
  'save-order',
  'reorder',
  'list-pending-orders',
  'confirm-pending-order',
  'reject-pending-order',
  'list-community-signups',
  'delete-community-signup',
  'upload-image'
]);
const ALLOWED_STATUSES = new Set(['currentstock', 'readytocollect', 'instock', 'preorder', 'sold', 'chase', 'limited', 'new', 'comingsoon', 'lastone']);
const ALLOWED_POSITIONS = new Set(['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.publicMessage = message;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request, env) });
      }

      if (request.method === 'GET') {
        const rows = await readProducts(env);
        return json(rows, 200, request, env, { publicCache: true });
      }

      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405, request, env);
      }

      const body = await readRequestJson(request);
      const action = String(body.action || '').trim();

      if (action === 'admin-login') {
        return handleAdminLogin(body, request, env);
      }

      if (action === 'admin-verify') {
        await requireAdmin(request, env);
        return json({ ok: true }, 200, request, env);
      }

      if (PROTECTED_ACTIONS.has(action)) {
        await requireAdmin(request, env);
      }

      if (action === 'update') {
        const product = sanitizeProductRow(body.product || body.row || {});
        await upsertProduct(env, product);
        return json({ ok: true, modelNo: product['MODEL NO.'] }, 200, request, env);
      }

      if (action === 'delete') {
        const modelNo = sanitizeModelNo(body.modelNo || body.model || body['MODEL NO.']);
        await deleteProduct(env, modelNo);
        return json({ ok: true, modelNo }, 200, request, env);
      }

      if (action === 'import' || action === 'bulk-update') {
        const incoming = Array.isArray(body.products) ? body.products : Array.isArray(body.rows) ? body.rows : [];
        if (!incoming.length) throw new HttpError(400, 'No products supplied for import');
        const products = incoming.map(sanitizeProductRow);
        await upsertProducts(env, products);
        return json({ ok: true, count: products.length }, 200, request, env);
      }

      if (action === 'replace') {
        // Full replace: incoming list becomes the entire catalog. Unlike import/bulk-update
        // (which only adds/updates), this also removes any product not present in the payload.
        const incoming = Array.isArray(body.products) ? body.products : Array.isArray(body.rows) ? body.rows : [];
        const products = incoming.map(sanitizeProductRow);
        await replaceProducts(env, products);
        return json({ ok: true, count: products.length }, 200, request, env);
      }

      if (action === 'save-order' || action === 'reorder') {
        const count = await saveOrder(env, body);
        return json({ ok: true, count }, 200, request, env);
      }

      if (['create-pending-order', 'create-order', 'checkout', 'pending-order'].includes(action)) {
        const order = await createPendingOrder(env, body);
        return json({ ok: true, order }, 200, request, env);
      }

      if (['list-pending-orders', 'pending-orders', 'get-pending-orders', 'list-orders'].includes(action)) {
        const orders = await readPendingOrders(env);
        return json({ ok: true, orders }, 200, request, env);
      }

      if (['confirm-pending-order', 'confirm-order'].includes(action)) {
        const result = await confirmPendingOrder(env, body.orderId || body.id);
        return json({ ok: true, ...result }, 200, request, env);
      }

      if (['reject-pending-order', 'reject-order', 'delete-pending-order'].includes(action)) {
        const result = await rejectPendingOrder(env, body.orderId || body.id);
        return json({ ok: true, ...result }, 200, request, env);
      }

      if (['join-community', 'community-signup', 'community-join'].includes(action)) {
        const signup = await createCommunitySignup(env, body);
        return json({ ok: true, signup }, 200, request, env);
      }

      if (action === 'list-community-signups') {
        const signups = await readCommunitySignups(env);
        return json({ ok: true, signups }, 200, request, env);
      }

      if (action === 'delete-community-signup') {
        await deleteCommunitySignup(env, body.id);
        return json({ ok: true }, 200, request, env);
      }

      if (action === 'upload-image') {
        const result = await uploadProductImage(env, body);
        return json({ ok: true, url: result.url, key: result.key }, 200, request, env);
      }

      return json({ ok: false, error: 'Unknown action' }, 400, request, env);
    } catch (err) {
      const status = err && err.status ? err.status : 500;
      const message = err && err.publicMessage ? err.publicMessage : 'Server error';
      if (status >= 500) console.error('64CAST Worker error:', err && (err.stack || err.message || err));
      return json({ ok: false, error: message }, status, request, env);
    }
  }
};

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ADMIN_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  let allowOrigin = allowed[0] || 'https://64cast.com';
  if (allowed.includes('*')) allowOrigin = '*';
  else if (origin && allowed.includes(origin)) allowOrigin = origin;

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function securityHeaders(cacheControl) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': cacheControl
  };
}

function json(data, status, request, env, options = {}) {
  const cacheControl = options.publicCache ? 'public, max-age=20, stale-while-revalidate=60' : 'no-store';
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env),
      ...securityHeaders(cacheControl)
    }
  });
}

async function readRequestJson(request) {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (_) {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const aa = enc.encode(String(a || ''));
  const bb = enc.encode(String(b || ''));
  let diff = aa.length ^ bb.length;
  const len = Math.max(aa.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

function base64UrlFromBytes(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlEncodeText(text) {
  return base64UrlFromBytes(new TextEncoder().encode(text));
}

function base64UrlDecodeText(value) {
  const base64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(value, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return base64UrlFromBytes(new Uint8Array(sig));
}

function tokenTtlMs(env) {
  const hours = Number(env.ADMIN_TOKEN_TTL_HOURS || DEFAULT_TOKEN_TTL_HOURS);
  const safeHours = Number.isFinite(hours) && hours > 0 && hours <= 72 ? hours : DEFAULT_TOKEN_TTL_HOURS;
  return safeHours * 60 * 60 * 1000;
}

async function createAdminToken(env) {
  assertAdminSecrets(env);
  const expiresAt = Date.now() + tokenTtlMs(env);
  const payload = {
    scope: '64cast-admin',
    iat: Date.now(),
    exp: expiresAt,
    nonce: crypto.randomUUID()
  };
  const payloadPart = base64UrlEncodeText(JSON.stringify(payload));
  const sigPart = await hmacSha256(payloadPart, env.ADMIN_TOKEN_SECRET);
  return { token: `${payloadPart}.${sigPart}`, expiresAt };
}

async function verifyAdminToken(token, env) {
  if (!env.ADMIN_TOKEN_SECRET || !token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [payloadPart, sigPart] = parts;
  const expectedSig = await hmacSha256(payloadPart, env.ADMIN_TOKEN_SECRET);
  if (!timingSafeEqual(sigPart, expectedSig)) return false;

  let payload;
  try {
    payload = JSON.parse(base64UrlDecodeText(payloadPart));
  } catch (_) {
    return false;
  }

  return payload.scope === '64cast-admin' && Number(payload.exp) > Date.now();
}

function bearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

async function requireAdmin(request, env) {
  const ok = await verifyAdminToken(bearerToken(request), env);
  if (!ok) throw new HttpError(401, 'Unauthorized');
}

function assertAdminSecrets(env) {
  if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'ADMIN_PASSWORD is not configured');
  if (!env.ADMIN_TOKEN_SECRET) throw new HttpError(500, 'ADMIN_TOKEN_SECRET is not configured');
  if (String(env.ADMIN_TOKEN_SECRET).length < 32) {
    throw new HttpError(500, 'ADMIN_TOKEN_SECRET must be at least 32 characters');
  }
}

async function handleAdminLogin(body, request, env) {
  assertAdminSecrets(env);
  const ip = getClientIp(request);
  await checkLoginRateLimit(env, ip);
  const password = String(body.password || '');
  const ok = timingSafeEqual(password, env.ADMIN_PASSWORD);
  if (!ok) {
    await recordFailedLogin(env, ip);
    await delay(250);
    return json({ ok: false, error: 'Invalid password' }, 401, request, env);
  }
  await clearLoginAttempts(env, ip);
  const tokenInfo = await createAdminToken(env);
  return json({ ok: true, token: tokenInfo.token, expiresAt: tokenInfo.expiresAt }, 200, request, env);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('cf-connecting-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

async function ensureLoginAttemptsD1Schema(env) {
  if (!hasD1(env)) return;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      ip TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0,
      window_start TEXT,
      locked_until TEXT
    )
  `).run();
}

async function getLoginAttempts(env, ip) {
  if (hasD1(env)) {
    await ensureLoginAttemptsD1Schema(env);
    const row = await env.DB.prepare('SELECT count, window_start, locked_until FROM login_attempts WHERE ip = ?').bind(ip).first();
    return row ? { count: row.count, windowStart: Number(row.window_start), lockedUntil: row.locked_until ? Number(row.locked_until) : null } : null;
  }
  if (hasKV(env)) {
    const raw = await env.PRODUCTS_KV.get('login_attempts:' + ip);
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

async function setLoginAttempts(env, ip, data) {
  if (hasD1(env)) {
    await ensureLoginAttemptsD1Schema(env);
    await env.DB.prepare(
      `INSERT INTO login_attempts (ip, count, window_start, locked_until) VALUES (?, ?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET count = excluded.count, window_start = excluded.window_start, locked_until = excluded.locked_until`
    ).bind(ip, data.count, String(data.windowStart), data.lockedUntil ? String(data.lockedUntil) : null).run();
    return;
  }
  if (hasKV(env)) {
    await env.PRODUCTS_KV.put('login_attempts:' + ip, JSON.stringify(data), { expirationTtl: 3600 });
    return;
  }
  // No storage binding configured - rate limiting is a no-op (login still works,
  // just without lockout tracking). Matches the rest of the Worker's graceful
  // degradation when neither DB nor PRODUCTS_KV is bound.
}

async function clearLoginAttempts(env, ip) {
  if (hasD1(env)) {
    await ensureLoginAttemptsD1Schema(env);
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
    return;
  }
  if (hasKV(env)) {
    await env.PRODUCTS_KV.delete('login_attempts:' + ip);
    return;
  }
}

async function checkLoginRateLimit(env, ip) {
  const data = await getLoginAttempts(env, ip);
  if (!data) return;
  const now = Date.now();
  if (data.lockedUntil && Number(data.lockedUntil) > now) {
    const waitMin = Math.max(1, Math.ceil((Number(data.lockedUntil) - now) / 60000));
    throw new HttpError(429, `Too many failed login attempts. Try again in ${waitMin} minute${waitMin === 1 ? '' : 's'}.`);
  }
}

async function recordFailedLogin(env, ip) {
  const now = Date.now();
  const existing = await getLoginAttempts(env, ip);
  const data = existing || { count: 0, windowStart: now, lockedUntil: null };
  if (now - Number(data.windowStart) > LOGIN_WINDOW_MS) {
    data.count = 0;
    data.windowStart = now;
    data.lockedUntil = null;
  }
  data.count = Number(data.count) + 1;
  if (data.count >= MAX_LOGIN_ATTEMPTS) {
    data.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
  await setLoginAttempts(env, ip, data);
}

function hasD1(env) {
  return !!(env && env.DB && typeof env.DB.prepare === 'function');
}

function hasKV(env) {
  return !!(env && env.PRODUCTS_KV && typeof env.PRODUCTS_KV.get === 'function' && typeof env.PRODUCTS_KV.put === 'function');
}

async function ensureD1Schema(env) {
  if (!hasD1(env)) return;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      model_no TEXT PRIMARY KEY,
      row_json TEXT NOT NULL,
      sort_order REAL DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await env.DB.prepare(`
    CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order, model_no)
  `).run();
}

async function readProducts(env) {
  if (hasD1(env)) {
    await ensureD1Schema(env);
    const out = await env.DB.prepare('SELECT row_json FROM products ORDER BY sort_order ASC, model_no ASC').all();
    const rows = (out && out.results ? out.results : []).map((r) => JSON.parse(r.row_json));
    return normaliseReadRows(rows);
  }

  if (hasKV(env)) {
    const raw = await env.PRODUCTS_KV.get(env.PRODUCTS_KV_KEY || DEFAULT_KV_KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return normaliseReadRows(rows);
  }

  throw new HttpError(500, 'No storage binding configured. Add D1 binding DB or KV binding PRODUCTS_KV.');
}

async function upsertProduct(env, product) {
  if (hasD1(env)) {
    await ensureD1Schema(env);
    await env.DB.prepare(
      `INSERT INTO products (model_no, row_json, sort_order, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(model_no) DO UPDATE SET
         row_json = excluded.row_json,
         sort_order = excluded.sort_order,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(product['MODEL NO.'], JSON.stringify(product), Number(product.SORTORDER || 0)).run();
    return;
  }

  if (hasKV(env)) {
    const rows = await readProducts(env);
    const idx = rows.findIndex((r) => String(r['MODEL NO.'] || '') === product['MODEL NO.']);
    if (idx >= 0) rows[idx] = product;
    else rows.push(product);
    await writeKvProducts(env, rows);
    return;
  }

  throw new HttpError(500, 'No storage binding configured. Add D1 binding DB or KV binding PRODUCTS_KV.');
}

async function upsertProducts(env, products) {
  if (hasD1(env)) {
    await ensureD1Schema(env);
    const statements = products.map((product) => env.DB.prepare(
      `INSERT INTO products (model_no, row_json, sort_order, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(model_no) DO UPDATE SET
         row_json = excluded.row_json,
         sort_order = excluded.sort_order,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(product['MODEL NO.'], JSON.stringify(product), Number(product.SORTORDER || 0)));
    if (statements.length) await env.DB.batch(statements);
    return;
  }

  if (hasKV(env)) {
    const current = await readProducts(env);
    const byModel = new Map(current.map((row) => [String(row['MODEL NO.'] || ''), row]));
    for (const product of products) byModel.set(product['MODEL NO.'], product);
    await writeKvProducts(env, Array.from(byModel.values()));
    return;
  }

  throw new HttpError(500, 'No storage binding configured. Add D1 binding DB or KV binding PRODUCTS_KV.');
}

async function deleteProduct(env, modelNo) {
  if (hasD1(env)) {
    await ensureD1Schema(env);
    await env.DB.prepare('DELETE FROM products WHERE model_no = ?').bind(modelNo).run();
    return;
  }

  if (hasKV(env)) {
    const rows = await readProducts(env);
    await writeKvProducts(env, rows.filter((r) => String(r['MODEL NO.'] || '') !== modelNo));
    return;
  }

  throw new HttpError(500, 'No storage binding configured. Add D1 binding DB or KV binding PRODUCTS_KV.');
}

async function saveOrder(env, body) {
  const rows = await readProducts(env);
  let count = 0;

  if (Array.isArray(body.orders)) {
    const orderMap = new Map();
    for (const item of body.orders) {
      const modelNo = sanitizeModelNo(item.modelNo || item.model || item['MODEL NO.']);
      const sortOrder = safeNumber(item.sortOrder || item.SORTORDER || item.order, 0);
      orderMap.set(modelNo, sortOrder);
    }
    for (const row of rows) {
      const modelNo = String(row['MODEL NO.'] || '');
      if (orderMap.has(modelNo)) {
        row.SORTORDER = orderMap.get(modelNo);
        count++;
      }
    }
  } else if (Array.isArray(body.products) || Array.isArray(body.rows)) {
    const products = (body.products || body.rows).map(sanitizeProductRow);
    await upsertProducts(env, products);
    return products.length;
  } else {
    throw new HttpError(400, 'No order data supplied');
  }

  await replaceProducts(env, rows.map(sanitizeProductRow));
  return count;
}

async function replaceProducts(env, rows) {
  if (hasD1(env)) {
    await ensureD1Schema(env);
    // True replace: clear the table first so products absent from `rows` are actually removed,
    // not just left behind (upsert-only would never delete stale rows).
    const statements = [env.DB.prepare('DELETE FROM products')];
    for (const product of rows) {
      statements.push(env.DB.prepare(
        `INSERT INTO products (model_no, row_json, sort_order, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(product['MODEL NO.'], JSON.stringify(product), Number(product.SORTORDER || 0)));
    }
    await env.DB.batch(statements);
    return;
  }

  if (hasKV(env)) {
    await writeKvProducts(env, rows);
    return;
  }

  throw new HttpError(500, 'No storage binding configured. Add D1 binding DB or KV binding PRODUCTS_KV.');
}

async function writeKvProducts(env, rows) {
  const sorted = normaliseReadRows(rows);
  await env.PRODUCTS_KV.put(env.PRODUCTS_KV_KEY || DEFAULT_KV_KEY, JSON.stringify(sorted));
}

function normaliseReadRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r && String(r['MODEL NO.'] || '').trim())
    .sort((a, b) => {
      const ao = Number(a.SORTORDER || a['SORT ORDER'] || a.ORDER || a['DISPLAY ORDER'] || 0) || 999999;
      const bo = Number(b.SORTORDER || b['SORT ORDER'] || b.ORDER || b['DISPLAY ORDER'] || 0) || 999999;
      if (ao !== bo) return ao - bo;
      return String(a['PRODUCT NAME'] || '').localeCompare(String(b['PRODUCT NAME'] || ''));
    });
}

function sanitizeProductRow(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Product must be an object');
  }

  const modelNo = sanitizeModelNo(input['MODEL NO.'] || input.modelNo || input.model);
  const price = safeNumber(input.PRICE ?? input.price, 0);
  const origPrice = safeNumber(input.ORIGPRICE ?? input.origPrice ?? price, price);
  const qty = Math.max(0, Math.floor(safeNumber(input.QTY ?? input.qty, 0)));
  const statusRaw = cleanText(input.STATUS ?? input.tag ?? 'currentstock', 40).toLowerCase().replace(/\s+/g, '');
  const status = ALLOWED_STATUSES.has(statusRaw) ? statusRaw : qty === 0 ? 'sold' : 'currentstock';

  return {
    'REF IMG': cleanImageUrl(input['REF IMG'] ?? input.refImg ?? ''),
    BRAND: cleanText(input.BRAND ?? input.brand ?? '', 160),
    CARBRAND: cleanText(input.CARBRAND ?? input['CAR MANUFACTURER'] ?? input.carbrand ?? '', 160),
    SCALE: cleanText(input.SCALE ?? input.scale ?? '1:64', 40) || '1:64',
    'PRODUCT NAME': cleanText(input['PRODUCT NAME'] ?? input.name ?? '', 300),
    'MODEL NO.': modelNo,
    PRICE: price,
    ORIGPRICE: origPrice,
    QTY: qty,
    STATUS: status,
    SORTORDER: safeNumber(input.SORTORDER ?? input['SORT ORDER'] ?? input.ORDER ?? input['DISPLAY ORDER'] ?? input.sortOrder, 0),
    IMG1: cleanImageUrl(input.IMG1 ?? (input.imgs && input.imgs[0]) ?? ''),
    IMG2: cleanImageUrl(input.IMG2 ?? (input.imgs && input.imgs[1]) ?? ''),
    IMG3: cleanImageUrl(input.IMG3 ?? (input.imgs && input.imgs[2]) ?? ''),
    IMG4: cleanImageUrl(input.IMG4 ?? (input.imgs && input.imgs[3]) ?? ''),
    IMG1POS: cleanPosition(input.IMG1POS ?? input.img1Pos ?? 'center'),
    IMG2POS: cleanPosition(input.IMG2POS ?? input.img2Pos ?? 'center'),
    IMG1ZOOM: cleanZoom(input.IMG1ZOOM ?? input.img1Zoom ?? 100),
    IMG2ZOOM: cleanZoom(input.IMG2ZOOM ?? input.img2Zoom ?? 100),
    IMAGE_SCALE: Math.max(70, Math.min(130, safeNumber(input.IMAGE_SCALE ?? input.IMGSCALE ?? input.imageScale, 100))),
    ETA: cleanText(input.ETA ?? input.eta ?? '', 40),
    NEW: cleanText(input.NEW ?? input.newArrival ?? '', 10).toLowerCase() === 'yes' ? 'yes' : '',
    FEATURED: cleanText(input.FEATURED ?? input.featured ?? '', 10).toLowerCase() === 'yes' ? 'yes' : '',
    DESCRIPTION: cleanText(input.DESCRIPTION ?? input.description ?? '', 4000)
  };
}

function sanitizeModelNo(value) {
  const modelNo = cleanText(value, 120);
  if (!modelNo) throw new HttpError(400, 'MODEL NO. is required');
  return modelNo;
}

function cleanText(value, maxLength) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function cleanImageUrl(value) {
  const url = cleanText(value, 2048);
  if (!url) return '';
  if (/^(javascript|vbscript|data:text|file):/i.test(url)) return '';
  return url;
}

function cleanPosition(value) {
  const pos = cleanText(value, 40).toLowerCase();
  return ALLOWED_POSITIONS.has(pos) ? pos : 'center';
}

function cleanZoom(value) {
  const n = safeNumber(value, 100);
  return Math.max(50, Math.min(400, Math.round(n)));
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function ensurePendingD1Schema(env) {
  if (!hasD1(env)) return;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pending_orders (
      id TEXT PRIMARY KEY,
      order_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await env.DB.prepare(`
    CREATE INDEX IF NOT EXISTS idx_pending_orders_status_created ON pending_orders(status, created_at)
  `).run();
}

function pendingKey(env) {
  return env.PENDING_ORDERS_KV_KEY || DEFAULT_PENDING_KV_KEY;
}

async function createPendingOrder(env, body) {
  const incoming = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.cart)
      ? body.cart
      : Array.isArray(body.products)
        ? body.products
        : [];

  if (!incoming.length) throw new HttpError(400, 'No cart items supplied');

  const cleanItems = [];
  const skippedItems = [];

  for (const item of incoming) {
    if (!item || typeof item !== 'object') {
      skippedItems.push({ reason: 'Invalid item' });
      continue;
    }

    const modelCandidate = item.modelNo || item.model || item['MODEL NO.'] || item.model_no || item.sku || item.id || '';
    const modelNo = cleanText(modelCandidate, 120);

    if (!modelNo) {
      skippedItems.push({
        reason: 'Missing model number',
        name: cleanText(item.name || item['PRODUCT NAME'] || '', 120)
      });
      continue;
    }

    const qty = Math.max(1, Math.floor(safeNumber(item.qty ?? item.quantity ?? item.QTY ?? item.count ?? 1, 1)));
    cleanItems.push({
      modelNo,
      name: cleanText(item.name || item['PRODUCT NAME'] || item.productName || '', 300),
      brand: cleanText(item.brand || item.BRAND || '', 160),
      carbrand: cleanText(item.carbrand || item.CARBRAND || item['CARBRAND'] || item['CAR MANUFACTURER'] || '', 160),
      qty,
      price: safeNumber(item.price ?? item.PRICE ?? item.amount, 0)
    });
  }

  if (!cleanItems.length) {
    throw new HttpError(400, 'No valid cart items supplied. Each item needs a modelNo or MODEL NO. value.');
  }

  const order = {
    id: cleanText(body.orderId || body.id || '', 80) || ('ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()),
    status: 'pending',
    createdAt: cleanText(body.createdAt || '', 40) || new Date().toISOString(),
    customerName: cleanText(body.customerName || body.name || '', 160),
    customerPhone: cleanText(body.customerPhone || body.phone || body.whatsapp || '', 80),
    note: cleanText(body.note || body.message || '', 1000),
    source: cleanText(body.source || body.sourceUrl || 'website-cart', 300),
    total: safeNumber(body.total, cleanItems.reduce((sum, item) => sum + (safeNumber(item.price, 0) * safeNumber(item.qty, 1)), 0)),
    skippedItems,
    items: cleanItems
  };

  if (hasD1(env)) {
    await ensurePendingD1Schema(env);
    await env.DB.prepare(
      `INSERT INTO pending_orders (id, order_json, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         order_json = excluded.order_json,
         status = excluded.status,
         updated_at = excluded.updated_at`
    ).bind(order.id, JSON.stringify(order), order.status, order.createdAt, new Date().toISOString()).run();
    return order;
  }

  if (hasKV(env)) {
    const orders = await readPendingOrders(env, { includeAll: true });
    const existingIdx = orders.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) orders[existingIdx] = order;
    else orders.unshift(order);
    await writePendingOrders(env, orders);
    return order;
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function readPendingOrders(env, options = {}) {
  const includeAll = !!options.includeAll;

  if (hasD1(env)) {
    await ensurePendingD1Schema(env);
    const query = includeAll
      ? `SELECT order_json FROM pending_orders ORDER BY created_at DESC`
      : `SELECT order_json FROM pending_orders WHERE status = 'pending' ORDER BY created_at DESC`;
    const out = await env.DB.prepare(query).all();
    return (out && out.results ? out.results : []).map((r) => JSON.parse(r.order_json));
  }

  if (hasKV(env)) {
    const raw = await env.PRODUCTS_KV.get(pendingKey(env));
    const orders = raw ? JSON.parse(raw) : [];
    return includeAll ? orders : orders.filter((o) => (o.status || 'pending') === 'pending');
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function writePendingOrders(env, orders) {
  if (hasD1(env)) {
    await ensurePendingD1Schema(env);
    const statements = [];
    for (const order of orders) {
      statements.push(env.DB.prepare(
        `INSERT INTO pending_orders (id, order_json, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           order_json = excluded.order_json,
           status = excluded.status,
           updated_at = CURRENT_TIMESTAMP`
      ).bind(
        order.id,
        JSON.stringify(order),
        order.status || 'pending',
        order.createdAt || new Date().toISOString()
      ));
    }
    if (statements.length) await env.DB.batch(statements);
    return;
  }

  if (hasKV(env)) {
    await env.PRODUCTS_KV.put(pendingKey(env), JSON.stringify(orders));
    return;
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function updatePendingOrderStatus(env, orderId, status) {
  const id = cleanText(orderId, 120);
  if (!id) throw new HttpError(400, 'Order ID is required');

  if (hasD1(env)) {
    await ensurePendingD1Schema(env);
    const found = await env.DB.prepare('SELECT order_json FROM pending_orders WHERE id = ?').bind(id).first();
    if (!found) throw new HttpError(404, 'Pending order not found');
    const order = JSON.parse(found.order_json);
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE pending_orders SET order_json = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(JSON.stringify(order), status, id).run();
    return order;
  }

  if (hasKV(env)) {
    const orders = await readPendingOrders(env, { includeAll: true });
    const order = orders.find((o) => o.id === id);
    if (!order) throw new HttpError(404, 'Pending order not found');
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await writePendingOrders(env, orders);
    return order;
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function confirmPendingOrder(env, orderId) {
  const id = cleanText(orderId, 120);
  if (!id) throw new HttpError(400, 'Order ID is required');

  const orders = await readPendingOrders(env, { includeAll: true });
  const order = orders.find((o) => o.id === id && (o.status || 'pending') === 'pending');
  if (!order) throw new HttpError(404, 'Pending order not found');

  const products = await readProducts(env);
  const updated = [];
  const missing = [];

  for (const item of order.items || []) {
    const modelNo = String(item.modelNo || '').trim();
    const product = products.find((p) => String(p['MODEL NO.'] || '').trim() === modelNo);
    if (!product) {
      missing.push(modelNo);
      continue;
    }

    const currentQty = Math.max(0, Math.floor(safeNumber(product.QTY, 0)));
    const deductQty = Math.max(1, Math.floor(safeNumber(item.qty, 1)));
    const newQty = Math.max(0, currentQty - deductQty);

    product.QTY = newQty;
    product.STATUS = newQty <= 0 ? 'sold' : (product.STATUS === 'sold' ? 'readytocollect' : product.STATUS || 'readytocollect');
    updated.push({ modelNo, previousQty: currentQty, orderedQty: deductQty, newQty, status: product.STATUS });
  }

  await replaceProducts(env, products.map(sanitizeProductRow));

  if (hasD1(env)) {
    order.status = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.stockUpdates = updated;
    order.missingProducts = missing;
    await env.DB.prepare(
      `UPDATE pending_orders SET order_json = ?, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(JSON.stringify(order), id).run();
  } else if (hasKV(env)) {
    const allOrders = await readPendingOrders(env, { includeAll: true });
    const target = allOrders.find((o) => o.id === id);
    if (target) {
      target.status = 'confirmed';
      target.confirmedAt = new Date().toISOString();
      target.stockUpdates = updated;
      target.missingProducts = missing;
    }
    await writePendingOrders(env, allOrders);
  }

  const remaining = (await readPendingOrders(env)).length;
  return { orderId: id, updated, missing, remaining };
}

async function rejectPendingOrder(env, orderId) {
  const order = await updatePendingOrderStatus(env, orderId, 'rejected');
  const remaining = (await readPendingOrders(env)).length;
  return { orderId: order.id, remaining };
}

function communityKey(env) {
  return env.COMMUNITY_KV_KEY || DEFAULT_COMMUNITY_KV_KEY;
}

async function ensureCommunityD1Schema(env) {
  if (!hasD1(env)) return;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS community_signups (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function createCommunitySignup(env, body) {
  const phone = cleanText(body.phone || body.number || body.whatsapp || '', 40);
  if (!phone) throw new HttpError(400, 'A WhatsApp number is required');
  if (!/^[+\d][\d\s-]{5,25}$/.test(phone)) throw new HttpError(400, 'Enter a valid WhatsApp number');

  const signup = {
    id: 'SIGNUP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    phone,
    createdAt: new Date().toISOString()
  };

  if (hasD1(env)) {
    await ensureCommunityD1Schema(env);
    await env.DB.prepare(
      `INSERT INTO community_signups (id, phone, created_at) VALUES (?, ?, ?)`
    ).bind(signup.id, signup.phone, signup.createdAt).run();
    return signup;
  }

  if (hasKV(env)) {
    const raw = await env.PRODUCTS_KV.get(communityKey(env));
    const signups = raw ? JSON.parse(raw) : [];
    signups.unshift(signup);
    await env.PRODUCTS_KV.put(communityKey(env), JSON.stringify(signups));
    return signup;
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function readCommunitySignups(env) {
  if (hasD1(env)) {
    await ensureCommunityD1Schema(env);
    const out = await env.DB.prepare('SELECT id, phone, created_at FROM community_signups ORDER BY created_at DESC').all();
    return (out && out.results ? out.results : []).map((r) => ({ id: r.id, phone: r.phone, createdAt: r.created_at }));
  }

  if (hasKV(env)) {
    const raw = await env.PRODUCTS_KV.get(communityKey(env));
    return raw ? JSON.parse(raw) : [];
  }

  throw new HttpError(500, 'No storage binding configured.');
}

async function deleteCommunitySignup(env, id) {
  const cleanId = cleanText(id, 120);
  if (!cleanId) throw new HttpError(400, 'Signup ID is required');

  if (hasD1(env)) {
    await ensureCommunityD1Schema(env);
    await env.DB.prepare('DELETE FROM community_signups WHERE id = ?').bind(cleanId).run();
    return;
  }

  if (hasKV(env)) {
    const signups = await readCommunitySignups(env);
    await env.PRODUCTS_KV.put(communityKey(env), JSON.stringify(signups.filter((s) => s.id !== cleanId)));
    return;
  }

  throw new HttpError(500, 'No storage binding configured.');
}

const IMAGE_MIME_EXT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6MB raw
const R2_PUBLIC_BASE_DEFAULT = 'https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/';

async function uploadProductImage(env, body) {
  if (!env.IMAGES_BUCKET || typeof env.IMAGES_BUCKET.put !== 'function') {
    throw new HttpError(500, 'Image uploads are not configured yet. Add an R2 bucket binding named IMAGES_BUCKET to this Worker (pointing at the same bucket that serves pub-93350f16ecf844b7824fa0a683487d84.r2.dev), then redeploy.');
  }

  const modelNo = sanitizeModelNo(body.model);
  const slot = Math.max(1, Math.min(4, Math.floor(safeNumber(body.slot, 1))));
  const contentType = String(body.contentType || '').toLowerCase();
  const ext = IMAGE_MIME_EXT[contentType];
  if (!ext) throw new HttpError(400, 'Unsupported image type. Use JPEG, PNG or WEBP.');

  const base64 = String(body.dataBase64 || '');
  if (!base64) throw new HttpError(400, 'No image data supplied');

  let bytes;
  try {
    const binary = atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch (e) {
    throw new HttpError(400, 'Invalid image data');
  }

  if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'Image is too large. Max 6MB.');

  const modelKey = modelNo.replace(/\//g, '-').replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `PI/${modelKey}-0${slot}.${ext}`;

  await env.IMAGES_BUCKET.put(key, bytes, { httpMetadata: { contentType } });

  const base = env.R2_PUBLIC_BASE || R2_PUBLIC_BASE_DEFAULT;
  return { url: base.replace(/\/+$/, '/') + key, key };
}
