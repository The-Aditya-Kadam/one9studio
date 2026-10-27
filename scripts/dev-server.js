/*
  Local preview server that behaves like Vercel for this project.
  Run:  node scripts/dev-server.js   then open http://localhost:4319
  - Pages are built by api/page.js, the dashboard talks to api/studio.js — the same code as on Vercel.
  - Data is stored in .devdata/store.json and uploads in .devdata/uploads (never touches the live database).
  - Delete the .devdata folder to start again from the default content.
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, '.devdata');
process.env.ONE9_DEV_STORE = path.join(DATA, 'store.json');

const PORT = Number(process.env.PORT) || 4319;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
const HIDDEN = /^\/(scripts|lib|node_modules|\.devdata|\.git|api)(\/|$)|\.md$|package(-lock)?\.json$|^\/\./;

function vercelRes(res) {
  res.status = code => { res.statusCode = code; return res; };
  res.json = obj => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res; };
  res.send = body => { res.end(body); return res; };
  return res;
}

async function runFunction(name, req, res, query) {
  const file = path.join(ROOT, 'api', name + '.js');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  req.query = query;
  try { req.body = raw && String(req.headers['content-type'] || '').includes('application/json') ? JSON.parse(raw) : raw; }
  catch { res.writeHead(400); return res.end('Invalid JSON'); }
  try { await require(file)(req, vercelRes(res)); }
  catch (e) { console.error(e); if (!res.headersSent) { res.writeHead(500); res.end('Server error'); } }
}

function serveFile(file, res, shot) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    // ?shot=1 turns off fade-in animations so screenshots show final content
    if (shot && file.endsWith('.html')) data = Buffer.from(String(data).replace('</head>', '<style>.rv{opacity:1!important;transform:none!important;transition:none!important}</style></head>'));
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  const query = Object.fromEntries(url.searchParams);
  const shot = url.searchParams.has('shot');

  if (p.startsWith('/api/')) return runFunction(p.slice(5).replace(/\/$/, ''), req, res, query);
  if (p.startsWith('/dev-uploads/')) return serveFile(path.join(DATA, 'uploads', path.basename(p)), res);
  if (HIDDEN.test(p)) { res.writeHead(404); return res.end('Not found'); }

  // Static files first (like Vercel), including clean URLs (/dashboard → dashboard.html)
  const file = path.join(ROOT, p);
  if (file.startsWith(ROOT) && p !== '/') {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return serveFile(file, res, shot);
    if (!path.extname(file) && fs.existsSync(file + '.html')) return serveFile(file + '.html', res, shot);
  }

  // Everything else is a website page built from the database
  const pagePath = p === '/' ? '' : p.slice(1).replace(/\/$/, '');
  const fake = { url: req.url, headers: req.headers, method: 'GET', [Symbol.asyncIterator]: async function* () {} };
  const out = vercelRes(res);
  if (shot) {
    const origEnd = res.end.bind(res);
    res.end = body => origEnd(typeof body === 'string' ? body.replace('</head>', '<style>.rv{opacity:1!important;transform:none!important;transition:none!important}</style></head>') : body);
  }
  return runFunction('page', fake, out, { path: pagePath, ...(query.preview ? { preview: query.preview } : {}) });
}).listen(PORT, () => console.log('Preview: http://localhost:' + PORT + '  (data: .devdata/)'));
