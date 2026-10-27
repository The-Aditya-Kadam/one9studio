/*
  Local preview server that mimics Vercel's clean URLs.
  Run:  node scripts/dev-server.js   then open http://localhost:4319
  /api is not available locally, so the site and dashboard run in demo mode.
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 4319;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.startsWith('/api/') || p.startsWith('/scripts/')) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"error":"Not available in local preview"}'); }
  if (p === '/') p = '/index.html';
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    // ?shot=1 turns off fade-in animations so screenshots show final content
    if (path.extname(file) === '.html' && req.url.includes('shot=1')) data = Buffer.from(String(data).replace('</head>', '<style>.rv{opacity:1!important;transform:none!important;transition:none!important}</style></head>'));
    res.end(data);
  });
}).listen(PORT, () => console.log('Preview: http://localhost:' + PORT));
