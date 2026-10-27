# one9studio

Website and team dashboard for one9studio — *Influence has value and we are turning it into the commercial opportunity.*

## How the website works

Every page of the website (home, the 7 service pages and any new pages) is **built from the database** when someone visits it. All text, images, sections, menus, contact details and the WhatsApp number are edited in the dashboard under **Website** — no code changes needed.

- `api/page.js` builds the pages (Vercel serverless function). `vercel.json` sends page addresses (`/`, `/brand-management`, `/about-us` …) to it.
- `lib/sections.js` — the section types (hero, cards, features, steps, numbers, work, people, events, testimonials, call-to-action, text + photo, case study, FAQ, contact, text block, gallery, banner …) and how each one looks.
- `lib/render.js` — header, menu, footer and page assembly.
- `lib/default-site.json` — the starting content. Used until the first time someone publishes from the dashboard, and as a backup if the database can't be reached.
- `lib/store.js` — database (Upstash Redis) and image uploads (Vercel Blob).
- Pages are cached for about 30 seconds, so a published change shows on the live site within ~30 seconds.

`suppliers.html`, `diwali-edit.html` and `coming-soon.html` (Sampling Store) are separate static pages and are not part of the editor.

## Dashboard → Website

- **Pages:** pick a page to see its sections in order. Edit, move up/down, hide/show, duplicate, delete, or **+ Add section** (choose from the section types).
- **Images:** every image field has **Upload image** (resized automatically in the browser, stored in Vercel Blob) or a box to paste an image link.
- **New page:** name + address, start blank or as a copy of another page. New pages start **hidden** — switch off "Hidden" in Page settings when ready. Hidden pages can still be checked with the preview link.
- **Page settings:** name, address, service page (adds it to the Services menu, footer and WhatsApp topic buttons), top-menu link, Google title/description, share image.
- **Site settings:** WhatsApp number and messages, email, phone, address, menu links, social links, footer text.
- **Publish to website:** nothing goes live until you click it. **Version history** keeps the last 20 published versions and can restore any of them.
- Events marked *Published* in **Events & Shows** appear automatically in the events section (when that section has the option switched on).

## Local preview

```bash
npm install
node scripts/dev-server.js
```

Open http://localhost:4319 and http://localhost:4319/dashboard. Locally the data is stored in `.devdata/` (not the live database) — delete that folder to start again.

## Vercel setup

Framework "Other", no build command, output directory `.`. Vercel installs `@vercel/blob` from `package.json` automatically. Environment variables (already set on the one9studio project):

- `KV_REST_API_URL`, `KV_REST_API_TOKEN` — Upstash Redis database
- `BLOB_READ_WRITE_TOKEN` — image storage (Blob store `one9studio-images`)
- `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET` — dashboard login (used when the login is switched on)

## Login — currently OFF

`TEMPORARILY_DISABLE_DASHBOARD_LOGIN` in `api/studio.js` is `true`, as requested. **Anyone who opens `/dashboard` can change the whole website and see all records.** Set it to `false` to require the team password (`STUDIO_PASSWORD` is already set in Vercel).

Agreed flow: The-Aditya-Kadam/one9studio (main) → Vercel project one9studio (team One9 Studio).
