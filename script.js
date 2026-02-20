/* ══════════════════════════════════════════
   script.js — Samir Elnagdi 3D Portfolio
   v2 — Stable Advanced 3D (no custom shaders)
   ══════════════════════════════════════════ */

/* ══════════════════════
   1. CUSTOM CURSOR
══════════════════════ */
const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

if (!isTouchDevice()) {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  })();

  const hoverEls = document.querySelectorAll('a, button, .exp-card, .skill-card, .wcard, .ftab, .upload-btn');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = dot.style.height = '16px';
      ring.style.width = ring.style.height = '54px';
      ring.style.borderColor = 'var(--acc2)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = dot.style.height = '6px';
      ring.style.width = ring.style.height = '32px';
      ring.style.borderColor = 'rgba(255,214,10,.5)';
    });
  });
}

/* ══════════════════════
   2. NAV
══════════════════════ */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  navOverlay.classList.toggle('visible', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════
   3. THREE.JS — ADVANCED 3D (compatible)
══════════════════════════════════════════ */
(function initThree() {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const clock    = new THREE.Clock();
  const isMobile = window.innerWidth < 768;

  const accHex = [0xFF3366, 0xFFD60A, 0x00F5D4, 0x7B61FF, 0x00E676];
  const accRGB = [
    [1.0, 0.20, 0.40],
    [1.0, 0.84, 0.04],
    [0.0, 0.96, 0.83],
    [0.48, 0.38, 1.0],
    [0.0, 0.90, 0.46],
  ];

  /* ── A. GALAXY PARTICLES (spiral) ── */
  const N = isMobile ? 900 : 2800;
  const pos   = new Float32Array(N * 3);
  const cols  = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const arm    = i % 3;
    const radius = 1.5 + Math.pow(Math.random(), 0.6) * 38;
    const spin   = radius * 0.45;
    const spread = (Math.random() - 0.5) * (radius * 0.08);
    const angle  = (arm / 3) * Math.PI * 2 + spin + spread;

    pos[i*3]   = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
    pos[i*3+1] = (Math.random() - 0.5) * 3.5;
    pos[i*3+2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.5 - 8;

    const c = accRGB[arm % accRGB.length];
    const b = 0.5 + Math.random() * 0.5;
    cols[i*3] = c[0]*b; cols[i*3+1] = c[1]*b; cols[i*3+2] = c[2]*b;
  }

  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gGeo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));

  const gMat = new THREE.PointsMaterial({
    size: isMobile ? 0.22 : 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const galaxy = new THREE.Points(gGeo, gMat);
  scene.add(galaxy);

  /* ── B. DNA DOUBLE HELIX ── */
  const dnaGroup   = new THREE.Group();
  const helixNodes = isMobile ? 48 : 90;
  const helixMeshes = [];

  for (let i = 0; i < helixNodes; i++) {
    const t = (i / helixNodes) * Math.PI * 9;
    const r = 2.8;
    const y = (i / helixNodes) * 32 - 16;

    const p1 = { x: Math.cos(t) * r, y, z: Math.sin(t) * r - 18 };
    const p2 = { x: Math.cos(t + Math.PI) * r, y, z: Math.sin(t + Math.PI) * r - 18 };

    [p1, p2].forEach((p, si) => {
      const isNode = i % 5 === 0;
      const radius = isNode ? 0.18 : 0.08;
      const geo = new THREE.SphereGeometry(radius, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: accHex[(i + si) % accHex.length],
        transparent: true,
        opacity: isNode ? 0.9 : 0.55,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.userData = { t, si, i, isNode, baseOpacity: mat.opacity };
      dnaGroup.add(mesh);
      helixMeshes.push(mesh);
    });

    // Cross rungs every 5
    if (i % 5 === 0) {
      const dist = Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.z-p1.z,2));
      const rGeo = new THREE.CylinderGeometry(0.025, 0.025, dist, 5);
      const rMat = new THREE.MeshBasicMaterial({
        color: accHex[i % accHex.length],
        transparent: true,
        opacity: 0.25,
      });
      const rung = new THREE.Mesh(rGeo, rMat);
      rung.position.set((p1.x+p2.x)/2, y, (p1.z+p2.z)/2);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = t;
      dnaGroup.add(rung);
    }
  }
  scene.add(dnaGroup);

  /* ── C. TORUS KNOT + MORPHING SHAPES ── */
  const floatingShapes = [];
  const shapeDefs = [
    { geo: new THREE.TorusKnotGeometry(1.3, 0.35, 80, 10), x: 16, y: 4, z: -8 },
    { geo: new THREE.IcosahedronGeometry(1.8, 1),           x: -18, y: -3, z: -6 },
    { geo: new THREE.TorusGeometry(1.6, 0.45, 10, 40),     x: 14, y: -8, z: -12 },
    { geo: new THREE.OctahedronGeometry(1.6, 0),            x: -15, y: 6, z: -10 },
    { geo: new THREE.IcosahedronGeometry(1.2, 2),           x: 20, y: -1, z: -14 },
    { geo: new THREE.TorusGeometry(1.0, 0.3, 8, 24),       x: -20, y: 8, z: -8  },
  ];

  const count = isMobile ? 3 : shapeDefs.length;
  for (let i = 0; i < count; i++) {
    const def = shapeDefs[i];
    const mat = new THREE.MeshBasicMaterial({
      color: accHex[i % accHex.length],
      wireframe: true,
      transparent: true,
      opacity: isMobile ? 0.12 : 0.17,
    });
    const mesh = new THREE.Mesh(def.geo, mat);
    mesh.position.set(def.x, def.y, def.z);
    const s = 0.7 + Math.random() * 0.9;
    mesh.scale.set(s, s, s);
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.014,
      ry: (Math.random() - 0.5) * 0.018,
      rz: (Math.random() - 0.5) * 0.01,
      floatAmp:   0.7 + Math.random() * 1.1,
      floatSpeed: 0.18 + Math.random() * 0.35,
      floatOff:   Math.random() * Math.PI * 2,
      pulseOff:   Math.random() * Math.PI * 2,
      baseY:      def.y,
      baseOp:     isMobile ? 0.12 : 0.17,
    };
    scene.add(mesh);
    floatingShapes.push(mesh);
  }

  /* ── D. ENERGY RINGS (concentric, tilted) ── */
  const ringGroup = new THREE.Group();
  ringGroup.position.set(0, 0, -20);
  const ringCount = isMobile ? 3 : 5;
  const ringMeshes = [];

  for (let i = 0; i < ringCount; i++) {
    const geo = new THREE.TorusGeometry(4 + i * 2.8, 0.045, 6, 100);
    const mat = new THREE.MeshBasicMaterial({
      color: accHex[i % accHex.length],
      transparent: true,
      opacity: 0.14,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI * 0.42 + i * 0.18;
    ring.rotation.z = i * 0.22;
    ring.userData = {
      rotY: 0.004 + i * 0.003,
      rotX: 0.001 + i * 0.001,
      pulseOff: i * (Math.PI * 2 / ringCount),
    };
    ringGroup.add(ring);
    ringMeshes.push(ring);
  }
  scene.add(ringGroup);

  /* ── E. NEURAL NETWORK NODES ── */
  const neuralGroup = new THREE.Group();
  const nodeCount   = isMobile ? 18 : 35;
  const nodeMeshes  = [];
  const nodePos     = [];

  for (let i = 0; i < nodeCount; i++) {
    const p = new THREE.Vector3(
      (Math.random() - 0.5) * 55,
      (Math.random() - 0.5) * 32,
      (Math.random() - 0.5) * 22 - 8
    );
    nodePos.push(p);

    const isHub = i % 7 === 0;
    const geo = new THREE.SphereGeometry(isHub ? 0.22 : 0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: accHex[i % accHex.length],
      transparent: true,
      opacity: isHub ? 0.8 : 0.45,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(p);
    mesh.userData = {
      basePos: p.clone(),
      fs: 0.18 + Math.random() * 0.28,
      fo: Math.random() * Math.PI * 2,
      fa: 0.4 + Math.random() * 0.9,
      baseOp: mat.opacity,
    };
    neuralGroup.add(mesh);
    nodeMeshes.push(mesh);
  }

  // Draw edges between close nodes
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x7B61FF, transparent: true, opacity: 0.1,
  });
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (nodePos[i].distanceTo(nodePos[j]) < 13) {
        const geo = new THREE.BufferGeometry().setFromPoints([nodePos[i], nodePos[j]]);
        neuralGroup.add(new THREE.Line(geo, edgeMat));
      }
    }
  }
  scene.add(neuralGroup);

  /* ── F. GRID FLOOR (wave) ── */
  const gridHelper = new THREE.GridHelper(100, 32, 0x0A0A1E, 0x0D0D22);
  gridHelper.position.y = -14;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = isMobile ? 0.2 : 0.35;
  scene.add(gridHelper);

  /* ── G. BURST PARTICLES ── */
  const BURST = 250;
  const bPos   = new Float32Array(BURST * 3);
  const bCols  = new Float32Array(BURST * 3);
  const bVel   = [];
  let burstOn = false, burstT = 0;

  for (let i = 0; i < BURST; i++) {
    bPos[i*3] = bPos[i*3+1] = bPos[i*3+2] = 9999; // hidden offscreen
    const spd = 0.06 + Math.random() * 0.18;
    const th  = Math.random() * Math.PI * 2;
    const ph  = Math.random() * Math.PI;
    bVel.push({
      x: Math.sin(ph) * Math.cos(th) * spd,
      y: Math.sin(ph) * Math.sin(th) * spd + 0.02,
      z: Math.cos(ph) * spd,
    });
    const c = accRGB[i % accRGB.length];
    bCols[i*3] = c[0]; bCols[i*3+1] = c[1]; bCols[i*3+2] = c[2];
  }

  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  bGeo.setAttribute('color',    new THREE.BufferAttribute(bCols, 3));
  const bMat = new THREE.PointsMaterial({
    size: 0.25, vertexColors: true,
    transparent: true, opacity: 0,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const burstMesh = new THREE.Points(bGeo, bMat);
  scene.add(burstMesh);

  let burstOrigin = new THREE.Vector3();

  function triggerBurst(x, y, z) {
    burstOrigin.set(x||0, y||0, z||0);
    burstOn = true; burstT = 0;
    bMat.opacity = 0.95;
    const arr = bGeo.attributes.position.array;
    for (let i = 0; i < BURST * 3; i++) arr[i] = 0;
    bGeo.attributes.position.needsUpdate = true;
  }

  /* ── Section scroll burst trigger ── */
  let lastSec = -1;
  window.addEventListener('scroll', () => {
    document.querySelectorAll('section[id]').forEach((s, idx) => {
      const r = s.getBoundingClientRect();
      if (r.top <= 120 && r.bottom >= 120 && idx !== lastSec) {
        lastSec = idx;
        triggerBurst((Math.random()-0.5)*8, (Math.random()-0.5)*4, 0);
      }
    });
  }, { passive: true });

  /* ── Parallax inputs ── */
  let mx = 0, my = 0, scrollY = 0;

  if (!isTouchDevice()) {
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  } else {
    window.addEventListener('deviceorientation', e => {
      mx = (e.gamma||0) / 45;
      my = (e.beta ||0) / 90;
    }, { passive: true });
  }

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ══ ANIMATION LOOP ══ */
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Galaxy */
    galaxy.rotation.y = t * 0.05;
    gMat.opacity = 0.65 + Math.sin(t * 0.2) * 0.1;

    /* DNA */
    dnaGroup.rotation.y = t * 0.1;
    dnaGroup.position.x = Math.sin(t * 0.07) * 2.5;
    helixMeshes.forEach((m, i) => {
      const pulse = 0.85 + Math.sin(t * 1.8 + i * 0.22) * 0.18;
      m.scale.setScalar(pulse);
      m.material.opacity = m.userData.baseOpacity * (0.55 + Math.sin(t * 0.9 + i * 0.3) * 0.45);
    });

    /* Morphing shapes */
    floatingShapes.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.rotation.z += m.userData.rz;
      m.position.y  = m.userData.baseY
        + Math.sin(t * m.userData.floatSpeed + m.userData.floatOff) * m.userData.floatAmp;
      m.material.opacity = m.userData.baseOp
        * (0.65 + Math.sin(t * 0.5 + m.userData.pulseOff) * 0.35);
    });

    /* Energy rings */
    ringMeshes.forEach((r, i) => {
      r.rotation.y += r.userData.rotY;
      r.rotation.z += r.userData.rotX;
      r.material.opacity = 0.07 + Math.sin(t * 0.55 + r.userData.pulseOff) * 0.09;
      const s = 1 + Math.sin(t * 0.28 + r.userData.pulseOff) * 0.04;
      r.scale.setScalar(s);
    });

    /* Neural nodes */
    nodeMeshes.forEach(m => {
      m.position.y = m.userData.basePos.y
        + Math.sin(t * m.userData.fs + m.userData.fo) * m.userData.fa;
      m.position.x = m.userData.basePos.x
        + Math.cos(t * m.userData.fs * 0.6 + m.userData.fo) * 0.35;
      m.material.opacity = m.userData.baseOp * (0.5 + Math.sin(t * 0.7 + m.userData.fo) * 0.5);
    });

    /* Grid wave */
    gridHelper.position.y = -14 + Math.sin(t * 0.18) * 0.8;

    /* Burst */
    if (burstOn) {
      burstT += 0.017;
      const arr = bGeo.attributes.position.array;
      for (let i = 0; i < BURST; i++) {
        arr[i*3]   += bVel[i].x;
        arr[i*3+1] += bVel[i].y;
        arr[i*3+2] += bVel[i].z;
        bVel[i].y  -= 0.0012; // gravity
      }
      bGeo.attributes.position.needsUpdate = true;
      bMat.opacity = Math.max(0, 0.95 - burstT * 1.3);
      if (burstT > 1.4) { burstOn = false; bMat.opacity = 0; }
    }

    /* Camera parallax */
    camera.position.x += (mx * 4    - camera.position.x) * 0.028;
    camera.position.y += (-my * 2.5 - camera.position.y) * 0.028;
    camera.position.z  = 30 - scrollY * 0.005;
    camera.rotation.z  = Math.sin(t * 0.04) * 0.004;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();

/* ══════════════════════
   4. SCROLL REVEAL
══════════════════════ */
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ══════════════════════
   5. SKILL BARS
══════════════════════ */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.sk-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));

/* ══════════════════════
   6. 3D TILT
══════════════════════ */
function addTilt(el, maxDeg = 10, perspective = 700) {
  if (isTouchDevice()) return;
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = ((e.clientY - cy) / rect.height) * -maxDeg;
    const ry = ((e.clientX - cx) / rect.width ) *  maxDeg;
    el.style.transform =
      `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
}

const aboutCard = document.getElementById('aboutCard');
if (aboutCard) addTilt(aboutCard, 18, 800);
document.querySelectorAll('.wcard').forEach(card => addTilt(card, 7, 600));

/* ══════════════════════
   7. ACTIVE NAV
══════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(l => l.style.color = '');
      const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (a) a.style.color = 'var(--fg)';
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObs.observe(s));

/* ══════════════════════
   8. FILTER TABS
══════════════════════ */
const tabs   = document.querySelectorAll('.ftab');
const wCards = document.querySelectorAll('.wcard');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;
    wCards.forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
    });
  });
});

/* ══════════════════════════════════════
   9. LIGHTBOX
══════════════════════════════════════ */
let lbItems  = [];
let lbIndex  = 0;
let lbSlides = [];
let lbSlide  = 0;

function openLb(el) {
  lbItems  = [...document.querySelectorAll('.wcard:not([style*="display: none"])')];
  lbIndex  = lbItems.indexOf(el);
  loadProject(el);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function buildSlides(el) {
  const slides = [];
  const videosSrc = el.dataset.videos || el.dataset.video || '';
  const gallerySrc = el.dataset.gallery || '';

  if (videosSrc) {
    videosSrc.split(',').forEach(s => {
      const src = s.trim();
      if (src) slides.push({ type: 'vid', src });
    });
  }
  if (gallerySrc) {
    gallerySrc.split(',').forEach(s => {
      const src = s.trim();
      if (src) slides.push({ type: 'img', src });
    });
  }
  if (!slides.length) {
    const ci = el.querySelector('.wcard-img');
    if (ci) slides.push({ type: 'img', src: ci.src });
  }
  return slides;
}

function loadProject(el) {
  lbSlides = buildSlides(el);
  lbSlide  = 0;
  document.getElementById('lbTitle').textContent = el.dataset.title || '';
  document.getElementById('lbDesc').textContent  = el.dataset.desc  || '';
  renderSlide();
  renderDots();
}

function renderSlide() {
  const media = document.getElementById('lbMedia');
  stopLbVideo();
  const slide = lbSlides[lbSlide];
  if (!slide) { media.innerHTML = ''; return; }
  if (slide.type === 'vid') {
    media.innerHTML = `<video class="lb-video" src="${slide.src}"
      controls autoplay muted playsinline
      style="width:100%;border-radius:14px;max-height:70vh;background:#000;display:block"></video>`;
  } else {
    media.innerHTML = `<img src="${slide.src}" class="lb-img" alt=""
      onerror="this.style.display='none'">`;
  }
  updateDots();
}

function renderDots() {
  const dw = document.getElementById('lbDots');
  if (!dw) return;
  if (lbSlides.length <= 1) { dw.innerHTML = ''; return; }
  dw.innerHTML = lbSlides.map((s, i) => `
    <button class="lb-dot ${i === lbSlide ? 'active' : ''}"
            onclick="goSlide(${i})" aria-label="Slide ${i+1}">${s.type==='vid'?'▶':''}</button>`
  ).join('');
}

function updateDots() {
  document.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === lbSlide));
  const c = document.getElementById('lbCounter');
  if (c) c.textContent = lbSlides.length > 1 ? `${lbSlide+1} / ${lbSlides.length}` : '';
}

function goSlide(i)     { lbSlide = i; renderSlide(); }
function prevSlide(e)   { e&&e.stopPropagation(); if(lbSlides.length<=1){navLb(-1);return;} lbSlide=(lbSlide-1+lbSlides.length)%lbSlides.length; renderSlide(); }
function nextSlide(e)   { e&&e.stopPropagation(); if(lbSlides.length<=1){navLb(1);return;}  lbSlide=(lbSlide+1)%lbSlides.length; renderSlide(); }
function stopLbVideo()  { const v=document.querySelector('#lbMedia video'); if(v){v.pause();v.src='';} }
function closeLb()      { stopLbVideo(); document.getElementById('lightbox').classList.remove('open'); document.body.style.overflow=''; }
function closeLbOut(e)  { if(e.target.id==='lightbox') closeLb(); }
function navLb(dir)     { if(!lbItems.length) return; lbIndex=(lbIndex+dir+lbItems.length)%lbItems.length; loadProject(lbItems[lbIndex]); }

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key==='Escape')     closeLb();
  if (e.key==='ArrowRight') nextSlide();
  if (e.key==='ArrowLeft')  prevSlide();
});

(function addSwipe() {
  const lb = document.getElementById('lightbox');
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
  lb.addEventListener('touchend',   e => { const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) dx<0?nextSlide():prevSlide(); }, { passive:true });
})();

/* ══════════════════════
   10. CONTACT FORM
══════════════════════ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-send');
    btn.textContent = 'Sent! ✓';
    btn.style.background = 'linear-gradient(135deg,#00E676,#11998e)';
    setTimeout(() => { btn.textContent='Send Message ✦'; btn.style.background=''; contactForm.reset(); }, 3000);
  });
}

/* ══════════════════════
   11. FILE UPLOAD
══════════════════════ */
const uploadZone = document.getElementById('uploadZone');
const fileInput  = document.getElementById('fileInput');
const grid       = document.getElementById('worksGrid');

if (uploadZone && fileInput && grid) {
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  fileInput.addEventListener('change', e => handleFiles(e.target.files));
}

function handleFiles(files) {
  [...files].forEach(file => {
    const url   = URL.createObjectURL(file);
    const isVid = file.type.startsWith('video/');
    const name  = file.name.replace(/\.[^.]+$/, '');
    const item  = document.createElement('div');
    item.className = 'wcard reveal';
    item.dataset.type  = isVid ? 'video' : 'design';
    item.dataset.title = name;
    item.dataset.desc  = isVid ? 'Uploaded video' : 'Uploaded image';
    item.innerHTML = isVid
      ? `<video src="${url}" style="width:100%;height:220px;object-fit:cover;display:block" muted loop playsinline onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0"></video>
         <div class="wcard-bottom"><div><h3>${name}</h3><p>Uploaded</p></div><span class="wbadge wb-video">Video</span></div>`
      : `<img src="${url}" style="width:100%;display:block" alt="${name}">
         <div class="wcard-overlay"><h3>${name}</h3></div>
         <div class="wcard-bottom"><div><h3>${name}</h3><p>Uploaded</p></div><span class="wbadge wb-design">Design</span></div>`;
    item.onclick = () => openLb(item);
    if (!isTouchDevice()) addTilt(item, 7, 600);
    grid.insertBefore(item, uploadZone);
    setTimeout(() => item.classList.add('visible'), 50);
  });
}