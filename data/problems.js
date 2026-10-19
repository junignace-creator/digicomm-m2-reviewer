/* Solve problems, ordered by topic. Shape (helpers in lib.js: steps, tbl, mb, frac, rt, note, warn):
   PROBLEMS.push({ id: 'T1-01', lec: 'T1', kind: 'solve', title: '…', q: `…`, a: steps([…]) });
   Every numeric answer needs a matching check() in verify.js. */

/* ================= T1 · Baseband PAM & ISI ================= */
PROBLEMS.push({
  id: 'T1-01', lec: 'T1', kind: 'solve',
  title: 'PNRZ level encoding and the PAM signal s(t) (slide example)',
  q: `<p>The bit stream b<sub>k</sub> = 1 0 0 1 1 0 (k = 0…5) is encoded with polar NRZ (bit 1 → +A, bit 0 → −A) and passed through the rectangular transmit filter g(t) of width T<sub>b</sub>.</p>
  <p>(a) List the level-encoded symbols a<sub>k</sub>. (b) Write s(t) as a sum. (c) What does the term for k = 3 look like?</p>`,
  a: steps([
    'PNRZ rule: a<sub>k</sub> = +A if b<sub>k</sub> = 1, −A if b<sub>k</sub> = 0. So a<sub>k</sub> = +A, −A, −A, +A, +A, −A.',
    'Each symbol rides on its own shifted copy of the pulse: ' + mb('s(t) = Σ<sub>k</sub> a<sub>k</sub> g(t − kT<sub>b</sub>) = A g(t) − A g(t − T<sub>b</sub>) − A g(t − 2T<sub>b</sub>) + A g(t − 3T<sub>b</sub>) + A g(t − 4T<sub>b</sub>) − A g(t − 5T<sub>b</sub>)'),
    'The k = 3 term is a<sub>3</sub> g(t − 3T<sub>b</sub>) = +A over one bit period, starting 3T<sub>b</sub> later than the first pulse.',
    curveFig({ series: [{ fn: function (t) { var k = Math.floor(t + 0.5), a = [1, -1, -1, 1, 1, -1]; return k >= 0 && k < 6 ? a[k] : 0; } }], xlo: -1, xhi: 6.5, ylo: -1.4, yhi: 1.4, xt: [[1, 'Tb'], [2, '2Tb'], [3, '3Tb'], [4, '4Tb'], [5, '5Tb']], yt: [[1, '+A'], [-1, '−A']], cap: 's(t) for 1 0 0 1 1 0 with rectangular g(t) centred on each kT<sub>b</sub> (as on slide 5–6).', label: 'PNRZ waveform' }),
    note('Where this comes from: s(t) = a(t) ∗ g(t) with a(t) = Σ a<sub>k</sub> δ(t − kT<sub>b</sub>); convolving a shifted δ with g just shifts g.')
  ])
});

PROBLEMS.push({
  id: 'T1-02', lec: 'T1', kind: 'solve',
  title: 'Computing the ISI in the received samples',
  q: `<p>The overall pulse p(t) = g(t) ∗ h(t) ∗ q(t) has samples p(0) = 1, p(T<sub>b</sub>) = 0.2, p(−T<sub>b</sub>) = 0.1 and p(nT<sub>b</sub>) = 0 for every other n. Polar symbols a<sub>k</sub> = ±1 carry the bits 1 0 1 1 (k = 0, 1, 2, 3; nothing is sent before or after).</p>
  <p>(a) Find y(iT<sub>b</sub>) for i = 0…3. (b) Split y(T<sub>b</sub>) into desired symbol + ISI. (c) What is the worst-case ISI, and can it ever cause a wrong decision with a threshold of 0?</p>`,
  a: steps([
    'Symbols: a = +1, −1, +1, +1. Sampled output: ' + mb('y(iT<sub>b</sub>) = a<sub>i</sub> p(0) + Σ<sub>k≠i</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)') + 'Only k = i − 1 (weight p(T<sub>b</sub>) = 0.2) and k = i + 1 (weight p(−T<sub>b</sub>) = 0.1) contribute ISI.',
    tbl(['i', 'a<sub>i</sub>·p(0)', '+0.2·a<sub>i−1</sub>', '+0.1·a<sub>i+1</sub>', 'y(iT<sub>b</sub>)'], [
      ['0', '+1', '0', '−0.1', '0.9'],
      ['1', '−1', '+0.2', '+0.1', '−0.7'],
      ['2', '+1', '−0.2', '+0.1', '0.9'],
      ['3', '+1', '+0.2', '0', '1.2']
    ], 4),
    '(b) y(T<sub>b</sub>) = −1 (desired) + 0.3 (ISI) = −0.7. The neighbours pulled the sample 0.3 towards the threshold.',
    '(c) Worst case: both neighbours oppose the desired symbol: |ISI|<sub>max</sub> = 0.2 + 0.1 = 0.3. The smallest possible |y| is 1 − 0.3 = 0.7 > 0, so with no noise every decision is still correct — but the noise margin shrank by 30 %.',
    warn('ISI is not noise: it is deterministic and depends on the neighbouring data. It shrinks the eye opening (see T4-06).')
  ])
});

PROBLEMS.push({
  id: 'T1-03', lec: 'T1', kind: 'solve',
  title: 'Rectangular TX pulse + matched rectangular RX filter: zero ISI? What about timing error?',
  q: `<p>g(t) is a rectangle of width T<sub>b</sub>, the channel is ideal (h(t) = δ(t)), and the receive filter q(t) is the same rectangle. The overall pulse is then a triangle, normalised to p(τ) = 1 − |τ|/T<sub>b</sub> for |τ| < T<sub>b</sub> (τ measured from the peak), and 0 elsewhere.</p>
  <p>(a) Is there ISI when sampling exactly at the peaks? (b) The sampling clock is late by T<sub>b</sub>/4. Find the desired-symbol weight, the ISI weights and the worst-case sample with a<sub>k</sub> = ±1.</p>`,
  a: steps([
    'Rect ∗ rect = triangle of base 2T<sub>b</sub>. Samples at the peak and at multiples of T<sub>b</sub> away: p(0) = 1, p(±T<sub>b</sub>) = 0, p(±2T<sub>b</sub>) = 0… ⇒ <b>zero ISI</b> (the zero-ISI condition p(nT<sub>b</sub>) = 0 for n ≠ 0 holds).',
    'Late by T<sub>b</sub>/4: desired weight p(T<sub>b</sub>/4) = 1 − 0.25 = 0.75.',
    'The next symbol\'s pulse peaks T<sub>b</sub> later, so it is seen at τ = −3T<sub>b</sub>/4: p = 0.25. The previous symbol is at τ = 5T<sub>b</sub>/4 > T<sub>b</sub>: p = 0.',
    'Worst case: 0.75 − 0.25 = 0.5 (eye opening halved). Best case: 0.75 + 0.25 = 1.0.',
    warn('Zero ISI only holds at the right sampling instants. A timing error turns the zero crossings of p(t) into non-zero ISI weights.')
  ])
});

PROBLEMS.push({
  id: 'T1-04', lec: 'T1', kind: 'solve',
  title: 'A pulse that is too wide: does the eye close?',
  q: `<p>A badly band-limited link has the overall pulse p(t) = 1 − |t|/(2T<sub>b</sub>) for |t| < 2T<sub>b</sub>, 0 elsewhere (a triangle twice as wide as in T1-03). Symbols are a<sub>k</sub> = ±1, sampled at t = iT<sub>b</sub>.</p>
  <p>(a) List p(nT<sub>b</sub>). (b) Write y(iT<sub>b</sub>) in terms of a<sub>i−1</sub>, a<sub>i</sub>, a<sub>i+1</sub>. (c) Find the smallest |y| for a<sub>i</sub> = +1 and comment.</p>`,
  a: steps([
    'p(0) = 1, p(±T<sub>b</sub>) = 1 − ½ = 0.5, p(±2T<sub>b</sub>) = 0. Not zero-ISI (p(±T<sub>b</sub>) ≠ 0).',
    'y(iT<sub>b</sub>) = a<sub>i</sub> + 0.5 a<sub>i−1</sub> + 0.5 a<sub>i+1</sub>.',
    'For a<sub>i</sub> = +1 with both neighbours −1: y = 1 − 0.5 − 0.5 = 0. The sample sits exactly on the threshold: the eye is <b>fully closed</b>, and any noise causes errors.',
    'Fix: reshape the overall pulse so p(±T<sub>b</sub>) = 0 — the Nyquist criterion (T2) — or equalise (Part 2).'
  ])
});

/* ================= T2 · Nyquist channel & raised cosine ================= */
PROBLEMS.push({
  id: 'T2-01', lec: 'T2', kind: 'solve',
  title: 'Ideal Nyquist channel for 9600 bps',
  q: `<p>Binary data at R<sub>b</sub> = 9600 bps is sent through an ideal Nyquist (brick-wall) channel with √E = 1.</p>
  <p>(a) Find the Nyquist bandwidth W. (b) Find T<sub>b</sub> and the zero crossings of p(t). (c) Write P<sub>opt</sub>(f) and its height.</p>`,
  a: steps([
    'W = R<sub>b</sub>/2 = 9600/2 = <b>4800 Hz</b> (minimum bandwidth for zero ISI).',
    'T<sub>b</sub> = 1/R<sub>b</sub> = 104.17 µs. p(t) = sinc(2Wt) = sin(2πWt)/(2πWt) is zero where 2Wt is a non-zero integer, i.e. t = n/(2W) = nT<sub>b</sub>: ±104.17 µs, ±208.33 µs, …',
    'P<sub>opt</sub>(f) = √E/(2W) for |f| < W, 0 elsewhere: height 1/9600 = 1.0417 × 10<sup>−4</sup> over |f| < 4800 Hz.',
    note('Check with the criterion: (1/T<sub>b</sub>)·Σ P(f − nR<sub>b</sub>) = 9600 × 1.0417×10<sup>−4</sup> = 1 ✓ — the replicas tile the axis edge to edge.')
  ])
});

PROBLEMS.push({
  id: 'T2-02', lec: 'T2', kind: 'solve',
  title: 'Raised-cosine bandwidth for α = 0.5',
  q: `<p>The 9600 bps link of T2-01 uses a raised-cosine spectrum with roll-off α = 0.5. Find W, f<sub>1</sub>, the excess bandwidth and the transmission bandwidth B<sub>T</sub>. Where does P(f) fall to half its flat value?</p>`,
  a: steps([
    'W = R<sub>b</sub>/2 = 4800 Hz (unchanged by α).',
    'f<sub>1</sub> = W(1 − α) = 4800 × 0.5 = <b>2400 Hz</b> (end of the flat part).',
    'Excess bandwidth αW = 2400 Hz; B<sub>T</sub> = 2W − f<sub>1</sub> = W(1 + α) = <b>7200 Hz</b>.',
    'Half height: at |f| = W = 4800 Hz the cosine argument is π(W − f<sub>1</sub>)/(2(W − f<sub>1</sub>)) = π/2, so P = (√E/4W)(1 + 0) = ½·√E/(2W). The roll-off is symmetric about W — that is what keeps the replica sum flat.'
  ])
});

PROBLEMS.push({
  id: 'T2-03', lec: 'T2', kind: 'solve',
  title: 'Maximum bit rate through a 3 kHz channel',
  q: `<p>A baseband channel passes 0–3 kHz. Raised-cosine pulses with α = 0.25 are used. What is the highest bit rate with zero ISI? What would it be with α = 0 and with α = 1?</p>`,
  a: steps([
    'B<sub>T</sub> = W(1 + α) = (R<sub>b</sub>/2)(1 + α) ⇒ ' + mb('R<sub>b</sub> = ' + frac('2B<sub>T</sub>', '1 + α')),
    'α = 0.25: R<sub>b</sub> = 2·3000/1.25 = <b>4800 bps</b>.',
    'α = 0 (brick wall): 6000 bps (theoretical maximum, R<sub>b</sub> = 2B). α = 1: 3000 bps.',
    warn('Bandwidth questions: always go through W = R<sub>b</sub>/2 first, then B<sub>T</sub> = W(1 + α). Don\'t forget the (1 + α).')
  ])
});

PROBLEMS.push({
  id: 'T2-04', lec: 'T2', kind: 'solve',
  title: 'Finding the roll-off factor from R<sub>b</sub> and B<sub>T</sub>',
  q: `<p>A 56 kbps binary baseband link occupies B<sub>T</sub> = 35 kHz. Find α, f<sub>1</sub>, and the excess bandwidth as a percentage.</p>`,
  a: steps([
    'W = 56 000/2 = 28 kHz.',
    'α = B<sub>T</sub>/W − 1 = 35/28 − 1 = <b>0.25</b> (25 % excess bandwidth, αW = 7 kHz).',
    'f<sub>1</sub> = W(1 − α) = 28 × 0.75 = <b>21 kHz</b>. Check: B<sub>T</sub> = 2W − f<sub>1</sub> = 56 − 21 = 35 kHz ✓.'
  ])
});

PROBLEMS.push({
  id: 'T2-05', lec: 'T2', kind: 'solve',
  title: 'Evaluating P(f) and checking the Nyquist criterion',
  q: `<p>Raised cosine with √E = 1, W = 1000 Hz (R<sub>b</sub> = 2000 bps), α = 0.5.</p>
  <p>(a) Find f<sub>1</sub> and the band edge. (b) Evaluate P(f) at 250, 750, 1000, 1250 and 1600 Hz. (c) Show that (1/T<sub>b</sub>)[P(750) + P(750 − R<sub>b</sub>)] = 1.</p>`,
  a: steps([
    'f<sub>1</sub> = (1 − 0.5)·1000 = 500 Hz; band edge 2W − f<sub>1</sub> = 1500 Hz. Flat value √E/(2W) = 1/2000 = 5×10<sup>−4</sup>.',
    tbl(['f (Hz)', 'region', 'P(f)'], [
      ['250', 'flat (|f| < 500)', '5.000 × 10<sup>−4</sup>'],
      ['750', 'roll-off', '(1/4000)(1 + cos(π·250/1000)) = 4.268 × 10<sup>−4</sup>'],
      ['1000', 'roll-off (= W)', '(1/4000)(1 + cos(π/2)) = 2.500 × 10<sup>−4</sup>'],
      ['1250', 'roll-off', '(1/4000)(1 + cos(3π/4)) = 0.732 × 10<sup>−4</sup>'],
      ['1600', '≥ 1500', '0']
    ], 2),
    'Roll-off formula used: P(f) = (√E/4W)[1 + cos(π(|f| − f<sub>1</sub>)/(2(W − f<sub>1</sub>)))], here 2(W − f<sub>1</sub>) = 1000 Hz.',
    '(c) 750 − 2000 = −1250, and P is even, so P(−1250) = 0.732×10<sup>−4</sup>. Sum = 5.000×10<sup>−4</sup>; times 1/T<sub>b</sub> = 2000 gives <b>1</b> ✓. The dip of one replica is filled by the tail of its neighbour.'
  ])
});

PROBLEMS.push({
  id: 'T2-06', lec: 'T2', kind: 'solve',
  title: 'How fast do the tails decay? p(t) at t = 2.5T<sub>b</sub>',
  q: `<p>With √E = 1, evaluate the raised-cosine pulse p(t) = sinc(2Wt)·cos(2παWt)/(1 − 16α²W²t²) at t = 2.5T<sub>b</sub> for α = 0, 0.5 and 1. (Use W = 1/(2T<sub>b</sub>), so Wt = 1.25.)</p>`,
  a: steps([
    'sinc(2Wt) = sinc(2.5) = sin(2.5π)/(2.5π) = 1/(2.5π) = 0.1273.',
    'α = 0: correction factor = 1 ⇒ |p| = <b>0.1273</b> (12.7 % of the peak, decaying only as 1/|t|).',
    'α = 0.5: cos(2π·0.5·1.25) = cos(1.25π) = −0.7071; 1 − 16(0.25)(1.5625) = −5.25; factor = 0.1347 ⇒ p = <b>0.0171</b> (≈ 7× smaller).',
    'α = 1: cos(2.5π) = 0 ⇒ p = <b>0</b>. The full raised cosine has extra zero crossings at ±1.5T<sub>b</sub>, ±2.5T<sub>b</sub>, …',
    curveFig({ series: [
      { fn: function (t) { return sinc(t); }, cls: 'wave3', name: 'α = 0' },
      { fn: function (t) { var d = 1 - 4 * 0.25 * t * t; return Math.abs(d) < 1e-9 ? NaN : sinc(t) * Math.cos(Math.PI * 0.5 * t) / d; }, cls: 'wave2', name: 'α = 0.5' },
      { fn: function (t) { var d = 1 - 4 * t * t; return Math.abs(d) < 1e-9 ? 0.5 : sinc(t) * Math.cos(Math.PI * t) / d; }, cls: 'wave', name: 'α = 1' }
    ], xlo: -4, xhi: 4, ylo: -0.3, yhi: 1.1, xl: 't/Tb', xt: [[-3, '−3'], [-2, '−2'], [-1, '−1'], [1, '1'], [2, '2'], [3, '3']], yt: [[1, '1'], [0.5, '0.5']], cap: 'Raised-cosine pulses (time axis in bit periods). All three are zero at every non-zero integer — zero ISI — but larger α kills the tails faster.', label: 'raised cosine pulses' }),
    note('Why it matters: slow tails make the sum of many neighbours large when the sampling time is off — the Nyquist channel is very sensitive to timing error.')
  ])
});

/* ================= T3 · Noise, Gaussian RVs & random processes ================= */
PROBLEMS.push({
  id: 'T3-01', lec: 'T3', kind: 'solve',
  title: 'Gaussian probabilities with the Q-function',
  q: `<p>X ~ N(2, 9) (mean 2, variance 9). Using a Q-table, find (a) Pr{X > 5}, (b) Pr{X < −1}, (c) Pr{−1 ≤ X ≤ 5}, (d) Pr{X > 8}.</p>`,
  a: steps([
    'Normalise first! σ = √9 = 3, Z = (X − 2)/3 ~ N(0, 1).',
    '(a) Pr{X > 5} = Pr{Z > 1} = Q(1) = <b>0.1587</b>.',
    '(b) Pr{X < −1} = Pr{Z < −1} = Pr{Z > 1} (symmetry) = Q(1) = <b>0.1587</b>.',
    '(c) 1 − 2Q(1) = <b>0.6827</b> (the "68 % within 1σ" rule).',
    '(d) Pr{Z > 2} = Q(2) = <b>0.02275</b>.',
    warn('Divide by σ, not σ². The variance is 9, the standard deviation is 3.')
  ])
});

PROBLEMS.push({
  id: 'T3-02', lec: 'T3', kind: 'solve',
  title: 'Gaussian properties: scaling, shifting and adding',
  q: `<p>X ~ N(1, 4) and V ~ N(−1, 5) are independent. (a) What is the distribution of Y = 3X + 2? (b) Of Z = X + V? (c) Find Pr{Z > 6}.</p>`,
  a: steps([
    '(a) Scaling and shifting keep it Gaussian: mean 3(1) + 2 = 5, variance 3²·4 = 36 ⇒ Y ~ N(5, 36). (The +2 shifts the mean only.)',
    '(b) Sum of independent Gaussians is Gaussian: mean 1 + (−1) = 0, variance 4 + 5 = 9 ⇒ Z ~ N(0, 9).',
    '(c) Pr{Z > 6} = Q(6/3) = Q(2) = <b>0.02275</b>.',
    warn('Variances add, standard deviations do not: σ<sub>Z</sub> = √(4 + 5) = 3, not 2 + √5.')
  ])
});

PROBLEMS.push({
  id: 'T3-03', lec: 'T3', kind: 'solve',
  title: 'Thermal-noise PSD and noise power through an ideal filter',
  q: `<p>White thermal noise at T<sub>e</sub> = 290 K enters an ideal low-pass filter with |H(f)| = 1 for |f| < 1 MHz.</p>
  <p>(a) Find N<sub>0</sub> and the two-sided PSD. (b) Find the output noise power in W and dBm.</p>`,
  a: steps([
    'N<sub>0</sub> = kT<sub>e</sub> = 1.381×10<sup>−23</sup> × 290 = <b>4.004 × 10<sup>−21</sup> W/Hz</b>; two-sided S<sub>W</sub>(f) = N<sub>0</sub>/2 = 2.002×10<sup>−21</sup> W/Hz.',
    'Output PSD = (N<sub>0</sub>/2)|H(f)|². Power = area under it: ' + mb('P<sub>N</sub> = ' + frac('N<sub>0</sub>', '2') + ' × 2B = N<sub>0</sub>B = 4.004×10<sup>−21</sup> × 10<sup>6</sup> = 4.004×10<sup>−15</sup> W'),
    'In dBm: 10 log(4.004×10<sup>−15</sup>/10<sup>−3</sup>) = <b>−114.0 dBm</b> (the classic −174 dBm/Hz + 60 dB).',
    warn('Two-sided PSD N<sub>0</sub>/2 is integrated over −B…+B (width 2B). Using N<sub>0</sub>/2 × B gives half the right answer.')
  ])
});

PROBLEMS.push({
  id: 'T3-04', lec: 'T3', kind: 'solve',
  title: 'Bit-error probability of a noisy polar sample',
  q: `<p>A polar receiver samples y = ±A + n, where n ~ N(0, σ²), and decides with threshold 0. A = 1 V. Find the bit-error probability for σ = 0.4 V and for σ = 0.8 V.</p>`,
  a: steps([
    'If +A was sent, an error happens when n < −A: Pr = Pr{n/σ < −A/σ} = Q(A/σ). Same for −A by symmetry ⇒ P<sub>e</sub> = Q(A/σ).',
    'σ = 0.4: Q(2.5) = <b>6.21 × 10<sup>−3</sup></b>.',
    'σ = 0.8: Q(1.25) = <b>0.106</b>. Doubling the noise rms increased P<sub>e</sub> 17-fold.',
    note('The Q-function is the tail probability of N(0, 1): Q(x) = Pr{Z > x} = 1 − Φ(x).')
  ])
});

PROBLEMS.push({
  id: 'T3-05', lec: 'T3', kind: 'solve',
  title: 'Which functions can be autocorrelations of a WSS process?',
  q: `<p>Which of these can be the autocorrelation R<sub>X</sub>(τ) of a real WSS process? Give the reason for each. (a) e<sup>−|τ|</sup> (b) e<sup>−τ</sup> (c) τ²e<sup>−|τ|</sup> (d) cos(2πτ). For the valid ones, what is the average power?</p>`,
  a: steps([
    'Tests from the slides: (1) even, R(−τ) = R(τ); (2) maximum at the origin, R(0) ≥ |R(τ)|; and R(0) = E[X²] = average power.',
    '(a) e<sup>−|τ|</sup>: even ✓, max 1 at τ = 0 ✓ ⇒ <b>valid</b>, power R(0) = 1.',
    '(b) e<sup>−τ</sup>: not even (e<sup>−1</sup> ≠ e<sup>+1</sup>) ⇒ <b>invalid</b>.',
    '(c) τ²e<sup>−|τ|</sup>: R(0) = 0 but R(1) = 0.368 > R(0) ⇒ <b>invalid</b>.',
    '(d) cos(2πτ): even ✓, |cos| ≤ 1 = R(0) ✓ ⇒ <b>valid</b> (a random-phase sinusoid), power 1.'
  ])
});

PROBLEMS.push({
  id: 'T3-06', lec: 'T3', kind: 'solve',
  title: 'Central limit theorem: sum of 12 uniform variables',
  q: `<p>Y = X<sub>1</sub> + … + X<sub>12</sub> where the X<sub>i</sub> are i.i.d. uniform on [0, 1] (mean ½, variance 1/12). Use the CLT to estimate Pr{Y > 7.5}.</p>`,
  a: steps([
    'E[Y] = 12 × ½ = 6. Var[Y] = 12 × 1/12 = 1 (independent ⇒ variances add), σ<sub>Y</sub> = 1.',
    'Normalise: Z = (Y − 6)/1 ≈ N(0, 1) by the CLT.',
    'Pr{Y > 7.5} ≈ Q(1.5) = <b>0.0668</b>.',
    note('This is why channel noise — the sum of many small independent electron motions — is modelled as Gaussian, whatever each contribution looks like.')
  ])
});

PROBLEMS.push({
  id: 'T3-07', lec: 'T3', kind: 'solve',
  title: 'White noise through a filter with gain 2',
  q: `<p>White noise with N<sub>0</sub>/2 = 10<sup>−6</sup> W/Hz passes through a filter with |H(f)| = 2 for |f| < 5 kHz and 0 elsewhere. Find the output PSD and the output noise power. Confirm with Parseval: P<sub>N</sub> = (N<sub>0</sub>/2)∫|h(τ)|²dτ.</p>`,
  a: steps([
    'S<sub>out</sub>(f) = (N<sub>0</sub>/2)|H(f)|² = 10<sup>−6</sup> × 4 = 4×10<sup>−6</sup> W/Hz for |f| < 5 kHz.',
    'P<sub>N</sub> = 4×10<sup>−6</sup> × 10 000 Hz (from −5k to +5k) = <b>0.04 W</b>.',
    'Parseval: ∫|h|²dτ = ∫|H|²df = 4 × 10 000 = 40 000, so P<sub>N</sub> = 10<sup>−6</sup> × 40 000 = 0.04 W ✓.'
  ])
});

/* ================= T4 · Matched filter & eye pattern ================= */
PROBLEMS.push({
  id: 'T4-01', lec: 'T4', kind: 'solve',
  title: 'Matched filter for a rectangular pulse (slide Example 1)',
  q: `<p>g(t) = A for 0 ≤ t ≤ T, 0 elsewhere. (a) Sketch the impulse response of the matched filter. (b) Find and plot the matched-filter output y(t) (no noise). (c) Find its peak value.</p>`,
  a: steps([
    'h<sub>opt</sub>(t) = g(T − t) (take k = 1): flip g in time and shift by T. A rectangle flipped about T/2 is the same rectangle: h(t) = A for 0 ≤ t ≤ T.',
    'y(t) = g(t) ∗ h(t). Slide the two rectangles past each other: the overlap grows linearly, then shrinks: ' + mb('y(t) = A²t for 0 < t ≤ T; &nbsp; y(t) = A²(2T − t) for T < t ≤ 2T; &nbsp; 0 elsewhere'),
    curveFig({ series: [{ fn: function (t) { return t < 0 || t > 2 ? 0 : t <= 1 ? t : 2 - t; } }], xlo: -0.3, xhi: 2.4, ylo: -0.1, yhi: 1.15, xt: [[1, 'T'], [2, '2T']], yt: [[1, 'A²T']], cap: 'Matched-filter output: a triangle that peaks at t = T.', label: 'triangle output' }),
    '(c) Peak at t = T: y(T) = <b>A²T</b> = the pulse energy E. That is why we sample at t = T.'
  ])
});

PROBLEMS.push({
  id: 'T4-02', lec: 'T4', kind: 'solve',
  title: 'Matched filter for a split (Manchester-like) pulse (slide Example 2)',
  q: `<p>g(t) = +A/2 for 0 ≤ t < T/2 and −A/2 for T/2 ≤ t < T. (a) Sketch the matched filter h(t). (b) Find y(t) at t = 0, T/2, T, 3T/2, 2T and sketch it. (c) Peak value?</p>`,
  a: steps([
    'h(t) = g(T − t): flip and shift. The first half of h is the second half of g: h(t) = −A/2 for 0 ≤ t < T/2 and +A/2 for T/2 ≤ t < T.',
    'y(t) = g ∗ h is the autocorrelation of g shifted to t = T. Piece by piece (each piece is linear): ' + mb('y(t) = −(A²/4)t, &nbsp; 0 ≤ t ≤ T/2<br>y(t) = (A²/4)(3t − 2T), &nbsp; T/2 ≤ t ≤ T<br>y(t) = (A²/4)(4T − 3t), &nbsp; T ≤ t ≤ 3T/2<br>y(t) = −(A²/4)(2T − t), &nbsp; 3T/2 ≤ t ≤ 2T'),
    tbl(['t', '0', 'T/2', 'T', '3T/2', '2T'], [['y(t)', '0', '−A²T/8', '<b>A²T/4</b>', '−A²T/8', '0']]),
    curveFig({ series: [{ fn: function (t) { if (t < 0 || t > 2) return 0; if (t <= 0.5) return -t; if (t <= 1) return 3 * t - 2; if (t <= 1.5) return 4 - 3 * t; return -(2 - t); } }], xlo: -0.3, xhi: 2.4, ylo: -0.7, yhi: 1.15, xt: [[0.5, 'T/2'], [1, 'T'], [1.5, '3T/2'], [2, '2T']], yt: [[1, 'A²T/4'], [-0.5, '−A²T/8']], cap: 'Matched-filter output for the split pulse (vertical axis in units of A²T/4).', label: 'split pulse output' }),
    '(c) Peak y(T) = <b>A²T/4</b> = energy of g: (A/2)²·T. Again the peak equals the pulse energy and occurs at t = T.'
  ])
});

PROBLEMS.push({
  id: 'T4-03', lec: 'T4', kind: 'solve',
  title: 'Maximum output SNR of a matched filter',
  q: `<p>A rectangular pulse of amplitude A = 1 V and duration T = 1 ms arrives in white noise with N<sub>0</sub> = 10<sup>−4</sup> W/Hz. Data power is normalised (P<sub>d</sub> = 1). Find the pulse energy and the maximum SNR (ratio and dB).</p>`,
  a: steps([
    'E = ∫|g|²dt = A²T = 1 × 10<sup>−3</sup> = 10<sup>−3</sup> J.',
    'SNR<sub>max</sub> = (2E/N<sub>0</sub>)·P<sub>d</sub> = 2×10<sup>−3</sup>/10<sup>−4</sup> = <b>20</b> = <b>13.0 dB</b>.',
    note('Only the energy matters — not the pulse shape (next problem).')
  ])
});

PROBLEMS.push({
  id: 'T4-04', lec: 'T4', kind: 'solve',
  title: 'Same energy, same SNR: rectangle vs half-sine',
  q: `<p>Pulse 1 is a rectangle of amplitude A over 0…T. Pulse 2 is a half-sine B sin(πt/T) over 0…T. Each is detected with its own matched filter in the same noise. Find B (in terms of A) so both give the same maximum SNR.</p>`,
  a: steps([
    'SNR<sub>max</sub> = 2E/N<sub>0</sub> depends only on energy (implication 1 & 3 on the slides).',
    'E<sub>1</sub> = A²T. E<sub>2</sub> = ∫<sub>0</sub><sup>T</sup> B² sin²(πt/T) dt = B²T/2.',
    'Equal energy: B²T/2 = A²T ⇒ <b>B = √2·A ≈ 1.414A</b>.',
    'The half-sine needs a 41 % higher peak to carry the same energy — but in exchange it has a narrower spectrum.'
  ])
});

PROBLEMS.push({
  id: 'T4-05', lec: 'T4', kind: 'solve',
  title: 'SNR penalty of a mismatched receive filter',
  q: `<p>g(t) = A on 0…T. Instead of the matched filter, the receiver uses h(t) = 1 for 0 ≤ t ≤ T/2 (it integrates only half the pulse) and samples at t = T. Find the SNR and compare with the matched filter.</p>`,
  a: steps([
    'SNR = P<sub>d</sub>(∫g(T − τ)h(τ)dτ)² / ((N<sub>0</sub>/2)∫|h(τ)|²dτ), with P<sub>d</sub> = 1.',
    'Numerator: g(T − τ) = A for 0 ≤ τ ≤ T, overlap with h is 0…T/2 ⇒ ∫ = AT/2, squared A²T²/4.',
    'Denominator: (N<sub>0</sub>/2)(T/2) = N<sub>0</sub>T/4.',
    'SNR = (A²T²/4)/(N<sub>0</sub>T/4) = A²T/N<sub>0</sub>. Matched: 2A²T/N<sub>0</sub>. Ratio ½ ⇒ <b>3 dB loss</b>.',
    note('Cauchy–Schwarz says no filter can beat g(T − t); any other shape loses SNR.')
  ])
});

PROBLEMS.push({
  id: 'T4-06', lec: 'T4', kind: 'solve',
  title: 'Reading an eye pattern',
  q: `<p>(a) For the link of T1-02 (p(0) = 1, ISI weights 0.2 and 0.1, a<sub>k</sub> = ±1, no noise), what are the possible sample values, and what is the vertical eye opening at the sampling instant? (b) On a generic eye diagram, what do the eye width, the eye height, the slope of the sides and the spread of the zero crossings tell you? (c) For a 4-level eye with levels ±1, ±3, where are the decision boundaries and how many eyes are there?</p>`,
  a: steps([
    '(a) y = a<sub>i</sub> + 0.2a<sub>i−1</sub> + 0.1a<sub>i+1</sub>: for a<sub>i</sub> = +1 the values are 1.3, 1.1, 0.9, 0.7; mirrored for −1. The inner edges are ±0.7, so the eye opening is 0.7 − (−0.7) = <b>1.4</b> (vs 2 with no ISI): 30 % of each half-eye eaten by ISI.',
    '(b) Width (open time) → time interval over which the wave can be sampled; height at the best sampling time → margin over noise; slope of the sides → sensitivity to timing error; zero-crossing spread → timing jitter (distortion of zero crossings).',
    '(c) Boundaries half-way between levels: <b>−2, 0, +2</b>; M − 1 = <b>3 eyes</b> stacked vertically, decision time at the widest opening.',
    warn('Noise makes the traces fuzzy (eye closes vertically); ISI makes them split into separate paths. Too narrow a receive filter ⇒ ISI; too wide ⇒ more noise.')
  ])
});
