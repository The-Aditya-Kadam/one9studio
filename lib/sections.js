/*
  Section types for the website editor.
  Each type has: label, description, fields (what the dashboard shows) and render(data, ctx) → HTML.
  Field: [key, label, type, options]
    type: text | textarea | image | link | select | toggle | icon | list
    list options: { fields: [...], itemLabel: 'Card' }
  Every value is escaped when rendered. Titles accept line breaks (Enter) which become <br>.
*/
'use strict';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const br = s => esc(s).replace(/\r?\n/g, '<br>');
const paras = s => String(s ?? '').split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${br(p)}</p>`).join('');

// Only allow safe link and image addresses.
function safeUrl(u, { image = false } = {}) {
  u = String(u ?? '').trim();
  if (!u) return '';
  if (/^https:\/\//i.test(u) || /^\/(?!\/)/.test(u)) return u;
  if (!image && (/^#[\w-]*$/.test(u) || /^mailto:[^\s]+$/i.test(u) || /^tel:\+?[\d\s-]+$/i.test(u) || /^http:\/\//i.test(u))) return u;
  return '';
}

const ICONS = {
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4a4 4 0 010 8M22 21c0-3-2-5-4-6"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  handshake: '<path d="M2 12l5-5 4 2 4-2 7 5"/><path d="M7 7l-3 9 4 3 4-3 4 3 4-3-2-6"/>',
  megaphone: '<path d="M3 11v2a1 1 0 001 1h3l8 5V5L7 10H4a1 1 0 00-1 1z"/><path d="M19 9a4 4 0 010 6"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7l2-3h4l2 3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M13 6v12"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
  pin: '<path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
};
const icon = n => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.spark}</svg>`;
const WA_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2-.2-.1-.4-.2z"/></svg>';

// Shared field groups
const BG = ['background', 'Background', 'select', { options: [['', 'Light (default)'], ['white', 'White'], ['dark', 'Dark']] }];
const ANCHOR = ['anchor', 'Section link name (optional, e.g. "work" makes /#work jump here)', 'text'];
const HEAD = [['eyebrow', 'Small label above title', 'text'], ['title', 'Title', 'textarea'], ['intro', 'Intro text', 'textarea']];

// Section wrapper with optional background and anchor
function wrap(d, cls, inner, extraStyle = '') {
  const bg = d.background === 'dark' ? ' dark' : '';
  const style = d.background === 'white' ? 'background:#fff;' : '';
  const id = d.anchor && /^[a-z0-9-]+$/i.test(d.anchor) ? ` id="${esc(d.anchor)}"` : '';
  const st = style + extraStyle;
  return `<section class="${cls}${bg}"${id}${st ? ` style="${st}"` : ''}>${inner}</section>\n`;
}
function head(d, { right = true } = {}) {
  if (!d.eyebrow && !d.title && !d.intro) return '';
  return `<div class="section-head rv"><div>${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}${d.title ? `<h2>${br(d.title)}</h2>` : ''}</div>${right && d.intro ? `<p>${br(d.intro)}</p>` : ''}</div>`;
}
const img = (src, alt = '', attrs = 'loading="lazy"') => { const u = safeUrl(src, { image: true }); return u ? `<img src="${esc(u)}" alt="${esc(alt)}" ${attrs}>` : ''; };
const items = d => Array.isArray(d.items) ? d.items : [];

const TYPES = {
  hero: {
    label: 'Home hero (big headline + photo collage)', group: 'Headers',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Headline (white part)', 'textarea'], ['highlight', 'Headline (yellow part)', 'textarea'], ['intro', 'Intro text', 'textarea'],
      ['primaryText', 'WhatsApp button text', 'text'], ['secondaryText', 'Second button text', 'text'], ['secondaryLink', 'Second button link', 'link'],
      ['stats', 'Numbers under the buttons', 'list', { itemLabel: 'Number', fields: [['value', 'Number', 'text'], ['label', 'Label', 'text']] }],
      ['image1', 'Large photo', 'image'], ['image2', 'Top-right photo', 'image'], ['image3', 'Bottom photo', 'image'],
      ['chip1Value', 'Badge 1 number', 'text'], ['chip1Label', 'Badge 1 text', 'text'], ['chip2Value', 'Badge 2 number', 'text'], ['chip2Label', 'Badge 2 text', 'text']],
    render: (d, c) => `<section class="hero"><div class="wrap hero-grid"><div class="rv">
${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}<h1>${br(d.title)}${d.highlight ? ` <em>${br(d.highlight)}</em>` : ''}</h1>
${d.intro ? `<p class="lead">${br(d.intro)}</p>` : ''}
<div class="hero-actions"><a class="btn btn-wa" ${c.wa(c.topic)}>${WA_ICON} ${esc(d.primaryText || 'Chat on WhatsApp')}</a>${d.secondaryText ? `<a class="btn btn-ghost" href="${esc(safeUrl(d.secondaryLink) || '#')}">${esc(d.secondaryText)}</a>` : ''}</div>
${(d.stats || []).length ? `<div class="hero-proof">${d.stats.map(s => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div>` : ''}
</div><div class="collage rv" aria-hidden="true">
${d.image1 ? `<figure class="c1">${img(d.image1, '', 'fetchpriority="high"')}</figure>` : ''}${d.image2 ? `<figure class="c2">${img(d.image2, '', '')}</figure>` : ''}${d.image3 ? `<figure class="c3">${img(d.image3, '', '')}</figure>` : ''}
${d.chip1Value ? `<div class="chip chip-1"><i>${icon('chart')}</i><div><b>${esc(d.chip1Value)}</b>${esc(d.chip1Label)}</div></div>` : ''}${d.chip2Value ? `<div class="chip chip-2"><i>${icon('star')}</i><div><b>${esc(d.chip2Value)}</b>${esc(d.chip2Label)}</div></div>` : ''}
</div></div></section>\n`,
  },

  page_hero: {
    label: 'Page header (title + photo)', group: 'Headers',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['intro', 'Intro text', 'textarea'], ['image', 'Photo', 'image'],
      ['primaryText', 'WhatsApp button text', 'text'], ['secondaryText', 'Second button text (optional)', 'text'], ['secondaryLink', 'Second button link', 'link'],
      ['breadcrumb', 'Show "Home / …" trail', 'toggle']],
    render: (d, c) => `<section class="page-hero"><div class="wrap"><div class="rv">
${d.breadcrumb ? `<ol class="crumbs"><li><a href="/">Home</a></li>${c.page.isService ? '<li><a href="/#services">Services</a></li>' : ''}<li aria-current="page">${esc(c.page.title)}</li></ol>` : ''}
${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}<h1>${br(d.title)}</h1>${d.intro ? `<p class="lead">${br(d.intro)}</p>` : ''}
<div class="hero-actions"><a class="btn btn-wa" ${c.wa(c.topic)}>${WA_ICON} ${esc(d.primaryText || 'Talk to us on WhatsApp')}</a>${d.secondaryText ? `<a class="btn btn-ghost" href="${esc(safeUrl(d.secondaryLink) || '#')}">${esc(d.secondaryText)}</a>` : ''}</div>
</div>${d.image ? `<figure class="rv">${img(d.image, c.page.title, 'fetchpriority="high"')}</figure>` : ''}</div></section>\n`,
  },

  logo_strip: {
    label: 'Logo / brand strip', group: 'Social proof',
    fields: [['label', 'Text on the left', 'text'], ['items', 'Brands', 'list', { itemLabel: 'Brand', fields: [['name', 'Brand name', 'text'], ['image', 'Logo (optional, replaces the name)', 'image']] }]],
    render: d => `<section class="strip"><div class="wrap">${d.label ? `<p>${esc(d.label)}</p>` : ''}<ul>${items(d).map(i => `<li>${i.image ? img(i.image, i.name) : esc(i.name)}</li>`).join('')}</ul></div></section>\n`,
  },

  cards: {
    label: 'Cards with photos (e.g. services)', group: 'Content',
    fields: [...HEAD, ['numbered', 'Show numbers 01, 02…', 'toggle'],
      ['items', 'Cards', 'list', { itemLabel: 'Card', fields: [['title', 'Title', 'text'], ['text', 'Text', 'textarea'], ['image', 'Photo', 'image'], ['link', 'Link (e.g. /brand-management)', 'link'], ['linkText', 'Link text', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="services-grid${items(d).length === 7 ? '' : ' grid-auto'}">${items(d).map((i, n) => {
      const href = safeUrl(i.link); const tag = href ? 'a' : 'div';
      return `<${tag} class="service-card rv"${href ? ` href="${esc(href)}"` : ''}>${i.image ? `<div class="thumb">${img(i.image)}</div>` : ''}<div class="body">${d.numbered ? `<span class="num">${String(n + 1).padStart(2, '0')}</span>` : ''}<h3>${esc(i.title)}</h3>${i.text ? `<p>${br(i.text)}</p>` : ''}${href ? `<span class="more">${esc(i.linkText || 'Learn more')} <span class="arrow">→</span></span>` : ''}</div></${tag}>`;
    }).join('')}</div></div>`),
  },

  features: {
    label: 'Feature boxes with icons', group: 'Content',
    fields: [...HEAD, ['items', 'Boxes', 'list', { itemLabel: 'Box', fields: [['icon', 'Icon', 'icon'], ['title', 'Title', 'text'], ['text', 'Text', 'textarea']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="caps">${items(d).map(i => `<div class="cap rv"><div class="ico">${icon(i.icon)}</div><h3>${esc(i.title)}</h3><p>${br(i.text)}</p></div>`).join('')}</div></div>`),
  },

  steps: {
    label: 'Numbered steps (process)', group: 'Content',
    fields: [...HEAD, ['items', 'Steps', 'list', { itemLabel: 'Step', fields: [['title', 'Title', 'text'], ['text', 'Text', 'textarea']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<ol class="process${d.background === 'dark' ? '' : ' light-process'}">${items(d).map(i => `<li class="rv"><h3>${esc(i.title)}</h3><p>${br(i.text)}</p></li>`).join('')}</ol></div>`),
  },

  stats: {
    label: 'Big numbers', group: 'Social proof',
    fields: [...HEAD, ['items', 'Numbers', 'list', { itemLabel: 'Number', fields: [['value', 'Number (e.g. 250+)', 'text'], ['label', 'Label', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="stats">${items(d).map(i => `<div class="stat rv"><strong>${esc(i.value)}</strong><span>${esc(i.label)}</span></div>`).join('')}</div></div>`),
  },

  work: {
    label: 'Work / project cards with results', group: 'Social proof',
    fields: [...HEAD, ['items', 'Projects', 'list', { itemLabel: 'Project', fields: [['tag', 'Tag (e.g. service name)', 'text'], ['title', 'Title', 'text'], ['image', 'Photo', 'image'], ['value1', 'Result 1 number', 'text'], ['label1', 'Result 1 label', 'text'], ['value2', 'Result 2 number', 'text'], ['label2', 'Result 2 label', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="work-grid">${items(d).map((i, n) => `<article class="work-card rv">${i.image ? `<div class="thumb">${img(i.image)}</div>` : ''}<div class="body">${i.tag ? `<span class="tag${n % 2 ? ' gold' : ''}">${esc(i.tag)}</span>` : ''}<h3>${esc(i.title)}</h3>${i.value1 || i.value2 ? `<div class="result">${i.value1 ? `<div><b>${esc(i.value1)}</b><span>${esc(i.label1)}</span></div>` : ''}${i.value2 ? `<div><b>${esc(i.value2)}</b><span>${esc(i.label2)}</span></div>` : ''}</div>` : ''}</div></article>`).join('')}</div></div>`),
  },

  people: {
    label: 'People / roster cards', group: 'Social proof',
    fields: [...HEAD, ['items', 'People', 'list', { itemLabel: 'Person', fields: [['image', 'Photo', 'image'], ['name', 'Name', 'text'], ['role', 'Role / details', 'text'], ['badge', 'Badge (e.g. Influencer)', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="roster">${items(d).map(i => `<article class="person rv">${img(i.image, i.name)}${i.badge ? `<span class="badge">${esc(i.badge)}</span>` : ''}<div class="info"><h3>${esc(i.name)}</h3><p>${esc(i.role)}</p></div></article>`).join('')}</div></div>`),
  },

  events: {
    label: 'Events list', group: 'Content',
    fields: [...HEAD, ['useDashboardEvents', 'Show events marked "Published" in Events & Shows instead of the list below (when there are any upcoming)', 'toggle'],
      ['items', 'Events', 'list', { itemLabel: 'Event', fields: [['image', 'Photo', 'image'], ['date', 'Date (YYYY-MM-DD)', 'text'], ['meta', 'Type · City · Venue', 'text'], ['title', 'Event name', 'text'], ['text', 'Short description', 'textarea']] }], BG, ANCHOR],
    render: (d, c) => {
      let list = items(d);
      if (d.useDashboardEvents && c.events?.length) {
        const imgs = list.map(i => i.image).filter(Boolean);
        list = c.events.slice(0, 3).map((e, n) => ({ image: imgs[n % (imgs.length || 1)], date: e.date, meta: [e.type, e.city, e.venue].filter(Boolean).join(' · '), title: e.name, text: e.description }));
      }
      return wrap(d, 'section', `<div class="wrap">${head(d)}<div class="events">${list.map(i => {
        const dt = /^\d{4}-\d{2}-\d{2}$/.test(i.date || '') ? new Date(i.date + 'T00:00:00') : null;
        return `<article class="event rv"><div class="thumb">${img(i.image)}${dt ? `<div class="date"><b>${dt.getDate()}</b>${dt.toLocaleString('en-US', { month: 'short' })}</div>` : ''}</div><div class="body">${i.meta ? `<div class="meta">${esc(i.meta)}</div>` : ''}<h3>${esc(i.title)}</h3><p>${br(i.text)}</p></div></article>`;
      }).join('')}</div></div>`);
    },
  },

  testimonials: {
    label: 'Testimonials', group: 'Social proof',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['items', 'Quotes', 'list', { itemLabel: 'Quote', fields: [['quote', 'Quote', 'textarea'], ['name', 'Name', 'text'], ['role', 'Role / company', 'text'], ['image', 'Photo', 'image']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="quotes">${items(d).map(i => `<figure class="quote rv"><blockquote>“${br(i.quote)}”</blockquote><figcaption>${img(i.image)}<div><b>${esc(i.name)}</b><span>${esc(i.role)}</span></div></figcaption></figure>`).join('')}</div></div>`),
  },

  cta: {
    label: 'Call-to-action band (pink)', group: 'Calls to action',
    fields: [['title', 'Text', 'textarea'], ['buttonText', 'Button text (opens WhatsApp)', 'text'], BG, ANCHOR],
    render: (d, c) => wrap(d, 'section', `<div class="wrap"><div class="cta-band rv"><h2>${br(d.title)}</h2><a class="btn btn-light" ${c.wa(c.topic)}>${WA_ICON} ${esc(d.buttonText || 'Chat on WhatsApp')}</a></div></div>`, 'padding-top:0;'),
  },

  text_image: {
    label: 'Text + photo side by side', group: 'Content',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['text', 'Text', 'textarea'], ['bullets', 'Tick-list points', 'list', { itemLabel: 'Point', fields: [['text', 'Point', 'text']] }],
      ['image', 'Photo', 'image'], ['imageSide', 'Photo position', 'select', { options: [['left', 'Left'], ['right', 'Right']] }], BG, ANCHOR],
    render: d => {
      const fig = d.image ? `<figure class="rv">${img(d.image)}</figure>` : '';
      const txt = `<div class="rv">${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}${d.title ? `<h2>${br(d.title)}</h2>` : ''}${d.text ? `<div class="muted">${paras(d.text)}</div>` : ''}${(d.bullets || []).length ? `<ul class="checks">${d.bullets.map(b => `<li>${esc(b.text)}</li>`).join('')}</ul>` : ''}</div>`;
      return wrap(d, 'section', `<div class="wrap split">${d.imageSide === 'right' ? txt + fig : fig + txt}</div>`);
    },
  },

  case_study: {
    label: 'Case study (results + photo)', group: 'Social proof',
    fields: [['eyebrow', 'Small label', 'text'], ['tag', 'Tag (e.g. Beauty · Launch)', 'text'], ['title', 'Title', 'textarea'], ['text', 'Text', 'textarea'], ['image', 'Photo', 'image'],
      ['results', 'Results', 'list', { itemLabel: 'Result', fields: [['value', 'Number', 'text'], ['label', 'Label', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap split"><div class="rv">${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}${d.tag ? `<span class="tag">${esc(d.tag)}</span>` : ''}<h2>${br(d.title)}</h2>${d.text ? `<p class="muted">${br(d.text)}</p>` : ''}<div class="case-results">${(d.results || []).map(r => `<div><b>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`).join('')}</div></div>${d.image ? `<figure class="rv">${img(d.image)}</figure>` : ''}</div>`).replace('<section class="section', '<section class="section case'),
  },

  faq: {
    label: 'FAQ (questions & answers)', group: 'Content',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['items', 'Questions', 'list', { itemLabel: 'Question', fields: [['question', 'Question', 'text'], ['answer', 'Answer', 'textarea']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="faq rv">${items(d).map((i, n) => `<details${n === 0 ? ' open' : ''}><summary>${esc(i.question)}</summary><p>${br(i.answer)}</p></details>`).join('')}</div></div>`),
  },

  service_links: {
    label: 'Links to other service pages (automatic)', group: 'Navigation',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], BG, ANCHOR],
    render: (d, c) => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="other-services rv">${c.site.pages.filter(p => p.isService && p.id !== c.page.id && !p.hidden).map(p => `<a href="${esc(c.href(p))}">${esc(p.title)} →</a>`).join('')}</div></div>`),
  },

  contact: {
    label: 'Contact (WhatsApp, email, phone, address)', group: 'Calls to action',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['text', 'Text', 'textarea'], ['cardTitle', 'WhatsApp box title', 'text'], ['cardText', 'WhatsApp box text', 'textarea'],
      ['buttonText', 'Big button text (blank = automatic)', 'text'], ['showTopics', 'Show one WhatsApp button per service', 'toggle'], ANCHOR],
    render: (d, c) => {
      const s = c.site.settings;
      const services = c.site.pages.filter(p => p.isService && !p.hidden && p.title !== c.topic);
      return `<section class="section dark" id="${esc(d.anchor && /^[a-z0-9-]+$/i.test(d.anchor) ? d.anchor : 'contact')}"><div class="wrap contact-grid"><div class="rv">
${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}<h2>${br(d.title)}</h2>${d.text ? `<p class="muted">${br(d.text)}</p>` : ''}
<ul class="contact-list">
${s.email ? `<li><i>${icon('mail')}</i><div><small>Email</small><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div></li>` : ''}
${s.phone ? `<li><i>${icon('phone')}</i><div><small>Phone / WhatsApp</small><a href="tel:${esc(String(s.phone).replace(/[^+0-9]/g, ''))}">${esc(s.phone)}</a></div></li>` : ''}
${s.address ? `<li><i>${icon('pin')}</i><div><small>Studio</small>${br(s.address)}</div></li>` : ''}
</ul></div>
<div class="wa-card rv"><div class="wa-head"><span class="wa-badge">${WA_ICON}</span><div><h3>${esc(d.cardTitle || 'Chat with us on WhatsApp')}</h3>${d.cardText ? `<p class="muted">${br(d.cardText)}</p>` : ''}</div></div>
<a class="btn btn-wa btn-lg" ${c.wa(c.topic)}>${WA_ICON} ${esc(d.buttonText || (c.topic ? 'Ask about ' + c.topic : 'Start a WhatsApp chat'))}</a>
${d.showTopics && services.length ? `<p class="wa-label">Or pick a topic</p><div class="wa-topics">${services.map(p => `<a ${c.wa(p.title)}>${esc(p.title)}<span>→</span></a>`).join('')}</div>` : ''}
</div></div></section>\n`;
    },
  },

  rich_text: {
    label: 'Text block', group: 'Content',
    fields: [['eyebrow', 'Small label', 'text'], ['title', 'Title', 'textarea'], ['body', 'Text (leave an empty line between paragraphs)', 'textarea'], ['align', 'Alignment', 'select', { options: [['left', 'Left'], ['center', 'Centre']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap"><div class="rich rv${d.align === 'center' ? ' center' : ''}">${d.eyebrow ? `<span class="eyebrow">${esc(d.eyebrow)}</span>` : ''}${d.title ? `<h2>${br(d.title)}</h2>` : ''}${paras(d.body)}</div></div>`),
  },

  gallery: {
    label: 'Photo gallery', group: 'Content',
    fields: [...HEAD, ['items', 'Photos', 'list', { itemLabel: 'Photo', fields: [['image', 'Photo', 'image'], ['caption', 'Caption (optional)', 'text']] }], BG, ANCHOR],
    render: d => wrap(d, 'section', `<div class="wrap">${head(d)}<div class="gallery">${items(d).filter(i => i.image).map(i => `<figure class="rv">${img(i.image, i.caption)}${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`).join('')}</div></div>`),
  },

  banner: {
    label: 'Full-width photo banner', group: 'Calls to action',
    fields: [['image', 'Background photo', 'image'], ['title', 'Title', 'textarea'], ['text', 'Text', 'textarea'], ['buttonText', 'Button text (optional)', 'text'], ['buttonLink', 'Button link (blank = WhatsApp)', 'link'], ANCHOR],
    render: (d, c) => {
      const u = safeUrl(d.image, { image: true });
      const link = safeUrl(d.buttonLink);
      return `<section class="banner"${d.anchor && /^[a-z0-9-]+$/i.test(d.anchor) ? ` id="${esc(d.anchor)}"` : ''}${u ? ` style="background-image:linear-gradient(90deg,rgba(11,12,20,.88),rgba(11,12,20,.35)),url('${esc(u)}')"` : ''}><div class="wrap rv">${d.title ? `<h2>${br(d.title)}</h2>` : ''}${d.text ? `<p>${br(d.text)}</p>` : ''}${d.buttonText ? (link ? `<a class="btn btn-primary" href="${esc(link)}">${esc(d.buttonText)}</a>` : `<a class="btn btn-wa" ${c.wa(c.topic)}>${WA_ICON} ${esc(d.buttonText)}</a>`) : ''}</div></section>\n`;
    },
  },
};

// Field definitions only (sent to the dashboard)
function schema() {
  const out = {};
  for (const [k, t] of Object.entries(TYPES)) out[k] = { label: t.label, group: t.group, fields: t.fields };
  return { types: out, icons: Object.keys(ICONS) };
}

module.exports = { TYPES, schema, esc, br, safeUrl, icon, WA_ICON, ICONS };
