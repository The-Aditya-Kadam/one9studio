# one9studio dashboard setup

The dashboard at `/dashboard` manages inquiries, brands, social media accounts, influencers, talent, artists, brand collaborations, events and the home page content. Data is stored in Upstash Redis through the Vercel function `api/studio.js`.

## 1. Connect the database (required)

Create an Upstash Redis database (Vercel Marketplace → Upstash, or upstash.com) and add these to the Vercel project's **Production** environment variables:

- `UPSTASH_REDIS_REST_URL` — the database's HTTPS REST endpoint
- `UPSTASH_REDIS_REST_TOKEN` — the database's REST token

(The Vercel KV names `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work.)

Enter them in Vercel only — never in GitHub or chat. Redeploy afterwards.

Until these are set, the dashboard runs in **demo mode** with sample data. The website itself works without the database — all contact goes through WhatsApp.

## 2. Turn the login on (recommended before launch)

The login is **currently off** (`TEMPORARILY_DISABLE_DASHBOARD_LOGIN = true` in `api/studio.js`). While it is off and the database is connected, anyone with the `/dashboard` link can read and edit every record.

To require the team password:

1. Add `STUDIO_PASSWORD` (a long, unique shared password) and `STUDIO_SESSION_SECRET` (at least 32 random characters, e.g. `openssl rand -hex 32`) to Vercel.
2. Set `TEMPORARILY_DISABLE_DASHBOARD_LOGIN = false` in `api/studio.js`.
3. Commit and redeploy.

Sign-in then creates an 8-hour Secure, HttpOnly, SameSite=Strict session cookie. Login attempts are rate-limited per IP.

## What each section stores

| Dashboard section | Record type | Key fields |
|---|---|---|
| Inquiries | `inquiries` | leads you log from WhatsApp: name, phone, email, company, service, message, status (New → In progress → Contacted → Won / Closed) |
| Brand Management | `brands` | brand, industry, contact, retainer, status |
| Social Media | `social` | handle, platform, client, followers, posts this month, status |
| Influencers / Talent / Artists | `talent` | name, category, niche, followers, city, rate, status |
| Brand Collaborations | `campaigns` | name, brand, talent, budget, launch date, status |
| Events & Shows | `events` | name, type, date, city, venue, status (Published events show on the website) |
| Website content | `content` | home page headline, introduction, contact email, phone and WhatsApp number |

Deleted records are copied to an archive in Redis before removal. Public visitors can only read the website content and published events.

## Not included yet

Individual team accounts and roles, password recovery, file uploads, payments and invoicing.
