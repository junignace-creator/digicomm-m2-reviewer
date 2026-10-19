/* M2-2 (Part 2): equalization (T5) and synchronization (T6). Same shape as data/problems.js. */

/* ================= T5 · Channel models & equalizers ================= */
PROBLEMS.push({
  id: 'T5-01', lec: 'T5', kind: 'solve',
  title: 'Which channel model? (additive noise / LTI / LTV)',
  q: `<p>Name the channel model and write its equation for each case: (a) a short, wideband coaxial link whose only impairment is thermal noise plus a fixed attenuation; (b) a telephone line that passes only 300–3400 Hz, with noise; (c) a phone moving through a city, where reflections off buildings arrive at different, changing delays. (d) Use the lecturer's cave analogy to explain what the convolution in (b) does to the signal.</p>`,
  a: steps([
    '(a) <b>Additive noise channel</b> (with attenuation α): r(t) = α s(t) + n(t). The simplest model — the channel does not reshape the signal.',
    '(b) <b>LTI filter channel with additive noise</b>: r(t) = s(t) ∗ h(t) + n(t) = ∫h(τ)s(t − τ)dτ + n(t). The linear filter keeps the signal within the allowed bandwidth (exceeding it would interfere with other signals — crosstalk).',
    '(c) <b>LTV filter channel with additive noise</b>: r(t) = s(t) ∗ h(τ, t) + n(t) = ∫h(τ, t)s(t − τ)dτ + n(t), where h(τ, t) is the response at time t to an impulse applied at t − τ. It models <b>time-varying multipath</b>: many reflections arriving at different delays spread the pulse out.',
    '(d) Your voice is the transmitted signal and the cave is the channel: the cave reshapes the voice, and the echoey sound you hear is the convolution output. Convolution = flip one function, then slide it with a delay and integrate the product.',
    warn('Slide 6 writes the LTV relation with a Σ symbol but ends with dτ — it is an integral, like the LTI case.')
  ])
});

PROBLEMS.push({
  id: 'T5-02', lec: 'T5', kind: 'solve',
  title: 'Output of a 3-tap linear transversal equalizer',
  q: `<p>A linear transversal equalizer has K = 1 with taps c<sub>−1</sub> = −0.1, c<sub>0</sub> = 1, c<sub>1</sub> = −0.2. At time k the delay line holds v<sub>k+1</sub> = 0.3, v<sub>k</sub> = 1.1, v<sub>k−1</sub> = −0.4. (a) How many taps, and which are precursor / postcursor? (b) Compute Î<sub>k</sub>. (c) The symbols are ±1: what is the decision Ĩ<sub>k</sub>?</p>`,
  a: steps([
    '(a) 2K + 1 = <b>3 taps</b>: centre tap c<sub>0</sub> (current symbol), <b>precursor</b> c<sub>−1</sub> (j &lt; 0, future symbol), <b>postcursor</b> c<sub>1</sub> (j &gt; 0, past symbol).',
    '(b) Î<sub>k</sub> = Σ<sub>j=−1</sub><sup>1</sup> c<sub>j</sub>v<sub>k−j</sub> = c<sub>−1</sub>v<sub>k+1</sub> + c<sub>0</sub>v<sub>k</sub> + c<sub>1</sub>v<sub>k−1</sub>',
    tbl(['j', 'c<sub>j</sub>', 'v<sub>k−j</sub>', 'product'], [['−1', '−0.1', 'v<sub>k+1</sub> = 0.3', '−0.03'], ['0', '1', 'v<sub>k</sub> = 1.1', '1.10'], ['1', '−0.2', 'v<sub>k−1</sub> = −0.4', '+0.08']], 3),
    'Î<sub>k</sub> = −0.03 + 1.10 + 0.08 = <b>1.15</b>.',
    '(c) Quantize to the nearest symbol: Ĩ<sub>k</sub> = <b>+1</b>. An error would occur only if Ĩ<sub>k</sub> ≠ I<sub>k</sub>.',
    warn('v<sub>k−j</sub> with j = −1 is v<sub>k+1</sub> — the precursor tap multiplies the <i>next</i> (future) sample.')
  ])
});

PROBLEMS.push({
  id: 'T5-03', lec: 'T5', kind: 'solve',
  title: 'Is the eye open before equalization? (input distortion D<sub>0</sub>)',
  q: `<p>The overall system before the equalizer has samples f<sub>n</sub>. For each case compute D<sub>0</sub> = (1/|f<sub>0</sub>|)Σ<sub>n=1</sub><sup>L</sup>|f<sub>n</sub>|, the worst-case unequalized sample for a +1 symbol (a<sub>k</sub> = ±1), and say whether the peak-distortion (zero-forcing) design applies. (a) f = {1, 0.5}. (b) f = {1, 0.6, 0.5}.</p>`,
  a: steps([
    '(a) L = 1: D<sub>0</sub> = 0.5/1 = <b>0.5 &lt; 1</b>. Worst case 1 − 0.5 = 0.5 &gt; 0: the eye is <b>open</b> ⇒ the zero-forcing solution minimises the peak distortion.',
    '(b) L = 2: D<sub>0</sub> = (0.6 + 0.5)/1 = <b>1.1 &gt; 1</b>. Worst case 1 − 1.1 = −0.1: the eye is <b>closed</b> before equalization ⇒ the peak-distortion criterion\'s solution does not apply; this equalizer cannot be relied on to fix it.',
    note('D<sub>0</sub> &lt; 1 is exactly the "eye open prior to equalization" condition on slide 22: the current response must outweigh the sum of the leftover responses.')
  ])
});

PROBLEMS.push({
  id: 'T5-04', lec: 'T5', kind: 'solve',
  title: 'Infinite-length zero-forcing equalizer = inverse filter',
  q: `<p>The system before the equalizer is F(z) = 1 + 0.5z<sup>−1</sup> (f<sub>0</sub> = 1, f<sub>1</sub> = 0.5). (a) Find the infinite-length ZF equalizer C(z) and its first four taps. (b) Check that q<sub>n</sub> = Σc<sub>j</sub>f<sub>n−j</sub> gives …0 0 1 0 0… (c) Why is it called zero-forcing?</p>`,
  a: steps([
    '(a) Peak distortion zero ⇔ Q(z) = C(z)F(z) = 1 ⇒ ' + mb('C(z) = ' + frac('1', 'F(z)') + ' = ' + frac('1', '1 + 0.5z<sup>−1</sup>') + ' = 1 − 0.5z<sup>−1</sup> + 0.25z<sup>−2</sup> − 0.125z<sup>−3</sup> + …') + 'Taps c<sub>0</sub> = 1, c<sub>1</sub> = −0.5, c<sub>2</sub> = 0.25, c<sub>3</sub> = −0.125 (c<sub>n</sub> = (−0.5)<sup>n</sup>).',
    '(b) q<sub>0</sub> = c<sub>0</sub>f<sub>0</sub> = 1; q<sub>1</sub> = c<sub>1</sub>f<sub>0</sub> + c<sub>0</sub>f<sub>1</sub> = −0.5 + 0.5 = 0; q<sub>2</sub> = c<sub>2</sub>f<sub>0</sub> + c<sub>1</sub>f<sub>1</sub> = 0.25 − 0.25 = 0; and so on ✓. The sequence …0 0 1 0 0… has Z-transform 1 — like an impulse having a flat spectrum.',
    '(c) It <b>forces</b> every q<sub>n</sub> with n ≠ 0 (the ISI) to <b>zero</b>.',
    warn('A ZF equalizer needs infinitely many taps in general, and 1/F blows up wherever F(z) is small — the noise is amplified there (see T5-07).')
  ])
});

PROBLEMS.push({
  id: 'T5-05', lec: 'T5', kind: 'solve',
  title: '3-tap zero-forcing equalizer and its residual ISI',
  q: `<p>Same channel f<sub>0</sub> = 1, f<sub>1</sub> = 0.5 (L = 1), but a finite equalizer with K = 1 (taps c<sub>−1</sub>, c<sub>0</sub>, c<sub>1</sub>). (a) Set q<sub>0</sub> = 1 and q<sub>±1</sub> = 0 and solve. (b) Which q<sub>n</sub> are left over, and what is the peak distortion now? (c) How many non-zero q<sub>n</sub> can there be?</p>`,
  a: steps([
    'q<sub>n</sub> = Σ<sub>j</sub>c<sub>j</sub>f<sub>n−j</sub>, with f non-zero only at 0 and 1.',
    'n = −1: c<sub>−1</sub>f<sub>0</sub> = 0 ⇒ <b>c<sub>−1</sub> = 0</b> (the channel has no precursor, so no precursor tap is needed).',
    'n = 0: c<sub>0</sub>f<sub>0</sub> + c<sub>−1</sub>f<sub>1</sub> = 1 ⇒ <b>c<sub>0</sub> = 1</b>.',
    'n = 1: c<sub>1</sub>f<sub>0</sub> + c<sub>0</sub>f<sub>1</sub> = 0 ⇒ <b>c<sub>1</sub> = −0.5</b>.',
    '(b) Residual (range K + 1 ≤ n ≤ K + L, here n = 2): q<sub>2</sub> = c<sub>1</sub>f<sub>1</sub> = −0.25. Peak distortion D = Σ<sub>n≠0</sub>|q<sub>n</sub>| = <b>0.25</b>, down from D<sub>0</sub> = 0.5.',
    '(c) 2K + L + 1 = 4 values (n = −1…2) but only 2K + 1 = 3 adjustable taps ⇒ ISI can\'t be completely removed with a finite equalizer; a longer one pushes the residual further out and makes it smaller (0.125, 0.0625, …).'
  ])
});

PROBLEMS.push({
  id: 'T5-06', lec: 'T5', kind: 'solve',
  title: '3-tap ZF equalizer for a channel with precursor and postcursor ISI',
  q: `<p>The sampled system response is f<sub>−1</sub> = 0.1, f<sub>0</sub> = 1, f<sub>1</sub> = −0.2 (zero elsewhere). Design a 3-tap zero-forcing equalizer (K = 1), then compute the residual ISI and the peak distortion before and after.</p>`,
  a: steps([
    'Write q<sub>n</sub> = Σ<sub>j</sub>c<sub>j</sub>f<sub>n−j</sub> for n = −1, 0, 1 and force [0, 1, 0]:' + mb('n = −1: c<sub>−1</sub>(1) + c<sub>0</sub>(0.1) = 0<br>n = 0: c<sub>−1</sub>(−0.2) + c<sub>0</sub>(1) + c<sub>1</sub>(0.1) = 1<br>n = 1: c<sub>0</sub>(−0.2) + c<sub>1</sub>(1) = 0'),
    'From the outer equations c<sub>−1</sub> = −0.1c<sub>0</sub> and c<sub>1</sub> = 0.2c<sub>0</sub>. Substitute: c<sub>0</sub>(0.02 + 1 + 0.02) = 1 ⇒ <b>c<sub>0</sub> = 0.9615</b>, <b>c<sub>−1</sub> = −0.0962</b>, <b>c<sub>1</sub> = 0.1923</b>.',
    'Residual ISI at n = ±2: q<sub>−2</sub> = c<sub>−1</sub>f<sub>−1</sub> = −0.0096, q<sub>2</sub> = c<sub>1</sub>f<sub>1</sub> = −0.0385.',
    'Peak distortion before: (0.1 + 0.2)/1 = <b>0.30</b>. After: 0.0096 + 0.0385 = <b>0.048</b> — about 6× smaller.',
    note('Matrix form: the 3×3 matrix has entries f<sub>n−j</sub> (rows n, columns j); solving it is the "zero-forcing for 1 ≤ |n| ≤ K" solution on slide 22.')
  ])
});

PROBLEMS.push({
  id: 'T5-07', lec: 'T5', kind: 'solve',
  title: 'MSE equalizer vs zero-forcing at a strong frequency and in a deep null',
  q: `<p>The MSE equalizer is C = F*/(|F|² + N<sub>0</sub>). Take a real channel gain F at three frequencies, F = 1, 0.5 and 0.01, with N<sub>0</sub> = 0.01. Compute the ZF gain 1/F and the MSE gain at each frequency and explain the difference.</p>`,
  a: steps([
    tbl(['F', 'ZF gain 1/F', 'MSE gain F/(F² + N<sub>0</sub>)'], [['1 (strong)', '1', '0.990'], ['0.5', '2', '1.923'], ['0.01 (deep null)', '100', '0.990']], 2),
    '<b>Strong channel</b> (|F|² ≫ N<sub>0</sub>): N<sub>0</sub> is negligible, C ≈ 1/F — the MSE equalizer <b>acts as a ZFE</b> and removes ISI.',
    '<b>Deep null</b> (|F|² ≪ N<sub>0</sub>): ZF would boost by 100 (noise power by 10 000). In the MSE solution N<sub>0</sub> dominates the denominator: <b>no division by zero</b> and <b>no noise amplification</b> — the weights stay finite even for a poor channel.',
    'So the MSE criterion trades a little residual ISI for much less noise, and reduces to the ZF / peak-distortion result at high SNR.'
  ])
});

PROBLEMS.push({
  id: 'T5-08', lec: 'T5', kind: 'solve',
  title: 'Decision-feedback equalizer removes postcursor ISI',
  q: `<p>The channel is f<sub>0</sub> = 1, f<sub>1</sub> = 0.5 (postcursor only), noise-free, symbols ±1: I = +1, −1, −1, +1 (k = 0…3, nothing before). (a) Find the received samples v<sub>k</sub>. (b) Use a DFE with feedforward tap c<sub>0</sub> = 1 and one feedback tap from c<sub>k</sub> = −Σc<sub>j</sub>f<sub>k−j</sub>. (c) Run it and give every decision. (d) Why is the DFE nonlinear, and what happens if a past decision is wrong?</p>`,
  a: steps([
    '(a) v<sub>k</sub> = I<sub>k</sub> + 0.5I<sub>k−1</sub>: v = <b>1, −0.5, −1.5, 0.5</b>.',
    '(b) Feedback tap: c<sub>1</sub> = −c<sub>0</sub>f<sub>1</sub> = <b>−0.5</b>. DFE output Î<sub>k</sub> = c<sub>0</sub>v<sub>k</sub> + c<sub>1</sub>Ĩ<sub>k−1</sub> = v<sub>k</sub> − 0.5Ĩ<sub>k−1</sub>.',
    tbl(['k', 'v<sub>k</sub>', '−0.5·Ĩ<sub>k−1</sub>', 'Î<sub>k</sub>', 'Ĩ<sub>k</sub>'], [['0', '1', '0', '1', '+1'], ['1', '−0.5', '−0.5', '−1', '−1'], ['2', '−1.5', '+0.5', '−1', '−1'], ['3', '0.5', '+0.5', '1', '+1']], 4),
    '(c) Every decision is correct and Î<sub>k</sub> = I<sub>k</sub> exactly: subtracting 0.5 × (the past decision) cancels the postcursor ISI. Compare the 3-tap linear ZF of T5-05, which leaves residual ISI 0.25.',
    '(d) The feedback filter works on <b>quantized decisions</b>; the quantizer is a staircase (nonlinear) function, so the loop is nonlinear. The slide\'s equations assume past decisions are correct — a wrong decision feeds back the wrong correction and can cause further errors (error propagation).',
    warn('Slide 28 writes the feedback sum from j = 0 with K<sub>2</sub> + 1 taps, but slide 29 uses k = 1…K<sub>2</sub>. The feedback can only use <i>past</i> decisions (j ≥ 1); the current decision is not available yet.')
  ])
});

PROBLEMS.push({
  id: 'T5-09', lec: 'T5', kind: 'solve',
  title: 'Essay: why equalize, where to put the equalizer, and linear vs DFE',
  q: `<p>(a) Matched filtering and Nyquist pulse shaping already remove ISI in theory — why do real receivers still need an equalizer? (b) Where can the equalizer be placed, and what kind of equalizer does each position give? (c) What does equalization do to the eye diagram? (d) Compare the linear transversal equalizer and the DFE (structure, which ISI each part handles, performance), and say what an adaptive equalizer is.</p>`,
  a: steps([
    '(a) ISI can be made arbitrarily small only if the channel is known <b>precisely</b>. In practice the channel is not known exactly, it may vary with time, and the transmit/receive filters are implemented imprecisely. The leftover (residual) distortion is compensated by equalization.',
    '(b) All at the receiver: <b>before the decision device</b> (after the sampler) ⇒ works on samples ⇒ <b>digital</b> equalizer; <b>before the sampler</b> ⇒ continuous-time ⇒ <b>analog</b> equalizer; or <b>combined with the receive filter</b>, compensating residual channel distortion and noise together.',
    '(c) Transmitted eye: wide open. Received through the imperfect channel: the opening shrinks. After equalization: the eye <b>reopens</b>, so detection is more robust to noise and other distortion.',
    '(d) <b>Linear transversal</b>: a tapped delay line, Î<sub>k</sub> = Σc<sub>j</sub>v<sub>k−j</sub>, 2K + 1 taps (centre, K postcursor for past-symbol ISI, K precursor for future-symbol ISI), optimised by peak distortion (ZF) or MSE. <b>DFE</b> (nonlinear): a feedforward filter on the samples attenuates precursor ISI and whitens noise; a feedback filter on past <i>decisions</i> cancels postcursor ISI. Still suboptimum (precursor ISI is hard to cancel) but generally better than a linear equalizer, and it does not boost noise when removing postcursor ISI. <b>Adaptive</b>: tap weights are adjusted continuously to follow a time-varying channel (not covered in this module).'
  ])
});

/* ================= T6 · Synchronization ================= */
PROBLEMS.push({
  id: 'T6-01', lec: 'T6', kind: 'solve',
  title: 'Effect of a carrier phase error on the demodulated amplitude',
  q: `<p>s(t) = A(t)cos(2πf<sub>c</sub>t + φ) is demodulated with the local carrier c(t) = cos(2πf<sub>c</sub>t + φ̂) and a low-pass filter. (a) Derive y(t). (b) For phase errors φ − φ̂ = 0°, 30°, 60° and 90°, give the amplitude factor and the loss in dB. (c) Why is this worse for QPSK/QAM?</p>`,
  a: steps([
    '(a) Product-to-sum, cos A cos B = ½[cos(A − B) + cos(A + B)]: ' + mb('c(t)s(t) = ½A(t)cos(φ − φ̂) + ½A(t)cos(4πf<sub>c</sub>t + φ + φ̂)') + 'The LPF removes the double-frequency term: <b>y(t) = ½A(t)cos(φ − φ̂)</b>.',
    '(b)' + tbl(['φ − φ̂', 'cos(φ − φ̂)', 'loss'], [['0°', '1', '0 dB'], ['30°', '0.866', '−1.25 dB'], ['60°', '0.5', '−6.02 dB'], ['90°', '0', 'signal lost']], 1),
    '(c) In QPSK/QAM the 2π of phase is divided among the symbols (90° apart for QPSK), and the cosine and sine branches leak into each other when φ̂ is wrong — a modest error can push points across decision boundaries.',
    note('Loss in dB uses 20 log because cos(φ − φ̂) scales an amplitude.')
  ])
});

PROBLEMS.push({
  id: 'T6-02', lec: 'T6', kind: 'solve',
  title: 'One-shot ML phase estimate: φ̂ = tan<sup>−1</sup>(Y/X)',
  q: `<p>In the one-shot ML estimator, r(t) is correlated over T<sub>0</sub> with cos 2πf<sub>c</sub>t (output X) and −sin 2πf<sub>c</sub>t (output Y). (a) For X = 0.433, Y = 0.25, estimate φ. (b) For X = −0.25, Y = 0.433. (c) How does this estimator differ from the PLL?</p>`,
  a: steps([
    '(a) φ̂ = tan<sup>−1</sup>(0.25/0.433) = <b>30°</b> (X &gt; 0, first quadrant).',
    '(b) Y/X = −1.732 and a calculator\'s tan<sup>−1</sup> gives −60°, but X &lt; 0 and Y &gt; 0 puts the point in the second quadrant: φ̂ = −60° + 180° = <b>120°</b>.',
    '(c) The one-shot estimator is <b>feedforward</b>: one block of data, one estimate, no feedback, so no continuous tracking. The <b>PLL</b> (multiplier, loop filter, VCO) feeds its estimate back and keeps <b>tracking</b> the phase continuously.',
    warn('Check the signs of X and Y before trusting tan<sup>−1</sup>; it only returns −90°…90°.')
  ])
});

PROBLEMS.push({
  id: 'T6-03', lec: 'T6', kind: 'solve',
  title: 'Early or late? Timing error from the matched-filter output',
  q: `<p>Rectangular pulses (A = 1 V, T = 1 ms) give a triangular matched-filter output that peaks at A²T when sampled at t = T. (a) The receiver samples at T − δ with δ = 0.1 ms. Find the sample and the loss in dB, and say whether it is early or late. (b) In a decision-directed timing loop, classify each case as early, late or on time: (i) Ĩ<sub>n</sub> = +1, slope &gt; 0; (ii) +1, slope &lt; 0; (iii) −1, slope &gt; 0; (iv) −1, slope &lt; 0; (v) slope = 0. (c) What does the loop do in each case?</p>`,
  a: steps([
    '(a) Rising side: y(T − δ) = A²(T − δ) = 0.9 × 10<sup>−3</sup> vs peak 10<sup>−3</sup>: 90 % of the peak, 20 log 0.9 = <b>−0.92 dB</b>. On the rising (positive-slope) side ⇒ <b>early</b>.',
    '(b) The loop multiplies the detected symbol by the sampled slope:' + tbl(['Ĩ<sub>n</sub>', 'slope', 'product', 'timing'], [['+1', '+', '+', 'early'], ['+1', '−', '−', 'late'], ['−1', '+', '−', 'late'], ['−1', '−', '+', 'early'], ['any', '0', '0', 'on time (optimum)']], 3),
    '(c) Positive product ⇒ early ⇒ move the sampling clock <b>later</b> (increase τ̂). Negative ⇒ late ⇒ step the clock <b>back</b>. Zero slope ⇒ sampling at the peak, no change. (For a −1 symbol the matched-filter output is an upside-down triangle, which is why its signs flip.)',
    note('Non-decision-directed timing uses the sample y<sub>n</sub> instead of Ĩ<sub>n</sub> — the same sign logic, but the product scales with the sample size.')
  ])
});

PROBLEMS.push({
  id: 'T6-04', lec: 'T6', kind: 'solve',
  title: 'Sampling instants t<sub>n</sub> = nT + τ',
  q: `<p>A baseband link runs at 2400 symbols/s and the propagation delay from TX to RX is τ = 0.1 ms. (a) Find T and the first four sampling instants. (b) Which part of this is "symbol synchronization (timing recovery)" and which is "timing phase"?</p>`,
  a: steps([
    '(a) T = 1/2400 = <b>416.67 µs</b>. t<sub>n</sub> = nT + τ: t<sub>0</sub> = 100 µs, t<sub>1</sub> = 516.67 µs, t<sub>2</sub> = 933.33 µs, t<sub>3</sub> = 1350 µs.',
    '(b) Knowing the rate 1/T (the clock) = <b>symbol synchronization / timing recovery</b>. Choosing where inside each interval to sample, i.e. τ, ideally at the widest eye opening / matched-filter peak = <b>timing phase</b>.'
  ])
});

PROBLEMS.push({
  id: 'T6-05', lec: 'T6', kind: 'solve',
  title: 'Essay: carrier and clock synchronization methods compared',
  q: `<p>(a) Compare the two basic ways of getting carrier synchronization at the receiver. (b) Describe the PLL: parts, what the loop filter is for, and how it differs from the one-shot estimator. (c) List the three ways of achieving symbol synchronization with one pro/con each. (d) Compare decision-directed and non-decision-directed timing estimation.</p>`,
  a: steps([
    '(a) <b>Pilot signal</b>: an unmodulated carrier is multiplexed with the information signal (e.g. Wi-Fi pilot subcarriers) — easy to lock onto, but costs transmit power and bandwidth. <b>Suppressed carrier</b>: the phase is derived from the modulated signal itself, so all the power goes to the information — more efficient and more common.',
    '(b) PLL = <b>multiplier</b> (phase detector) + <b>loop filter</b> + <b>VCO</b>, with feedback. The loop filter acts as a low-pass filter (removes the double-frequency term). Control model: ½ sin(φ̂ − φ) → G(s) → VCO K/s. Feedback ⇒ continuous tracking. The one-shot estimator is feedforward (φ̂ = tan<sup>−1</sup>(Y/X)) and does not track.',
    '(c) (1) <b>Master clock</b> shared by TX and RX (e.g. a dedicated clock line); RX only compensates the delay — accurate, but needs the extra clock distribution. (2) <b>TX sends the clock</b> (or a multiple) with the data; RX extracts it with a narrowband filter — simple, but costs power and bandwidth (worth it if many users share the clock). (3) <b>Self-synchronization</b>: RX extracts timing from the received data — no extra resources, more processing.',
    '(d) <b>Decision-directed</b>: slope × detected symbol (±1) — normalised, simple, less affected by noise, but relies on correct past decisions. <b>Non-decision-directed</b>: slope × the sample itself — does not need decisions, but has worse SNR and more jitter because the product scales with the sample magnitude.'
  ])
});
