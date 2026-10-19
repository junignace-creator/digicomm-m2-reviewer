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
        ${where([['b<sub>k</sub>','the k-th bit from the source, either 0 or 1'],['T<sub>b</sub>','bit duration: the time given to one bit (s). One bit leaves the source every T<sub>b</sub> seconds; bit rate R<sub>b</sub> = 1/T<sub>b</sub>'],['k','bit/symbol index at the transmitter (bit number 0, 1, 2, …), sent at t = kT<sub>b</sub>'],['a<sub>k</sub>','the voltage level chosen for bit k by the line code (e.g. +A or −A)'],['A','pulse amplitude (V)'],['g(t)','transmit filter: the pulse shape given to every symbol'],['s(t)','transmitted signal = the sum of all the shaped pulses'],['h(t)','channel impulse response (how the channel filters the signal)'],['x(t)','signal at the channel output (what reaches the receiver)'],['q(t)','receive filter impulse response'],['y(t)','receive-filter output, the signal that gets sampled'],['i','sample index at the receiver: the i-th sample is taken at t = iT<sub>b</sub>'],['t','time (s)']])}
      ${qa('Why is a rectangular pulse a problem on a band-limited channel?', 'Its sharp edges need many high-frequency harmonics, i.e. a wide bandwidth. A band-limited channel removes those harmonics and the pulse spreads out in time.')}
      ${use(['T1-01'])}`
    },
    {
      h: '2. Three convolutions become one pulse p(t)',
      html: `
      <p>Each block is linear, so the signal is convolved three times: transmit filter, channel, receive filter. Because convolution is associative we can lump them:</p>
      ${mb('p(t) = g(t) ∗ h(t) ∗ q(t) &nbsp;⇒&nbsp; y(t) = Σ<sub>k</sub> a<sub>k</sub> p(t − kT<sub>b</sub>)')}
      ${where([['p(t)','overall pulse shape seen at the receive-filter output'],['g(t)','transmit (pulse-shaping) filter impulse response'],['h(t)','channel impulse response'],['q(t)','receive filter impulse response'],['∗','convolution'],['y(t)','received signal after the receive filter (before sampling)'],['a<sub>k</sub>','level-encoded symbol number k (e.g. +A or −A in polar NRZ)'],['k','symbol index at the transmitter (which bit was sent)'],['T<sub>b</sub>','bit duration (s); symbol k is launched at t = kT<sub>b</sub>']])}
      <p>So the whole system behaves like "each symbol launches one copy of p(t), delayed by kT<sub>b</sub>". In the frequency domain: P(f) = G(f)H(f)Q(f).</p>
      ${where([['P(f), G(f), H(f), Q(f)','frequency responses (Fourier transforms) of p, g, h, q — convolution in time becomes multiplication in frequency'],['f','frequency (Hz)']])}
      <p><b>k vs i:</b> k is the transmitter's symbol index (when a bit was sent); i is the receiver's sampling index (when we look). We want sample i to give us symbol i.</p>
      ${qa('With g = rectangle of width T<sub>b</sub>, ideal channel, q = same rectangle, what is p(t)?', 'A triangle of base 2T<sub>b</sub> (rect ∗ rect). It peaks at one point and is zero one bit period either side — see T1-03.')}
      ${use(['T1-03'])}`
    },
    {
      h: '3. Intersymbol interference (ISI)',
      html: `
      <p>Sample at t = iT<sub>b</sub> and pull out the k = i term:</p>
      ${mb('y(iT<sub>b</sub>) = a<sub>i</sub> p(0) + Σ<sub>k≠i</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)')}
      ${where([['y(iT<sub>b</sub>)','the i-th sample of the receive-filter output'],['i','sampling index at the receiver (which sample we take)'],['a<sub>i</sub>','the desired symbol — the one this sample should detect'],['p(0)','overall pulse at its own peak (weight of the desired symbol); p(0) = √E'],['a<sub>k</sub>, k ≠ i','all the other (neighbouring) symbols'],['p((i − k)T<sub>b</sub>)','tail of symbol k’s pulse at our sampling instant — its ISI weight'],['T<sub>b</sub>','bit duration (s)']])}
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
      ${where([['H(f)','channel frequency response (given, fixed)'],['G(f)','transmit filter frequency response (we design it)'],['Q(f)','receive filter frequency response (we design it)']])}
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
      ${where([['p(·)','overall pulse shape'],['i, k','receiver sampling index, transmitter symbol index'],['T<sub>b</sub>','bit duration = sampling interval (s)'],['E','pulse energy, E = ∫|p(t)|²dt (J); √E = 1 for a normalised pulse']])}
      <p>In words: <b>p(t) must cross zero at every non-zero multiple of T<sub>b</sub></b>. Between those instants it can do whatever it likes.</p>
      ${qa('Does a triangle of base 2T<sub>b</sub> satisfy it? A triangle of base 4T<sub>b</sub>?', 'Base 2T<sub>b</sub>: yes, it is 0 at ±T<sub>b</sub>, ±2T<sub>b</sub>, … Base 4T<sub>b</sub>: no, p(±T<sub>b</sub>) = 0.5.')}`
    },
    {
      h: '2. Nyquist criterion (frequency domain)',
      html: `
      <p>Sampling p(t) every T<sub>b</sub> makes its spectrum repeat every R<sub>b</sub> = 1/T<sub>b</sub>. If the samples are just one impulse √E δ(t), their spectrum is flat. Setting the two equal gives the criterion:</p>
      ${where([['R<sub>b</sub>','bit rate = 1/T<sub>b</sub>; sampling every T<sub>b</sub> repeats the spectrum every R<sub>b</sub> Hz'],['δ(t)','Dirac impulse; its spectrum is flat (constant at all frequencies)'],['E','pulse energy (J); √E = p(0)']])}
      ${mb(frac('1', 'T<sub>b</sub>') + ' Σ<sub>n</sub> P(f − n/T<sub>b</sub>) = √E &nbsp; (= 1 for a normalised pulse)')}
      ${where([['P(f)','spectrum (Fourier transform) of the overall pulse p(t)'],['f','frequency (Hz)'],['n','replica number: P(f − n/T<sub>b</sub>) is the copy of P(f) shifted by n·R<sub>b</sub>'],['1/T<sub>b</sub> = R<sub>b</sub>','bit rate (bits/s) — also the sampling rate at the receiver'],['E','pulse energy (J)']])}
      <p><b>Meaning:</b> slide copies of P(f) by every multiple of R<sub>b</sub> and add them up; the total must be <b>flat</b>. No gaps, no bumps.</p>
      ${qa('Why two derivations on the slides?', 'One uses the Poisson-sum (sampling ⇒ spectrum replicas), the other plugs the zero-ISI samples into the Fourier transform definition (one impulse ⇒ flat). Both describe the same sampled pulse, so they must be equal.')}
      ${use(['T2-05'])}`
    },
    {
      h: '3. Ideal Nyquist channel: brick wall ↔ sinc',
      html: `
      <p>The simplest P(f) whose replicas add up flat is a rectangle that touches its neighbours edge to edge:</p>
      ${mb('P<sub>opt</sub>(f) = √E/(2W) for |f| < W &nbsp;⇔&nbsp; p<sub>opt</sub>(t) = √E sinc(2Wt) = √E ' + frac('sin(2πWt)', '2πWt'))}
      ${where([['P<sub>opt</sub>(f)','ideal (brick-wall) pulse spectrum'],['p<sub>opt</sub>(t)','its time-domain pulse (a sinc)'],['W','Nyquist bandwidth (Hz) — the edge of the brick wall'],['E','pulse energy (J)'],['sinc(x)','sin(πx)/(πx) (normalised sinc, zero at every non-zero integer x)'],['t, f','time (s), frequency (Hz)']])}
      <p>Edge-to-edge means W = R<sub>b</sub> − W, so</p>
      ${mb('W = ' + frac('R<sub>b</sub>', '2') + ' = ' + frac('1', '2T<sub>b</sub>') + ' &nbsp; (Nyquist bandwidth); &nbsp; R<sub>b</sub> = 2W (Nyquist rate)')}
      ${where([['W','Nyquist bandwidth: minimum bandwidth for zero ISI (Hz)'],['R<sub>b</sub>','bit rate (bits/s); R<sub>b</sub> = 2W is the Nyquist rate'],['T<sub>b</sub>','bit duration (s), T<sub>b</sub> = 1/R<sub>b</sub>']])}
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
      ${where([['P(f)','raised-cosine pulse spectrum'],['f','frequency (Hz); |f| because the spectrum is symmetric'],['f<sub>1</sub>','end of the flat part / start of the roll-off (Hz)'],['W','Nyquist bandwidth = R<sub>b</sub>/2 (Hz); the spectrum is at half height here'],['2W − f<sub>1</sub>','band edge: P(f) = 0 beyond it'],['E','pulse energy (J)']])}
      ${mb('α = 1 − f<sub>1</sub>/W &nbsp; ⇔ &nbsp; f<sub>1</sub> = W(1 − α)')}
      ${where([['α','roll-off (excess-bandwidth) factor, 0 ≤ α ≤ 1'],['f<sub>1</sub>','edge of the flat part (Hz)'],['W','Nyquist bandwidth (Hz)']])}
      ${tbl(['α', 'name', 'shape'], [['0', 'ideal brick wall', 'f<sub>1</sub> = W, no roll-off'], ['1', 'full raised cosine', 'f<sub>1</sub> = 0, no flat part'], ['0 < α < 1', 'practical', 'flat part + cosine roll-off']])}
      ${curveFig({ series: [
        { fn: function (f) { f = Math.abs(f); return f < 1 ? 1 : 0; }, cls: 'wave3', name: 'α = 0' },
        { fn: function (f) { f = Math.abs(f); var f1 = 0.5; return f < f1 ? 1 : f < 2 - f1 ? 0.5 * (1 + Math.cos(Math.PI * (f - f1) / (2 * (1 - f1)))) : 0; }, cls: 'wave2', name: 'α = 0.5' },
        { fn: function (f) { f = Math.abs(f); return f < 2 ? 0.5 * (1 + Math.cos(Math.PI * f / 2)) : 0; }, cls: 'wave', name: 'α = 1' }
      ], xlo: -2.3, xhi: 2.3, ylo: -0.1, yhi: 1.2, xl: 'f/W', xt: [[-2, '−2W'], [-1, '−W'], [1, 'W'], [2, '2W']], yt: [[1, '√E/2W'], [0.5, 'half']], cap: 'Raised-cosine spectra. Every curve passes through half height at |f| = W — the symmetry that keeps the replica sum flat.', label: 'raised cosine spectra' })}
      <p>Time domain:</p>
      ${mb('p(t) = √E sinc(2Wt) · ' + frac('cos(2παWt)', '1 − 16α²W²t²'))}
      ${where([['p(t)','raised-cosine pulse in time'],['sinc(2Wt)','the Nyquist-channel part: zero at t = nT<sub>b</sub> (keeps zero ISI)'],['cos(2παWt)/(1 − 16α²W²t²)','tail-reducing factor: kills the sinc tails faster as α grows'],['α','roll-off factor'],['W','Nyquist bandwidth (Hz)'],['E','pulse energy (J)'],['t','time (s)']])}
      <p>The sinc part keeps the zero crossings at nT<sub>b</sub> (zero ISI); the second factor <b>kills the tails</b> faster as α grows. At α = 1 it simplifies to √E sinc(4Wt)/(1 − 16W²t²) (using sin·cos = ½ sin 2θ).</p>
      ${qa('Why is α usually chosen between 0 and 1, and not negative or above 1?', 'Only |f| matters (the spectrum is mirrored), so a negative α means nothing new; above 1 the formula would push f<sub>1</sub> negative and the band past 2W.')}
      ${use(['T2-02', 'T2-05', 'T2-06'])}`
    },
    {
      h: '6. Transmission bandwidth and the excess bandwidth',
      html: `
      ${mb('B<sub>T</sub> = 2W − f<sub>1</sub> = W + αW = ' + frac('R<sub>b</sub>', '2') + '(1 + α)')}
      ${where([['B<sub>T</sub>','transmission bandwidth actually occupied (Hz)'],['W','Nyquist bandwidth = R<sub>b</sub>/2 (Hz)'],['αW','excess bandwidth beyond the Nyquist minimum (Hz)'],['f<sub>1</sub>','edge of the flat part (Hz)'],['R<sub>b</sub>','bit rate (bits/s)'],['α','roll-off factor']])}
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
      ${where([['x(t)','received signal at the channel output'],['s(t)','transmitted signal'],['n(t)','channel noise (AWGN)']])}
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
      ${where([['f<sub>X</sub>(x)','probability density function (PDF) of the random variable X'],['X','the random variable (capital letter)'],['x','a particular value X can take (small letter)'],['μ','mean (centre of the bell curve)'],['σ²','variance; σ = standard deviation (spread)'],['exp(·)','e raised to the power in brackets']])}
      <p>μ is the mean, σ² the variance (σ the standard deviation). Notation: X ~ N(μ, σ²). Continuous RVs are described by a PDF; discrete ones (a die) by a PMF.</p>
      <ol>
        <li>Completely described by μ and σ².</li>
        <li>X + c is Gaussian with mean μ + c (variance unchanged).</li>
        <li>cX is Gaussian with mean cμ and variance c²σ².</li>
        <li>The sum of two independent Gaussians is Gaussian: means add, <b>variances</b> add.</li>
        <li>A weighted sum of N independent Gaussians is Gaussian.</li>
        <li>Uncorrelated (zero covariance) Gaussians are also independent — special to Gaussians.</li>
      </ol>
        ${where([['X','a Gaussian random variable'],['N(μ, σ²)','shorthand for ’Gaussian with mean μ and variance σ²’'],['c','any constant'],['N','number of variables being added']])}
      ${qa('X ~ N(0, 4). Distribution of 2X − 1?', 'N(−1, 16): mean 2·0 − 1, variance 2²·4.')}
      ${use(['T3-02'])}`
    },
    {
      h: '3. PDF, CDF and the Q-function',
      html: `
      <p><b>CDF</b> F<sub>X</sub>(x) = Pr{X ≤ x} = area under the PDF from −∞ to x. It rises from 0 to 1. Pr{a ≤ X ≤ b} = F(b) − F(a); Pr{X > a} = 1 − F(a).</p>
      ${where([['F<sub>X</sub>(x)','cumulative distribution function (CDF): probability that X is at most x'],['Pr{·}','probability of the event in braces'],['a, b','any two values (interval limits)'],['−∞','the far left of the PDF; the CDF adds up area from there']])}
      <p><b>PDF</b> is never negative, has total area 1, and is the derivative of the CDF.</p>
      <p>The Gaussian CDF has no closed form, so we use a table of the <b>Q-function</b> — the upper tail of the <i>standard</i> Gaussian N(0, 1):</p>
      ${mb('Q(x) = Pr{Z > x} = 1 − Φ(x) = ' + frac('1', '√(2π)') + '∫<sub>x</sub><sup>∞</sup> e<sup>−s²/2</sup> ds')}
      ${where([['Q(x)','Q-function: probability that a standard Gaussian exceeds x (read from the Q-table)'],['Z','standard Gaussian random variable, N(0, 1): mean 0, variance 1'],['x','threshold, already normalised: x = (a − μ)/σ'],['Φ(x)','CDF of the standard Gaussian, Pr{Z ≤ x}'],['s','dummy integration variable'],['Pr{·}','probability of the event in braces']])}
      ${callout('Exam habit', 'The Q-table will be provided. Always <b>normalise first</b>: Pr{X > a} = Q((a − μ)/σ). Use Q(−x) = 1 − Q(x) for the other side.')}
      ${qa('X ~ N(3, 4). Pr{X > 5}?', 'σ = 2, Q((5 − 3)/2) = Q(1) ≈ 0.159.')}
      ${use(['T3-01', 'T3-04'])}`
    },
    {
      h: '4. Central limit theorem — why noise is Gaussian',
      html: `
      <p>If X<sub>1</sub> … X<sub>n</sub> are i.i.d. (independent, identically distributed, with finite mean and variance), the normalised sum Z = (Y − E[Y])/σ<sub>Y</sub> of Y = ΣX<sub>i</sub> tends to N(0, 1) as n grows — <i>whatever</i> the individual distribution.</p>
      ${where([['X<sub>1</sub> … X<sub>n</sub>','n independent random variables with the same distribution'],['n','how many variables are added'],['Y','their sum, ΣX<sub>i</sub>'],['E[Y]','mean (expected value) of Y'],['σ<sub>Y</sub>','standard deviation of Y'],['Z','normalised sum: (Y − mean)/std. dev.'],['N(0, 1)','standard Gaussian: mean 0, variance 1']])}
      <p>Thermal noise is the sum of a huge number of tiny independent electron contributions, so it is Gaussian.</p>
      <p>"Statistically independent" means the variables are uncorrelated; "identically distributed" means they share the same PDF — Gaussian or not. Normalising = subtract the mean, then divide by the standard deviation.</p>
      ${callout('Why the lecturer cares', 'Once something is Gaussian we know all its properties and can use the Q-function. The CLT is what lets us call white noise a <b>Gaussian random process</b>.')}
      ${use(['T3-06', 'T3-08'])}`
    },
    {
      h: '5. Random processes and stationarity',
      html: `
      <p>A <b>random process</b> X(t) is a collection (ensemble) of random variables evolving over time. Each waveform x<sub>i</sub>(t) is a <i>realization</i> (sample function). Freezing time at t<sub>1</sub> gives a random variable X(t<sub>1</sub>).</p>
      ${callout('Lecture analogy: N audio generators', 'Imagine N audio generators, each producing different values. Watching <b>one</b> generator on an oscilloscope over time = one <b>realization / sample function</b>. Reading <b>all</b> generators at the same instant t<sub>1</sub> = one <b>random variable</b>. The whole collection evolving over time = the <b>random process</b>.')}
      <p><b>Stationary:</b> cut the process into time intervals and compute the statistics (mean, standard deviation…) in each. If they are the same in every interval, the process is stationary.</p>
      ${callout('Lecture examples', '<b>Stationary:</b> channel noise — same statistics whichever interval you look at. <b>Non-stationary:</b> weather temperature — it fluctuates daily, but its statistics drift (rise or fall) from one interval to another.')}
      <ul>
        <li><b>1st-order stationary:</b> the distribution at one time is the same at any other time ⇒ mean and variance are constant (single-point statistics).</li>
        <li><b>2nd-order stationary:</b> the joint distribution of samples at (t<sub>1</sub>, t<sub>2</sub>) equals that at (t<sub>1</sub> + Δt, t<sub>2</sub> + Δt) ⇒ covariance and correlation (<b>two-point statistics</b>) depend only on the lag τ = t<sub>2</sub> − t<sub>1</sub>, not on absolute time.</li>
        <li><b>SSS</b> (strict sense): stationary for every order k and every time shift — mathematically complex to show. <b>WSS</b> (wide sense): only 1st and 2nd order — sufficient for communications computations.</li>
      </ul>
        ${where([['X(t)','the random process (the whole ensemble)'],['x<sub>i</sub>(t)','one realization (sample function), e.g. one audio generator'],['X(t<sub>1</sub>)','the random variable obtained by freezing the process at time t<sub>1</sub>'],['t<sub>1</sub>, t<sub>2</sub>','two observation times'],['Δt','any time shift'],['τ','lag between the two observations, t<sub>2</sub> − t<sub>1</sub>'],['k','order of stationarity (number of time points considered)']])}
      <p><b>Noise as a random process:</b> each electron's motion is like a random variable; the circuit's huge number of electrons is an ensemble ⇒ a random process. Adding them all (CLT) makes it Gaussian. So channel noise is a <b>WSS Gaussian random process</b>.</p>
      <p>A random process is described in the <b>amplitude domain</b> (PDF, CDF) or the <b>time domain</b> (autocorrelation, PSD).</p>
      ${use(['T3-09'])}`
    },
    {
      h: '6. Autocorrelation and PSD',
      html: `
      <p><b>Autocorrelation</b> R<sub>X</sub>(τ) = E[X(t)X(t − τ)]: the correlation of a signal with a delayed copy of <i>itself</i> ("auto" as in autobiography). It is the average of the product of the two samples.</p>
      ${callout('Lecture plots', '<b>Slowly fluctuating process:</b> R(τ) is wide — nearby samples stay correlated, and the correlation fades only at large lags. <b>Rapidly fluctuating process</b> (like noise): R(τ) drops almost immediately away from τ = 0. Near 0 = uncorrelated; near 1 = highly correlated; negative = correlated in the opposite direction.')}
      <p>For a real WSS process:</p>
      <ol><li>R<sub>X</sub>(0) = E[X²] = average power (voltage squared with a normalised 1 Ω resistance, then averaged).</li><li>Even: R<sub>X</sub>(−τ) = R<sub>X</sub>(τ) — the left side mirrors the right.</li><li>Maximum at 0: R<sub>X</sub>(0) ≥ |R<sub>X</sub>(τ)| — a signal matches itself best with no delay (in magnitude; R can be negative elsewhere).</li></ol>
      <p><b>PSD</b> (W/Hz): how the power is distributed across frequency. For a <i>deterministic</i> signal it is just the Fourier transform of the signal. Our signals are <i>random</i> (the data and the noise are random), so we use <b>Wiener–Khintchine</b>: the PSD is the Fourier transform of the <b>autocorrelation</b>, S<sub>X</sub>(f) = ∫R<sub>X</sub>(τ)e<sup>−j2πfτ</sup>dτ.</p>
      <p>PSD properties: area under S<sub>X</sub>(f) = E[X²] (W/Hz × Hz = W, the power); S<sub>X</sub>(f) ≥ 0; even in f; and through a filter: <b>S<sub>Y</sub>(f) = |H(f)|² S<sub>X</sub>(f)</b> — squared because the PSD comes from the autocorrelation, which is already a product of two samples.</p>
      ${where([['R<sub>X</sub>(τ)','autocorrelation of the process X(t) at lag τ'],['τ','lag (delay) between the two samples (s)'],['E[·]','expectation (average over the ensemble)'],['E[X²]','mean-square value = average power'],['S<sub>X</sub>(f)','power spectral density of X (W/Hz)'],['S<sub>Y</sub>(f)','PSD at the output of a filter'],['H(f)','filter frequency response; |H(f)|² is its power gain'],['e<sup>−j2πfτ</sup>','Fourier-transform kernel'],['f','frequency (Hz)']])}
      ${use(['T3-05'])}`
    },
    {
      h: '7. White noise PSD and filtered noise',
      html: `
      ${mb('R<sub>W</sub>(τ) = ' + frac('N<sub>0</sub>', '2') + 'δ(τ) &nbsp;⇔&nbsp; S<sub>W</sub>(f) = ' + frac('N<sub>0</sub>', '2') + ' W/Hz (two-sided)')}
      ${where([['R<sub>W</sub>(τ)','autocorrelation of the white noise w(t)'],['τ','lag (time difference) between the two samples (s)'],['δ(τ)','Dirac delta: non-zero only at τ = 0 (samples at different times are uncorrelated)'],['S<sub>W</sub>(f)','power spectral density of the noise (W/Hz)'],['N<sub>0</sub>/2','two-sided noise PSD level (W/Hz) — the noise power per Hz']])}
      <p>Noise fluctuates so fast that samples at different times are uncorrelated: the autocorrelation is an impulse — non-zero <b>only at zero lag</b>. The Fourier transform of δ(τ) is 1, so the PSD is the constant N<sub>0</sub>/2 at <b>every</b> frequency: white noise can never be avoided, it is present across the whole spectrum. N<sub>0</sub>/2 is the noise power (variance) level.</p>
      ${mb('N<sub>0</sub> = kT, &nbsp; k = 1.380649 × 10<sup>−23</sup> J/K, &nbsp; T (K) = T(°C) + 273.15')}
      ${where([['N<sub>0</sub>','one-sided thermal-noise density (W/Hz)'],['k','Boltzmann’s constant, 1.380649 × 10<sup>−23</sup> J/K'],['T','noise temperature in kelvin (K) — convert from °C first']])}
      ${callout('Calculator tip from lecture', 'Boltzmann\'s constant and 273.15 are stored as built-in constants in the scientific calculator (the lecturer used constant 25 for k and constant 38 for 273.15 on theirs — check your own model). Always convert °C to kelvin first.')}
      <p>Through a filter h(t) the noise becomes <b>band-limited noise</b> — still noise, but only inside the filter's band:</p>
      ${mb('S(f) = ' + frac('N<sub>0</sub>', '2') + '|H(f)|², &nbsp; P<sub>N</sub> = ' + frac('N<sub>0</sub>', '2') + '∫|H(f)|²df = ' + frac('N<sub>0</sub>', '2') + '∫|h(τ)|²dτ (Parseval)')}
      ${where([['S(f)','PSD of the noise after the filter (W/Hz)'],['H(f)','frequency response of the filter; h(τ) is its impulse response'],['|H(f)|²','power gain of the filter at frequency f'],['P<sub>N</sub>','output noise power (W) = area under S(f)'],['N<sub>0</sub>/2','two-sided white-noise PSD at the input (W/Hz)']])}
      <p>A brick-wall filter over ±W leaves a flat N<sub>0</sub>/2 between −W and W and nothing outside; a full-raised-cosine filter gives a raised-cosine-shaped noise PSD.</p>
      ${qa('Ideal LPF of bandwidth B, gain 1. Noise power?', '(N<sub>0</sub>/2)·2B = N<sub>0</sub>B.')}
      ${callout('AWGN, explained', '<b>Additive</b> — it adds to the signal (and Gaussian + constant is still Gaussian). <b>White</b> — all frequency components present equally. <b>Gaussian</b> — zero-mean, Gaussian-distributed amplitude (by the CLT).')}
      ${use(['T3-03', 'T3-07', 'T3-10'])}`
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
      <p>Now assume a <b>wideband LTI channel</b>: it only adds noise and does not reshape the signal, x(t) = s(t) + n(t), with s(t) = a<sub>0</sub>g(t) (a<sub>0</sub> = symbol such as ±A, g = transmit pulse). The receive filter is renamed from q(t) to <b>h(t)</b> (books switch notation); its output is sampled once at t = T.</p>
      <p>Passing through the filter is a convolution, and it distributes over the sum — <i>even the noise gets convolved</i>:</p>
      ${mb('y(t) = [s(t) + n(t)] ∗ h(t) = a<sub>0</sub>g(t) ∗ h(t) + n(t) ∗ h(t)')}
      ${where([['y(t)','receive-filter output'],['s(t)','received signal = a<sub>0</sub>g(t)'],['n(t)','additive white Gaussian noise'],['h(t)','receive filter impulse response (renamed from q(t) in these slides)'],['a<sub>0</sub>','the transmitted symbol (e.g. ±A)'],['g(t)','transmit pulse shape'],['∗','convolution']])}
      ${mb('y(T) = a<sub>0</sub>∫g(T − τ)h(τ)dτ (signal) + ∫n(T − τ)h(τ)dτ (band-limited noise)')}
      ${where([['y(T)','filter output sampled at t = T'],['T','symbol duration = sampling instant (s)'],['τ','dummy integration variable (time inside the convolution)'],['g(T − τ)','transmit pulse folded and shifted by T'],['h(τ)','receive filter impulse response'],['n(T − τ)','noise, folded and shifted the same way']])}
      <p>The receiver is <b>optimal</b> when SNR is highest: signal component large, noise component small.</p>
      <p><b>Signal power</b> = mean-square value of the signal component. E[a<sub>0</sub>²] is random (depends on the data) and becomes P<sub>d</sub>; the convolution of the two filters is deterministic, so its expectation is just itself:</p>
      ${mb('P<sub>S</sub> = P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²')}
      ${where([['P<sub>S</sub>','signal power at the sampling instant'],['P<sub>d</sub>','data-symbol power, E[a<sub>0</sub>²] (= 1 if normalised)'],['∫g(T − τ)h(τ)dτ','deterministic part: pulse and filter overlapping at t = T']])}
      <p><b>Noise power</b>: the noise is WSS, so its power = area under its PSD (N<sub>0</sub>/2)|H(f)|², and by Parseval:</p>
      ${mb('P<sub>N</sub> = ' + frac('N<sub>0</sub>', '2') + '∫|h(τ)|²dτ')}
      ${where([['P<sub>N</sub>','noise power at the filter output'],['N<sub>0</sub>/2','two-sided white-noise PSD (W/Hz)'],['∫|h(τ)|²dτ','energy of the receive filter (Parseval: equals ∫|H(f)|²df)']])}
      ${mb('SNR = ' + frac('P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²', '(N<sub>0</sub>/2)∫|h(τ)|²dτ'))}
      ${where([['SNR','signal-to-noise ratio at the sampling instant, P<sub>S</sub>/P<sub>N</sub>'],['P<sub>d</sub>','data-symbol power'],['g','transmit pulse; h = receive filter; T = sampling instant'],['N<sub>0</sub>','noise density (W/Hz)']])}`
    },
    {
      h: '2. Cauchy–Schwarz ⇒ the matched filter',
      html: `
      <p>Cauchy–Schwarz: (∫uv)² ≤ ∫u² ∫v², with equality when u = kv (like |A·B|² ≤ |A|²|B|² for vectors). Applied to the numerator:</p>
      ${where([['u, v','any two (real) functions — here u = g(T − τ) and v = h(τ)'],['k','any constant'],['A·B','dot product of two vectors (the same inequality in vector form)']])}
      ${mb('SNR ≤ ' + frac('2P<sub>d</sub>', 'N<sub>0</sub>') + '∫|g(T − τ)|²dτ = ' + frac('2E', 'N<sub>0</sub>') + 'P<sub>d</sub>')}
      ${where([['E','pulse energy, ∫|g(T − τ)|²dτ = ∫|g(t)|²dt (unchanged by folding/shifting)'],['P<sub>d</sub>','data-symbol power (1 if normalised)'],['N<sub>0</sub>','noise density (W/Hz)'],['2E/N<sub>0</sub>·P<sub>d</sub>','the maximum SNR, reached by the matched filter']])}
      <p>Equality — the maximum — when</p>
      ${mb('h<sub>opt</sub>(t) = k g(T − t)')}
      ${where([['h<sub>opt</sub>(t)','optimum (matched) receive filter'],['k','any constant gain — only the shape matters'],['g(T − t)','transmit pulse folded (g(−t)) and shifted right by T'],['T','symbol duration = sampling instant (s)']])}
      <p>After Cauchy–Schwarz the ∫|h|² terms on top and bottom cancel. The filter is a <b>time-reversed, delayed copy of the transmit pulse</b> — same shape, any amplitude k: it is "matched" to g.</p>
      ${callout('Fold, then shift', 'g(−t) is g <b>folded</b> about t = 0 (it now lives on −T…0). g(T − t) = g(−(t − T)) is that fold <b>shifted right by T</b>, back onto 0…T. The pulse energy is unchanged by folding or shifting.')}
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
      ${callout('As done in lecture: convolution case by case (rectangle A on 0…T)', 'Slide the folded signal across the filter and integrate the product over the overlap only:<br>• <b>t &lt; 0</b>: no overlap ⇒ y = 0 (the signal has not entered the filter).<br>• <b>0 ≤ t ≤ T</b>: overlap 0…t ⇒ y = ∫<sub>0</sub><sup>t</sup>A²dτ = A²t (rising line).<br>• <b>T ≤ t ≤ 2T</b>: overlap t − T…T ⇒ y = ∫<sub>t−T</sub><sup>T</sup>A²dτ = A²(2T − t) (falling line).<br>• <b>t &gt; 2T</b>: the signal has fully left ⇒ y = 0.<br>Peak A²T at t = T, where the overlap is complete. (The lecturer corrected the integration limits of the third case in class: lower t − T, upper T. Use a different dummy variable τ inside the integral from the limit t.)')}
      ${callout('Error probability link', 'For polar ±g: y(T) = ±E + noise with variance (N<sub>0</sub>/2)E, so P<sub>e</sub> = Q(√(2E/N<sub>0</sub>)) = Q(√SNR<sub>max</sub>).')}
      ${where([['P<sub>e</sub>','bit-error probability'],['Q(·)','Q-function (Gaussian tail probability)'],['E','pulse energy (J)'],['N<sub>0</sub>/2','two-sided noise PSD (W/Hz)'],['SNR<sub>max</sub>','matched-filter output SNR, 2E/N<sub>0</sub>']])}
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
      <p><b>Purpose:</b> it shows at a glance how badly the signal is distorted. The best time to sample is usually the <b>middle</b> of the symbol, where the eye is widest and the noise margin is largest; distortion at that instant shrinks the margin. The slope of the sides also tells you whether you are sampling <b>early or late</b>. Ideally all zero crossings meet at one point; channel distortion or noise spreads them.</p>
      <p>Noise makes the traces fuzzy; ISI splits them into separate paths. M-level signals give M − 1 eyes stacked vertically, with decision boundaries half-way between levels.</p>
      ${where([['M','number of signal levels (M = 2 binary, M = 4 for levels ±1, ±3)']])}
      ${callout('Lecture example: 4-level PAM', 'Levels +3, +1, −1, −3. Every possible transition between levels is overlaid, giving 3 eyes. Sample at the middle of the eye and compare with the boundaries <b>+2, 0, −2</b>.')}
      ${callout('With vs without bandwidth limitation', 'Without a bandwidth limit (filter much wider than the signal) the eyes are clean and wide open. With a bandwidth limit the eyes are less open ⇒ more chance of misdetection. Every real system is band-limited, so the receive filter bandwidth matters: <b>too narrow ⇒ ISI</b> (some traces leave the usual paths, more timing-sensitive, can\'t sample near the zero crossings); <b>too wide ⇒ more noise</b> (the opening shrinks).')}
      ${use(['T4-06', 'T4-08'])}`
    }
  ]
}
];
