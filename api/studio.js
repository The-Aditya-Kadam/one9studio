/*
  one9studio backend — Vercel serverless function at /api/studio
  Storage: Upstash Redis (REST). Setup: see ADMIN_SETUP.md.
*/
const crypto = require('node:crypto');

// Dashboard login switch.
// true  = anyone who opens /dashboard can see and change all records (current setting, requested by the owner).
// false = the team password (STUDIO_PASSWORD) is required. Switch back to false before sharing the site widely.
const TEMPORARILY_DISABLE_DASHBOARD_LOGIN = true;

const prefix = 'one9studio:v1:';
const SERVICES = ['Brand Management', 'Social Media Management', 'Influencer Management', 'Talent Management', 'Artist Management', 'Brand Collaborations', 'Event & Show Management', 'Not sure yet'];

// Record types the dashboard manages. Each field: [name, maxLength, kind]
// kind: 'text' | 'email' | 'date' | 'digits' | array of allowed values (first = default)
const SCHEMAS = {
  inquiries: { required: ['name'], fields: [['name', 150], ['email', 254, 'email'], ['phone', 40], ['company', 150], ['service', 200], ['message', 3000], ['status', 0, ['New', 'In progress', 'Contacted', 'Won', 'Closed']]] },
  brands: { required: ['name'], fields: [['name', 150], ['industry', 100], ['contact', 150], ['email', 254, 'email'], ['retainer', 60], ['status', 0, ['Active', 'Onboarding', 'Paused', 'Past']], ['notes', 2000]] },
  social: { required: ['name'], fields: [['name', 150], ['platform', 0, ['Instagram', 'YouTube', 'LinkedIn', 'X', 'Facebook', 'Snapchat']], ['client', 150], ['followers', 12, 'digits'], ['posts', 6, 'digits'], ['status', 0, ['Active', 'Paused']], ['notes', 2000]] },
  talent: { required: ['name'], fields: [['name', 150], ['category', 0, ['Influencer', 'Talent', 'Artist']], ['niche', 100], ['followers', 12, 'digits'], ['city', 100], ['rate', 60], ['status', 0, ['Available', 'Booked', 'Unavailable']], ['notes', 2000]] },
  campaigns: { required: ['name'], fields: [['name', 150], ['brand', 150], ['talent', 300], ['budget', 60], ['date', 10, 'date'], ['status', 0, ['Planning', 'Live', 'Completed', 'Cancelled']], ['notes', 2000]] },
  events: { required: ['name', 'date'], fields: [['name', 150], ['type', 0, ['Event', 'Show', 'Concert', 'Brand launch', 'Meet & greet']], ['date', 10, 'date'], ['city', 150], ['venue', 150], ['status', 0, ['Draft', 'Published']], ['description', 1500]] },
};
const groups = Object.keys(SCHEMAS);

function redisUrl() { return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL; }
function redisToken() { return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN; }
function setupIssues() {
  return [
    !TEMPORARILY_DISABLE_DASHBOARD_LOGIN && !process.env.STUDIO_PASSWORD ? 'STUDIO_PASSWORD is missing' : null,
    !TEMPORARILY_DISABLE_DASHBOARD_LOGIN && !(process.env.STUDIO_SESSION_SECRET?.length >= 32) ? 'STUDIO_SESSION_SECRET must contain at least 32 characters' : null,
    !redisUrl() ? 'Redis REST URL is missing' : null,
    !redisToken() ? 'Redis REST token is missing' : null,
  ].filter(Boolean);
}
function configured() { return setupIssues().length === 0; }

async function redis(...command) {
  const r = await fetch(redisUrl(), { method: 'POST', headers: { Authorization: `Bearer ${redisToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(8000) });
  const d = await r.json();
  if (!r.ok || d.error) throw Error('Storage unavailable');
  return d.result;
}

function equal(a, b) { const hash = x => crypto.createHash('sha256').update(String(x)).digest(); return crypto.timingSafeEqual(hash(a), hash(b)); }
function signed(body) { return crypto.createHmac('sha256', process.env.STUDIO_SESSION_SECRET).update(body).digest('base64url'); }
function authenticated(req) {
  if (TEMPORARILY_DISABLE_DASHBOARD_LOGIN) return true;
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('studio_session='));
  if (!cookie) return false;
  const [exp, nonce, sig] = cookie.slice(15).split('.');
  return Number(exp) > Date.now() && Boolean(nonce && sig) && equal(sig, signed(`${exp}.${nonce}`));
}
function cookie(value, age) { return `studio_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`; }
function text(v, max = 200) { return typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v).slice(0, max) : ''; }

function validate(group, r) {
  const schema = SCHEMAS[group];
  const d = {};
  for (const [key, max, kind] of schema.fields) {
    if (Array.isArray(kind)) { d[key] = kind.includes(r[key]) ? r[key] : kind[0]; continue; }
    const v = text(r[key], max);
    if (kind === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw Error('Enter a valid email address');
    if (kind === 'date' && v && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v)))) throw Error('Choose a valid date');
    if (kind === 'digits' && v && !/^\d+$/.test(v)) throw Error(`${key[0].toUpperCase() + key.slice(1)} must be a whole number`);
    d[key] = v;
  }
  for (const key of schema.required) if (!d[key]) throw Error(`${key[0].toUpperCase() + key.slice(1)} is required`);
  return d;
}

async function records(group) {
  const raw = await redis('HGETALL', prefix + group);
  const result = [];
  for (let i = 1; i < (raw || []).length; i += 2) { try { result.push(JSON.parse(raw[i])); } catch { /* skip bad record */ } }
  return result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function limited(req, kind, max) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = prefix + 'limit:' + kind + ':' + crypto.createHash('sha256').update(ip).digest('hex') + ':' + Math.floor(Date.now() / 900000);
  const count = await redis('INCR', key);
  if (count === 1) await redis('EXPIRE', key, 900);
  return count > max;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const action = req.query.action || 'status';

  if (!configured()) {
    return res.status(action === 'status' ? 200 : 503).json({
      configured: false, authenticated: false,
      setupIssues: action === 'status' ? setupIssues() : undefined,
      error: action === 'status' ? undefined : 'Dashboard backend is not configured',
    });
  }
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'POST') {
    const origin = req.headers.origin;
    if (origin && origin !== `https://${req.headers.host}`) return res.status(403).json({ error: 'Origin not allowed' });
    if (!String(req.headers['content-type'] || '').includes('application/json')) return res.status(415).json({ error: 'JSON required' });
  }

  try {
    if (action === 'status') return res.json({ configured: true, authenticated: authenticated(req), loginDisabled: TEMPORARILY_DISABLE_DASHBOARD_LOGIN });

    if (action === 'login' && req.method === 'POST') {
      if (TEMPORARILY_DISABLE_DASHBOARD_LOGIN) return res.json({ ok: true });
      if (await limited(req, 'login', 8)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
      if (!equal(req.body?.password, process.env.STUDIO_PASSWORD)) return res.status(401).json({ error: 'Incorrect password' });
      const body = `${Date.now() + 28800000}.${crypto.randomBytes(24).toString('base64url')}`;
      res.setHeader('Set-Cookie', cookie(body + '.' + signed(body), 28800));
      return res.json({ ok: true });
    }
    if (action === 'logout' && req.method === 'POST') { res.setHeader('Set-Cookie', cookie('', 0)); return res.json({ ok: true }); }

    // Public: website content and published events
    if (action === 'content' && req.method === 'GET') {
      const raw = await redis('GET', prefix + 'content');
      const events = (await records('events')).filter(x => x.status === 'Published').map(({ name, type, date, city, venue, description }) => ({ name, type, date, city, venue, description }));
      return res.json({ content: raw ? JSON.parse(raw) : null, events });
    }

    // Public: website inquiry form
    if (action === 'inquire' && req.method === 'POST') {
      if (await limited(req, 'inquire', 10)) return res.status(429).json({ error: 'Too many inquiries. Please try again later' });
      const d = validate('inquiries', req.body || {});
      if (!SERVICES.includes(d.service)) d.service = 'Not sure yet';
      d.status = 'New'; d.id = crypto.randomUUID(); d.createdAt = new Date().toISOString(); d.updatedAt = d.createdAt;
      await redis('HSET', prefix + 'inquiries', d.id, JSON.stringify(d));
      return res.status(201).json({ ok: true });
    }

    if (!authenticated(req)) return res.status(401).json({ error: 'Please sign in' });

    if (action === 'read' && req.method === 'GET') {
      const data = {};
      for (const g of groups) data[g] = await records(g);
      const c = await redis('GET', prefix + 'content');
      data.content = c ? JSON.parse(c) : null;
      return res.json(data);
    }
    if (action === 'publish' && req.method === 'POST') {
      const b = req.body || {};
      const d = { headline: text(b.headline, 150), intro: text(b.intro, 1500), email: text(b.email, 254), phone: text(b.phone, 40), whatsapp: text(b.whatsapp, 20).replace(/[^0-9]/g, '') };
      if (d.whatsapp && d.whatsapp.length < 8) throw Error('Enter the WhatsApp number with country code, e.g. 919876543210');
      if (!d.headline || !d.intro) throw Error('Headline and introduction are required');
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw Error('Invalid contact email');
      await redis('SET', prefix + 'content', JSON.stringify(d));
      return res.json({ ok: true });
    }
    if (action === 'save' && req.method === 'POST') {
      const { group, record } = req.body || {};
      if (!groups.includes(group) || !record) throw Error('Invalid record');
      const id = record.id || crypto.randomUUID();
      if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw Error('Invalid ID');
      const old = await redis('HGET', prefix + group, id);
      if (record.id && !old) return res.status(404).json({ error: 'Record not found' });
      const now = new Date().toISOString();
      const d = { ...validate(group, record), id, createdAt: old ? JSON.parse(old).createdAt : now, updatedAt: now };
      await redis('HSET', prefix + group, id, JSON.stringify(d));
      return res.json({ ok: true, record: d });
    }
    if (action === 'delete' && req.method === 'POST') {
      const { group, id } = req.body || {};
      if (!groups.includes(group) || typeof id !== 'string') throw Error('Invalid record');
      const old = await redis('HGET', prefix + group, id);
      if (old) {
        await redis('HSET', prefix + 'archive', crypto.randomUUID(), JSON.stringify({ group, record: JSON.parse(old), deletedAt: new Date().toISOString() }));
        await redis('HDEL', prefix + group, id);
      }
      return res.json({ ok: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Studio API:', error.message);
    const storage = error.message === 'Storage unavailable';
    return res.status(storage ? 503 : 400).json({ error: storage ? 'Storage is temporarily unavailable' : error.message });
  }
};
