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

// ---- problem checks go below, one block per problem id
// ---- T1-01 ...

// ---- data integrity: ids unique, topics valid, every link resolves
const ctx = { console }; vm.createContext(ctx);
['lib.js', 'data/topics.js', 'data/problems.js', 'data/design.js', 'data/concepts.js', 'data/plan.js', 'data/reference.js']
  .forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }));
vm.runInContext('this.__d = { PROBLEMS, TOPICS, CONCEPTS, PLAN }', ctx);
const { PROBLEMS, TOPICS, CONCEPTS, PLAN } = ctx.__d;
const ids = new Set();
PROBLEMS.forEach(p => {
  ok('duplicate id ' + p.id, !ids.has(p.id)); ids.add(p.id);
  ok(p.id + ': unknown topic ' + p.lec, p.lec in TOPICS);
  ok(p.id + ': kind', p.kind === 'solve' || p.kind === 'design');
  ok(p.id + ': leftover ${', !/\$\{/.test(p.q + p.a));
});
const allText = v => typeof v === "string" ? v : v && typeof v === "object" ? Object.values(v).map(allText).join(" ") : "";
for (const m of allText([PROBLEMS, CONCEPTS, PLAN]).matchAll(/data-goto="([^"]+)"/g)) ok("broken problem link " + m[1], ids.has(m[1]));
const planText = allText(PLAN.sessions) + allText(PLAN.quick);
PROBLEMS.forEach(p => ok(p.id + " is in no study-plan task", !PLAN.sessions.length || planText.includes('"' + p.id + '"')));

console.log(fails ? fails + ' of ' + n + ' checks FAILED' : 'all ' + n + ' checks passed');
process.exit(fails ? 1 : 0);
