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

/* Header shadow on scroll */
if (header) addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });
