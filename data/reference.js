/* Reference tabs.
   RECIPES  = [{ topic, items: [{ name, when, steps: [...], tip }] }]
   FORMULAS = [{ topic, items: [{ name, eq, note }] }]   (eq goes through mathify(); don't hand-italicize)
   CHEAT    = [{ title, items: [...] }] */
var RECIPES = [
  {
    topic: 'T1 · Baseband PAM & ISI', items: [
      { name: 'ISI at a sampling instant', when: 'Given samples p(nT<sub>b</sub>) and a symbol sequence.',
        steps: ['Encode bits → a<sub>k</sub> (PNRZ: 1 → +A, 0 → −A).', 'Write y(iT<sub>b</sub>) = a<sub>i</sub>p(0) + a<sub>i−1</sub>p(T<sub>b</sub>) + a<sub>i+1</sub>p(−T<sub>b</sub>) + … (pulse of symbol k is seen at lag (i − k)T<sub>b</sub>).', 'Desired = a<sub>i</sub>p(0); everything else is ISI.', 'Worst case: |ISI|<sub>max</sub> = A Σ<sub>n≠0</sub>|p(nT<sub>b</sub>)|. Eye half-opening = A p(0) − |ISI|<sub>max</sub>; closed if ≤ 0.'],
        tip: 'p(T<sub>b</sub>) multiplies the <i>previous</i> symbol (its pulse peaked one bit ago), p(−T<sub>b</sub>) the <i>next</i> one.' },
      { name: 'Is this pulse zero-ISI?', when: 'Given p(t) or P(f).',
        steps: ['Time domain: check p(nT<sub>b</sub>) = 0 for all n ≠ 0 (and p(0) ≠ 0).', 'Frequency domain: add copies P(f − nR<sub>b</sub>); the sum must be flat.', 'A timing offset τ moves every sample to p(nT<sub>b</sub> + τ) — recheck.'] }
    ]
  },
  {
    topic: 'T2 · Nyquist & raised cosine', items: [
      { name: 'Bandwidth ↔ bit rate', when: 'Any two of R<sub>b</sub>, α, B<sub>T</sub> given.',
        steps: ['W = R<sub>b</sub>/2 = 1/(2T<sub>b</sub>) (Nyquist bandwidth).', 'B<sub>T</sub> = W(1 + α) = 2W − f<sub>1</sub>; excess = αW.', 'f<sub>1</sub> = W(1 − α).', 'Solving for the rate: R<sub>b</sub> = 2B<sub>T</sub>/(1 + α). For α: α = B<sub>T</sub>/W − 1.'],
        tip: 'The brick wall (α = 0) gives the theoretical maximum R<sub>b</sub> = 2B.' },
      { name: 'Evaluate P(f)', when: 'Raised cosine at a given f.',
        steps: ['Find f<sub>1</sub> = W(1 − α) and the band edge 2W − f<sub>1</sub>.', '|f| < f<sub>1</sub>: P = √E/(2W).', 'Roll-off: P = (√E/4W)[1 + cos(π(|f| − f<sub>1</sub>)/(2(W − f<sub>1</sub>)))].', '|f| ≥ 2W − f<sub>1</sub>: P = 0.'],
        tip: 'At |f| = W the value is always half the flat height.' },
      { name: 'Evaluate p(t)', when: 'Raised-cosine pulse at a given t.',
        steps: ['Compute 2Wt (= t/T<sub>b</sub>) and sinc(2Wt) = sin(2πWt)/(2πWt).', 'Multiply by cos(2παWt)/(1 − 16α²W²t²).', 'If the denominator is 0 (t = ±1/(4αW)), the limit is finite — avoid those points or use the α = 1 form.'] }
    ]
  },
  {
    topic: 'T3 · Noise & Gaussian', items: [
      { name: 'Gaussian probability with a Q-table', when: 'X ~ N(μ, σ²), want a probability.',
        steps: ['σ = √(variance).', 'Pr{X > a} = Q((a − μ)/σ).', 'Pr{X < a} = 1 − Q((a − μ)/σ) = Q((μ − a)/σ).', 'Pr{a < X < b} = Q((a − μ)/σ) − Q((b − μ)/σ).'],
        tip: 'Q(0) = 0.5, Q(1) ≈ 0.159, Q(2) ≈ 0.0228, Q(3) ≈ 0.00135.' },
      { name: 'Noise power after a filter', when: 'White noise N<sub>0</sub>/2 into H(f).',
        steps: ['If T is in °C, convert: T(K) = T(°C) + 273.15; then N<sub>0</sub> = kT.', 'Output PSD = (N<sub>0</sub>/2)|H(f)|².', 'Integrate over all f (both sides!): P = (N<sub>0</sub>/2)∫|H|²df.', 'Or in time: P = (N<sub>0</sub>/2)∫|h(τ)|²dτ (Parseval).', 'Thermal: N<sub>0</sub> = kT<sub>e</sub>, k = 1.38×10<sup>−23</sup> J/K.'] }
    ]
  },
  {
    topic: 'T4 · Matched filter & eye', items: [
      { name: 'Matched-filter output', when: 'Given g(t) on 0…T.',
        steps: ['h(t) = g(T − t): fold g (g(−t)), then shift right by T.', 'y(t) = ∫g(τ)h(t − τ)dτ: slide one pulse across the other and split into cases by overlap (none / entering / leaving / none).', 'In each case integrate the product over the overlap only. y lives on 0…2T and is symmetric about t = T.', 'Evaluate at the breakpoints (0, T/2, T, …) — between them y is linear for piecewise-constant pulses.', 'Peak: y(T) = E = ∫g²dt.'],
        tip: 'For a pulse that is symmetric about T/2, h(t) = g(t).' },
      { name: 'SNR and P<sub>e</sub>', when: 'Matched-filter receiver in AWGN.',
        steps: ['E = ∫|g|²dt.', 'SNR<sub>max</sub> = 2E·P<sub>d</sub>/N<sub>0</sub> (P<sub>d</sub> = 1 if normalised).', 'Polar signalling: P<sub>e</sub> = Q(√(2E/N<sub>0</sub>)).', 'Mismatched filter: plug h into SNR = P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²/((N<sub>0</sub>/2)∫h²).'] }
    ]
  }
];

var FORMULAS = [
  {
    topic: 'T1 · Baseband PAM & ISI', items: [
      { name: 'PAM signal', eq: 's(t) = Σ a<sub>k</sub> g(t − kT<sub>b</sub>)' },
      { name: 'Overall pulse', eq: 'p(t) = g(t) ∗ h(t) ∗ q(t), &nbsp; P(f) = G(f)H(f)Q(f)' },
      { name: 'Received signal', eq: 'y(t) = Σ a<sub>k</sub> p(t − kT<sub>b</sub>)' },
      { name: 'Sampled output', eq: 'y(iT<sub>b</sub>) = a<sub>i</sub>p(0) + Σ<sub>k≠i</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)', note: 'First term: desired symbol. Sum: ISI.' },
      { name: 'Pulse energy', eq: 'p(0) = √E, &nbsp; E = ∫|p(t)|²dt' }
    ]
  },
  {
    topic: 'T2 · Nyquist & raised cosine', items: [
      { name: 'Zero-ISI condition', eq: 'p((i − k)T<sub>b</sub>) = √E (i = k), 0 (i ≠ k)' },
      { name: 'Nyquist criterion', eq: '(1/T<sub>b</sub>) Σ P(f − n/T<sub>b</sub>) = √E', note: 'Equal to 1 for a normalised pulse.' },
      { name: 'Ideal Nyquist channel', eq: 'P<sub>opt</sub>(f) = √E/(2W), |f| < W &nbsp;⇔&nbsp; p<sub>opt</sub>(t) = √E sinc(2Wt) = √E sin(2πWt)/(2πWt)' },
      { name: 'Nyquist bandwidth / rate', eq: 'W = R<sub>b</sub>/2 = 1/(2T<sub>b</sub>), &nbsp; R<sub>b</sub> = 2W' },
      { name: 'Roll-off factor', eq: 'α = 1 − f<sub>1</sub>/W, &nbsp; f<sub>1</sub> = W(1 − α)' },
      { name: 'Raised-cosine roll-off region', eq: 'P(f) = (√E/4W)[1 + cos(π(|f| − f<sub>1</sub>)/(2(W − f<sub>1</sub>)))], &nbsp; f<sub>1</sub> ≤ |f| < 2W − f<sub>1</sub>', note: 'Flat √E/(2W) below f<sub>1</sub>; zero above 2W − f<sub>1</sub>.' },
      { name: 'Raised-cosine pulse', eq: 'p(t) = √E sinc(2Wt)·cos(2παWt)/(1 − 16α²W²t²)', note: 'α = 1: √E sinc(4Wt)/(1 − 16W²t²).' },
      { name: 'Transmission bandwidth', eq: 'B<sub>T</sub> = 2W − f<sub>1</sub> = W(1 + α)', note: '<span class="watch">⚠</span> αW is the excess bandwidth.' }
    ]
  },
  {
    topic: 'T3 · Noise & random processes', items: [
      { name: 'Gaussian PDF', eq: 'f<sub>X</sub>(x) = (1/√(2πσ²)) exp(−(x − μ)²/(2σ²))' },
      { name: 'Linear transforms', eq: 'cX + d ~ N(cμ + d, c²σ²); &nbsp; X + Y ~ N(μ<sub>X</sub> + μ<sub>Y</sub>, σ<sub>X</sub>² + σ<sub>Y</sub>²)', note: 'Sum rule needs independence.' },
      { name: 'Q-function', eq: 'Q(x) = Pr{Z > x} = 1 − Φ(x) = (1/√(2π))∫<sub>x</sub><sup>∞</sup> exp(−s²/2) ds', note: '<span class="watch">⚠</span> Normalise first: Pr{X > a} = Q((a − μ)/σ).' },
      { name: 'CDF properties', eq: 'Pr{a ≤ X ≤ b} = F(b) − F(a); &nbsp; Pr{X > a} = 1 − F(a)' },
      { name: 'CLT', eq: 'Z = (Y − E[Y])/σ<sub>Y</sub> → N(0, 1)', note: 'Y = sum of n i.i.d. RVs, n → ∞.' },
      { name: 'Autocorrelation (WSS)', eq: 'R<sub>X</sub>(τ) = E[X(t)X(t − τ)], &nbsp; R<sub>X</sub>(0) = E[X²]' },
      { name: 'Wiener–Khintchine', eq: 'S<sub>X</sub>(f) = ∫R<sub>X</sub>(τ) exp(−j2πfτ) dτ, &nbsp; E[X²] = ∫S<sub>X</sub>(f)df' },
      { name: 'Filtered process', eq: 'S<sub>Y</sub>(f) = |H(f)|² S<sub>X</sub>(f)' },
      { name: 'White noise', eq: 'R<sub>W</sub>(τ) = (N<sub>0</sub>/2)δ(τ), &nbsp; S<sub>W</sub>(f) = N<sub>0</sub>/2, &nbsp; N<sub>0</sub> = kT<sub>e</sub>' },
      { name: 'Noise power through h', eq: 'P<sub>N</sub> = (N<sub>0</sub>/2)∫|H(f)|²df = (N<sub>0</sub>/2)∫|h(τ)|²dτ' }
    ]
  },
  {
    topic: 'T4 · Matched filter & eye', items: [
      { name: 'Output SNR (any h)', eq: 'SNR = P<sub>d</sub>(∫g(T − τ)h(τ)dτ)² / ((N<sub>0</sub>/2)∫|h(τ)|²dτ)' },
      { name: 'Matched filter', eq: 'h<sub>opt</sub>(t) = k g(T − t)' },
      { name: 'Maximum SNR', eq: 'SNR<sub>max</sub> = (2E/N<sub>0</sub>) P<sub>d</sub>', note: 'Depends on energy only, not on pulse shape.' },
      { name: 'Polar error probability', eq: 'P<sub>e</sub> = Q(√(2E/N<sub>0</sub>))' }
    ]
  }
];

var CHEAT = [
  {
    title: 'Red flags',
    items: [
      'Two-sided PSD N<sub>0</sub>/2 must be integrated over −B…+B: P = N<sub>0</sub>B, not N<sub>0</sub>B/2.',
      'Q-table needs a <b>normalised</b> argument: (a − μ)/σ, with σ (not σ²).',
      'B<sub>T</sub> = (R<sub>b</sub>/2)(1 + α). Forgetting the /2 or the (1 + α) are the two classic slips.',
      'sinc on these slides is normalised: sinc(x) = sin(πx)/(πx). sinc(2Wt) is zero at t = nT<sub>b</sub>.',
      'Matched filter = g(T − t): flip <i>and</i> shift. Sample at t = T.',
      'Variances of independent RVs add; standard deviations do not.',
      'For an autocorrelation: even, maximum at 0, R(0) = power.',
      'Thermal noise: convert to kelvin first, T = °C + 273.15. Using °C directly is off by a factor of ~11.',
      'Matched-filter convolution: integrate only over the overlap, with τ as the dummy variable. Falling case limits: t − T to T.',
      'PSD of a random signal = Fourier transform of its <b>autocorrelation</b>, not of the signal itself.'
    ]
  },
  {
    title: 'Numbers to know cold',
    items: [
      'Q(1) = 0.1587, Q(2) = 0.02275, Q(3) = 1.35×10<sup>−3</sup>, Q(4.265) ≈ 10<sup>−5</sup>.',
      'k = 1.380649×10<sup>−23</sup> J/K. kT at 290 K = 4.0×10<sup>−21</sup> W/Hz = −174 dBm/Hz; at 27 °C (300.15 K) = 4.14×10<sup>−21</sup> W/Hz.',
      'α = 0 → B<sub>T</sub> = W; α = 0.5 → 1.5W; α = 1 → 2W.',
      'Rectangle A over T: E = A²T, matched-filter peak A²T at t = T.'
    ]
  },
  {
    title: 'Ideas in one line',
    items: [
      'ISI = other symbols\' pulse tails at our sampling instant; zero ISI ⇔ p(nT<sub>b</sub>) = 0 for n ≠ 0.',
      'Nyquist: shifted copies of P(f) must add up flat.',
      'Brick wall is optimal in bandwidth but unrealizable and timing-sensitive; raised cosine trades bandwidth (α) for both.',
      'Noise is Gaussian because of the CLT; white means flat PSD / impulse autocorrelation.',
      'Random process = ensemble of RVs over time (N audio generators): one generator over time = realization; all generators at one instant = a random variable.',
      'Stationary = same statistics in every interval (noise). Non-stationary = statistics drift (temperature). WSS = 1st + 2nd order only.',
      'Matched filter maximises SNR; the result depends only on pulse energy.',
      'Eye: height = noise margin, width = timing margin, slope = timing sensitivity.'
    ]
  }
];
