const $ = (s) => document.querySelector(s);
const fx = $('#fx');
const bg = $('#bg');
const colors = ['#ff6fa5', '#ff9ec4', '#ff4d8d', '#f78fb3', '#ffb3d1', '#e8366f'];
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------- hearts (fireworks) ---------- */
function burst(n, x, y) {
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    const a = rand(0, Math.PI * 2);
    const d = rand(80, 280);
    h.className = 'heart pop';
    h.textContent = '♥';
    h.style.cssText = `left:${x}px;top:${y}px;font-size:${rand(14, 34)}px;color:${pick(colors)};` +
      `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;animation-delay:${rand(0, 0.25)}s`;
    h.addEventListener('animationend', () => h.remove());
    fx.appendChild(h);
  }
}

function rise(container) {
  const h = document.createElement('span');
  h.className = 'heart rise';
  h.textContent = '♥';
  h.style.cssText = `left:${rand(0, 100)}%;font-size:${rand(14, 32)}px;color:${pick(colors)};` +
    `--t:${rand(5, 9)}s;--dx:${rand(-40, 40)}px`;
  h.addEventListener('animationend', () => h.remove());
  container.appendChild(h);
}

/* ---------- aligned pink sketch pattern over the whole background ---------- */
function drawBackground() {
  bg.innerHTML = '';
  const cell = 76;
  const cols = Math.ceil(window.innerWidth / cell) + 1;
  const rows = Math.ceil(window.innerHeight / cell) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isFlower = (r + c) % 2 === 0;
      const sym = isFlower ? 'doodle-flower' : 'doodle-heart';
      const vb = isFlower ? '0 0 100 100' : '0 0 24 24';
      const size = cell * 0.5;
      const d = document.createElement('div');
      d.className = 'bg-doodle';
      d.style.cssText = `left:${c * cell + cell / 2}px;top:${r * cell + cell / 2}px;width:${size}px;height:${size}px`;
      d.innerHTML = `<svg viewBox="${vb}"><use href="#${sym}"/></svg>`;
      bg.appendChild(d);
    }
  }
}

/* ---------- pink vine border around the paper ---------- */
function createVineBorder() {
  const frame = $('.paper-frame');
  const paper = $('#paper');
  const old = frame.querySelector('.vine-border');
  if (old) old.remove();

  const w = paper.offsetWidth, h = paper.offsetHeight;
  const m = 20, amp = 7, step = 30;
  const W = w + m * 2, H = h + m * 2;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'vine-border');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);

  let d = `M ${m} ${m}`;
  let t = 1;
  for (let x = m; x < W - m - 0.1; x += step) {
    const nx = Math.min(x + step, W - m);
    d += ` Q ${(x + nx) / 2} ${m + t * amp} ${nx} ${m}`;
    t *= -1;
  }
  for (let y = m; y < H - m - 0.1; y += step) {
    const ny = Math.min(y + step, H - m);
    d += ` Q ${W - m + t * amp} ${(y + ny) / 2} ${W - m} ${ny}`;
    t *= -1;
  }
  for (let x = W - m; x > m + 0.1; x -= step) {
    const nx = Math.max(x - step, m);
    d += ` Q ${(x + nx) / 2} ${H - m + t * amp} ${nx} ${H - m}`;
    t *= -1;
  }
  for (let y = H - m; y > m + 0.1; y -= step) {
    const ny = Math.max(y - step, m);
    d += ` Q ${m + t * amp} ${(y + ny) / 2} ${m} ${ny}`;
    t *= -1;
  }
  const stem = document.createElementNS(ns, 'path');
  stem.setAttribute('class', 'vine-stem');
  stem.setAttribute('d', d);
  svg.appendChild(stem);

  function leaf(x, y, rot) {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
    const u = document.createElementNS(ns, 'use');
    u.setAttribute('href', '#vine-leaf');
    u.setAttribute('class', 'vine-leaf');
    u.setAttribute('width', 20);
    u.setAttribute('height', 20);
    u.setAttribute('x', -10);
    u.setAttribute('y', -10);
    g.appendChild(u);
    svg.appendChild(g);
  }
  let k = 0;
  for (let x = m + 30; x <= W - m - 30; x += 46) {
    leaf(x, m, k++ % 2 ? -35 : 35);
    leaf(x, H - m, k++ % 2 ? 215 : 145);
  }
  for (let y = m + 30; y <= H - m - 30; y += 46) {
    leaf(W - m, y, k++ % 2 ? 55 : 125);
    leaf(m, y, k++ % 2 ? 305 : 235);
  }

  if (paper.classList.contains('closing')) svg.classList.add('closing');
  frame.appendChild(svg);
}

/* ---------- scenes ---------- */
function show(id) {
  document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('active', s.id === id));
  // blur the background when text is showing so it stays readable
  bg.classList.toggle('blurred', id === 'letter' || id === 'ask' || id === 'yay');
}

/* ---------- start ---------- */
function redraw() {
  createVineBorder();
  drawBackground();
}
redraw();
window.addEventListener('resize', redraw);

const heartPath = $('#heartLine .heart-path');
const heartLen = heartPath.getTotalLength();
heartPath.style.strokeDasharray = heartLen;
heartPath.style.setProperty('--len', heartLen);

document.querySelectorAll('#tulipDoodle path').forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  p.style.setProperty('--len', len);
  const delay = p.classList.contains('tulip-stem') ? 1.4
    : p.classList.contains('tulip-leaf') ? 2.2 : 2.6;
  p.style.setProperty('--delay', delay + 's'); // stem grows first, then leaves, then bloom
});

window.addEventListener('load', () => {
  burst(40, window.innerWidth / 2, window.innerHeight / 2);
});

let opened = false;
$('#cover').addEventListener('click', (e) => {
  if (opened) return;
  opened = true;
  burst(16, e.clientX, e.clientY);
  show('letter');
});

let moved = false;
$('#nextBtn').addEventListener('click', () => {
  if (moved) return;
  moved = true;
  $('#paper').classList.add('closing');
  const vine = $('.vine-border');
  if (vine) vine.classList.add('closing'); // vine folds away with the letter
  setTimeout(() => {
    show('anim');
    const t = setInterval(() => burst(8, rand(40, window.innerWidth - 40), rand(40, window.innerHeight - 40)), 120);
    setTimeout(() => {
      clearInterval(t);
      show('ask');
      burst(30, window.innerWidth / 2, window.innerHeight / 2);
    }, 4000); // 4 second line-drawn heart + fireworks
  }, 750);
});

let said = false;
document.querySelectorAll('.yes').forEach((b) =>
  b.addEventListener('click', () => {
    if (said) return;
    said = true;
    show('yay');
    burst(70, window.innerWidth / 2, window.innerHeight / 2);
    const t = setInterval(() => {
      burst(14, rand(40, window.innerWidth - 40), rand(80, window.innerHeight - 80));
      rise(fx); rise(fx);
    }, 350);
    setTimeout(() => clearInterval(t), 30000); // keep the hearts popping longer
  })
);
