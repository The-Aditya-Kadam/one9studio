# Sampling Store — 3D marketing site

Static site for **https://www.one9studio.in**, hosted on Vercel.

## Pages
- `/` — home (`index.html`)
- `/diwali-edit` — Diwali Edit 2026 landing page (`diwali-edit.html`)
- `/suppliers` — supplier onboarding page (`suppliers.html`)

Shared styles and scripts live in `assets/site.css` and `assets/site.js`. The hero 3D scene uses Three.js from cdnjs.

## Local preview
```bash
python -m http.server 8765
```
Then open http://localhost:8765. Note: locally the clean URLs (`/suppliers`) only work on Vercel; use `/suppliers.html` when previewing with a plain static server.

## Deploy
1. Push this repo to GitHub.
2. In Vercel, **Add New Project → Import** the repo. Framework preset: *Other*. No build command, output directory `.` (root).
3. In the project's **Domains** settings add `www.one9studio.in` and `one9studio.in`, then at the DNS provider:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com`
   Vercel issues the TLS certificate automatically.

`vercel.json` enables clean URLs, long-lived caching for `/assets`, basic security headers and `.html` → clean URL redirects.
