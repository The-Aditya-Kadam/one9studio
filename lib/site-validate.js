/*
  Checks and cleans website content before it is saved.
  Unknown fields are dropped, text is length-limited, page addresses are checked.
*/
'use strict';
const { TYPES } = require('./sections');

const RESERVED = ['api', 'assets', 'dashboard', 'suppliers', 'diwali-edit', 'coming-soon', 'scripts', 'lib', 'sitemap.xml', 'robots.txt', 'dev-uploads', '404'];
const LIMITS = { text: 300, textarea: 6000, link: 500, image: 1200, icon: 30, select: 40 };

const str = (v, max) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '').slice(0, max);
const bool = v => v === true || v === 'true' || v === 'on';
const id = (v, fallback) => (typeof v === 'string' && /^[a-z0-9-]{1,60}$/i.test(v) ? v : fallback());
const newId = p => () => p + '-' + Math.random().toString(36).slice(2, 10);

function cleanFields(fields, data) {
  const out = {};
  data = data && typeof data === 'object' ? data : {};
  for (const [key, , type, opts] of fields) {
    if (type === 'toggle') out[key] = bool(data[key]);
    else if (type === 'list') out[key] = (Array.isArray(data[key]) ? data[key] : []).slice(0, 40).map(item => cleanFields(opts.fields, item));
    else if (type === 'select') { const allowed = opts.options.map(o => o[0]); out[key] = allowed.includes(data[key]) ? data[key] : allowed[0]; }
    else out[key] = str(data[key], LIMITS[type] || 300);
  }
  return out;
}

function cleanSettings(s) {
  s = s && typeof s === 'object' ? s : {};
  const whatsapp = str(s.whatsapp, 20).replace(/[^0-9]/g, '');
  if (whatsapp && whatsapp.length < 8) throw Error('Enter the WhatsApp number with country code, e.g. 918355874139');
  const email = str(s.email, 254).trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Enter a valid contact email');
  const link = o => ({ label: str(o?.label, 60), link: str(o?.link, 500), name: str(o?.name, 60) });
  return {
    siteName: str(s.siteName, 60) || 'one9studio', domain: str(s.domain, 120), tagline: str(s.tagline, 300),
    email, phone: str(s.phone, 40), whatsapp, address: str(s.address, 300),
    waMessage: str(s.waMessage, 300), waServiceMessage: str(s.waServiceMessage, 300),
    headerButtonText: str(s.headerButtonText, 40), floatingButtonText: str(s.floatingButtonText, 40), showFloatingButton: s.showFloatingButton !== false && s.showFloatingButton !== 'false',
    menu: (Array.isArray(s.menu) ? s.menu : []).slice(0, 12).map(link).filter(m => m.label),
    socials: (Array.isArray(s.socials) ? s.socials : []).slice(0, 10).map(link).filter(m => m.label),
    footerNote: str(s.footerNote, 120),
  };
}

function cleanSite(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.pages)) throw Error('Invalid website content');
  const settings = cleanSettings(input.settings);
  const seenPaths = new Set();
  const seenIds = new Set();
  const pages = input.pages.slice(0, 60).map(p => {
    p = p && typeof p === 'object' ? p : {};
    const path = str(p.path, 60).trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    if (path && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(path)) throw Error(`Page address "${path}" can only use small letters, numbers and dashes`);
    if (RESERVED.includes(path)) throw Error(`The page address "/${path}" is reserved — choose another one`);
    if (seenPaths.has(path)) throw Error(path ? `Two pages use the address "/${path}"` : 'Only one page can be the home page');
    seenPaths.add(path);
    const title = str(p.title, 100).trim();
    if (!title) throw Error('Every page needs a name');
    let pid = id(p.id, newId('p'));
    if (seenIds.has(pid)) pid = newId('p')();
    seenIds.add(pid);
    const sections = (Array.isArray(p.sections) ? p.sections : []).slice(0, 40).filter(s => s && TYPES[s.type]).map(s => ({
      id: id(s.id, newId('s')), type: s.type, hidden: bool(s.hidden), data: cleanFields(TYPES[s.type].fields, s.data),
    }));
    return {
      id: pid, path, title, seoTitle: str(p.seoTitle, 160), seoDescription: str(p.seoDescription, 400), ogImage: str(p.ogImage, 1200),
      isService: bool(p.isService), inMenu: bool(p.inMenu), hidden: path ? bool(p.hidden) : false, menuText: str(p.menuText, 200), whatsappTopic: str(p.whatsappTopic, 100),
      sections,
    };
  });
  if (!seenPaths.has('')) throw Error('The home page is missing');
  const site = { version: 1, settings, pages };
  if (JSON.stringify(site).length > 900000) throw Error('The website content is too large to save');
  return site;
}

module.exports = { cleanSite, RESERVED };
