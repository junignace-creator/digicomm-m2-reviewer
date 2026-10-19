/* Concepts: plain-language explanation per topic, tiny checkable examples, links to practice.
   Shape: { label: 'T1 · …', sections: [{ h: '1. …', html: `…` }] }
   Helpers: qa(question, answer), use(['T1-01', …]), callout(tag, html). */
var CONCEPTS = [

/* ================= T1 ================= */
{
  label: 'T1 · PAM & ISI',
  sections: [
    {
      h: '1. Where Module 2 starts: baseband, and the channel now matters',
      html: `
      <p>In Module 1 the channel only <i>added noise</i>. Module 2 asks what happens when the channel (and the filters around it) also <b>shape</b> the signal because they have limited bandwidth.</p>
      <p><b>Baseband</b> = no carrier. The pulses are sent at their own low frequencies; there is no modulation onto a higher frequency yet (that was passband, Module 1.3).</p>
      <p>The chain, block by block:</p>
      <ol>
        <li><b>Source</b> → bits b<sub>k</sub> ∈ {0, 1}, one every T<sub>b</sub> seconds (if the source is analog, sample and quantize first — Module 1.2).</li>
        <li><b>Level encoder</b> (a line code) → numbers a<sub>k</sub>. Polar NRZ: 1 → +A, 0 → −A.</li>
        <li><b>Transmit filter</b> g(t) → s(t) = Σ a<sub>k</sub> g(t − kT<sub>b</sub>).</li>
        <li><b>Channel</b> h(t) (+ noise) → x(t).</li>
        <li><b>Receive filter</b> q(t) → y(t), then <b>sample</b> at t = iT<sub>b</sub> and <b>compare with a threshold</b>.</li>
      </ol>
      ${qa('Why is a rectangular pulse a problem on a band-limited channel?', 'Its sharp edges need many high-frequency harmonics, i.e. a wide bandwidth. A band-limited channel removes those harmonics and the pulse spreads out in time.')}
      ${use(['T1-01'])}`
    },
    {
      h: '2. Three convolutions become one pulse p(t)',
      html: `
      <p>Each block is linear, so the signal is convolved three times: transmit filter, channel, receive filter. Because convolution is associative we can lump them:</p>
      ${mb('p(t) = g(t) ∗ h(t) ∗ q(t) &nbsp;⇒&nbsp; y(t) = Σ<sub>k</sub> a<sub>k</sub> p(t − kT<sub>b</sub>)')}
      <p>So the whole system behaves like "each symbol launches one copy of p(t), delayed by kT<sub>b</sub>". In the frequency domain: P(f) = G(f)H(f)Q(f).</p>
      <p><b>k vs i:</b> k is the transmitter's symbol index (when a bit was sent); i is the receiver's sampling index (when we look). We want sample i to give us symbol i.</p>
      ${qa('With g = rectangle of width T<sub>b</sub>, ideal channel, q = same rectangle, what is p(t)?', 'A triangle of base 2T<sub>b</sub> (rect ∗ rect). It peaks at one point and is zero one bit period either side — see T1-03.')}
      ${use(['T1-03'])}`
    },
    {
      h: '3. Intersymbol interference (ISI)',
      html: `
      <p>Sample at t = iT<sub>b</sub> and pull out the k = i term:</p>
      ${mb('y(iT<sub>b</sub>) = a<sub>i</sub> p(0) + Σ<sub>k≠i</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)')}
      <p>The first term is the <b>desired symbol</b>. The sum is <b>ISI</b>: the leftover tails of all the other symbols' pulses, before and after, landing on our sampling instant.</p>
      <p>With no ISI, y(iT<sub>b</sub>) = a<sub>i</sub>p(0), and p(0) = √E where E = ∫|p(t)|²dt (often normalised so √E = 1).</p>
      ${callout('Tiny example', 'p(0) = 1, p(T<sub>b</sub>) = 0.2, neighbours ±1. Desired +1 with a −1 before it: y = 1 − 0.2 = 0.8. ISI = −0.2.')}
      ${qa('Is ISI random like noise?', 'No. It is completely determined by the neighbouring data and the pulse shape. That is why it can be designed away (Nyquist) or undone (equalisation).')}
      ${use(['T1-02', 'T1-04'])}`
    },
    {
      h: '4. The pulse-shaping problem',
      html: `
      <p>The channel H(f) is given — we cannot change it. We <i>can</i> choose the transmit filter G(f) and the receive filter Q(f). Choose them so that:</p>
      <ol><li><b>ISI is zero</b>, and</li><li><b>bandwidth is conserved</b> (use as little as possible).</li></ol>
      <p>The answer starts with the Nyquist channel (T2).</p>`
    }
  ]
},

/* ================= T2 ================= */
{
  label: 'T2 · Nyquist & raised cosine',
  sections: [
    {
      h: '1. The zero-ISI condition',
      html: `
      <p>For no ISI, the overall pulse must be non-zero only at its own sampling instant:</p>
      ${mb('p((i − k)T<sub>b</sub>) = √E if i = k; &nbsp; 0 if i ≠ k')}
      <p>In words: <b>p(t) must cross zero at every non-zero multiple of T<sub>b</sub></b>. Between those instants it can do whatever it likes.</p>
      ${qa('Does a triangle of base 2T<sub>b</sub> satisfy it? A triangle of base 4T<sub>b</sub>?', 'Base 2T<sub>b</sub>: yes, it is 0 at ±T<sub>b</sub>, ±2T<sub>b</sub>, … Base 4T<sub>b</sub>: no, p(±T<sub>b</sub>) = 0.5.')}`
    },
    {
      h: '2. Nyquist criterion (frequency domain)',
      html: `
      <p>Sampling p(t) every T<sub>b</sub> makes its spectrum repeat every R<sub>b</sub> = 1/T<sub>b</sub>. If the samples are just one impulse √E δ(t), their spectrum is flat. Setting the two equal gives the criterion:</p>
      ${mb(frac('1', 'T<sub>b</sub>') + ' Σ<sub>n</sub> P(f − n/T<sub>b</sub>) = √E &nbsp; (= 1 for a normalised pulse)')}
      <p><b>Meaning:</b> slide copies of P(f) by every multiple of R<sub>b</sub> and add them up; the total must be <b>flat</b>. No gaps, no bumps.</p>
      ${qa('Why two derivations on the slides?', 'One uses the Poisson-sum (sampling ⇒ spectrum replicas), the other plugs the zero-ISI samples into the Fourier transform definition (one impulse ⇒ flat). Both describe the same sampled pulse, so they must be equal.')}
      ${use(['T2-05'])}`
    },
    {
      h: '3. Ideal Nyquist channel: brick wall ↔ sinc',
      html: `
      <p>The simplest P(f) whose replicas add up flat is a rectangle that touches its neighbours edge to edge:</p>
      ${mb('P<sub>opt</sub>(f) = √E/(2W) for |f| < W &nbsp;⇔&nbsp; p<sub>opt</sub>(t) = √E sinc(2Wt) = √E ' + frac('sin(2πWt)', '2πWt'))}
      <p>Edge-to-edge means W = R<sub>b</sub> − W, so</p>
      ${mb('W = ' + frac('R<sub>b</sub>', '2') + ' = ' + frac('1', '2T<sub>b</sub>') + ' &nbsp; (Nyquist bandwidth); &nbsp; R<sub>b</sub> = 2W (Nyquist rate)')}
      <p>The sinc is zero at t = n/(2W) = nT<sub>b</sub>, so every other symbol's pulse is passing through zero when we sample ours — no ISI even though the pulses overlap.</p>
      ${callout('Sinc convention', 'The slides use the <b>normalised</b> sinc: sinc(x) = sin(πx)/(πx), zero at integer x. The unnormalised sin(x)/x is zero at multiples of π.')}
      ${qa('W = 4800 Hz. What is the maximum bit rate with zero ISI?', '9600 bps (R<sub>b</sub> = 2W).')}
      ${use(['T2-01'])}`
    },
    {
      h: '4. Why the ideal channel is not practical',
      html: `
      <ol>
        <li><b>Unrealizable spectrum:</b> it must be perfectly flat up to W and drop to zero instantly at ±W. No real filter has an infinitely steep roll-off.</li>
        <li><b>Slow decay:</b> the sinc tails fall only as 1/|t|. If the sampling time is slightly off, the many tails no longer hit zero and add up to a large ISI — very sensitive to timing error.</li>
      </ol>`
    },
    {
      h: '5. Raised-cosine spectrum and the roll-off factor α',
      html: `
      <p>Keep a flat part, then let the spectrum fall <b>gradually</b> with a cosine shape that is symmetric about W (so the replicas still add up flat):</p>
      ${mb('P(f) = √E/(2W), &nbsp; |f| < f<sub>1</sub><br>P(f) = ' + frac('√E', '4W') + '[1 + cos(' + frac('π(|f| − f<sub>1</sub>)', '2(W − f<sub>1</sub>)') + ')], &nbsp; f<sub>1</sub> ≤ |f| < 2W − f<sub>1</sub><br>P(f) = 0, &nbsp; |f| ≥ 2W − f<sub>1</sub>')}
      ${mb('α = 1 − f<sub>1</sub>/W &nbsp; ⇔ &nbsp; f<sub>1</sub> = W(1 − α)')}
      ${tbl(['α', 'name', 'shape'], [['0', 'ideal brick wall', 'f<sub>1</sub> = W, no roll-off'], ['1', 'full raised cosine', 'f<sub>1</sub> = 0, no flat part'], ['0 < α < 1', 'practical', 'flat part + cosine roll-off']])}
      ${curveFig({ series: [
        { fn: function (f) { f = Math.abs(f); return f < 1 ? 1 : 0; }, cls: 'wave3', name: 'α = 0' },
        { fn: function (f) { f = Math.abs(f); var f1 = 0.5; return f < f1 ? 1 : f < 2 - f1 ? 0.5 * (1 + Math.cos(Math.PI * (f - f1) / (2 * (1 - f1)))) : 0; }, cls: 'wave2', name: 'α = 0.5' },
        { fn: function (f) { f = Math.abs(f); return f < 2 ? 0.5 * (1 + Math.cos(Math.PI * f / 2)) : 0; }, cls: 'wave', name: 'α = 1' }
      ], xlo: -2.3, xhi: 2.3, ylo: -0.1, yhi: 1.2, xl: 'f/W', xt: [[-2, '−2W'], [-1, '−W'], [1, 'W'], [2, '2W']], yt: [[1, '√E/2W'], [0.5, 'half']], cap: 'Raised-cosine spectra. Every curve passes through half height at |f| = W — the symmetry that keeps the replica sum flat.', label: 'raised cosine spectra' })}
      <p>Time domain:</p>
      ${mb('p(t) = √E sinc(2Wt) · ' + frac('cos(2παWt)', '1 − 16α²W²t²'))}
      <p>The sinc part keeps the zero crossings at nT<sub>b</sub> (zero ISI); the second factor <b>kills the tails</b> faster as α grows. At α = 1 it simplifies to √E sinc(4Wt)/(1 − 16W²t²) (using sin·cos = ½ sin 2θ).</p>
      ${qa('Why is α usually chosen between 0 and 1, and not negative or above 1?', 'Only |f| matters (the spectrum is mirrored), so a negative α means nothing new; above 1 the formula would push f<sub>1</sub> negative and the band past 2W.')}
      ${use(['T2-02', 'T2-05', 'T2-06'])}`
    },
    {
      h: '6. Transmission bandwidth and the excess bandwidth',
      html: `
      ${mb('B<sub>T</sub> = 2W − f<sub>1</sub> = W + αW = ' + frac('R<sub>b</sub>', '2') + '(1 + α)')}
      <p>αW is the <b>excess bandwidth</b> beyond the Nyquist minimum — hence "excess-bandwidth factor". α = 0.3 means 30 % more bandwidth than the ideal; α = 1 doubles it.</p>
      <p><b>The trade-off:</b> larger α → easier filter and faster tail decay (robust to timing error), but more bandwidth.</p>
      ${qa('R<sub>b</sub> = 10 kbps, α = 0.3. B<sub>T</sub>?', 'W = 5 kHz, B<sub>T</sub> = 5 × 1.3 = 6.5 kHz.')}
      ${use(['T2-03', 'T2-04', 'T2-07'])}`
    }
  ]
},

/* ================= T3 ================= */
{
  label: 'T3 · Noise & random processes',
  sections: [
    {
      h: '1. AWGN: additive, white, Gaussian',
      html: `
      <p>The channel noise is modelled as <b>additive white Gaussian noise</b>: x(t) = s(t) + n(t).</p>
      <ul>
        <li><b>Additive</b> — it simply adds to the signal.</li>
        <li><b>White</b> — present at all frequencies in equal amounts (like white light): flat PSD N<sub>0</sub>/2.</li>
        <li><b>Gaussian</b> — its amplitude at any instant is a zero-mean Gaussian random variable.</li>
      </ul>`
    },
    {
      h: '2. Gaussian random variable and its properties',
      html: `
      ${mb('f<sub>X</sub>(x) = ' + frac('1', '√(2πσ²)') + ' exp(−' + frac('(x − μ)²', '2σ²') + ')')}
      <p>μ is the mean, σ² the variance (σ the standard deviation). Notation: X ~ N(μ, σ²). Continuous RVs are described by a PDF; discrete ones (a die) by a PMF.</p>
      <ol>
        <li>Completely described by μ and σ².</li>
        <li>X + c is Gaussian with mean μ + c (variance unchanged).</li>
        <li>cX is Gaussian with mean cμ and variance c²σ².</li>
        <li>The sum of two independent Gaussians is Gaussian: means add, <b>variances</b> add.</li>
        <li>A weighted sum of N independent Gaussians is Gaussian.</li>
        <li>Uncorrelated (zero covariance) Gaussians are also independent — special to Gaussians.</li>
      </ol>
      ${qa('X ~ N(0, 4). Distribution of 2X − 1?', 'N(−1, 16): mean 2·0 − 1, variance 2²·4.')}
      ${use(['T3-02'])}`
    },
    {
      h: '3. PDF, CDF and the Q-function',
      html: `
      <p><b>CDF</b> F<sub>X</sub>(x) = Pr{X ≤ x} = area under the PDF from −∞ to x. It rises from 0 to 1. Pr{a ≤ X ≤ b} = F(b) − F(a); Pr{X > a} = 1 − F(a).</p>
      <p><b>PDF</b> is never negative, has total area 1, and is the derivative of the CDF.</p>
      <p>The Gaussian CDF has no closed form, so we use a table of the <b>Q-function</b> — the upper tail of the <i>standard</i> Gaussian N(0, 1):</p>
      ${mb('Q(x) = Pr{Z > x} = 1 − Φ(x) = ' + frac('1', '√(2π)') + '∫<sub>x</sub><sup>∞</sup> e<sup>−s²/2</sup> ds')}
      ${callout('Exam habit', 'The Q-table will be provided. Always <b>normalise first</b>: Pr{X > a} = Q((a − μ)/σ). Use Q(−x) = 1 − Q(x) for the other side.')}
      ${qa('X ~ N(3, 4). Pr{X > 5}?', 'σ = 2, Q((5 − 3)/2) = Q(1) ≈ 0.159.')}
      ${use(['T3-01', 'T3-04'])}`
    },
    {
      h: '4. Central limit theorem — why noise is Gaussian',
      html: `
      <p>If X<sub>1</sub> … X<sub>n</sub> are i.i.d. (independent, identically distributed, with finite mean and variance), the normalised sum Z = (Y − E[Y])/σ<sub>Y</sub> of Y = ΣX<sub>i</sub> tends to N(0, 1) as n grows — <i>whatever</i> the individual distribution.</p>
      <p>Thermal noise is the sum of a huge number of tiny independent electron contributions, so it is Gaussian.</p>
      ${use(['T3-06'])}`
    },
    {
      h: '5. Random processes and stationarity',
      html: `
      <p>A <b>random process</b> X(t) is a collection (ensemble) of random waveforms; each one is a <i>sample function</i>. Freezing time at t<sub>1</sub> gives a random variable X(t<sub>1</sub>).</p>
      <ul>
        <li><b>1st-order stationary:</b> the PDF at any single time does not depend on t ⇒ constant mean and variance.</li>
        <li><b>2nd-order stationary:</b> the joint PDF of two samples depends only on the lag τ = t<sub>2</sub> − t<sub>1</sub>.</li>
        <li><b>SSS</b> (strict sense): true for every order. <b>WSS</b> (wide sense): only the mean and the autocorrelation are time-invariant — enough for noise analysis.</li>
      </ul>`
    },
    {
      h: '6. Autocorrelation and PSD',
      html: `
      <p><b>Autocorrelation</b> R<sub>X</sub>(τ) = E[X(t)X(t − τ)]: how alike the process is with itself τ seconds apart. For a real WSS process:</p>
      <ol><li>R<sub>X</sub>(0) = E[X²] = average power.</li><li>Even: R<sub>X</sub>(−τ) = R<sub>X</sub>(τ).</li><li>Maximum at 0: R<sub>X</sub>(0) ≥ |R<sub>X</sub>(τ)|.</li></ol>
      <p><b>Wiener–Khintchine:</b> the PSD is the Fourier transform of the autocorrelation, S<sub>X</sub>(f) = ∫R<sub>X</sub>(τ)e<sup>−j2πfτ</sup>dτ.</p>
      <p>PSD properties: area under S<sub>X</sub>(f) = E[X²] (power); S<sub>X</sub>(f) ≥ 0; even in f; and through a filter: <b>S<sub>Y</sub>(f) = |H(f)|² S<sub>X</sub>(f)</b>.</p>
      ${use(['T3-05'])}`
    },
    {
      h: '7. White noise PSD and filtered noise',
      html: `
      ${mb('R<sub>W</sub>(τ) = ' + frac('N<sub>0</sub>', '2') + 'δ(τ) &nbsp;⇔&nbsp; S<sub>W</sub>(f) = ' + frac('N<sub>0</sub>', '2') + ' W/Hz (two-sided)')}
      <p>An impulse autocorrelation means any two different instants are uncorrelated. For thermal noise <b>N<sub>0</sub> = kT<sub>e</sub></b>.</p>
      <p>Through a filter h(t) the noise becomes band-limited:</p>
      ${mb('S(f) = ' + frac('N<sub>0</sub>', '2') + '|H(f)|², &nbsp; P<sub>N</sub> = ' + frac('N<sub>0</sub>', '2') + '∫|H(f)|²df = ' + frac('N<sub>0</sub>', '2') + '∫|h(τ)|²dτ (Parseval)')}
      ${qa('Ideal LPF of bandwidth B, gain 1. Noise power?', '(N<sub>0</sub>/2)·2B = N<sub>0</sub>B.')}
      ${use(['T3-03', 'T3-07'])}`
    }
  ]
},

/* ================= T4 ================= */
{
  label: 'T4 · Matched filter & eye',
  sections: [
    {
      h: '1. Setting up the optimal receiver',
      html: `
      <p>Now assume a wideband channel (no ISI) with white noise: x(t) = s(t) + n(t), s(t) = a<sub>0</sub>g(t). The receive filter is renamed h(t); its output is sampled once at t = T (end of the symbol).</p>
      ${mb('y(T) = a<sub>0</sub>∫g(T − τ)h(τ)dτ + ∫n(T − τ)h(τ)dτ')}
      <p>Goal: choose h to <b>maximise SNR</b> at the sampling instant.</p>
      ${mb('SNR = ' + frac('P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²', '(N<sub>0</sub>/2)∫|h(τ)|²dτ'))}
      <p>P<sub>d</sub> = E[a<sub>0</sub>²] is the data-symbol power (random part); the integral is deterministic.</p>`
    },
    {
      h: '2. Cauchy–Schwarz ⇒ the matched filter',
      html: `
      <p>Cauchy–Schwarz: (∫uv)² ≤ ∫u² ∫v², with equality when u = kv (like |A·B|² ≤ |A|²|B|² for vectors). Applied to the numerator:</p>
      ${mb('SNR ≤ ' + frac('2P<sub>d</sub>', 'N<sub>0</sub>') + '∫|g(T − τ)|²dτ = ' + frac('2E', 'N<sub>0</sub>') + 'P<sub>d</sub>')}
      <p>Equality — the maximum — when</p>
      ${mb('h<sub>opt</sub>(t) = k g(T − t)')}
      <p>The filter is a <b>time-reversed, delayed copy of the transmit pulse</b>: it is "matched" to g.</p>
      <ol>
        <li>The maximum SNR depends only on the pulse <b>energy</b> E, not its shape.</li>
        <li>The filter design does depend on the shape.</li>
        <li>All pulses with the same energy are equally good against white noise.</li>
      </ol>
      ${qa('g is a rectangle on 0…T. What does h<sub>opt</sub> look like?', 'The same rectangle on 0…T (flipping a symmetric pulse about T/2 changes nothing). The receiver is just an integrate-and-dump over the bit.')}
      ${use(['T4-01', 'T4-02', 'T4-03', 'T4-04', 'T4-05'])}`
    },
    {
      h: '3. The output peaks at t = T, and the peak is E',
      html: `
      <p>Without noise, y(t) = g(t) ∗ g(T − t) is the autocorrelation of g centred on t = T. Its maximum is at t = T and equals ∫g² = E. That is why the switch samples at t = T.</p>
      ${callout('Error probability link', 'For polar ±g: y(T) = ±E + noise with variance (N<sub>0</sub>/2)E, so P<sub>e</sub> = Q(√(2E/N<sub>0</sub>)) = Q(√SNR<sub>max</sub>).')}
      ${use(['T4-07'])}`
    },
    {
      h: '4. The eye pattern',
      html: `
      <p>Overlay the received waveform (before the threshold) one symbol interval at a time — like an oscilloscope triggered by the symbol clock. The traces form an "eye".</p>
      <ul>
        <li><b>Best sampling time</b> = where the eye is most open.</li>
        <li><b>Eye height</b> (at that time) = margin over noise. Distortion at the sampling time = ISI.</li>
        <li><b>Eye width</b> = time interval over which the wave can be sampled.</li>
        <li><b>Slope of the sides</b> = sensitivity to timing error.</li>
        <li><b>Spread of the zero crossings</b> = timing jitter.</li>
      </ul>
      <p>Noise makes the traces fuzzy; ISI splits them into separate paths. M-level signals give M − 1 eyes stacked vertically, with decision boundaries half-way between levels.</p>
      ${callout('Receive filter bandwidth', 'Too narrow ⇒ ISI (eye closes from inside). Too wide ⇒ more noise passes (eye gets fuzzy).')}
      ${use(['T4-06'])}`
    }
  ]
}
];
