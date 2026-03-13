// Shared JWT utilities for admin dashboard auth
// Uses Node crypto — zero external dependencies
import crypto from 'crypto';

export function signJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromCookie(req) {
  const cookies = (req.headers.cookie || '');
  const match = cookies.match(/nb_admin_token=([^;]+)/);
  return match ? match[1] : null;
}

export function requireAuth(req) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const token = getTokenFromCookie(req);
  if (!token) return null;
  return verifyJWT(token, secret);
}

// Supabase fetch helper
export async function supabaseFetch(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');

  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Supabase error:', text);
    throw new Error(`Supabase ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('json')) return res.json();
  return null;
}
