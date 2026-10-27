'use strict';
/* one9studio — public website behaviour */
document.documentElement.classList.remove('no-js');

/* Mobile menu */
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
document.querySelectorAll('.has-menu > button').forEach(btn => {
  btn.addEventListener('click', () => {
    const li = btn.parentElement;
    const open = li.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.body.classList.remove('nav-open');
  toggle?.setAttribute('aria-expanded', 'false');
  document.querySelectorAll('.has-menu.open').forEach(li => { li.classList.remove('open'); li.querySelector('button')?.setAttribute('aria-expanded', 'false'); });
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

/* Reveal on scroll */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
} else document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* Live content from the dashboard (headline, contact details, WhatsApp number, events) */
(async () => {
  try {
    const state = await fetch('/api/studio?action=status').then(r => r.ok ? r.json() : null);
    if (state?.configured !== true) return;
    const r = await fetch('/api/studio?action=content');
    if (!r.ok) return;
    const { content, events } = await r.json();
    if (content) {
      if (content.headline) document.querySelectorAll('[data-content="headline"]').forEach(el => { el.textContent = content.headline; });
      if (content.intro) document.querySelectorAll('[data-content="intro"]').forEach(el => { el.textContent = content.intro; });
      if (content.email) document.querySelectorAll('[data-content="email"]').forEach(el => { el.textContent = content.email; el.href = 'mailto:' + content.email; });
      if (content.phone) document.querySelectorAll('[data-content="phone"]').forEach(el => { el.textContent = content.phone; el.href = 'tel:' + content.phone.replace(/[^+0-9]/g, ''); });
      const number = String(content.whatsapp || '').replace(/[^0-9]/g, '');
      if (number.length >= 8) document.querySelectorAll('a[data-wa]').forEach(a => { a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(a.dataset.wa); });
    }
    const grid = document.querySelector('[data-events]');
    const upcoming = (events || []).filter(ev => ev.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    if (grid && upcoming.length) {
      const images = [...grid.querySelectorAll('img')].map(img => img.src);
      grid.replaceChildren(...upcoming.map((ev, i) => eventCard(ev, images[i % images.length])));
    }
  } catch { /* keep the built-in content */ }
})();

function eventCard(ev, image) {
  const d = new Date(ev.date + 'T00:00:00');
  const article = document.createElement('article');
  article.className = 'event';
  const thumb = document.createElement('div'); thumb.className = 'thumb';
  const img = document.createElement('img'); img.src = image; img.alt = ''; img.loading = 'lazy';
  const date = document.createElement('div'); date.className = 'date';
  const day = document.createElement('b'); day.textContent = d.getDate();
  date.append(day, d.toLocaleString('en-IN', { month: 'short' }));
  thumb.append(img, date);
  const body = document.createElement('div'); body.className = 'body';
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = [ev.type, ev.city, ev.venue].filter(Boolean).join(' · ');
  const h = document.createElement('h3'); h.textContent = ev.name;
  const p = document.createElement('p'); p.textContent = ev.description || '';
  body.append(meta, h, p);
  article.append(thumb, body);
  return article;
}

/* Header shadow on scroll */
if (header) addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });
