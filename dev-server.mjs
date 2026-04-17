// Local dev server for NBHQ — serves static files + Vercel-style API routes
// Usage: node dev-server.mjs
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dotenv dependency)
const envFile = path.join(__dirname, '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    // Strip surrounding quotes and trailing \n literals
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    val = val.replace(/\\n$/, '').replace(/\n$/, '');
    process.env[key] = val;
  }
}

const PORT = 3777;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

// Lazy-load API handlers
const apiCache = {};
async function loadApiHandler(apiPath) {
  if (apiCache[apiPath]) return apiCache[apiPath];
  const filePath = path.join(__dirname, apiPath + '.js');
  if (!fs.existsSync(filePath)) return null;
  const mod = await import(filePath);
  apiCache[apiPath] = mod.default;
  return mod.default;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // API routes
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.replace(/\/$/, '');
    const handler = await loadApiHandler(apiPath);
    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'API route not found' }));
    }

    // Parse body for POST/PATCH/PUT
    let body = '';
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      await new Promise(resolve => {
        req.on('data', chunk => body += chunk);
        req.on('end', resolve);
      });
      try { req.body = JSON.parse(body); } catch { req.body = {}; }
    }

    req.query = Object.fromEntries(url.searchParams);

    // Vercel-compatible res helpers
    const origWriteHead = res.writeHead.bind(res);
    let statusCode = 200;
    const headers = {};
    res.status = (code) => { statusCode = code; return res; };
    res.json = (data) => {
      headers['Content-Type'] = 'application/json';
      origWriteHead(statusCode, headers);
      res.end(JSON.stringify(data));
    };
    const origSetHeader = res.setHeader.bind(res);
    res.setHeader = (name, value) => {
      // Fix: remove Secure flag for localhost
      if (name === 'Set-Cookie' && Array.isArray(value)) {
        value = value.map(v => v.replace('; Secure', ''));
      } else if (name === 'Set-Cookie' && typeof value === 'string') {
        value = value.replace('; Secure', '');
      }
      origSetHeader(name, value);
    };

    try {
      await handler(req, res);
    } catch (err) {
      console.error('API error:', err);
      if (!res.writableEnded) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    }
    return;
  }

  // Static files — cleanUrls (no .html extension needed)
  let filePath = path.join(__dirname, pathname);

  // If no extension, try .html (Vercel cleanUrls)
  if (!path.extname(pathname)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Serve index.html for root
  if (pathname === '/') filePath = path.join(__dirname, 'index.html');

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`NBHQ dev server running at http://localhost:${PORT}`);
  console.log(`Swipe File: http://localhost:${PORT}/nb-admin-swipe-file`);
});
