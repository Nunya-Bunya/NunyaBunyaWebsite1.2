// Admin dashboard authentication — JWT cookie-based
import crypto from 'crypto';
import { signJWT, verifyJWT, getTokenFromCookie } from './auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'Auth not configured.' });
  }

  // POST = login
  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password required.' });

    // Timing-safe comparison
    const a = Buffer.from(password);
    const b = Buffer.from(ADMIN_PASSWORD);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = signJWT({ role: 'admin' }, JWT_SECRET);

    res.setHeader('Set-Cookie', [
      `nb_admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
    ]);

    return res.status(200).json({ success: true });
  }

  // GET = verify session
  if (req.method === 'GET') {
    const token = getTokenFromCookie(req);
    if (!token) return res.status(401).json({ valid: false });

    const payload = verifyJWT(token, JWT_SECRET);
    if (!payload) return res.status(401).json({ valid: false });

    return res.status(200).json({ valid: true, exp: payload.exp });
  }

  // DELETE = logout
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', [
      'nb_admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
