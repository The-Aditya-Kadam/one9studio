/*
  Storage for one9studio.
  - On Vercel: Upstash Redis (REST) for data, Vercel Blob for uploaded images.
  - Local preview (scripts/dev-server.js sets ONE9_DEV_STORE): a JSON file and a local uploads folder,
    so the whole site and dashboard can be tested without touching live data.
*/
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEV = process.env.ONE9_DEV_STORE || '';
const PREFIX = 'one9studio:v1:';

function redisUrl() { return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL; }
function redisToken() { return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN; }
function configured() { return Boolean(DEV || (redisUrl() && redisToken())); }

/* ---------- local JSON store (preview only) ---------- */
function devLoad() { try { return JSON.parse(fs.readFileSync(DEV, 'utf8')); } catch { return {}; } }
function devSave(db) { fs.mkdirSync(path.dirname(DEV), { recursive: true }); fs.writeFileSync(DEV, JSON.stringify(db)); }
function devCommand(cmd, key, ...a) {
  const db = devLoad();
  let r = null;
  switch (cmd) {
    case 'GET': r = db[key] ?? null; break;
    case 'SET': db[key] = a[0]; r = 'OK'; break;
    case 'DEL': delete db[key]; r = 1; break;
    case 'HGET': r = db[key]?.[a[0]] ?? null; break;
    case 'HSET': (db[key] ??= {})[a[0]] = a[1]; r = 1; break;
    case 'HDEL': if (db[key]) delete db[key][a[0]]; r = 1; break;
    case 'HGETALL': r = Object.entries(db[key] || {}).flat(); break;
    case 'INCR': db[key] = (Number(db[key]) || 0) + 1; r = db[key]; break;
    case 'EXPIRE': r = 1; break;
    default: throw Error('Unsupported dev command ' + cmd);
  }
  if (!['GET', 'HGET', 'HGETALL'].includes(cmd)) devSave(db);
  return r;
}

/* ---------- Redis command ---------- */
async function command(...args) {
  if (DEV) return devCommand(...args);
  const r = await fetch(redisUrl(), { method: 'POST', headers: { Authorization: `Bearer ${redisToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(8000) });
  const d = await r.json();
  if (!r.ok || d.error) throw Error('Storage unavailable');
  return d.result;
}

/* ---------- Image uploads ---------- */
function uploadsConfigured() { return Boolean(DEV || process.env.BLOB_READ_WRITE_TOKEN); }
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };

async function uploadImage(buffer, contentType, originalName) {
  const ext = TYPES[contentType];
  if (!ext) throw Error('Only JPG, PNG, WebP, GIF or SVG images can be uploaded');
  const base = String(originalName || 'image').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const name = `${base}-${crypto.randomBytes(5).toString('hex')}.${ext}`;
  if (DEV) {
    const dir = path.join(path.dirname(DEV), 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
    return '/dev-uploads/' + name;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw Error('Image uploads are not set up yet (Vercel Blob storage is missing)');
  const { put } = require('@vercel/blob');
  const blob = await put('site/' + name, buffer, { access: 'public', contentType, addRandomSuffix: false });
  return blob.url;
}

module.exports = { command, configured, uploadsConfigured, uploadImage, PREFIX, DEV };
