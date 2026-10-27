# one9studio

Website and team dashboard for one9studio — *Influence has value and we are turning it into the commercial opportunity.*

## Pages

| URL | File | What it is |
|---|---|---|
| `/` | `index.html` | Home page: hero, 7 services, process, stats, work, roster, events, testimonials, WhatsApp contact |
| `/brand-management` | `brand-management.html` | Service page |
| `/social-media-management` | `social-media-management.html` | Service page |
| `/influencer-management` | `influencer-management.html` | Service page |
| `/talent-management` | `talent-management.html` | Service page |
| `/artist-management` | `artist-management.html` | Service page |
| `/brand-collaborations` | `brand-collaborations.html` | Service page |
| `/event-show-management` | `event-show-management.html` | Service page |
| `/dashboard` | `dashboard.html` | Team dashboard (not indexed by search engines) |
| `/suppliers`, `/diwali-edit` | | Sampling Store pages (unchanged, separate design) |
| `/coming-soon` | `coming-soon.html` | Old coming-soon page |

Every service page has: hero, what's included, why one9studio, process, case study, FAQ, links to the other services, and WhatsApp buttons that open a chat with that service already named in the message.

## WhatsApp — no forms

There are no forms on the site. Every "Chat on WhatsApp" button, the topic buttons in the contact section and the floating chat button (bottom-right on every page) open WhatsApp with a ready-made first message, e.g. *"Hi one9studio, I'm interested in Influencer Management. Can we talk?"*

The number is set in two places:
- `SITE.whatsapp` in `scripts/build-pages.js` — the default, built into the pages (then run the build).
- **Website content → WhatsApp number** in the dashboard — overrides the default on the live site once the database is connected, no rebuild needed.

The current number `919876543210` is a placeholder.

## Demo content

All names, clients, numbers, case studies, testimonials, events, the contact email/phone and the WhatsApp number are **demo content**. Photos are free Unsplash images loaded from `images.unsplash.com`. Replace them with real ones before launch.

## Editing the pages

The home page and the 7 service pages are generated from one file so header, footer and WhatsApp buttons stay identical everywhere:

1. Edit the text, images or contact details in `scripts/build-pages.js` (the `SITE`, `SERVICES`, `ROSTER` and `EVENTS` sections).
2. Run `node scripts/build-pages.js`. It rewrites `index.html`, the 7 service pages and `sitemap.xml`.

Do not hand-edit those 8 HTML files — the next build overwrites them.

Styles: `assets/one9/one9.css` (website) and `assets/one9/dashboard.css` (dashboard). After changing CSS or JS, bump the `?v=` number where the file is linked so browsers pick up the new version.

## Local preview

```bash
node scripts/dev-server.js
```

Then open http://localhost:4319. The backend does not run locally, so the dashboard shows demo data.

## Dashboard

Sections: Overview, Inquiries, Brand Management, Social Media, Influencers, Talent, Artists, Brand Collaborations, Events & Shows, Website content.

- **No database connected:** shows sample data (demo mode); changes are not saved.
- **Database connected:** reads and saves real records; log WhatsApp leads in Inquiries (each lead with a phone number gets a one-click WhatsApp link); events marked *Published* appear on the home page; Website content updates the home page headline, contact details and WhatsApp number.

Setup steps are in [ADMIN_SETUP.md](ADMIN_SETUP.md).

## Login — currently OFF

`TEMPORARILY_DISABLE_DASHBOARD_LOGIN` in `api/studio.js` is `true`, as requested. Once the database is connected, **anyone who opens `/dashboard` can see and change every record**, including customer names, emails and phone numbers. Set it to `false` (and add `STUDIO_PASSWORD` and `STUDIO_SESSION_SECRET`) to require the team password.

## Deployment

**Vercel (main host):** framework "Other", no build command, output directory `.`, repository root. `vercel.json` sets clean URLs, redirects and security headers. `.vercelignore` keeps `scripts/` and docs off the live site.

**Render:** `render.yaml` publishes the static pages only; the dashboard needs Vercel.

Agreed flow: The-Aditya-Kadam/one9studio → agencywork187-commits/one9studio → Vercel.
