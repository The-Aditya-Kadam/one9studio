'use strict';
/* one9studio — Website editor (dashboard → Website)
   Loads the whole site from /api/studio?action=site, lets the team edit pages, sections, images and settings,
   and publishes everything in one go with /api/studio?action=site-save. */
(() => {
  const q = s => document.querySelector(s);
  const h = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const uid = p => p + '-' + Math.random().toString(36).slice(2, 10);
  const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const RESERVED = ['api', 'assets', 'dashboard', 'suppliers', 'diwali-edit', 'coming-soon', 'scripts', 'lib', 'sitemap.xml', 'robots.txt', 'dev-uploads', '404'];

  const S = { loaded: false, loading: false, site: null, saved: null, rev: 0, schema: null, uploads: false, dirty: false, current: null, api: null, demo: false };

  const SETTINGS_FIELDS = [
    ['siteName', 'Website name', 'text'], ['tagline', 'Tagline (footer)', 'textarea'], ['domain', 'Website address (for Google/sharing, e.g. https://www.one9studio.in)', 'text'],
    ['whatsapp', 'WhatsApp number — country code + number, digits only (e.g. 918355874139)', 'text'],
    ['waMessage', 'WhatsApp first message (general)', 'textarea'], ['waServiceMessage', 'WhatsApp first message on service pages — {service} becomes the service name', 'textarea'],
    ['headerButtonText', 'Header WhatsApp button text', 'text'], ['showFloatingButton', 'Show floating WhatsApp button', 'toggle'], ['floatingButtonText', 'Floating button text', 'text'],
    ['email', 'Contact email', 'text'], ['phone', 'Contact phone', 'text'], ['address', 'Studio address', 'textarea'],
    ['menu', 'Menu links (after "Services")', 'list', { itemLabel: 'Link', fields: [['label', 'Text', 'text'], ['link', 'Link (e.g. /#work or /about)', 'link']] }],
    ['socials', 'Social media links (footer)', 'list', { itemLabel: 'Social link', fields: [['label', 'Short label shown in the circle (e.g. IG)', 'text'], ['name', 'Name (e.g. Instagram)', 'text'], ['link', 'Profile link (https://…)', 'link']] }],
    ['footerNote', 'Footer note (bottom right)', 'text'],
  ];
  const PAGE_FIELDS = [
    ['title', 'Page name (used in menus)', 'text'], ['path', 'Page address', 'path'],
    ['isService', 'This is a service page (shows in the Services menu, footer and WhatsApp topic buttons)', 'toggle'],
    ['menuText', 'Short description under the name in the Services menu', 'textarea'],
    ['inMenu', 'Show in the top menu', 'toggle'], ['hidden', 'Hidden (not live — only visible with the preview link)', 'toggle'],
    ['whatsappTopic', 'WhatsApp topic for this page (optional — e.g. "Careers"; service pages use their name)', 'text'],
    ['seoTitle', 'Google title (optional)', 'text'], ['seoDescription', 'Google description (optional)', 'textarea'], ['ogImage', 'Image when the page is shared on WhatsApp/social media', 'image'],
  ];

  /* ---------- Loading / saving ---------- */
  async function load() {
    S.loading = true;
    main(`<p class="empty">Loading website…</p>`);
    try {
      const d = await S.api('site');
      S.site = d.site; S.saved = clone(d.site); S.rev = d.rev; S.schema = d.schema; S.uploads = d.uploads; S.loaded = true;
      S.current = S.current && (S.current === 'settings' || S.site.pages.some(p => p.id === S.current)) ? S.current : S.site.pages[0].id;
      setDirty(false);
      renderAll();
    } catch (e) {
      main(`<div class="panel"><p class="empty">The website editor could not load: ${h(e.message)}</p><p style="text-align:center"><button class="btn btn-primary" type="button" id="se-retry">Try again</button></p></div>`);
      q('#se-retry')?.addEventListener('click', load);
    } finally { S.loading = false; }
  }

  async function publish() {
    const btn = q('#se-publish');
    btn.disabled = true; btn.textContent = 'Publishing…';
    try {
      const d = await S.api('site-save', { site: S.site, rev: S.rev });
      S.site = d.site; S.saved = clone(d.site); S.rev = d.rev;
      setDirty(false);
      renderAll();
      toast('Published. The live website updates within about 30 seconds.');
    } catch (e) {
      if (e.status === 409) {
        dialog('Changed in another window', body => { body.innerHTML = `<p>${h(e.message)}</p><p class="muted">Reloading will discard the changes you made here.</p>`; },
          [{ text: 'Keep editing', cls: 'btn-ghost', close: true }, { text: 'Reload latest version', cls: 'btn-primary', onClick: () => { closeDialog(); load(); } }]);
      } else toast(e.message, true);
    } finally { btn.disabled = false; btn.textContent = 'Publish to website'; }
  }

  function setDirty(v) {
    S.dirty = v;
    q('#se-bar').hidden = !v;
  }
  const changed = () => { setDirty(true); };
  addEventListener('beforeunload', e => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Layout ---------- */
  function main(html) { q('#se-main').innerHTML = html; }
  function renderAll() { renderSide(); renderMain(); }

  function pageUrl(p, preview) { return '/' + (p.path || '') + (preview ? '?preview=1' : ''); }

  function renderSide() {
    q('#se-pages').innerHTML = S.site.pages.map(p => `<button type="button" class="se-nav${S.current === p.id ? ' active' : ''}" data-se-open="${h(p.id)}">
      <span>${h(p.title)}</span><small>${h(pageUrl(p))}${p.isService ? ' · service' : ''}${p.hidden ? ' · hidden' : ''}</small></button>`).join('');
    document.querySelectorAll('[data-se-open="settings"]').forEach(b => b.classList.toggle('active', S.current === 'settings'));
  }

  function renderMain() {
    if (S.current === 'settings') return renderSettings();
    const page = S.site.pages.find(p => p.id === S.current);
    if (!page) { S.current = S.site.pages[0].id; return renderMain(); }
    const types = S.schema.types;
    main(`<div class="panel se-page-head">
      <div><h2>${h(page.title)}</h2><a href="${h(pageUrl(page, page.hidden))}" target="_blank" rel="noopener">${h(location.host + pageUrl(page))} ↗</a>${page.hidden ? '<span class="pill gold">Hidden</span>' : ''}${page.isService ? '<span class="pill blue">Service</span>' : ''}</div>
      <div class="se-actions"><button type="button" class="btn btn-ghost" id="se-page-settings">Page settings</button>${page.path ? '<button type="button" class="btn btn-danger" id="se-page-delete">Delete page</button>' : ''}</div>
    </div>
    ${S.dirty ? '<p class="se-hint">Changes are only on this screen until you click <b>Publish to website</b>.</p>' : ''}
    <ol class="se-sections">${page.sections.map((s, i) => {
      const t = types[s.type] || { label: s.type };
      const d = s.data || {};
      const pic = d.image || d.image1 || (Array.isArray(d.items) && d.items.find(x => x.image)?.image) || '';
      const first = Array.isArray(d.items) ? d.items[0] : null;
      const summary = d.title || d.label || d.eyebrow || d.body || (first && (first.title || first.name || first.question || [first.value, first.label].filter(Boolean).join(' '))) || '';
      return `<li class="se-sec${s.hidden ? ' is-hidden' : ''}">
        <div class="se-thumb">${pic ? `<img src="${h(pic)}" alt="">` : '<span>¶</span>'}</div>
        <div class="se-info"><small>${i + 1}. ${h(t.label)}${s.hidden ? ' · hidden' : ''}</small><b>${h(String(summary).split('\n')[0].slice(0, 90)) || '<span class="muted">(empty)</span>'}</b></div>
        <div class="se-tools">
          <button type="button" class="btn btn-primary btn-sm" data-act="edit" data-i="${i}">Edit</button>
          <button type="button" class="icon-btn" data-act="up" data-i="${i}" title="Move up" aria-label="Move up"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" class="icon-btn" data-act="down" data-i="${i}" title="Move down" aria-label="Move down"${i === page.sections.length - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" class="icon-btn" data-act="hide" data-i="${i}" title="${s.hidden ? 'Show' : 'Hide'}" aria-label="${s.hidden ? 'Show section' : 'Hide section'}">${s.hidden ? '◌' : '◉'}</button>
          <button type="button" class="icon-btn" data-act="copy" data-i="${i}" title="Duplicate" aria-label="Duplicate">⧉</button>
          <button type="button" class="icon-btn danger" data-act="del" data-i="${i}" title="Delete" aria-label="Delete">✕</button>
        </div>
        <button type="button" class="se-insert" data-act="add" data-i="${i}">+ Add section below</button>
      </li>`;
    }).join('')}</ol>
    ${page.sections.length ? '' : '<p class="empty">This page has no sections yet.</p>'}
    <p style="text-align:center"><button type="button" class="btn btn-primary" data-act="add" data-i="${page.sections.length - 1}">+ Add section</button></p>`);

    q('#se-page-settings').addEventListener('click', () => editPage(page));
    q('#se-page-delete')?.addEventListener('click', () => {
      dialog('Delete page?', body => { body.innerHTML = `<p>Delete <b>${h(page.title)}</b> (${h(pageUrl(page))})? Links to it will show “Page not found” after you publish.</p><p class="muted">You can bring it back from Version history after publishing.</p>`; },
        [{ text: 'Cancel', cls: 'btn-ghost', close: true }, { text: 'Delete page', cls: 'btn-danger', onClick: () => { S.site.pages = S.site.pages.filter(p => p !== page); S.current = S.site.pages[0].id; closeDialog(); changed(); renderAll(); } }]);
    });
    q('#se-main').querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => sectionAction(page, b.dataset.act, Number(b.dataset.i))));
  }

  function sectionAction(page, act, i) {
    const list = page.sections;
    if (act === 'edit') return editSection(page, i);
    if (act === 'add') return pickSection(page, i + 1);
    if (act === 'up' && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    if (act === 'down' && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    if (act === 'hide') list[i].hidden = !list[i].hidden;
    if (act === 'copy') { const c = clone(list[i]); c.id = uid('s'); list.splice(i + 1, 0, c); }
    if (act === 'del') {
      return dialog('Delete section?', body => { body.innerHTML = `<p>Delete this <b>${h(S.schema.types[list[i].type]?.label || 'section')}</b>? Tip: use ◉ to hide it instead if you might need it later.</p>`; },
        [{ text: 'Cancel', cls: 'btn-ghost', close: true }, { text: 'Delete', cls: 'btn-danger', onClick: () => { list.splice(i, 1); closeDialog(); changed(); renderMain(); } }]);
    }
    changed(); renderMain();
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    main(`<div class="panel"><div class="panel-head"><h2>Site settings</h2></div><p class="muted" style="margin-top:-8px">Used on every page: header, footer, WhatsApp buttons and contact details.</p><div id="se-settings" class="se-form"></div></div>`);
    buildFields(q('#se-settings'), SETTINGS_FIELDS, S.site.settings, changed);
  }

  /* ---------- Section editing ---------- */
  function emptyData(fields) {
    const d = {};
    for (const [k, , type, opts] of fields) d[k] = type === 'list' ? [] : type === 'toggle' ? false : type === 'select' ? opts.options[0][0] : '';
    return d;
  }

  function pickSection(page, at) {
    const groups = {};
    for (const [k, t] of Object.entries(S.schema.types)) (groups[t.group] ||= []).push([k, t]);
    dialog('Add a section', body => {
      body.innerHTML = Object.entries(groups).map(([g, list]) => `<p class="se-label">${h(g)}</p><div class="se-pick">${list.map(([k, t]) => `<button type="button" class="se-pick-btn" data-type="${h(k)}">${h(t.label)}</button>`).join('')}</div>`).join('');
      body.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
        const type = b.dataset.type;
        const sec = { id: uid('s'), type, hidden: false, data: emptyData(S.schema.types[type].fields) };
        if (type === 'contact') Object.assign(sec.data, { title: 'Let’s talk.', cardTitle: 'Chat with us on WhatsApp', showTopics: true });
        page.sections.splice(at, 0, sec);
        changed(); renderMain();
        editSection(page, at, true);
      }));
    }, [{ text: 'Cancel', cls: 'btn-ghost', close: true }]);
  }

  function editSection(page, i, isNew) {
    const sec = page.sections[i];
    const t = S.schema.types[sec.type];
    const draft = clone(sec.data || {});
    dialog((isNew ? 'New: ' : 'Edit: ') + t.label, body => {
      body.innerHTML = '<div class="se-form"></div>';
      buildFields(body.firstChild, t.fields, draft, () => {});
    }, [{ text: 'Cancel', cls: 'btn-ghost', close: true }, { text: 'Done', cls: 'btn-primary', onClick: () => { sec.data = draft; closeDialog(); changed(); renderMain(); } }], 'wide');
  }

  /* ---------- Pages ---------- */
  function editPage(page) {
    const draft = clone(page);
    dialog('Page settings', body => {
      body.innerHTML = '<div class="se-form"></div>';
      buildFields(body.firstChild, page.path === '' ? PAGE_FIELDS.filter(f => !['path', 'hidden', 'inMenu', 'isService', 'menuText'].includes(f[0])) : PAGE_FIELDS, draft, () => {});
    }, [{ text: 'Cancel', cls: 'btn-ghost', close: true }, { text: 'Done', cls: 'btn-primary', onClick: () => {
      const err = checkPage(draft, page);
      if (err) return dialogError(err);
      Object.assign(page, draft, { sections: page.sections });
      closeDialog(); changed(); renderAll();
    } }], 'wide');
  }

  function checkPage(p, self) {
    if (!String(p.title || '').trim()) return 'Give the page a name.';
    if (self && self.path === '') return '';
    p.path = slugify(p.path);
    if (!p.path) return 'Enter a page address, e.g. about-us';
    if (RESERVED.includes(p.path)) return `“/${p.path}” is reserved — choose another address.`;
    if (S.site.pages.some(x => x !== self && x.path === p.path)) return `Another page already uses “/${p.path}”.`;
    return '';
  }

  function newPage() {
    const draft = { title: '', path: '', from: 'blank' };
    let pathTouched = false;
    dialog('New page', body => {
      body.innerHTML = `<div class="se-form">
        <label>Page name<input name="title" maxlength="100" placeholder="e.g. About us"></label>
        <label>Page address<div class="se-path"><span>${h(location.host)}/</span><input name="path" maxlength="60" placeholder="about-us"></div></label>
        <label>Start from<select name="from"><option value="blank">Blank page (header, text, contact)</option>${S.site.pages.map(p => `<option value="${h(p.id)}">Copy of “${h(p.title)}”</option>`).join('')}</select></label>
      </div>`;
      const f = body.querySelector('.se-form');
      f.querySelector('[name=title]').addEventListener('input', e => { draft.title = e.target.value; if (!pathTouched) f.querySelector('[name=path]').value = draft.path = slugify(draft.title); });
      f.querySelector('[name=path]').addEventListener('input', e => { pathTouched = true; draft.path = e.target.value; });
      f.querySelector('[name=from]').addEventListener('change', e => { draft.from = e.target.value; });
    }, [{ text: 'Cancel', cls: 'btn-ghost', close: true }, { text: 'Create page', cls: 'btn-primary', onClick: () => {
      const err = checkPage(draft, null);
      if (err) return dialogError(err);
      const src = S.site.pages.find(p => p.id === draft.from);
      const page = src ? Object.assign(clone(src), { id: uid('p'), title: draft.title.trim(), path: draft.path, hidden: true, seoTitle: '', ogImage: src.ogImage })
        : { id: uid('p'), title: draft.title.trim(), path: draft.path, seoTitle: '', seoDescription: '', ogImage: '', isService: false, inMenu: false, hidden: true, menuText: '', whatsappTopic: '', sections: [
          { id: uid('s'), type: 'page_hero', hidden: false, data: { ...emptyData(S.schema.types.page_hero.fields), eyebrow: draft.title.trim(), title: draft.title.trim(), breadcrumb: true, primaryText: 'Talk to us on WhatsApp' } },
          { id: uid('s'), type: 'rich_text', hidden: false, data: { ...emptyData(S.schema.types.rich_text.fields), title: 'Add your title', body: 'Write your text here.\n\nLeave an empty line to start a new paragraph.' } },
          { id: uid('s'), type: 'contact', hidden: false, data: { ...emptyData(S.schema.types.contact.fields), eyebrow: 'Contact', title: 'Let’s talk.', cardTitle: 'Chat with us on WhatsApp', showTopics: true } },
        ] };
      for (const s of page.sections) s.id = uid('s');
      S.site.pages.push(page);
      S.current = page.id;
      closeDialog(); changed(); renderAll();
      toast('Page created as hidden. Edit it, switch off “Hidden” in Page settings, then publish.');
    } }]);
  }

  async function history() {
    dialog('Version history', async body => {
      body.innerHTML = '<p class="muted">Loading…</p>';
      try {
        const { versions } = await S.api('site-history');
        body.innerHTML = versions.length ? `<p class="muted">Every time you publish, the previous version is kept here (last 20).</p><ul class="se-history">${versions.map(v => `<li><span>${h(new Date(v.savedAt).toLocaleString('en-IN'))}</span><small>${v.pages} pages</small><button type="button" class="btn btn-ghost btn-sm" data-id="${h(v.id)}">Restore</button></li>`).join('')}</ul>` : '<p class="muted">No earlier versions yet. Versions appear after you publish changes.</p>';
        body.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', async () => {
          if (!confirm('Restore this version on the live website? The current version is kept in history.')) return;
          try { const d = await S.api('site-restore', { id: b.dataset.id }); S.site = d.site; S.saved = clone(d.site); S.rev = d.rev; setDirty(false); closeDialog(); renderAll(); toast('Version restored on the live website.'); }
          catch (e) { dialogError(e.message); }
        }));
      } catch (e) { body.innerHTML = `<p class="form-msg err">${h(e.message)}</p>`; }
    }, [{ text: 'Close', cls: 'btn-ghost', close: true }]);
  }

  /* ---------- Form builder ---------- */
  function linkOptions() {
    return ['/', '#contact', ...S.site.pages.filter(p => p.path).map(p => '/' + p.path), '/#services', '/#work', '/#roster', '/#events', '/#about'];
  }

  function buildFields(container, fields, obj, onChange) {
    container.innerHTML = '';
    for (const f of fields) container.append(field(f, obj, onChange));
  }

  function field([key, label, type, opts], obj, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'se-field' + (type === 'list' ? ' se-field-list' : '') + (type === 'toggle' ? ' se-field-toggle' : '');
    const set = v => { obj[key] = v; onChange(); };
    if (type === 'toggle') {
      wrap.innerHTML = `<label><input type="checkbox"${obj[key] ? ' checked' : ''}> ${h(label)}</label>`;
      wrap.querySelector('input').addEventListener('change', e => set(e.target.checked));
    } else if (type === 'textarea') {
      wrap.innerHTML = `<label>${h(label)}<textarea rows="${String(obj[key] || '').length > 160 ? 5 : 3}">${h(obj[key])}</textarea></label>`;
      wrap.querySelector('textarea').addEventListener('input', e => set(e.target.value));
    } else if (type === 'select') {
      wrap.innerHTML = `<label>${h(label)}<select>${opts.options.map(([v, l]) => `<option value="${h(v)}"${(obj[key] || '') === v ? ' selected' : ''}>${h(l)}</option>`).join('')}</select></label>`;
      wrap.querySelector('select').addEventListener('change', e => set(e.target.value));
    } else if (type === 'icon') {
      wrap.innerHTML = `<label>${h(label)}<select>${S.schema.icons.map(n => `<option${obj[key] === n ? ' selected' : ''}>${h(n)}</option>`).join('')}</select></label>`;
      wrap.querySelector('select').addEventListener('change', e => set(e.target.value));
    } else if (type === 'image') {
      imageField(wrap, label, obj[key], set);
    } else if (type === 'list') {
      listField(wrap, label, opts, obj, key, onChange);
    } else if (type === 'path') {
      wrap.innerHTML = `<label>${h(label)}<div class="se-path"><span>${h(location.host)}/</span><input maxlength="60" value="${h(obj[key])}"></div></label>`;
      wrap.querySelector('input').addEventListener('input', e => set(e.target.value));
    } else {
      const listId = type === 'link' ? uid('dl') : '';
      wrap.innerHTML = `<label>${h(label)}<input value="${h(obj[key])}"${listId ? ` list="${listId}" placeholder="/page, /#section or https://…"` : ''}></label>${listId ? `<datalist id="${listId}">${linkOptions().map(o => `<option value="${h(o)}">`).join('')}</datalist>` : ''}`;
      wrap.querySelector('input').addEventListener('input', e => set(e.target.value));
    }
    return wrap;
  }

  function listField(wrap, label, opts, obj, key, onChange) {
    if (!Array.isArray(obj[key])) obj[key] = [];
    const list = obj[key];
    const render = () => {
      wrap.innerHTML = `<div class="se-list-head"><b>${h(label)}</b><small>${list.length} ${h(opts.itemLabel || 'item')}${list.length === 1 ? '' : 's'}</small></div><div class="se-items"></div><button type="button" class="btn btn-ghost btn-sm se-add-item">+ Add ${h((opts.itemLabel || 'item').toLowerCase())}</button>`;
      const box = wrap.querySelector('.se-items');
      list.forEach((item, i) => {
        const card = document.createElement('details');
        card.className = 'se-item';
        if (list.length <= 2 || item.__open) card.open = true;
        const name = item.title || item.name || item.label || item.question || item.value || item.text || item.caption || '';
        card.innerHTML = `<summary><span>${h(opts.itemLabel || 'Item')} ${i + 1}${name ? ': ' + h(String(name).slice(0, 50)) : ''}</span><span class="se-item-tools">
          <button type="button" class="icon-btn" data-m="up"${i === 0 ? ' disabled' : ''} aria-label="Move up">↑</button><button type="button" class="icon-btn" data-m="down"${i === list.length - 1 ? ' disabled' : ''} aria-label="Move down">↓</button><button type="button" class="icon-btn danger" data-m="del" aria-label="Remove">✕</button></span></summary><div class="se-item-body"></div>`;
        const inner = card.querySelector('.se-item-body');
        for (const f of opts.fields) inner.append(field(f, item, onChange));
        card.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', e => {
          e.preventDefault();
          const m = b.dataset.m;
          if (m === 'up') [list[i - 1], list[i]] = [list[i], list[i - 1]];
          if (m === 'down') [list[i + 1], list[i]] = [list[i], list[i + 1]];
          if (m === 'del') list.splice(i, 1);
          onChange(); render();
        }));
        box.append(card);
      });
      wrap.querySelector('.se-add-item').addEventListener('click', () => {
        const item = emptyData(opts.fields);
        Object.defineProperty(item, '__open', { value: true, enumerable: false });
        list.push(item); onChange(); render();
      });
    };
    render();
  }

  function imageField(wrap, label, value, set) {
    wrap.className += ' se-field-img';
    wrap.innerHTML = `<span class="se-flabel">${h(label)}</span><div class="se-img">
      <div class="se-img-prev">${value ? `<img src="${h(value)}" alt="">` : '<span>No image</span>'}</div>
      <div class="se-img-ctl">
        <input type="url" value="${h(value)}" placeholder="Paste an image link or upload →">
        <div class="se-img-btns"><label class="btn btn-primary btn-sm">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" hidden></label>${value ? '<button type="button" class="btn btn-ghost btn-sm" data-rm>Remove</button>' : ''}<span class="se-img-msg"></span></div>
      </div></div>`;
    const input = wrap.querySelector('input[type=url]');
    const prev = wrap.querySelector('.se-img-prev');
    const msg = wrap.querySelector('.se-img-msg');
    const update = v => { set(v); input.value = v; prev.innerHTML = v ? `<img src="${h(v)}" alt="">` : '<span>No image</span>'; };
    input.addEventListener('change', () => update(input.value.trim()));
    wrap.querySelector('[data-rm]')?.addEventListener('click', () => update(''));
    wrap.querySelector('input[type=file]').addEventListener('change', async e => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (!S.uploads) { msg.textContent = 'Uploads are not set up yet — paste an image link instead.'; msg.className = 'se-img-msg err'; return; }
      msg.className = 'se-img-msg'; msg.textContent = 'Uploading…';
      try {
        const { type, data } = await prepareImage(file);
        const d = await S.api('upload', { name: file.name, type, data });
        update(d.url);
        msg.textContent = 'Uploaded ✓';
      } catch (err) { msg.className = 'se-img-msg err'; msg.textContent = err.message; }
    });
  }

  // Resize big photos in the browser before uploading (max 2000px, JPEG/WebP ~85%).
  async function prepareImage(file) {
    const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(Error('Could not read the file')); r.readAsDataURL(blob); });
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.type)) throw Error('Please choose a JPG, PNG, WebP, GIF or SVG image');
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      if (file.size > 3.5 * 1024 * 1024) throw Error('This file is too large (max 3.5 MB)');
      return { type: file.type, data: await toB64(file) };
    }
    const bmp = await createImageBitmap(file).catch(() => { throw Error('Could not open this image'); });
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    let type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let blob = await new Promise(r => canvas.toBlob(r, type, 0.85));
    if (blob.size > 3 * 1024 * 1024) { type = 'image/jpeg'; blob = await new Promise(r => canvas.toBlob(r, type, 0.8)); }
    if (blob.size > 3.5 * 1024 * 1024) throw Error('This image is too large even after resizing');
    return { type, data: await toB64(blob) };
  }

  /* ---------- Dialog & toast ---------- */
  function dialog(title, build, buttons, size) {
    const dlg = q('#se-dialog');
    dlg.classList.toggle('wide', size === 'wide');
    q('#se-dialog-title').textContent = title;
    q('#se-dialog-error').textContent = '';
    const body = q('#se-dialog-body');
    body.innerHTML = '';
    const foot = q('#se-dialog-foot');
    foot.innerHTML = '<span></span>';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'btn ' + b.cls; el.textContent = b.text;
      el.addEventListener('click', () => (b.close ? closeDialog() : b.onClick()));
      foot.append(el);
    }
    if (!dlg.open) dlg.showModal();
    build(body);
    body.scrollTop = 0;
  }
  function closeDialog() { q('#se-dialog').close(); }
  function dialogError(m) { q('#se-dialog-error').textContent = m; }
  q('#se-dialog').querySelector('[data-se-close]').addEventListener('click', closeDialog);
  q('#se-dialog-form').addEventListener('submit', e => e.preventDefault());

  function toast(text, err) {
    let t = q('#se-toast');
    if (!t) { t = document.createElement('div'); t.id = 'se-toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = text; t.className = 'se-toast show' + (err ? ' err' : '');
    clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'se-toast'; }, err ? 7000 : 4500);
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-se-open]');
    if (!b || !S.loaded) return;
    S.current = b.dataset.seOpen;
    renderAll();
    q('#se-main').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  q('#se-add-page').addEventListener('click', () => S.loaded && newPage());
  q('#se-history').addEventListener('click', () => {
    if (!S.loaded) return;
    if (S.dirty) return toast('Publish or discard your changes before opening version history.', true);
    history();
  });
  q('#se-publish').addEventListener('click', publish);
  q('#se-discard').addEventListener('click', () => {
    dialog('Discard changes?', body => { body.innerHTML = '<p>Undo everything you changed since the last publish?</p>'; },
      [{ text: 'Keep editing', cls: 'btn-ghost', close: true }, { text: 'Discard changes', cls: 'btn-danger', onClick: () => { S.site = clone(S.saved); setDirty(false); closeDialog(); renderAll(); } }]);
  });

  window.SiteEditor = {
    show({ demo, api }) {
      S.api = api; S.demo = demo;
      if (demo) { main('<div class="panel"><p class="empty">The website editor needs the database connection. Connect Upstash Redis (see ADMIN_SETUP.md) to edit the website.</p></div>'); return; }
      if (!S.loaded && !S.loading) load();
      else if (S.loaded) renderAll();
    },
  };
})();
