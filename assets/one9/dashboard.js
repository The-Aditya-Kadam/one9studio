'use strict';
/* one9studio — dashboard */

const SERVICES = ['Brand Management', 'Social Media Management', 'Influencer Management', 'Talent Management', 'Artist Management', 'Brand Collaborations', 'Event & Show Management', 'Not sure yet'];

// Editor fields per record type: [key, label, type, fullWidth]
const FIELDS = {
  inquiries: [['name', 'Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['company', 'Company / brand', 'text'], ['service', 'Service', SERVICES], ['status', 'Status', ['New', 'In progress', 'Contacted', 'Won', 'Closed']], ['message', 'Message', 'textarea', true]],
  brands: [['name', 'Brand', 'text'], ['industry', 'Industry', 'text'], ['contact', 'Contact person', 'text'], ['email', 'Contact email', 'email'], ['retainer', 'Monthly retainer', 'text'], ['status', 'Status', ['Active', 'Onboarding', 'Paused', 'Past']], ['notes', 'Notes', 'textarea', true]],
  social: [['name', 'Account handle', 'text'], ['platform', 'Platform', ['Instagram', 'YouTube', 'LinkedIn', 'X', 'Facebook', 'Snapchat']], ['client', 'Client', 'text'], ['followers', 'Followers', 'number'], ['posts', 'Posts this month', 'number'], ['status', 'Status', ['Active', 'Paused']], ['notes', 'Notes', 'textarea', true]],
  talent: [['name', 'Name', 'text'], ['category', 'Category', ['Influencer', 'Talent', 'Artist']], ['niche', 'Niche / genre', 'text'], ['followers', 'Followers', 'number'], ['city', 'City', 'text'], ['rate', 'Rate', 'text'], ['status', 'Status', ['Available', 'Booked', 'Unavailable']], ['notes', 'Notes', 'textarea', true]],
  campaigns: [['name', 'Collaboration', 'text'], ['brand', 'Brand', 'text'], ['talent', 'Talent / partners', 'text'], ['budget', 'Budget', 'text'], ['date', 'Launch date', 'date'], ['status', 'Status', ['Planning', 'Live', 'Completed', 'Cancelled']], ['notes', 'Notes', 'textarea', true]],
  events: [['name', 'Event / show', 'text'], ['type', 'Type', ['Event', 'Show', 'Concert', 'Brand launch', 'Meet & greet']], ['date', 'Date', 'date'], ['city', 'City', 'text'], ['venue', 'Venue', 'text'], ['status', 'Status', ['Draft', 'Published']], ['description', 'Description', 'textarea', true]],
};
const REQUIRED = { inquiries: ['name'], events: ['name', 'date'] };

const PAGES = {
  overview: { title: 'Overview', sub: 'Your studio at a glance.' },
  inquiries: { group: 'inquiries', title: 'Inquiries', sub: 'Log WhatsApp and direct leads here to track them to a deal.', noun: 'inquiry', cols: [['name', 'Name', r => `<b>${esc(r.name)}</b><small>${esc(r.company || r.email)}</small>`], ['service', 'Service'], ['phone', 'Contact', r => `${esc(r.phone || r.email || '—')}${waLink(r.phone)}`], ['createdAt', 'Received', r => esc(ago(r.createdAt))], ['status', 'Status', pill]] },
  brands: { group: 'brands', title: 'Brand Management', sub: 'Brands we manage, their retainers and status.', noun: 'brand', cols: [['name', 'Brand', r => `<b>${esc(r.name)}</b><small>${esc(r.industry || '')}</small>`], ['contact', 'Contact', r => `${esc(r.contact || '—')}<small>${esc(r.email || '')}</small>`], ['retainer', 'Retainer'], ['status', 'Status', pill]] },
  social: { group: 'social', title: 'Social Media Management', sub: 'Client accounts we run, with audience and output.', noun: 'account', cols: [['name', 'Account', r => `<b>${esc(r.name)}</b><small>${esc(r.platform)}</small>`], ['client', 'Client'], ['followers', 'Followers', r => esc(compact(r.followers))], ['posts', 'Posts this month'], ['status', 'Status', pill]] },
  influencers: { group: 'talent', category: 'Influencer', title: 'Influencers', sub: 'Creators in our influencer network.', noun: 'influencer', cols: rosterCols() },
  talent: { group: 'talent', category: 'Talent', title: 'Talent', sub: 'Hosts, anchors, models and personalities we represent.', noun: 'talent', cols: rosterCols() },
  artists: { group: 'talent', category: 'Artist', title: 'Artists', sub: 'Musicians, DJs, comedians and performers we manage.', noun: 'artist', cols: rosterCols() },
  campaigns: { group: 'campaigns', title: 'Brand Collaborations', sub: 'Partnerships between brands, creators and artists.', noun: 'collaboration', cols: [['name', 'Collaboration', r => `<b>${esc(r.name)}</b><small>${esc(r.brand || '')}</small>`], ['talent', 'Talent / partners'], ['budget', 'Budget'], ['date', 'Launch', r => esc(fmtDate(r.date))], ['status', 'Status', pill]] },
  events: { group: 'events', title: 'Events & Shows', sub: 'Concerts, launches and shows. Published events appear on the website.', noun: 'event', cols: [['name', 'Event', r => `<b>${esc(r.name)}</b><small>${esc(r.type || '')}</small>`], ['date', 'Date', r => esc(fmtDate(r.date))], ['city', 'Location', r => `${esc(r.city || '—')}<small>${esc(r.venue || '')}</small>`], ['status', 'Status', pill]] },
  website: { title: 'Website', sub: 'Edit every page, section, image and setting of the live website.' },
};
// WhatsApp chat link for a lead's phone number (opens in a new tab, does not open the editor)
function waLink(phone) { const n = String(phone || '').replace(/[^0-9]/g, ''); return n.length >= 10 ? `<a class="wa-mini" href="https://wa.me/${n.length === 10 ? '91' + n : n}" target="_blank" rel="noopener" data-stop>WhatsApp ↗</a>` : ''; }
function rosterCols() { return [['name', 'Name', r => `<b>${esc(r.name)}</b><small>${esc(r.niche || '')}</small>`], ['followers', 'Followers', r => esc(compact(r.followers))], ['city', 'City'], ['rate', 'Rate'], ['status', 'Status', pill]]; }

const COLORS = { New: 'pink', 'In progress': 'gold', Contacted: 'blue', Won: 'green', Active: 'green', Onboarding: 'blue', Paused: 'gold', Available: 'green', Booked: 'blue', Planning: 'gold', Live: 'pink', Completed: 'green', Published: 'green' };

const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function pill(r) { return `<span class="pill ${COLORS[r.status] || ''}">${esc(r.status || '—')}</span>`; }
function compact(n) { n = Number(n); if (!n) return '—'; return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n); }
function fmtDate(d) { if (!d) return '—'; const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function ago(iso) { if (!iso) return '—'; const m = Math.round((Date.now() - Date.parse(iso)) / 60000); if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; const d = Math.round(h / 24); return d < 30 ? d + (d === 1 ? ' day ago' : ' days ago') : new Date(iso).toLocaleDateString('en-IN'); }
const today = () => new Date().toISOString().slice(0, 10);
const initials = n => String(n || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

let data = { inquiries: [], brands: [], social: [], talent: [], campaigns: [], events: [], content: null };
let demo = false;
let page = 'overview';
let editing = null;

/* ---------- API ---------- */
async function api(action, body) {
  const r = await fetch('/api/studio?action=' + action, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(Error(d.error || 'Request failed'), { status: r.status });
  return d;
}
async function refresh() { data = await api('read'); render(); }

/* ---------- Boot ---------- */
async function boot() {
  let state = null;
  try { state = await api('status'); } catch { state = null; }
  if (!state || !state.configured) { startDemo(); return; }
  $('#connection').textContent = state.loginDisabled ? 'Live · login off' : 'Live · signed in';
  $('#connection-dot').style.background = '#4bd9a2';
  $('#public-banner').hidden = !state.loginDisabled;
  $('#logout').hidden = state.loginDisabled || !state.authenticated;
  if (!state.authenticated) { $('#login').showModal(); return; }
  try { await refresh(); } catch (e) { alert(e.message); }
}
function startDemo() {
  demo = true;
  data = demoData();
  $('#demo-banner').hidden = false;
  $('#connection').textContent = 'Demo mode · not saved';
  render();
}

/* ---------- Routing ---------- */
function route() {
  page = PAGES[location.hash.slice(1)] ? location.hash.slice(1) : 'overview';
  document.querySelectorAll('.sidebar nav a[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  document.body.classList.remove('nav-open');
  $('#search').value = '';
  render();
  scrollTo(0, 0);
}
addEventListener('hashchange', route);

function render() {
  const p = PAGES[page];
  $('#page-title').textContent = p.title;
  $('#page-sub').textContent = p.sub;
  document.title = p.title + ' — one9studio dashboard';
  $('#add-btn').hidden = !p.group;
  if (p.group) $('#add-btn').textContent = '+ Add ' + p.noun;
  document.querySelectorAll('[data-view]').forEach(v => { v.hidden = v.dataset.view !== (p.group ? 'records' : page); });
  const newCount = data.inquiries.filter(r => r.status === 'New').length;
  $('#badge-inquiries').textContent = newCount || '';
  if (page === 'overview') renderOverview();
  else if (page === 'website') renderWebsite();
  else renderRecords();
}

/* ---------- Overview ---------- */
function renderOverview() {
  const roster = data.talent;
  const upcoming = data.events.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  const live = data.campaigns.filter(c => c.status === 'Live');
  const reach = data.social.filter(s => s.status === 'Active').reduce((t, s) => t + Number(s.followers || 0), 0);
  const kpis = [
    ['New inquiries', data.inquiries.filter(r => r.status === 'New').length, `${data.inquiries.length} total`, '✉', 'c-pink', 'inquiries'],
    ['Active brands', data.brands.filter(b => b.status === 'Active').length, `${data.brands.filter(b => b.status === 'Onboarding').length} onboarding`, '◆', 'c-blue', 'brands'],
    ['Social reach', compact(reach), `${data.social.filter(s => s.status === 'Active').length} active accounts`, '◉', 'c-gold', 'social'],
    ['Roster', roster.length, `${roster.filter(r => r.status === 'Available').length} available`, '★', 'c-green', 'influencers'],
    ['Live collaborations', live.length, `${data.campaigns.filter(c => c.status === 'Planning').length} in planning`, '⇄', 'c-pink', 'campaigns'],
    ['Upcoming events', upcoming.length, upcoming[0] ? 'Next: ' + fmtDate(upcoming[0].date) : 'None scheduled', '▦', 'c-gold', 'events'],
  ];
  $('#kpis').innerHTML = kpis.map(([l, v, s, i, c, to]) => `<a class="kpi" href="#${to}"><i class="${c}">${i}</i><span>${l}</span><strong>${esc(v)}</strong><small>${esc(s)}</small></a>`).join('');

  const counts = SERVICES.slice(0, 7).map(s => [s, data.inquiries.filter(r => r.service === s).length]);
  const max = Math.max(1, ...counts.map(c => c[1]));
  $('#by-service').innerHTML = counts.map(([s, n]) => `<div class="bar-row"><span>${esc(s)}</span><div class="bar-track"><div class="bar-fill" style="width:${n / max * 100}%"></div></div><b>${n}</b></div>`).join('');

  const stages = [['New', '#ff3d81'], ['In progress', '#ffc83d'], ['Contacted', '#4c5ff0'], ['Won', '#14a06c'], ['Closed', '#b9bccb']];
  const total = data.inquiries.length;
  $('#pipeline').innerHTML = `<div class="stack">${stages.map(([s, c]) => { const n = data.inquiries.filter(r => r.status === s).length; return n ? `<div style="width:${n / total * 100}%;background:${c}" title="${s}: ${n}"></div>` : ''; }).join('')}</div>
    <div class="legend">${stages.map(([s, c]) => { const n = data.inquiries.filter(r => r.status === s).length; return `<div><i style="background:${c}"></i>${s}<b>${n}</b><small>${total ? Math.round(n / total * 100) : 0}%</small></div>`; }).join('')}</div>`;

  $('#recent').innerHTML = data.inquiries.length ? `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Service</th><th>Received</th><th>Status</th></tr></thead><tbody>${data.inquiries.slice(0, 5).map(r => `<tr data-group="inquiries" data-id="${esc(r.id)}"><td><b>${esc(r.name)}</b><small>${esc(r.company || r.email)}</small></td><td>${esc(r.service)}</td><td>${esc(ago(r.createdAt))}</td><td>${pill(r)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No inquiries yet. Website inquiries will appear here.</p>';

  $('#upcoming').innerHTML = upcoming.length ? `<div class="list">${upcoming.slice(0, 4).map(e => { const d = new Date(e.date + 'T00:00:00'); return `<div class="list-row"><div class="date-chip"><b>${d.getDate()}</b><br>${d.toLocaleString('en-IN', { month: 'short' })}</div><div class="main-t"><b>${esc(e.name)}</b><small>${esc([e.city, e.venue].filter(Boolean).join(' · '))}</small></div>${pill(e)}</div>`; }).join('')}</div>` : '<p class="empty">No upcoming events.</p>';

  $('#live').innerHTML = live.length ? `<div class="list">${live.slice(0, 4).map(c => `<div class="list-row"><div class="avatar">${esc(initials(c.brand))}</div><div class="main-t"><b>${esc(c.name)}</b><small>${esc(c.brand)} · ${esc(c.talent)}</small></div><span class="muted">${esc(c.budget)}</span></div>`).join('')}</div>` : '<p class="empty">No live collaborations.</p>';

  $('#roster-split').innerHTML = `<div class="split3">${[['Influencer', 'influencers', 'Influencers'], ['Talent', 'talent', 'Talent'], ['Artist', 'artists', 'Artists']].map(([c, to, l]) => `<a href="#${to}"><strong>${roster.filter(r => r.category === c).length}</strong><span>${l}</span></a>`).join('')}</div>`;
}

/* ---------- Record lists ---------- */
function rows() {
  const p = PAGES[page];
  let list = data[p.group] || [];
  // Older records without a known category are listed under Talent
  if (p.category) list = list.filter(r => r.category === p.category || (p.category === 'Talent' && !['Influencer', 'Artist'].includes(r.category)));
  return list;
}
function renderRecords() {
  const p = PAGES[page];
  const all = rows();
  const statuses = FIELDS[p.group].find(f => f[0] === 'status')[2];
  const sel = $('#status-filter');
  const keep = statuses.includes(sel.value) ? sel.value : '';
  sel.innerHTML = '<option value="">All statuses</option>' + statuses.map(s => `<option${s === keep ? ' selected' : ''}>${esc(s)}</option>`).join('');
  $('#mini-kpis').innerHTML = [['Total', all.length, 'c-blue'], ...statuses.slice(0, 3).map((s, i) => [s, all.filter(r => r.status === s).length, ['c-pink', 'c-gold', 'c-green'][i]])].map(([l, v]) => `<div class="kpi"><span>${esc(l)}</span><strong>${v}</strong></div>`).join('');
  const q = $('#search').value.trim().toLowerCase();
  const shown = all.filter(r => (!keep || r.status === keep) && (!q || Object.values(r).join(' ').toLowerCase().includes(q)));
  $('#thead').innerHTML = '<tr>' + p.cols.map(c => `<th>${esc(c[1])}</th>`).join('') + '</tr>';
  $('#tbody').innerHTML = shown.map(r => `<tr data-group="${p.group}" data-id="${esc(r.id)}" tabindex="0">` + p.cols.map(([k, , fn]) => `<td class="wrap-cell">${fn ? fn(r) : esc(r[k] || '—')}</td>`).join('') + '</tr>').join('');
  $('#record-count').textContent = shown.length + ' of ' + all.length;
  $('#empty').hidden = shown.length > 0;
  $('#empty').textContent = all.length ? 'No records match your search.' : `No ${p.title.toLowerCase()} yet. Click “+ Add ${p.noun}” to create the first one.`;
}
$('#search').addEventListener('input', renderRecords);
$('#status-filter').addEventListener('change', renderRecords);
document.addEventListener('click', e => {
  if (e.target.closest('[data-stop]')) return;
  const tr = e.target.closest('tr[data-id]');
  if (tr) openEditor(tr.dataset.group, data[tr.dataset.group].find(r => r.id === tr.dataset.id));
});
document.addEventListener('keydown', e => {
  const tr = e.target.closest?.('tr[data-id]');
  if (tr && e.key === 'Enter') openEditor(tr.dataset.group, data[tr.dataset.group].find(r => r.id === tr.dataset.id));
});

/* ---------- Editor ---------- */
$('#add-btn').addEventListener('click', () => { const p = PAGES[page]; openEditor(p.group, null, p.category); });
function openEditor(group, record, category) {
  editing = { group, id: record?.id };
  const noun = Object.values(PAGES).find(p => p.group === group && (!category || p.category === category))?.noun || 'record';
  $('#editor-title').textContent = (record ? 'Edit ' : 'Add ') + (record && group === 'talent' ? record.category.toLowerCase() : noun);
  const req = REQUIRED[group] || ['name'];
  $('#editor-fields').innerHTML = FIELDS[group].map(([key, label, type, full]) => {
    let value = record?.[key] ?? (key === 'category' ? category : '') ?? '';
    const r = req.includes(key) ? ' required' : '';
    let control;
    if (Array.isArray(type)) control = `<select name="${key}">${type.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else if (type === 'textarea') control = `<textarea name="${key}" rows="3" maxlength="2000">${esc(value)}</textarea>`;
    else control = `<input name="${key}" type="${type}" value="${esc(value)}"${type === 'number' ? ' min="0" step="1"' : ''} maxlength="254"${r}>`;
    return `<label class="${full ? 'full' : ''}">${esc(label)}${r ? ' *' : ''}${control}</label>`;
  }).join('');
  $('#delete-btn').hidden = !record;
  $('#editor-error').textContent = '';
  $('#editor').showModal();
}
$('#editor-close').addEventListener('click', () => $('#editor').close());
$('#cancel-btn').addEventListener('click', () => $('#editor').close());
$('#editor-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const record = Object.fromEntries(new FormData(form));
  if (editing.id) record.id = editing.id;
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    if (demo) {
      const list = data[editing.group];
      const now = new Date().toISOString();
      if (editing.id) Object.assign(list.find(r => r.id === editing.id), record, { updatedAt: now });
      else list.unshift({ ...record, id: 'demo-' + Math.random().toString(36).slice(2), createdAt: now, updatedAt: now });
    } else {
      await api('save', { group: editing.group, record });
      await refresh();
    }
    $('#editor').close();
    render();
  } catch (err) { $('#editor-error').textContent = err.message; }
  finally { btn.disabled = false; }
});
$('#delete-btn').addEventListener('click', async () => {
  if (!confirm('Delete this record? A copy is kept in the archive.')) return;
  try {
    if (demo) data[editing.group] = data[editing.group].filter(r => r.id !== editing.id);
    else { await api('delete', { group: editing.group, id: editing.id }); await refresh(); }
    $('#editor').close();
    render();
  } catch (err) { $('#editor-error').textContent = err.message; }
});

/* ---------- Website editor (assets/one9/site-editor.js) ---------- */
function renderWebsite() { window.SiteEditor?.show({ demo, api }); }

/* ---------- Login / logout / menu ---------- */
$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  try { await api('login', { password: e.target.elements.password.value }); $('#login').close(); location.reload(); }
  catch (err) { $('#login-error').textContent = err.message; }
});
$('#login').addEventListener('cancel', e => e.preventDefault());
$('#logout').addEventListener('click', async () => { await api('logout', {}).catch(() => {}); location.reload(); });
$('#menu-btn').addEventListener('click', () => { const open = document.body.classList.toggle('nav-open'); $('#menu-btn').setAttribute('aria-expanded', String(open)); });

/* ---------- Demo data (shown only when no database is connected) ---------- */
function demoData() {
  const day = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const at = h => new Date(Date.now() - h * 36e5).toISOString();
  let i = 0;
  const mk = (list, extra = () => ({})) => list.map(r => ({ id: 'demo-' + (++i), createdAt: at(i * 7), updatedAt: at(i * 7), ...r, ...extra(r) }));
  return {
    content: null,
    inquiries: mk([
      { name: 'Priya Nair', email: 'priya@velora.in', phone: '+91 98200 11223', company: 'Velora Skincare', service: 'Influencer Management', status: 'New', message: 'Budget: ₹10–25 lakh\n\nLaunching a new SPF range in December. Looking for 40–60 beauty creators.', createdAt: at(2) },
      { name: 'Rahul Verma', email: 'rahul@brewhaus.co', phone: '+91 99300 44556', company: 'Brewhaus Cafés', service: 'Social Media Management', status: 'New', message: 'Budget: ₹2–10 lakh\n\nNeed monthly content and community management for 12 outlets.', createdAt: at(5) },
      { name: 'Sneha Kulkarni', email: 'sneha@pulsefest.in', company: 'Pulse Fest', service: 'Event & Show Management', status: 'In progress', message: 'Budget: ₹25 lakh+\n\nCollege fest in Pune, Feb 2027. Need a headline artist and full production.', createdAt: at(20) },
      { name: 'Aditya Rao', email: 'aditya@northlane.in', company: 'Northlane Apparel', service: 'Brand Collaborations', status: 'Contacted', message: 'Interested in a creator capsule collection for spring.', createdAt: at(30) },
      { name: 'Ishita Shah', email: 'ishita.shah@gmail.com', phone: '+91 90040 77881', service: 'Talent Management', status: 'New', message: 'Lifestyle creator, 420K on Instagram, looking for management.', createdAt: at(9) },
      { name: 'Vikram Malhotra', email: 'vikram@kaaya.com', company: 'KAAYA Home', service: 'Brand Management', status: 'Won', message: 'Brand refresh ahead of festive season.', createdAt: at(80) },
      { name: 'Neha Joshi', email: 'neha@lumenco.in', company: 'Lumen & Co', service: 'Influencer Management', status: 'In progress', message: 'Budget: ₹2–10 lakh\n\nMicro-creator seeding for our jewellery line.', createdAt: at(44) },
      { name: 'Karan Singh', email: 'karan@soundgarden.in', company: 'Soundgarden Records', service: 'Artist Management', status: 'Contacted', message: 'Looking for management and booking support for two independent artists.', createdAt: at(60) },
      { name: 'Ananya Iyer', email: 'ananya@saffronst.in', company: 'Saffron Street', service: 'Brand Management', status: 'Closed', message: 'Went with an in-house team for now.', createdAt: at(200) },
    ]),
    brands: mk([
      { name: 'Velora Skincare', industry: 'Beauty', contact: 'Priya Nair', email: 'priya@velora.in', retainer: '₹3.5 lakh / month', status: 'Active' },
      { name: 'KAAYA Home', industry: 'Home décor', contact: 'Vikram Malhotra', email: 'vikram@kaaya.com', retainer: '₹2.8 lakh / month', status: 'Active' },
      { name: 'Brewhaus Cafés', industry: 'Food & beverage', contact: 'Rahul Verma', email: 'rahul@brewhaus.co', retainer: '₹1.6 lakh / month', status: 'Onboarding' },
      { name: 'Northlane Apparel', industry: 'Fashion', contact: 'Aditya Rao', email: 'aditya@northlane.in', retainer: '₹4 lakh / month', status: 'Active' },
      { name: 'Lumen & Co', industry: 'Jewellery', contact: 'Neha Joshi', email: 'neha@lumenco.in', retainer: '₹1.2 lakh / month', status: 'Paused' },
    ]),
    social: mk([
      { name: '@velora.skin', platform: 'Instagram', client: 'Velora Skincare', followers: '284000', posts: '24', status: 'Active' },
      { name: 'Velora Skincare', platform: 'YouTube', client: 'Velora Skincare', followers: '61000', posts: '6', status: 'Active' },
      { name: '@brewhaus.cafes', platform: 'Instagram', client: 'Brewhaus Cafés', followers: '140000', posts: '30', status: 'Active' },
      { name: 'KAAYA Home', platform: 'LinkedIn', client: 'KAAYA Home', followers: '18500', posts: '12', status: 'Active' },
      { name: '@northlane', platform: 'Instagram', client: 'Northlane Apparel', followers: '512000', posts: '28', status: 'Active' },
      { name: '@lumenandco', platform: 'Instagram', client: 'Lumen & Co', followers: '73000', posts: '0', status: 'Paused' },
    ]),
    talent: mk([
      { name: 'Aanya Kapoor', category: 'Influencer', niche: 'Fashion & lifestyle', followers: '1200000', city: 'Mumbai', rate: '₹1.5 lakh / reel', status: 'Booked' },
      { name: 'Kabir Sethi', category: 'Influencer', niche: 'Tech & finance', followers: '860000', city: 'Bengaluru', rate: '₹1.2 lakh / video', status: 'Available' },
      { name: 'Tara Menon', category: 'Influencer', niche: 'Food & travel', followers: '430000', city: 'Kochi', rate: '₹60K / reel', status: 'Available' },
      { name: 'Dev Arora', category: 'Influencer', niche: 'Fitness', followers: '275000', city: 'Delhi', rate: '₹45K / reel', status: 'Available' },
      { name: 'Rohan Mehta', category: 'Talent', niche: 'Host & anchor', followers: '190000', city: 'Mumbai', rate: '₹2 lakh / event', status: 'Available' },
      { name: 'Simran Bedi', category: 'Talent', niche: 'Model & actor', followers: '640000', city: 'Mumbai', rate: '₹1.8 lakh / day', status: 'Booked' },
      { name: 'Arjun Desai', category: 'Talent', niche: 'Lifestyle personality', followers: '1100000', city: 'Ahmedabad', rate: '₹1.4 lakh / day', status: 'Unavailable' },
      { name: 'Meera Iyer', category: 'Artist', niche: 'Singer-songwriter', followers: '920000', city: 'Chennai', rate: '₹6 lakh / show', status: 'Booked' },
      { name: 'DJ Nyx', category: 'Artist', niche: 'Electronic DJ', followers: '310000', city: 'Goa', rate: '₹3 lakh / set', status: 'Available' },
      { name: 'The Local Loop', category: 'Artist', niche: 'Indie band', followers: '150000', city: 'Shillong', rate: '₹4 lakh / show', status: 'Available' },
    ]),
    campaigns: mk([
      { name: 'Glow Season launch', brand: 'Velora Skincare', talent: '60 micro-creators', budget: '₹18 lakh', date: day(-6), status: 'Live' },
      { name: 'Northlane × Aanya capsule', brand: 'Northlane Apparel', talent: 'Aanya Kapoor', budget: '₹25 lakh', date: day(21), status: 'Planning' },
      { name: 'Brewhaus Monsoon Menu', brand: 'Brewhaus Cafés', talent: 'Tara Menon + 8 food creators', budget: '₹6 lakh', date: day(-12), status: 'Live' },
      { name: 'KAAYA Festive Edit', brand: 'KAAYA Home', talent: 'Simran Bedi', budget: '₹12 lakh', date: day(-40), status: 'Completed' },
      { name: 'Monsoon Nights presented by Lumen', brand: 'Lumen & Co', talent: 'Meera Iyer', budget: '₹9 lakh', date: day(18), status: 'Planning' },
    ]),
    events: mk([
      { name: 'Monsoon Nights Live', type: 'Concert', date: day(18), city: 'Mumbai', venue: 'NSCI Dome', status: 'Published', description: 'An evening with Meera Iyer and special guests.' },
      { name: 'Creator Fest 2026', type: 'Show', date: day(40), city: 'Bengaluru', venue: 'Phoenix Arena', status: 'Published', description: '40+ creators, live podcasts and workshops.' },
      { name: 'The Collab Edit', type: 'Brand launch', date: day(83), city: 'Delhi', venue: 'Aerocity', status: 'Draft', description: 'Showcase of creator × brand capsule collections.' },
      { name: 'Velora meet & greet', type: 'Meet & greet', date: day(9), city: 'Pune', venue: 'Phoenix Marketcity', status: 'Draft', description: 'Fan meet with Velora’s top creators.' },
    ]),
  };
}

route();
boot();
