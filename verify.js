// Numerical checks for every closed-form answer in data/*.js, plus data-integrity checks.
// Run: node verify.js   (exits non-zero if any check fails)
const fs = require('fs'), vm = require('vm');
let fails = 0, n = 0;
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
function check(name, got, want, tol) {
  n++;
  const ok = Array.isArray(want) ? want.length === got.length && want.every((w, i) => near(got[i], w, tol)) : near(got, want, tol);
  if (!ok) { fails++; console.log('FAIL', name, '\n  got ', got, '\n  want', want); }
}
function ok(name, cond) { n++; if (!cond) { fails++; console.log('FAIL', name); } }

// ---- comms helpers
// erfc via Numerical Recipes Chebyshev fit (|rel err| < 1.2e-7)
function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
    t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
const Q = x => 0.5 * erfc(x / Math.SQRT2);
const dB = r => 10 * Math.log10(r), undB = x => Math.pow(10, x / 10);
const dBm = w => dB(w / 1e-3), log2 = Math.log2;
const k_B = 1.380649e-23; // Boltzmann, J/K

// sanity of the helpers themselves
check('Q(0)', Q(0), 0.5);
check('Q(1)', Q(1), 0.158655, 1e-5);
check('Q(3)', Q(3), 1.349898e-3, 1e-5);
check('dB(2)', dB(2), 3.0103, 1e-4);

// ---- problem checks, one block per problem id
const sinc = x => x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
const Qinv = p => { let lo = 0, hi = 10; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; Q(m) > p ? lo = m : hi = m; } return lo; };
// numeric convolution (f*g)(t) with f supported on [lo, hi]; and a plain integral
function convAt(f, g, t, lo, hi, N = 20000) { let s = 0, dt = (hi - lo) / N; for (let i = 0; i < N; i++) { const x = lo + (i + 0.5) * dt; s += f(x) * g(t - x); } return s * dt; }
const integ = (f, lo, hi, N = 20000) => { let s = 0, dt = (hi - lo) / N; for (let i = 0; i < N; i++) s += f(lo + (i + 0.5) * dt); return s * dt; };
// raised cosine P(f) and p(t) with sqrtE = 1
const rcP = (f, W, al) => { f = Math.abs(f); const f1 = W * (1 - al); if (f < f1) return 1 / (2 * W); if (f < 2 * W - f1) return (1 / (4 * W)) * (1 + Math.cos(Math.PI * (f - f1) / (2 * (W - f1)))); return 0; };
const rcp = (t, W, al) => sinc(2 * W * t) * Math.cos(2 * Math.PI * al * W * t) / (1 - 16 * al * al * W * W * t * t);

// ---- T1-01 PNRZ
check('T1-01', [1, 0, 0, 1, 1, 0].map(b => b ? 1 : -1), [1, -1, -1, 1, 1, -1]);
// ---- T1-02 ISI samples: y(i) = sum_k a_k p(i-k), p(0)=1, p(1)=0.2, p(-1)=0.1
{ const a = [1, -1, 1, 1], p = { 0: 1, 1: 0.2, '-1': 0.1 };
  const y = [0, 1, 2, 3].map(i => a.reduce((s, ak, k) => s + ak * (p[i - k] || 0), 0));
  check('T1-02 y', y, [0.9, -0.7, 0.9, 1.2]); check('T1-02 worst', 1 - 0.3, 0.7); }
// ---- T1-03 triangle sampled late by Tb/4 (Tb = 1); rect*rect = triangle zero at 2Tb
{ const tri = t => Math.max(0, 1 - Math.abs(t)); check('T1-03 desired', tri(0.25), 0.75); check('T1-03 next', tri(-0.75), 0.25); check('T1-03 prev', tri(1.25), 0);
  const r = t => (t >= 0 && t < 1) ? 1 : 0; check('T1-03 rect*rect peak', convAt(r, r, 1, 0, 1), 1, 1e-3); check('T1-03 rect*rect at 2Tb', convAt(r, r, 2, 0, 1), 0, 1e-3); }
// ---- T1-04 wide triangle
{ const tri2 = t => Math.max(0, 1 - Math.abs(t) / 2); check('T1-04 p(Tb)', tri2(1), 0.5); check('T1-04 closed', 1 - 0.5 - 0.5, 0); }
// ---- T2-01
check('T2-01 W', 9600 / 2, 4800); check('T2-01 Tb', 1 / 9600, 104.1667e-6, 1e-5); check('T2-01 height', 1 / (2 * 4800), 1.0417e-4, 1e-4);
check('T2-01 sinc zeros', [1, 2, 3].map(n => sinc(2 * 4800 * n / 9600)), [0, 0, 0], 1e-12);
// ---- T2-02
check('T2-02 f1', 4800 * (1 - 0.5), 2400); check('T2-02 BT', 4800 * 1.5, 7200); check('T2-02 BT=2W-f1', 2 * 4800 - 2400, 7200);
check('T2-02 half at W', rcP(4800, 4800, 0.5) / rcP(0, 4800, 0.5), 0.5);
// ---- T2-03
check('T2-03', [2 * 3000 / 1.25, 2 * 3000 / 1, 2 * 3000 / 2], [4800, 6000, 3000]);
// ---- T2-04
check('T2-04', [35000 / 28000 - 1, 28000 * 0.75, 56000 - 21000], [0.25, 21000, 35000]);
// ---- T2-05
check('T2-05 P', [250, 750, 1000, 1250, 1600].map(f => rcP(f, 1000, 0.5)), [5e-4, 4.268e-4, 2.5e-4, 0.732e-4, 0], 1e-3);
check('T2-05 criterion', 2000 * (rcP(750, 1000, 0.5) + rcP(750 - 2000, 1000, 0.5)), 1);
{ let worst = 0; for (let f = -1000; f <= 1000; f += 7) { let s = 0; for (let n = -3; n <= 3; n++) s += rcP(f - n * 2000, 1000, 0.5); worst = Math.max(worst, Math.abs(2000 * s - 1)); } check('T2-05 flat everywhere', worst, 0, 1e-9); }
// ---- T2-06 tails at t = 2.5 Tb (Tb = 1, W = 0.5)
check('T2-06 a=0', Math.abs(rcp(2.5, 0.5, 0)), 0.12732, 1e-4); check('T2-06 a=.5', rcp(2.5, 0.5, 0.5), 0.017149, 1e-3); check('T2-06 a=1', rcp(2.5, 0.5, 1), 0, 1e-9);
check('T2-06 factor', Math.cos(1.25 * Math.PI) / (1 - 6.25), 0.13469, 1e-3);
check('T2-06 zero ISI any alpha', [1, 2, 3, 4].map(n => rcp(n, 0.5, 0.3)), [0, 0, 0, 0], 1e-12);
check('T2-06 alpha=1 form', rcp(0.37, 0.5, 1), sinc(4 * 0.5 * 0.37) / (1 - 16 * 0.25 * 0.37 * 0.37));
// ---- T3-01
check('T3-01', [Q((5 - 2) / 3), 1 - 2 * Q(1), Q(2)], [0.1587, 0.6827, 0.02275], 1e-3);
// ---- T3-02
check('T3-02', [3 * 1 + 2, 9 * 4, 1 - 1, 4 + 5, Q(6 / 3)], [5, 36, 0, 9, 0.02275], 1e-3);
// ---- T3-03
{ const N0 = k_B * 290; check('T3-03 N0', N0, 4.004e-21, 1e-3); check('T3-03 P', N0 * 1e6, 4.004e-15, 1e-3); check('T3-03 dBm', dBm(N0 * 1e6), -113.98, 1e-4); }
// ---- T3-04
check('T3-04', [Q(1 / 0.4), Q(1 / 0.8)], [6.21e-3, 0.1056], 1e-3); check('T3-04 ratio', Q(1.25) / Q(2.5), 17, 0.02);
// ---- T3-05
check('T3-05 c', Math.exp(-1), 0.3679, 1e-3);
// ---- T3-06
check('T3-06', [12 * 0.5, 12 / 12, Q(1.5)], [6, 1, 0.0668], 1e-3);
// ---- T3-07
check('T3-07', 1e-6 * 4 * 10000, 0.04);
// ---- T3-10 thermal noise at 27 °C, brick wall W = 10 kHz
{ const T = 27 + 273.15, N0 = k_B * T; check('T3-10 T', T, 300.15); check('T3-10 N0', [N0, N0 / 2], [4.144e-21, 2.072e-21], 1e-3);
  check('T3-10 P', N0 * 1e4, 4.144e-17, 1e-3); check('T3-10 dBm', dBm(N0 * 1e4), -133.8, 1e-3); check('T3-10 trap', T / 27, 11.1, 1e-2); }
// ---- T4-08 4-PAM boundaries half-way between levels
check('T4-08', [(-3 + -1) / 2, (-1 + 1) / 2, (1 + 3) / 2], [-2, 0, 2]);
// ---- T4-01 rect matched filter (A = 2, T = 1)
{ const A = 2, g = t => (t >= 0 && t <= 1) ? A : 0, h = t => g(1 - t);
  check('T4-01', [1, 0.5, 1.5].map(t => convAt(g, h, t, 0, 1)), [A * A, A * A / 2, A * A / 2], 1e-3); }
// ---- T4-02 split pulse (A = 2, T = 1): y(T/2, T, 3T/2, 2T) = -A^2T/8, A^2T/4, -A^2T/8, 0
{ const A = 2, g = t => (t >= 0 && t < 0.5) ? A / 2 : (t >= 0.5 && t < 1) ? -A / 2 : 0, h = t => g(1 - t);
  check('T4-02', [0.5, 1, 1.5, 1.999].map(t => convAt(g, h, t, 0, 1)), [-A * A / 8, A * A / 4, -A * A / 8, 0], 2e-3);
  check('T4-02 pieces', [0.25, 0.75, 1.25, 1.75].map(t => convAt(g, h, t, 0, 1)), [-(A * A / 4) * 0.25, (A * A / 4) * (3 * 0.75 - 2), (A * A / 4) * (4 - 3 * 1.25), -(A * A / 4) * (2 - 1.75)], 2e-3);
  check('T4-02 energy', integ(t => g(t) ** 2, 0, 1), A * A / 4, 1e-6); }
// ---- T4-03
check('T4-03', [2 * 1e-3 / 1e-4, dB(20)], [20, 13.01], 1e-3);
// ---- T4-04 half-sine energy with B = sqrt2 A (A = 1, T = 1) equals A^2 T
check('T4-04', integ(t => 2 * Math.sin(Math.PI * t) ** 2, 0, 1), 1, 1e-6);
// ---- T4-05 mismatched filter: SNR / SNRmax (A = 1, T = 1, N0 = 1)
{ const num = integ(t => (t <= 0.5 ? 1 : 0), 0, 1) ** 2, den = 0.5 * 0.5; check('T4-05', [(num / den) / 2, dB(0.5)], [0.5, -3.01], 1e-3); }
// ---- T4-06
check('T4-06 levels', [1 + 0.2 + 0.1, 1 + 0.2 - 0.1, 1 - 0.2 + 0.1, 1 - 0.2 - 0.1], [1.3, 1.1, 0.9, 0.7]); check('T4-06 opening', 2 * 0.7, 1.4);
// ---- T2-07
check('T2-07', [4000 / 1.25, 2 * 3200, 1 / 6400, 3200 * 0.75, 2 * 3200 - 2400, 2 * 4000, 2 * 4000 / 2], [3200, 6400, 156.25e-6, 2400, 4000, 8000, 4000]);
check('T2-07 zero ISI', [1, 2, 3].map(n => rcp(n / 6400 * (1 + 1e-9), 3200, 0.25)), [0, 0, 0], 1e-6); // n = 2 is the 0/0 point t = 1/(4αW); limit (π/4)·sinc(2) = 0
// ---- T4-07
{ const x = Qinv(1e-5), ebn0 = x * x / 2, N0 = k_B * 290, E = ebn0 * N0;
  check('T4-07 Qinv', x, 4.265, 1e-3); check('T4-07 E/N0', [ebn0, dB(ebn0)], [9.09, 9.59], 2e-3);
  check('T4-07 E', E, 3.64e-20, 2e-3); check('T4-07 Pr dBm', dBm(E * 1e6), -104.4, 1e-3); check('T4-07 BT', 0.5e6 * 1.35, 675e3); }

// ================= M2-2 =================
// ---- T5-02 transversal equalizer output
check('T5-02', -0.1 * 0.3 + 1 * 1.1 + -0.2 * -0.4, 1.15);
// ---- T5-03 input distortion D0
check('T5-03', [0.5 / 1, 1 - 0.5, (0.6 + 0.5) / 1, 1 - 1.1], [0.5, 0.5, 1.1, -0.1]);
// discrete convolution q_n = sum_j c_j f_{n-j}; c and f given as {index: value}
const qconv = (c, f, n) => Object.keys(c).reduce((s, j) => s + c[j] * (f[n - j] || 0), 0);
// ---- T5-04 infinite ZF: c_n = (-0.5)^n gives q = delta (truncate at 40 taps)
{ const c = {}, f = { 0: 1, 1: 0.5 }; for (let n = 0; n < 40; n++) c[n] = Math.pow(-0.5, n);
  check('T5-04 taps', [0, 1, 2, 3].map(n => c[n]), [1, -0.5, 0.25, -0.125]); check('T5-04 q', [0, 1, 2, 3, 10].map(n => qconv(c, f, n)), [1, 0, 0, 0, 0], 1e-9); }
// ---- T5-05 3-tap ZF on f = {1, 0.5}
{ const c = { '-1': 0, 0: 1, 1: -0.5 }, f = { 0: 1, 1: 0.5 };
  check('T5-05 q', [-1, 0, 1, 2].map(n => qconv(c, f, n)), [0, 1, 0, -0.25]); check('T5-05 count', 2 * 1 + 1 + 1, 4);
  check('T5-05 longer', [1, 2, 3].map(K => Math.pow(0.5, K + 1)), [0.25, 0.125, 0.0625]); }
// ---- T5-06 3-tap ZF on f = {-1: 0.1, 0: 1, 1: -0.2}: solve, then residual
{ const f = { '-1': 0.1, 0: 1, 1: -0.2 }, c0 = 1 / (0.02 + 1 + 0.02), c = { '-1': -0.1 * c0, 0: c0, 1: 0.2 * c0 };
  check('T5-06 taps', [c['-1'], c[0], c[1]], [-0.09615, 0.96154, 0.19231], 1e-4);
  check('T5-06 forced', [-1, 0, 1].map(n => qconv(c, f, n)), [0, 1, 0], 1e-12);
  check('T5-06 residual', [qconv(c, f, -2), qconv(c, f, 2)], [-0.0096, -0.0385], 3e-3);
  check('T5-06 D', [(0.1 + 0.2) / 1, Math.abs(qconv(c, f, -2)) + Math.abs(qconv(c, f, 2))], [0.3, 0.048], 3e-3); }
// ---- T5-07 MSE vs ZF gains, N0 = 0.01
check('T5-07 ZF', [1, 0.5, 0.01].map(F => 1 / F), [1, 2, 100]);
check('T5-07 MSE', [1, 0.5, 0.01].map(F => F / (F * F + 0.01)), [0.990, 1.923, 0.990], 1e-3);
check('T5-07 noise power', (1 / 0.01) ** 2, 10000);
// ---- T5-08 DFE on f = {1, 0.5}, data +1 -1 -1 +1
{ const I = [1, -1, -1, 1], vk = I.map((x, k) => x + 0.5 * (k ? I[k - 1] : 0)), c1 = -1 * 0.5;
  let prev = 0; const out = vk.map(x => { const e = x + c1 * prev; prev = Math.sign(e); return e; });
  check('T5-08 v', vk, [1, -0.5, -1.5, 0.5]); check('T5-08 c1', c1, -0.5); check('T5-08 out', out, I); }
// ---- T6-01 phase error
check('T6-01', [0, 30, 60].map(d => Math.cos(d * Math.PI / 180)), [1, 0.866, 0.5], 1e-3);
check('T6-01 dB', [30, 60].map(d => 20 * Math.log10(Math.cos(d * Math.PI / 180))), [-1.25, -6.02], 2e-3);
check('T6-01 90', Math.cos(Math.PI / 2), 0, 1e-12);
{ const A = 0.7, B = 0.3; check('T6-01 identity', Math.cos(A) * Math.cos(B), 0.5 * (Math.cos(A - B) + Math.cos(A + B))); }
// ---- T6-02 one-shot ML phase (X = (T0/2)cos, Y = (T0/2)sin)
check('T6-02', [Math.atan2(0.25, 0.433), Math.atan2(0.433, -0.25)].map(r => r * 180 / Math.PI), [30, 120], 1e-3);
check('T6-02 naive', Math.atan(0.433 / -0.25) * 180 / Math.PI, -60, 1e-3);
// ---- T6-03 early sample on the triangle
check('T6-03', [1 * (1e-3 - 0.1e-3), 20 * Math.log10(0.9)], [0.9e-3, -0.915], 1e-3);
check('T6-03 signs', [1 * 1, 1 * -1, -1 * 1, -1 * -1], [1, -1, -1, 1]);
// ---- T6-04 sampling instants
{ const T = 1 / 2400; check('T6-04', [T, ...[0, 1, 2, 3].map(n => n * T + 0.1e-3)], [416.667e-6, 100e-6, 516.667e-6, 933.333e-6, 1350e-6], 1e-5); }

// ---- data integrity: ids unique, topics valid, every link resolves
const ctx = { console }; vm.createContext(ctx);
['lib.js', 'data/topics.js', 'data/problems.js', 'data/problems-m22.js', 'data/glossary.js', 'data/glossary-m22.js', 'data/concepts.js', 'data/concepts-m22.js', 'data/plan.js', 'data/reference.js', 'data/reference-m22.js']
  .forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }));
vm.runInContext('this.__d = { PROBLEMS, TOPICS, CONCEPTS, PLAN, GLOSSARY }', ctx);
const { PROBLEMS, TOPICS, CONCEPTS, PLAN, GLOSSARY } = ctx.__d;
const terms = new Set();
GLOSSARY.forEach(g => { ok('glossary entry shape ' + g[0], g.length === 3 && g[1].length > 10); ok('glossary topic ' + g[0], g[2] in TOPICS); ok('duplicate term ' + g[0], !terms.has(g[0])); terms.add(g[0]); });
const ids = new Set();
PROBLEMS.forEach(p => {
  ok('duplicate id ' + p.id, !ids.has(p.id)); ids.add(p.id);
  ok(p.id + ': unknown topic ' + p.lec, p.lec in TOPICS);
  ok(p.id + ': kind', p.kind === 'solve');
  ok(p.id + ': leftover ${', !/\$\{/.test(p.q + p.a));
});
const allText = v => typeof v === "string" ? v : v && typeof v === "object" ? Object.values(v).map(allText).join(" ") : "";
for (const m of allText([PROBLEMS, CONCEPTS, PLAN]).matchAll(/data-goto="([^"]+)"/g)) ok("broken problem link " + m[1], ids.has(m[1]));
const planText = allText(PLAN.sessions) + allText(PLAN.quick);
PROBLEMS.forEach(p => ok(p.id + " is in no study-plan task", !PLAN.sessions.length || planText.includes('"' + p.id + '"')));

console.log(fails ? fails + ' of ' + n + ' checks FAILED' : 'all ' + n + ' checks passed');
process.exit(fails ? 1 : 0);
