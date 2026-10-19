/* Concepts for M2-2 (Part 2): T5 equalization, T6 synchronization. Appended to CONCEPTS (same shape as data/concepts.js). */
CONCEPTS.push(

/* ================= T5 ================= */
{
  label: 'T5 · Equalization',
  sections: [
    {
      h: '1. From M2-1 to M2-2: now the channel distorts',
      html: `
      <p>M2-1 assumed an <b>additive noise channel</b>: the channel only adds Gaussian noise (and maybe attenuates by α), r(t) = αs(t) + n(t). The matched filter then maximised SNR and pulse shaping removed ISI.</p>
      <p>M2-2 lets the channel <b>reshape</b> the signal:</p>
      ${tbl(['model', 'equation', 'meaning'], [
        ['Additive noise', 'r = αs + n', 'simplest; noise (and attenuation) only'],
        ['LTI filter + noise', 'r = s ∗ h + n = ∫h(τ)s(t − τ)dτ + n', 'fixed band-limiting filter; keeps the signal in its allowed band (no crosstalk)'],
        ['LTV filter + noise', 'r = s ∗ h(τ, t) + n = ∫h(τ, t)s(t − τ)dτ + n', 'filter changes with time: time-varying multipath, e.g. urban reflections at different delays']
      ])}
      ${callout('Lecture analogy: speaking in a cave', 'Your voice is the transmitted signal and the cave is the channel. The cave reshapes your voice; the echoey sound you hear is the <b>convolution</b> of your voice with the cave. Convolution = flip one function, slide it with a delay, integrate the product.')}
      <p>In a passband system the modulator sits after the transmit filter and the demodulator before the receive filter; baseband just leaves them out.</p>
      ${use(['T5-01'])}`
    },
    {
      h: '2. Why equalize, and where the equalizer goes',
      html: `
      <p>If the channel were known <b>precisely</b>, a suitable pair of transmit/receive filters (matched filtering + Nyquist shaping) could make ISI arbitrarily small. In practice the channel is not known exactly, it may change over time, and real filters are imprecise. The leftover <b>residual distortion</b> is removed by <b>equalization</b>.</p>
      <p>The equalizer is always at the receiver, in one of three places:</p>
      <ul>
        <li><b>Before the decision device</b> (after the sampler) — it works on samples ⇒ a <b>digital</b> equalizer.</li>
        <li><b>Before the sampler</b> — the signal is still continuous-time ⇒ an <b>analog</b> equalizer.</li>
        <li><b>Combined with the receive filter</b> — one response compensates both residual distortion and noise.</li>
      </ul>
      <p><b>Effect on the eye:</b> transmitted eye wide open → received eye small (distorted) → equalized eye reopened ⇒ detection is more robust.</p>
      <p><b>Types:</b> linear, nonlinear, adaptive. Adaptive equalizers keep adjusting their weights for a time-varying channel — not covered in this module. Notation follows Proakis &amp; Salehi.</p>
      ${use(['T5-09'])}`
    },
    {
      h: '3. Linear transversal filter (tapped delay line)',
      html: `
      <p>The received samples v<sub>k</sub> travel down a chain of delays z<sup>−1</sup> (one symbol each). At every stage the signal is <b>tapped off transversely</b> (perpendicular to the line — hence "transversal"), multiplied by a weight c<sub>j</sub>, and all taps are summed:</p>
      ${mb('Î<sub>k</sub> = Σ<sub>j=−K</sub><sup>K</sup> c<sub>j</sub>v<sub>k−j</sub>')}
      ${where([['Î<sub>k</sub>','equalizer estimate of the k-th symbol (before quantizing)'],['k','sampling (symbol) index'],['j','tap index: j = 0 centre, j > 0 postcursor (past), j < 0 precursor (future)'],['c<sub>j</sub>','tap weight (coefficient) number j'],['v<sub>k−j</sub>','received sample stored at tap j at time k (v<sub>k+1</sub> for j = −1, v<sub>k−1</sub> for j = 1)'],['K','filter length parameter: 2K + 1 taps in total']])}
      ${tdlFig()}
      <ul>
        <li>Î<sub>k</sub> = estimate of the k-th symbol; k = sampling index (v<sub>k</sub> is the M2-1 y(iT<sub>b</sub>)).</li>
        <li>K = filter length parameter ⇒ <b>2K + 1 taps</b>: 1 <b>centre tap</b> (j = 0, current symbol), K <b>postcursor</b> taps (j &gt; 0, ISI from <i>past</i> symbols — "post" = already happened), K <b>precursor</b> taps (j &lt; 0, ISI from <i>future</i> symbols — a sinc pulse has a left side too).</li>
        <li>Î<sub>k</sub> is <b>quantized</b> to the nearest symbol Ĩ<sub>k</sub>; an error occurs if Ĩ<sub>k</sub> ≠ I<sub>k</sub>.</li>
      </ul>
      <p>The weights are chosen by one of two criteria: <b>peak distortion</b> or <b>mean-square error</b>.</p>
      ${qa('With K = 2, how many taps, and what does c<sub>−2</sub> multiply?', '5 taps. c<sub>−2</sub> multiplies v<sub>k+2</sub>, the sample two symbols in the future (a precursor tap).')}
      ${use(['T5-02'])}`
    },
    {
      h: '4. Peak distortion criterion → zero-forcing equalizer',
      html: `
      <p>Lump everything before the equalizer (TX filter, channel, RX filter) into one discrete-time response f<sub>n</sub>. The cascade with the equalizer c<sub>n</sub> is their convolution:</p>
      ${mb('q<sub>n</sub> = Σ<sub>j</sub> c<sub>j</sub>f<sub>n−j</sub>, &nbsp; Î<sub>k</sub> = q<sub>0</sub>I<sub>k</sub> + Σ<sub>n≠k</sub>I<sub>n</sub>q<sub>k−n</sub> + Σ<sub>j</sub>c<sub>j</sub>n<sub>k−j</sub>')}
      ${where([['f<sub>n</sub>','sampled response of everything before the equalizer (TX filter, channel, RX filter)'],['c<sub>j</sub>','equalizer tap weights'],['q<sub>n</sub>','combined response of system + equalizer (their convolution); q<sub>0</sub> = desired-symbol weight'],['I<sub>k</sub>','transmitted information symbol k'],['I<sub>n</sub>, n ≠ k','other symbols (sources of ISI)'],['n<sub>k−j</sub>','noise sample at tap j (filtered by the equalizer)']])}
      <p>Desired symbol + ISI + filtered noise. The <b>peak distortion</b> is the worst-case ISI:</p>
      ${mb('𝒟(c) = Σ<sub>n≠0</sub> |q<sub>n</sub>|')}
      ${where([['𝒟(c)','peak distortion: worst-case ISI at the equalizer output'],['c','vector of all equalizer tap weights (bold c on the slides)'],['q<sub>n</sub>, n ≠ 0','leftover (ISI) values of the combined response']])}
      <p>To kill ISI, force q<sub>n</sub> = 1 at n = 0 and 0 elsewhere — the sequence …0 0 1 0 0… Its Z-transform (a DTFT with z = e<sup>jωT</sup> on the unit circle; z<sup>−1</sup> = one delay) is Q(z) = 1, like an impulse having a flat spectrum. So</p>
      ${mb('C(z)F(z) = 1 &nbsp;⇒&nbsp; C(z) = ' + frac('1', 'F(z)'))}
      ${where([['C(z)','Z-transform of the equalizer taps c<sub>n</sub> (its transfer function)'],['F(z)','Z-transform of the system response f<sub>n</sub>'],['z','Z-transform variable; z<sup>−1</sup> = one symbol delay; z = e<sup>jωT</sup> on the unit circle'],['1','Z-transform of …0 0 1 0 0… (no ISI)']])}
      <p>The equalizer is the <b>inverse filter</b> of the channel: the <b>zero-forcing equalizer (ZFE)</b> — it forces the ISI to zero (assuming infinitely many taps).</p>
      <p><b>Finite length:</b> 2K + 1 taps, and f<sub>n</sub> has L + 1 taps (the channel "remembers" a symbol for L intervals). Their convolution has 2K + L + 1 non-zero q<sub>n</sub> but only 2K + 1 knobs ⇒ ISI generally can't be removed completely.</p>
      ${mb('D<sub>0</sub> = ' + frac('1', '|f<sub>0</sub>|') + ' Σ<sub>n=1</sub><sup>L</sup> |f<sub>n</sub>| &lt; 1 &nbsp;⇔&nbsp; eye open before equalization')}
      ${where([['D<sub>0</sub>','distortion at the equalizer input (before equalization)'],['f<sub>0</sub>','system response for the current symbol (main tap)'],['f<sub>n</sub>, n = 1…L','responses that spill into the next L symbol intervals'],['L','channel memory: f<sub>n</sub> has L + 1 taps']])}
      <p>If D<sub>0</sub> &lt; 1, the optimum is to zero-force q<sub>n</sub> for 1 ≤ |n| ≤ K; the q<sub>n</sub> left for K + 1 ≤ n ≤ K + L are the <b>residual ISI</b>. If the eye is already closed, this equalizer can't be relied on.</p>
      ${callout('Exam habit', 'For a small ZF design: write q<sub>n</sub> = Σc<sub>j</sub>f<sub>n−j</sub> for n = −K…K, set it to 0 except q<sub>0</sub> = 1, solve the 2K + 1 equations, then compute the leftover q<sub>n</sub> outside that range.')}
      ${use(['T5-03', 'T5-04', 'T5-05', 'T5-06'])}`
    },
    {
      h: '5. Mean-square-error (MSE) criterion',
      html: `
      <p>Error = transmitted symbol − estimate: ε<sub>k</sub> = I<sub>k</sub> − Î<sub>k</sub>. Choose the c<sub>j</sub> to minimise</p>
      ${mb('J = E|ε<sub>k</sub>|² = E|I<sub>k</sub> − Î<sub>k</sub>|²')}
      ${where([['J','performance index: mean-square error to minimise'],['ε<sub>k</sub>','error = I<sub>k</sub> − Î<sub>k</sub>'],['I<sub>k</sub>','transmitted symbol'],['Î<sub>k</sub>','equalizer estimate'],['E[·]','expectation (average)']])}
      <p>(For real symbols it is just the square of the real part.) Substituting Î<sub>k</sub> gives a quadratic in the c<sub>j</sub>; the <b>orthogonality principle</b> (choose c so the error is orthogonal to every received sample v<sub>k−l</sub>) turns it into linear equations. The result for an infinite equalizer:</p>
      ${mb('C(z) = ' + frac('F*(1/z*)', 'F(z)F*(1/z*) + N<sub>0</sub>'))}
      ${where([['C(z)','MSE equalizer transfer function'],['F(z)','discrete-time system response before the equalizer'],['F*(1/z*)','complex-conjugate matched filter (time-reversed F)'],['F(z)F*(1/z*)','folded power spectrum, = |F|² on the unit circle'],['N<sub>0</sub>','noise power spectral density']])}
      <ul>
        <li>F*(1/z*) = complex-conjugate <b>matched filter</b> (time-reversed — z<sup>+n</sup> instead of z<sup>−n</sup>).</li>
        <li>F(z)F*(1/z*) = <b>folded power spectrum</b> = |F|² on the unit circle.</li>
        <li>N<sub>0</sub> = noise PSD.</li>
      </ul>
      ${callout('Two limits (lecture emphasis)', '<b>Strong channel</b>, |F|² ≫ N<sub>0</sub>: C ≈ 1/F — acts as a ZFE and removes ISI (MSE generalizes the peak-distortion result at high SNR). <b>Deep null</b>, |F|² ≪ N<sub>0</sub>: N<sub>0</sub> dominates — no division by zero and no noise amplification, so the weights stay finite even for a poor channel.')}
      ${use(['T5-07'])}`
    },
    {
      h: '6. Nonlinear: decision-feedback equalizer (DFE)',
      html: `
      <p>Two transversal filters: a <b>feedforward</b> filter on the received samples and a <b>feedback</b> filter on the <b>past decisions</b>. Their outputs are added before the symbol-by-symbol detector:</p>
      ${mb('Î<sub>k</sub> = Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>v<sub>k−j</sub> (feedforward) + Σ c<sub>j</sub>Ĩ<sub>k−j</sub> (feedback, past decisions)')}
      ${where([['Î<sub>k</sub>','DFE estimate of symbol k'],['v<sub>k−j</sub>','received (matched-filter) samples entering the feedforward filter'],['Ĩ<sub>k−j</sub>','past decisions (quantized symbols) entering the feedback filter'],['c<sub>j</sub>','tap weights (feedforward for j ≤ 0, feedback for j ≥ 1)'],['K<sub>1</sub>','feedforward length: K<sub>1</sub> + 1 taps'],['K<sub>2</sub>','number of feedback taps']])}
      ${dfeFig()}
      <ul>
        <li><b>Feedback filter</b> removes <b>postcursor</b> ISI (past symbols are already decided). Its taps: c<sub>k</sub> = −Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>f<sub>k−j</sub>, k = 1…K<sub>2</sub> — it depends on the feedforward taps and the detected symbols.</li>
        <li><b>Feedforward filter</b> attenuates <b>precursor</b> ISI (future symbols) and <b>whitens the noise</b> (sampling makes the noise correlated; whitening makes it uncorrelated again). Its taps solve Σψ<sub>lj</sub>c<sub>j</sub> = f*<sub>−l</sub>: ψ = autocorrelation (matrix) of the received samples incl. N<sub>0</sub>, right side = cross-correlation with the desired symbol.</li>
        <li><b>Nonlinear</b> because the detector output is quantized (a staircase function) and fed back.</li>
        <li><b>Suboptimum</b> (precursor ISI is hard to cancel completely) but generally <b>better than a linear equalizer</b>. Assumes past decisions are correct.</li>
      </ul>
      ${use(['T5-08'])}`
    }
  ]
},

/* ================= T6 ================= */
{
  label: 'T6 · Synchronization',
  sections: [
    {
      h: '1. Two jobs at the receiver',
      html: `
      <p><b>Carrier estimation</b> (get the carrier's phase/frequency right) and <b>symbol timing estimation</b> (sample at the right instants — ideally the widest eye opening).</p>`
    },
    {
      h: '2. Carrier synchronization: pilot vs suppressed carrier',
      html: `
      ${tbl(['approach', 'how', 'trade-off'], [
        ['Pilot signal', 'an unmodulated carrier is multiplexed with the information signal (e.g. Wi-Fi pilot subcarriers)', 'easy to find, but costs power and bandwidth'],
        ['Suppressed carrier', 'derive the carrier phase from the modulated signal itself', 'all transmit power goes to information; more common — the focus of the lecture']
      ])}`
    },
    {
      h: '3. Why the phase estimate matters',
      html: `
      <p>Received s(t) = A(t)cos(2πf<sub>c</sub>t + φ); local carrier c(t) = cos(2πf<sub>c</sub>t + φ̂). Using cos A cos B = ½[cos(A − B) + cos(A + B)]:</p>
      ${mb('c(t)s(t) = ½A(t)cos(φ − φ̂) + ½A(t)cos(4πf<sub>c</sub>t + φ + φ̂)')}
      ${where([['s(t)','received amplitude-modulated signal, A(t)cos(2πf<sub>c</sub>t + φ)'],['c(t)','receiver’s local carrier, cos(2πf<sub>c</sub>t + φ̂)'],['A(t)','information-bearing amplitude'],['f<sub>c</sub>','carrier frequency (Hz)'],['φ','true carrier phase'],['φ̂','receiver’s estimate of the phase'],['cos(4πf<sub>c</sub>t + …)','double-frequency component (removed by the LPF)']])}
      <p>The low-pass filter removes the double-frequency term:</p>
      ${mb('y(t) = ½A(t)cos(φ − φ̂)')}
      ${where([['y(t)','demodulated output after the low-pass filter'],['φ − φ̂','phase error; cos(φ − φ̂) is the amplitude loss factor']])}
      <p>Ideally φ̂ = φ and cos 0 = 1. Any phase error shrinks the amplitude (cos 60° = 0.5, cos 90° = 0). It is worse for QPSK/QAM, where the 2π of phase is shared among the symbols.</p>
      ${use(['T6-01'])}`
    },
    {
      h: '4. Phase estimators: PLL and one-shot',
      html: `
      <p><b>Phase-locked loop (PLL)</b> = multiplier + <b>loop filter</b> + <b>VCO</b>, in a feedback loop. The loop filter acts as a low-pass filter (removes the double-frequency component); feedback gives <b>continuous tracking</b>, giving an ML estimate of the phase of an unmodulated carrier.</p>
      ${mb('control model: φ − φ̂ → ½ sin(φ̂ − φ) → G(s) → VCO ' + frac('K', 's') + ' → φ̂')}
      ${where([['φ, φ̂','true phase, PLL estimate'],['½ sin(φ̂ − φ)','phase-detector (multiplier) output after removing the double frequency'],['G(s)','loop filter transfer function'],['K/s','VCO model; K = VCO gain constant'],['s','Laplace variable, s = σ + jω (σ: growth/decay, ω: angular frequency)']])}
      <p>s = σ + jω (Laplace): σ describes growth/decay (the transient), ω the angular frequency; in steady state it behaves like a Fourier transform. The PLL has a transient and a steady-state response, as in control systems (not computed in this course).</p>
      <p><b>One-shot ML estimate</b>: correlate r(t) over T<sub>0</sub> with cos 2πf<sub>c</sub>t → X and with −sin 2πf<sub>c</sub>t → Y, then</p>
      ${mb('φ̂<sub>ML</sub> = tan<sup>−1</sup>(Y/X)')}
      ${where([['φ̂<sub>ML</sub>','maximum-likelihood estimate of the carrier phase'],['X','correlation of r(t) with cos 2πf<sub>c</sub>t over T<sub>0</sub>'],['Y','correlation of r(t) with −sin 2πf<sub>c</sub>t over T<sub>0</sub>'],['T<sub>0</sub>','observation (integration) interval']])}
      <p>It is <b>feedforward</b> — no feedback, so no continuous tracking.</p>
      ${use(['T6-02'])}`
    },
    {
      h: '5. Symbol timing: rate and phase',
      html: `
      ${mb('t<sub>n</sub> = nT + τ')}
      ${where([['t<sub>n</sub>','n-th sampling instant'],['n','symbol number'],['T','symbol interval (s); 1/T = symbol rate'],['τ','nominal delay: propagation time from TX to RX (s)']])}
      <p>T = symbol interval; τ = nominal delay (propagation time TX → RX).</p>
      <ul>
        <li><b>Symbol synchronization / timing recovery</b> — extracting the clock, i.e. knowing the rate 1/T at which to sample the matched-filter outputs.</li>
        <li><b>Timing phase</b> — choosing <i>when</i> within each interval T to sample.</li>
      </ul>
      <p>With a rectangular pulse the matched-filter output is a triangle: sampling on the rising (positive-slope) side is <b>early</b>, on the falling (negative-slope) side is <b>late</b>, and the optimum is the peak, where the slope is <b>zero</b>.</p>
      ${curveFig({ series: [{ fn: function (t) { return t < 0 || t > 2 ? 0 : t <= 1 ? t : 2 - t; } }], xlo: -0.2, xhi: 2.3, ylo: -0.1, yhi: 1.2, xt: [[0.8, 'T−δ'], [1, 'T'], [1.2, 'T+δ'], [2, '2T']], yt: [[1, 'peak']], cap: 'Matched-filter output for a rectangular pulse: early sample at T − δ (slope +), optimum at T (slope 0), late sample at T + δ (slope −).', label: 'early late timing' })}
      <p><b>Three ways to get the clock:</b> (1) TX and RX locked to a <b>master clock</b> (e.g. a dedicated clock line); RX compensates the delay. (2) TX <b>sends the clock</b> (or a multiple) with the data; RX extracts it with a <b>narrowband filter</b> — simple, but costs power and bandwidth; worth it if the clock is shared by many users. (3) RX <b>self-synchronizes</b> from the received data.</p>
      ${use(['T6-04'])}`
    },
    {
      h: '6. Decision-directed vs non-decision-directed timing',
      html: `
      <p>Both: matched filter → d/dt (slope) → sample at nT + τ̂ → multiply → Σ → VCC adjusts τ̂.</p>
      ${tbl(['', 'decision-directed', 'non-decision-directed'], [
        ['slope multiplied by', 'the detected symbol I<sub>n</sub> (±1)', 'the sample y<sub>n</sub> itself'],
        ['pros', 'normalized, simple, less affected by noise', 'does not rely on previous decisions'],
        ['cons', 'needs correct decisions', 'worse SNR, more jitter (product scales with sample size)']
      ])}
      ${tbl(['symbol', 'slope', 'product', 'meaning', 'action'], [
        ['+1', '+', '+', 'early', 'advance the timing (sample later)'],
        ['+1', '−', '−', 'late', 'step the clock back'],
        ['−1', '+', '−', 'late', 'step back'],
        ['−1', '−', '+', 'early', 'advance'],
        ['any', '0', '0', 'optimum', 'no change']
      ])}
      ${use(['T6-03', 'T6-05'])}`
    }
  ]
}
);
