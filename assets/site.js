/* ---------- supplier logo marquee ---------- */
const logos = ['arsian-2.png','bigsmall.png','boardroom.jpg','de-jay-logo.png','fairtrade.jpg','gaia.jpg','gc-enterprises.png','gift-touch.jpg','gurus-2.png','hulaspun.jpg','km.jpg','la-cadeau.jpg','maleta.png','mnjs-logo.png','mridaa.jpg','samskara-home.png','sly.png','stories-3.png','supasac.png','tarood.jpg','tgl-co.jpg','urban.jpg','wayona.jpg'];
const track = document.getElementById('track');
if (track) [...logos, ...logos].forEach(f => {
  const d = document.createElement('div'); d.className = 'logo';
  const i = document.createElement('img'); i.src = 'assets/logos/' + f; i.alt = f.split(/[-.]/)[0]; i.loading = 'lazy';
  d.appendChild(i); track.appendChild(d);
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ---------- counters ---------- */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, t0 = performance.now();
  (function tick(t) { const p = Math.min(1, (t - t0) / 1600), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString('en-IN') + (p === 1 ? '+' : ''); if (p < 1) requestAnimationFrame(tick); })(t0);
}), { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

/* ---------- 3D tilt cards ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ---------- hero card cluster parallax ---------- */
const art = document.getElementById('heroArt');
if (art) window.addEventListener('mousemove', e => {
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  art.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
});

/* ---------- mobile nav ---------- */
const nav = document.getElementById('nav');
document.getElementById('burger').onclick = () => nav.classList.toggle('open');
nav.querySelectorAll('ul a').forEach(a => a.onclick = () => nav.classList.remove('open'));

/* ---------- THREE.JS hero scene: floating gift boxes ---------- */
window.initScene = function (id) {
  if (!window.THREE) return;
  const canvas = document.getElementById(id); if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const small = innerWidth < 720;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05071a, 0.045);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  scene.add(new THREE.AmbientLight(0x6c8cff, 0.6));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.6); key.position.set(6, 8, 8); scene.add(key);
  const rim = new THREE.PointLight(0xff7a2b, 2.5, 40); rim.position.set(-8, -4, 4); scene.add(rim);
  const blue = new THREE.PointLight(0x2a44ff, 3, 40); blue.position.set(8, -6, -4); scene.add(blue);

  const gold = new THREE.MeshStandardMaterial({ color: 0xf7c948, metalness: 0.75, roughness: 0.28 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6a2b, metalness: 0.5, roughness: 0.35 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x2a44ff, metalness: 0.6, roughness: 0.3 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9fb4ff, metalness: 0, roughness: 0.05, transmission: 0.9, thickness: 1.2, transparent: true, opacity: 0.9 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xb3402f, metalness: 0.4, roughness: 0.4 });

  function giftBox(size, mat) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat));
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.02, size * 1.02, size * 0.18), ribbonMat);
    const r2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.18, size * 1.02, size * 1.02), ribbonMat);
    g.add(r1, r2);
    const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(size * 0.16, size * 0.05, 60, 8), ribbonMat);
    bow.position.y = size * 0.6; g.add(bow);
    return g;
  }

  const objs = [];
  const mats = [gold, orange, navy, glass];
  for (let i = 0; i < (small ? 8 : 16); i++) {
    let m;
    const t = i % 4;
    if (t === 0) m = giftBox(0.9 + Math.random() * 0.8, mats[i % 3]);
    else if (t === 1) m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.5, 0), navy);
    else if (t === 2) m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 20, 60), gold);
    else m = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), glass);
    m.position.set((Math.random() - 0.5) * (small ? 12 : 22), (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10 - 2);
    m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
    m.userData = { s: 0.2 + Math.random() * 0.5, o: Math.random() * 6, rx: (Math.random() - .5) * .01, ry: (Math.random() - .5) * .012 };
    scene.add(m); objs.push(m);
  }

  // sparkle particles (diyas)
  const pc = small ? 220 : 500, pos = new Float32Array(pc * 3);
  for (let i = 0; i < pc * 3; i++) pos[i] = (Math.random() - 0.5) * 40;
  const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: 0xffd27a, size: 0.07, transparent: true, opacity: 0.8 }));
  scene.add(pts);

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize); resize();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(t) {
    t *= 0.001;
    objs.forEach(o => { o.position.y += Math.sin(t * o.userData.s + o.userData.o) * 0.004; o.rotation.x += o.userData.rx; o.rotation.y += o.userData.ry; });
    pts.rotation.y = t * 0.02;
    camera.position.x += (mx * 3 - camera.position.x) * 0.04;
    camera.position.y += (-my * 2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (!reduce) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
initScene('scene');
