/*
  Builds website pages from the site content stored in the database
  (falls back to lib/default-site.json if nothing has been saved yet or the database is unreachable).
*/
'use strict';
const { TYPES, esc, safeUrl, WA_ICON } = require('./sections');
const store = require('./store');
const DEFAULT_SITE = require('./default-site.json');

const SITE_KEY = store.PREFIX + 'site';
const ASSET_VERSION = '5';

/* ---------- Loading & normalising ---------- */
function clone(x) { return JSON.parse(JSON.stringify(x)); }

function normalise(site) {
  const d = clone(DEFAULT_SITE);
  if (!site || typeof site !== 'object' || !Array.isArray(site.pages) || !site.pages.length) return d;
  site.settings = { ...d.settings, ...(site.settings || {}) };
  for (const p of site.pages) { p.sections = Array.isArray(p.sections) ? p.sections : []; p.path = p.path || ''; }
  if (!site.pages.some(p => p.path === '')) site.pages.unshift(d.pages[0]);
  return site;
}

async function loadSite() {
  if (!store.configured()) return { site: normalise(null), saved: false };
  try {
    const raw = await store.command('GET', SITE_KEY);
    return { site: normalise(raw ? JSON.parse(raw) : null), saved: Boolean(raw) };
  } catch { return { site: normalise(null), saved: false, error: true }; }
}

async function loadEvents() {
  if (!store.configured()) return [];
  try {
    const raw = await store.command('HGETALL', store.PREFIX + 'events');
    const today = new Date().toISOString().slice(0, 10);
    const list = [];
    for (let i = 1; i < (raw || []).length; i += 2) { try { list.push(JSON.parse(raw[i])); } catch { /* skip */ } }
    return list.filter(e => e.status === 'Published' && e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  } catch { return []; }
}

/* ---------- Helpers ---------- */
const href = p => '/' + (p.path || '');
function makeWa(settings) {
  const number = String(settings.whatsapp || '').replace(/[^0-9]/g, '');
  return topic => {
    const msg = topic ? String(settings.waServiceMessage || "I'm interested in {service}").replace('{service}', topic) : String(settings.waMessage || 'Hi!');
    return `href="https://wa.me/${number}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener"`;
  };
}

/* ---------- Page chrome ---------- */
function headHtml(site, page) {
  const s = site.settings;
  const title = page.seoTitle || `${page.title} — ${s.siteName}`;
  const desc = page.seoDescription || s.tagline || '';
  const url = (s.domain || '').replace(/\/$/, '') + href(page);
  const og = safeUrl(page.ogImage, { image: true });
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${og ? `<meta property="og:image" content="${esc(og)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0c14">
${page.hidden ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/assets/one9/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/assets/one9/one9.css?v=${ASSET_VERSION}">
</head>
<body>
`;
}

function brandHtml(s) {
  const name = String(s.siteName || 'one9studio');
  const m = name.match(/^(one9)(.*)$/i);
  return `<img src="/assets/one9/logo.svg" alt="" width="38" height="38"><span>${m ? `${esc(m[1])}<b>${esc(m[2])}</b>` : esc(name)}</span>`;
}

function navHtml(site, page, ctx) {
  const s = site.settings;
  const services = site.pages.filter(p => p.isService && p.inMenu && !p.hidden);
  const extraPages = site.pages.filter(p => !p.isService && p.inMenu && !p.hidden && p.path);
  const links = [...(s.menu || []).filter(m => m.label && safeUrl(m.link)).map(m => ({ label: m.label, link: safeUrl(m.link) })), ...extraPages.map(p => ({ label: p.title, link: href(p), current: p.id === page.id }))];
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap nav">
<a class="brand" href="/" aria-label="${esc(s.siteName)} home">${brandHtml(s)}</a>
<ul class="nav-links" id="nav-links">
${services.length ? `<li class="has-menu"><button type="button" aria-expanded="false" aria-controls="services-menu">Services ▾</button><div class="menu" id="services-menu">${services.map(p => `<a href="${esc(href(p))}"${p.id === page.id ? ' aria-current="page"' : ''}><strong>${esc(p.title)}</strong>${p.menuText ? `<small>${esc(p.menuText)}</small>` : ''}</a>`).join('')}</div></li>` : ''}
${links.map(l => `<li><a href="${esc(l.link)}"${l.current ? ' aria-current="page"' : ''}>${esc(l.label)}</a></li>`).join('')}
<li class="mobile-cta"><a class="btn btn-wa" ${ctx.wa(ctx.topic)}>${WA_ICON} ${esc(s.headerButtonText || 'Chat on WhatsApp')}</a></li>
</ul>
<div class="nav-cta"><a class="btn btn-wa" ${ctx.wa(ctx.topic)}>${WA_ICON} ${esc(s.headerButtonText || 'Chat on WhatsApp')}</a>
<button class="menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button></div>
</div></header>
`;
}

function footerHtml(site, ctx) {
  const s = site.settings;
  const services = site.pages.filter(p => p.isService && !p.hidden);
  const others = site.pages.filter(p => !p.isService && !p.hidden && p.path && p.inMenu);
  const half = Math.ceil(services.length / 2);
  const socials = (s.socials || []).filter(x => safeUrl(x.link));
  return `<footer class="site-footer"><div class="wrap"><div class="footer-grid">
<div><a class="brand" href="/">${brandHtml(s)}</a>${s.tagline ? `<p class="footer-tag">${esc(s.tagline)}.</p>` : ''}
${socials.length ? `<div class="socials">${socials.map(x => `<a href="${esc(safeUrl(x.link))}" target="_blank" rel="noopener" aria-label="${esc(x.name || x.label)}">${esc(x.label)}</a>`).join('')}</div>` : ''}</div>
<div><h4>Services</h4><ul>${services.slice(0, half).map(p => `<li><a href="${esc(href(p))}">${esc(p.title)}</a></li>`).join('')}</ul></div>
<div><h4>&nbsp;</h4><ul>${services.slice(half).map(p => `<li><a href="${esc(href(p))}">${esc(p.title)}</a></li>`).join('')}</ul></div>
<div><h4>Studio</h4><ul>${(s.menu || []).filter(m => m.label && safeUrl(m.link)).map(m => `<li><a href="${esc(safeUrl(m.link))}">${esc(m.label)}</a></li>`).join('')}${others.map(p => `<li><a href="${esc(href(p))}">${esc(p.title)}</a></li>`).join('')}${s.email ? `<li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>` : ''}</ul></div>
</div>
<div class="footer-bottom"><span>© <span data-year>${new Date().getFullYear()}</span> ${esc(s.siteName)}. All rights reserved.</span><span>${esc(s.footerNote || '')}</span></div>
</div></footer>
${s.showFloatingButton !== false ? `<a class="wa-float" ${ctx.wa(ctx.topic)} aria-label="Chat on WhatsApp">${WA_ICON}<span>${esc(s.floatingButtonText || 'Chat with us')}</span></a>` : ''}
<script src="/assets/one9/one9.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>
`;
}

/* ---------- Pages ---------- */
function renderPage(site, page, events = []) {
  const ctx = { site, page, events, href, wa: makeWa(site.settings), topic: page.isService ? page.title : (page.whatsappTopic || null) };
  let body = '';
  for (const sec of page.sections || []) {
    if (sec.hidden) continue;
    const type = TYPES[sec.type];
    if (!type) continue;
    try { body += type.render(sec.data || {}, ctx); }
    catch (e) { body += `<!-- section ${esc(sec.type)} could not be shown -->`; }
  }
  return headHtml(site, page) + navHtml(site, page, ctx) + `<main id="main">\n${body}</main>\n` + footerHtml(site, ctx);
}

function notFound(site) {
  const page = { id: '404', path: '404', title: 'Page not found', seoTitle: 'Page not found — ' + site.settings.siteName, hidden: true, sections: [] };
  const ctx = { site, page, href, wa: makeWa(site.settings), topic: null };
  return headHtml(site, page) + navHtml(site, page, ctx) + `<main id="main"><section class="page-hero"><div class="wrap"><div><span class="eyebrow">404</span><h1>Page not found.</h1><p class="lead">The page you’re looking for doesn’t exist or has moved.</p><div class="hero-actions"><a class="btn btn-primary" href="/">Go to the home page</a></div></div></div></section></main>\n` + footerHtml(site, ctx);
}

function sitemap(site) {
  const base = (site.settings.domain || '').replace(/\/$/, '');
  const urls = [...site.pages.filter(p => !p.hidden).map(href), '/suppliers', '/diwali-edit'];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(base + u)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

async function render(pathname, { preview = false } = {}) {
  const clean = String(pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  const { site } = await loadSite();
  if (clean === 'sitemap.xml') return { status: 200, type: 'application/xml; charset=utf-8', body: sitemap(site) };
  const page = site.pages.find(p => (p.path || '') === clean);
  if (!page || (page.hidden && !preview)) return { status: 404, type: 'text/html; charset=utf-8', body: notFound(site) };
  const needsEvents = page.sections.some(s => s.type === 'events' && !s.hidden && s.data?.useDashboardEvents);
  const events = needsEvents ? await loadEvents() : [];
  return { status: 200, type: 'text/html; charset=utf-8', body: renderPage(site, page, events) };
}

module.exports = { render, loadSite, normalise, renderPage, SITE_KEY, DEFAULT_SITE };
