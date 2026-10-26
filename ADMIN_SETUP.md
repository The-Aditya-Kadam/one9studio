# one9studio dashboard setup

The main website stays at `/`. `/dashboard` is a separate 3D administration interface inspired by the supplied SKYBUILD reference, using the one9studio palette. It manages inquiries, talent records, service descriptions, events and public hero/contact content. It uses no Claude-only runtime.

## Required configuration

Create an Upstash Redis database and set these variables in the existing Vercel project's Production environment:

- `UPSTASH_REDIS_REST_URL`: HTTPS REST endpoint from that database.
- `UPSTASH_REDIS_REST_TOKEN`: server REST token from that database.
- `STUDIO_PASSWORD`: a long unique shared team password.
- `STUDIO_SESSION_SECRET`: at least 32 random characters (generate locally, e.g. `openssl rand -hex 32`).

Enter these directly in Vercel, never in GitHub or chat. Redeploy after setting them. No payment provider or payment collection is included.

Until all variables are present, the dashboard shows an explicit setup notice, no private records are returned, writes are rejected, and website inquiries keep their previous local draft behavior. There is no default password, fake login or invented activity.

## Behavior

Team login is verified server-side; an eight-hour signed session is stored in a Secure, HttpOnly, SameSite=Strict cookie. Login and public-inquiry requests have database-backed limits per IP/time window. Records are stored in Redis hashes. Deleted records are copied to a server-side archive before removal; this is not a permanent-delete tool. Writes require same-origin JSON and an authenticated session, except public inquiry submission. Records never use localStorage as a substitute for server persistence.

After configuration, public forms submit to `/api/studio?action=inquire`; the dashboard inbox reads those records. Site content and published events are fetched from `/api/studio?action=content`. Service description updates apply to the six existing service cards by matching their names; creating an unrelated service record does not invent a new public card or inquiry form. Talent records are internal. Project/payment tracking from the reference is not included.

One shared team password is supported in this first version. Individual accounts, per-user roles, password recovery, attachments and payment accounting are not implemented. Redis contains contact data; limit access to the Vercel and Redis project owners.

## Verification

Syntax and mocked API tests cover configuration gating, login, cookie authentication, private record reads and public inquiry persistence. Production login/storage verification requires the variables above. No credentials are included in the repository.
