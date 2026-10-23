const NS = 'http://www.w3.org/2000/svg';

const gift = document.getElementById('gift');
const giftScene = document.getElementById('giftScene');
const bouquetScene = document.getElementById('bouquetScene');
const svg = document.getElementById('bouquet');
const message = document.getElementById('message');

const MESSAGE_TEXT = 'Un regalito virtual para ti ♡';
const BASE = { x: 200, y: 450 }; // punto donde se juntan los tallos
const SPEED = 0.6; // 1 = velocidad original; más chico = más rápido

// Paletas pastel: base = color cerca del centro, tip = color en la orilla del pétalo
const ROSE_PALETTES = {
  dusty: { base: '#d98ba0', tip: '#fbe3e8', line: '#c97b91', core: '#c46f87' },
  peach: { base: '#e9a493', tip: '#fde9df', line: '#d68f7e', core: '#cf7e70' },
  blush: { base: '#e8adb9', tip: '#fff3f1', line: '#d9969f', core: '#d58897' },
};

const GERBERA_PALETTES = {
  pink: { base: '#ee9fb3', tip: '#ffe6ec' },
  peach: { base: '#f3b493', tip: '#ffecdf' },
  cream: { base: '#ecd3c0', tip: '#fffaf4' },
  orchid: { base: '#e3a3c4', tip: '#fbe6f1' },
};

// Flores grandes y amontonadas: de atrás hacia adelante
const FLOWERS = [
  { type: 'gerbera', x: 118, y: 112, r: 50, p: 'cream' },
  { type: 'rose', x: 200, y: 92, r: 44, p: 'dusty' },
  { type: 'gerbera', x: 284, y: 112, r: 50, p: 'peach' },
  { type: 'rose', x: 62, y: 192, r: 44, p: 'blush' },
  { type: 'gerbera', x: 152, y: 182, r: 54, p: 'pink' },
  { type: 'rose', x: 250, y: 178, r: 48, p: 'peach' },
  { type: 'rose', x: 340, y: 194, r: 44, p: 'dusty' },
  { type: 'gerbera', x: 96, y: 264, r: 50, p: 'orchid' },
  { type: 'gerbera', x: 304, y: 262, r: 50, p: 'pink' },
];

// Nubecitas de flores blancas
const BABY_BREATH = [
  { x: 35, y: 120 }, { x: 365, y: 120 }, { x: 125, y: 40 },
  { x: 275, y: 40 }, { x: 20, y: 270 }, { x: 380, y: 270 },
];

// ---------- Utilidades ----------
function el(tag, attrs = {}, parent = svg) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  parent.appendChild(node);
  return node;
}

function delay(node, seconds) {
  node.style.setProperty('--d', `${seconds * SPEED}s`);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Degradado a lo largo del pétalo (de la base a la punta)
function petalGradient(defs, id, base, tip) {
  const g = el('linearGradient', { id, x1: 0.5, y1: 1, x2: 0.5, y2: 0 }, defs);
  el('stop', { offset: '0%', 'stop-color': base }, g);
  el('stop', { offset: '100%', 'stop-color': tip }, g);
}

function setupDefs() {
  const defs = el('defs');
  for (const [name, c] of Object.entries(ROSE_PALETTES)) petalGradient(defs, `rose-${name}`, c.base, c.tip);
  for (const [name, c] of Object.entries(GERBERA_PALETTES)) petalGradient(defs, `gerbera-${name}`, c.base, c.tip);
  petalGradient(defs, 'paperFront', '#ecc9c6', '#f8e6e1');
  petalGradient(defs, 'paperBack', '#ead8c4', '#f7ede1');
}

// ---------- Abrir el regalo ----------
gift.addEventListener('click', () => {
  if (gift.classList.contains('open')) return;
  gift.classList.add('open');
  giftScene.classList.add('leaving');

  const rect = gift.getBoundingClientRect();
  bloomBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

  setTimeout(() => {
    giftScene.classList.add('hidden');
    bouquetScene.classList.remove('hidden');
    drawBouquet();
  }, 1200);
});

function bloomBurst(x, y) {
  const icons = ['✿', '❀', '♡'];
  const colors = ['#e8a3b4', '#cbb8e6', '#f3b493', '#d98ba0'];
  for (let i = 0; i < 16; i++) {
    const span = document.createElement('span');
    span.className = 'burst';
    span.textContent = icons[i % icons.length];
    span.style.color = colors[i % colors.length];
    const angle = (Math.PI * 2 * i) / 16;
    const dist = rand(110, 190);
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    span.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    span.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1500);
  }
}

// ---------- Dibujar el ramo ----------
function drawBouquet() {
  setupDefs();

  // Papel de atrás
  const back = el('path', {
    d: 'M10,175 Q200,235 390,175 L232,455 L168,455 Z',
    fill: 'url(#paperBack)',
    stroke: '#e3cdb8',
    'stroke-width': 1.5,
    class: 'fade',
  });
  delay(back, 0);

  // Tallos
  const stems = el('g');
  FLOWERS.forEach((f, i) => {
    const cx = (BASE.x + f.x) / 2 + (f.x - BASE.x) * 0.12;
    const stem = el('path', {
      d: `M${BASE.x},${BASE.y} Q${cx},${(BASE.y + f.y) / 2} ${f.x},${f.y}`,
      class: 'stem',
    }, stems);
    const len = stem.getTotalLength();
    stem.style.strokeDasharray = len;
    stem.style.strokeDashoffset = len;
    delay(stem, 0.3 + i * 0.04);
  });

  // Flores blancas (detrás de las flores grandes)
  BABY_BREATH.forEach((b, i) => addBabyBreath(b.x, b.y, 1.4 + i * 0.08));

  // Papel del frente (las flores lo tapan por arriba)
  const front = el('path', {
    d: 'M75,300 Q200,345 325,300 L230,470 L170,470 Z',
    fill: 'url(#paperFront)',
    stroke: '#e2b7b6',
    'stroke-width': 1.5,
    class: 'fade',
  });
  delay(front, 1.9);
  const vellum = el('path', {
    d: 'M110,310 Q170,335 245,312 L214,468 L182,468 Z',
    fill: '#fffaf6',
    opacity: 0.55,
    class: 'fade',
  });
  delay(vellum, 2.1);

  // Flores grandes
  FLOWERS.forEach((f, i) => {
    const start = 2.3 + i * 0.25;
    if (f.type === 'gerbera') addGerbera(f, start);
    else addRose(f, start);
  });

  // Pompompurin asomándose desde el ramo
  const purinTime = 2.3 + FLOWERS.length * 0.25 + 0.2;
  addPurin(200, 262, purinTime);

  // Moño
  const bowTime = purinTime + 0.8;
  addBow(200, 400, bowTime);

  // Mensaje
  setTimeout(typeMessage, (bowTime + 0.5) * SPEED * 1000);
}

function addBabyBreath(x, y, start) {
  const g = el('g', { transform: `translate(${x},${y})` });
  for (let i = 0; i < 9; i++) {
    const dx = rand(-22, 22);
    const dy = rand(-22, 22);
    el('path', { d: `M0,18 L${dx},${dy}`, stroke: '#b5c7a9', 'stroke-width': 0.8 }, g);
    const dot = el('circle', { cx: dx, cy: dy, r: rand(2.5, 4), fill: '#fffdf8', stroke: '#efe4da', 'stroke-width': 0.6, class: 'grow' }, g);
    dot.style.transformOrigin = `${dx}px ${dy}px`;
    delay(dot, start + i * 0.04);
  }
}

function addGerbera(f, start) {
  const R = f.r;
  const fill = `url(#gerbera-${f.p})`;
  const g = el('g', { transform: `translate(${f.x},${f.y}) rotate(${rand(0, 30)})` });

  // Pétalo con puntita un poco hendida
  const petal = (L, w) =>
    `M0,0 C${w},${-L * 0.25} ${w},${-L * 0.85} ${w * 0.45},${-L} ` +
    `Q0,${-L * 0.94} ${-w * 0.45},${-L} C${-w},${-L * 0.85} ${-w},${-L * 0.25} 0,0 Z`;

  const layers = [
    { count: 26, L: R, w: R * 0.15, offset: 0, wait: 0.15 },
    { count: 22, L: R * 0.78, w: R * 0.14, offset: 8, wait: 0.35 },
    { count: 16, L: R * 0.52, w: R * 0.12, offset: 4, wait: 0.55 },
  ];
  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      const wrap = el('g', { transform: `rotate(${(360 / layer.count) * i + layer.offset})` }, g);
      const p = el('path', {
        d: petal(layer.L, layer.w),
        fill,
        stroke: 'rgba(150, 90, 100, 0.12)',
        'stroke-width': 0.6,
        class: 'grow',
      }, wrap);
      delay(p, start + layer.wait + i * 0.012);
    }
  });

  // Centro: anillo de estambres + disco
  const center = el('g', { class: 'grow' }, g);
  el('circle', { r: R * 0.3, fill: '#efd38a' }, center);
  for (let i = 0; i < 28; i++) {
    const a = (Math.PI * 2 * i) / 28;
    el('circle', { cx: Math.cos(a) * R * 0.25, cy: Math.sin(a) * R * 0.25, r: R * 0.035, fill: '#d9b25e' }, center);
  }
  el('circle', { r: R * 0.18, fill: '#8c6a3f' }, center);
  el('circle', { r: R * 0.1, fill: '#a7884f', opacity: 0.8 }, center);
  delay(center, start);
}

function addRose(f, start) {
  const R = f.r;
  const c = ROSE_PALETTES[f.p];
  const fill = `url(#rose-${f.p})`;
  const g = el('g', { transform: `translate(${f.x},${f.y}) rotate(${rand(0, 72)})` });

  // Pétalo redondeado tipo copa
  const petal = (L) =>
    `M0,0 C${-L * 0.62},${-L * 0.08} ${-L * 0.7},${-L * 0.92} 0,${-L} ` +
    `C${L * 0.7},${-L * 0.92} ${L * 0.62},${-L * 0.08} 0,0 Z`;

  const layers = [
    { count: 6, L: R, offset: 0, wait: 0 },
    { count: 6, L: R * 0.82, offset: 30, wait: 0.15 },
    { count: 5, L: R * 0.64, offset: 10, wait: 0.3 },
    { count: 5, L: R * 0.46, offset: 46, wait: 0.45 },
  ];
  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (360 / layer.count) * i + layer.offset + rand(-6, 6);
      const wrap = el('g', { transform: `rotate(${angle})` }, g);
      const p = el('path', {
        d: petal(layer.L),
        fill,
        stroke: c.line,
        'stroke-width': 0.8,
        'stroke-opacity': 0.55,
        class: 'grow',
      }, wrap);
      delay(p, start + layer.wait + i * 0.04);
    }
  });

  // Botón central con espiral
  const bud = el('g', { class: 'grow' }, g);
  const k = R / 40;
  el('circle', { r: R * 0.26, fill: c.base }, bud);
  el('path', {
    d: `M0,0 m${-3 * k},0 a${3 * k},${3 * k} 0 1,1 ${6 * k},0 ` +
       `a${6 * k},${6 * k} 0 1,1 ${-12 * k},0 a${9 * k},${9 * k} 0 1,1 ${18 * k},0`,
    fill: 'none',
    stroke: c.core,
    'stroke-width': 1.6,
    'stroke-linecap': 'round',
  }, bud);
  delay(bud, start + 0.6);
}

function addPurin(x, y, start) {
  const defs = svg.querySelector('defs');

  // Color de peluche: más claro arriba, más dorado en las orillas
  const grad = el('radialGradient', { id: 'purinBody', cx: 0.4, cy: 0.3, r: 0.75 }, defs);
  el('stop', { offset: '0%', 'stop-color': '#fee99a' }, grad);
  el('stop', { offset: '60%', 'stop-color': '#f8d458' }, grad);
  el('stop', { offset: '100%', 'stop-color': '#eebf3c' }, grad);

  // Solo se ve la parte que queda arriba del papel, como si estuviera dentro del ramo
  const clip = el('clipPath', { id: 'insideBouquet' }, defs);
  el('path', { d: 'M0,-100 L400,-100 L400,300 L325,300 Q200,345 75,300 L0,300 Z' }, clip);

  const clipped = el('g', { 'clip-path': 'url(#insideBouquet)' });
  const g = el('g', { transform: `translate(${x},${y})` }, clipped);
  const pop = el('g', { class: 'grow' }, g);
  const bob = el('g', { class: 'bob' }, pop);
  const purin = el('g', { class: 'purin', tabindex: 0, role: 'button', 'aria-label': 'Tocar a Pompompurin' }, bob);
  const soft = { fill: 'url(#purinBody)', stroke: '#d9a93a', 'stroke-width': 1.5, 'stroke-linejoin': 'round' };
  const ink = '#3b2415';

  // Cuerpo redondito (cabeza y cuerpo son uno solo)
  el('path', {
    d: 'M0,-48 C36,-48 58,-24 60,6 C62,40 58,70 52,95 L-52,95 C-58,70 -62,40 -60,6 C-58,-24 -36,-48 0,-48 Z',
    ...soft,
  }, purin);

  // Orejas que salen hacia los lados y caen
  const ear = 'M40,-30 C60,-42 86,-32 92,-12 C96,2 86,10 74,5 C62,0 52,-10 42,-12 Z';
  el('path', { d: ear, ...soft }, purin);
  el('path', { d: ear, transform: 'scale(-1,1)', ...soft }, purin);

  // Boina café con su colita
  el('path', { d: 'M5,-66 C3,-73 7,-79 12,-78', fill: 'none', stroke: '#6b3e20', 'stroke-width': 6, 'stroke-linecap': 'round' }, purin);
  el('path', {
    d: 'M-30,-40 C-36,-58 -12,-68 6,-68 C28,-68 44,-58 38,-42 C28,-35 -20,-34 -30,-40 Z',
    fill: '#7b4a28',
    stroke: '#5e3519',
    'stroke-width': 1.5,
  }, purin);
  el('ellipse', { cx: -2, cy: -58, rx: 14, ry: 4, fill: '#94603a', opacity: 0.7 }, purin);

  // Cachetes (aparecen cuando lo tocas)
  const cheeks = el('g', { class: 'cheeks' }, purin);
  el('ellipse', { cx: -38, cy: 8, rx: 8, ry: 4.5, fill: '#f6a4b0' }, cheeks);
  el('ellipse', { cx: 38, cy: 8, rx: 8, ry: 4.5, fill: '#f6a4b0' }, cheeks);

  // Ojitos normales y ojitos felices ^ ^
  const eyesOpen = el('g', { class: 'eyes-open' }, purin);
  el('ellipse', { cx: -26, cy: -6, rx: 4.2, ry: 5, fill: ink }, eyesOpen);
  el('ellipse', { cx: 26, cy: -6, rx: 4.2, ry: 5, fill: ink }, eyesOpen);
  const eyesHappy = el('g', { class: 'eyes-happy' }, purin);
  el('path', { d: 'M-31,-4 Q-26,-12 -21,-4 M21,-4 Q26,-12 31,-4', fill: 'none', stroke: ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, eyesHappy);

  // Boquita abierta con lengüita, nariz y bigotito en "w"
  el('path', { d: 'M-8,13 Q0,10 8,13 Q8,27 0,27 Q-8,27 -8,13 Z', fill: '#f2a0ab', stroke: ink, 'stroke-width': 1.6 }, purin);
  el('path', { d: 'M0,5 L0,10 M-15,8 Q-8,17 0,10 Q8,17 15,8', fill: 'none', stroke: ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, purin);
  el('path', { d: 'M-7,0 Q0,-5 7,0 Q5,7 0,7 Q-5,7 -7,0 Z', fill: ink }, purin);

  // Bracitos sobre la pancita
  el('ellipse', { cx: -32, cy: 46, rx: 16, ry: 12, transform: 'rotate(-20 -32 46)', ...soft }, purin);
  el('ellipse', { cx: 32, cy: 46, rx: 16, ry: 12, transform: 'rotate(20 32 46)', ...soft }, purin);

  purin.addEventListener('click', (e) => pokePurin(purin, e));
  purin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pokePurin(purin);
    }
  });

  delay(pop, start);
}

// Cuando lo tocan: se apachurra, cierra los ojitos, se sonroja y suelta corazones
function pokePurin(purin, e) {
  purin.classList.remove('poked');
  void purin.getBoundingClientRect(); // reinicia la animación
  purin.classList.add('poked');
  clearTimeout(purin.pokeTimer);
  purin.pokeTimer = setTimeout(() => purin.classList.remove('poked'), 1400);

  document.getElementById('purinHint').classList.remove('show');

  const rect = purin.getBoundingClientRect();
  const x = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
  const y = rect.top + rect.height * 0.25;

  const icons = ['♡', '♥', '✿', '♡'];
  const colors = ['#f2a0ab', '#e88da0', '#cbb8e6', '#f6c6cf'];
  for (let i = 0; i < 7; i++) {
    const span = document.createElement('span');
    span.className = 'love';
    span.textContent = icons[i % icons.length];
    span.style.color = colors[i % colors.length];
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    span.style.setProperty('--dx', `${rand(-70, 70)}px`);
    span.style.setProperty('--rise', `${rand(60, 130)}px`);
    span.style.animationDelay = `${i * 0.05}s`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1700);
  }

  const words = ['purin~ ♡', 'jiji ♡', '¡te quiero!', 'mimitos ♡'];
  const bubble = document.createElement('span');
  bubble.className = 'love love-text';
  bubble.textContent = words[Math.floor(Math.random() * words.length)];
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top}px`;
  bubble.style.setProperty('--dx', '0px');
  bubble.style.setProperty('--rise', '50px');
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 1700);
}

function addBow(x, y, start) {
  const g = el('g', { transform: `translate(${x},${y})` });
  const inner = el('g', { class: 'grow' }, g);
  const ribbon = { fill: '#d4c3ec', stroke: '#b8a3d8', 'stroke-width': 1 };
  el('path', { d: 'M-2,2 C-10,30 -22,55 -30,72 L-18,66 L-12,78 C-6,55 -2,30 2,2 Z', ...ribbon }, inner);
  el('path', { d: 'M2,2 C10,30 22,55 30,72 L18,66 L12,78 C6,55 2,30 -2,2 Z', ...ribbon }, inner);
  el('path', { d: 'M0,0 C-30,-30 -55,-6 -46,8 C-38,20 -14,8 0,0 Z', ...ribbon }, inner);
  el('path', { d: 'M0,0 C30,-30 55,-6 46,8 C38,20 14,8 0,0 Z', ...ribbon }, inner);
  el('path', { d: 'M-8,-8 C-24,-18 -38,-6 -36,4', fill: 'none', stroke: '#efe6f8', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, inner);
  el('path', { d: 'M8,-8 C24,-18 38,-6 36,4', fill: 'none', stroke: '#efe6f8', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, inner);
  el('ellipse', { rx: 8, ry: 7, fill: '#c6b2e2', stroke: '#b8a3d8', 'stroke-width': 1 }, inner);
  delay(inner, start);
}

function typeMessage() {
  const chars = Array.from(MESSAGE_TEXT);
  let i = 0;
  message.classList.add('typing');
  const timer = setInterval(() => {
    message.textContent += chars[i++];
    if (i >= chars.length) {
      clearInterval(timer);
      setTimeout(() => {
        message.classList.remove('typing');
        document.getElementById('purinHint').classList.add('show');
      }, 900);
    }
  }, 55);
}

// ---------- Pétalos cayendo ----------
const petalsBox = document.getElementById('petals');
const PETAL_COLORS = ['#f6c6cf', '#f9d5c2', '#dccbf0', '#fff1e6', '#efb3c0'];

function spawnPetal() {
  const petal = document.createElement('span');
  petal.className = 'petal';
  const size = rand(9, 18);
  const duration = rand(9, 15);
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.3}px`;
  petal.style.background = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  petal.style.animationDuration = `${duration}s`;
  petal.style.setProperty('--drift', `${rand(-120, 120)}px`);
  petal.style.setProperty('--spin', `${rand(-360, 360)}deg`);
  petalsBox.appendChild(petal);
  setTimeout(() => petal.remove(), duration * 1000);
}

setInterval(spawnPetal, 700);
