/* Lecture Notes for M2-2 (Equalization & Synchronization), appended to NOTES. Same shape as data/notes.js. */
NOTES.push({
  label: 'M2-2 · Equalization & Synchronization',
  intro: '<b>Lecture coverage:</b> 2 videos — channel models, why equalization is needed, linear transversal equalizers (peak distortion → zero forcing, mean-square error), the decision-feedback equalizer, carrier phase synchronization (PLL, one-shot) and symbol timing. Symbols follow Proakis &amp; Salehi.',
  sections: [
    {
      h: '1. Recap, and what is new in Part 2',
      html: `
      <p>Same baseband PAM chain as Part 1: bits b<sub>k</sub> → level encoder → transmit filter g → channel → receive filter → sampler → decision. (If the signal had to go passband, the <b>modulator</b> would sit right after the transmit filter and the <b>demodulator</b> right before the receive filter; they are not drawn because this is baseband.)</p>
      <p>In Part 1 the channel was <b>ideal</b>: it did not reshape the signal, it only added Gaussian noise — and maybe attenuated it by a factor α. Under that model, the <b>matched filter</b> maximised the signal power against the noise, and with proper pulse shaping the ISI could be eliminated.</p>
      <p><b>New in Part 2:</b> the channel itself now <b>distorts</b> (reshapes) the signal. The question becomes: what do we do about the distortion the channel leaves behind?</p>`
    },
    {
      h: '2. Three channel models',
      html: `
      <h4>1. Additive noise channel (the Part 1 model)</h4>
      <p>The simplest mathematical model. The channel only adds noise (statistically, a Gaussian noise process), possibly after attenuating the signal:</p>
      ${mb('r(t) = α s(t) + n(t)')}
      ${where([['r(t)', 'received signal'], ['s(t)', 'transmitted signal'], ['α', 'attenuation factor (the channel only weakens, it does not reshape)'], ['n(t)', 'additive Gaussian noise']])}
      <h4>2. Linear time-invariant (LTI) filter channel with additive noise</h4>
      <p>Now a <b>linear filter</b> sits inside the channel. It reflects the fact that real channels — wired or wireless — only allow a certain range of frequencies; the filter keeps the transmitted signal within the specified bandwidth. (Exceeding it would interfere with other signals: <b>crosstalk</b>.) "Time-invariant" means the filter does not change over time.</p>
      ${mb('r(t) = s(t) ∗ h(t) + n(t) = ∫<sub>−∞</sub><sup>∞</sup> h(τ) s(t − τ) dτ + n(t)')}
      ${where([['h(t)', 'impulse response of the channel filter (the book writes c(t))'], ['∗', 'convolution: the signal is reshaped by the channel'], ['τ', 'delay used inside the convolution']])}
      ${callout('Lecturer’s analogy: speaking inside a cave', 'Your voice is the transmitted signal. The cave is the channel — it reshapes your voice. What you hear, your voice plus its echoes, is the <b>output of the convolution</b>. Whenever a signal passes through a filter it is convolved with it: flip it, slide it through with a delay, and integrate the product.')}
      <h4>3. Linear time-variant (LTV) filter channel with additive noise</h4>
      <p>Here the channel filter itself <b>changes with time</b>, so its response depends both on the time t and on the delay τ:</p>
      ${mb('r(t) = s(t) ∗ h(τ, t) + n(t) = ∫<sub>−∞</sub><sup>∞</sup> h(τ, t) s(t − τ) dτ + n(t)')}
      ${where([['h(τ, t)', 'response of the channel at time t to an impulse applied at time t − τ']])}
      <p>LTV channels model <b>time-varying multipath propagation</b>. In an urban environment there are many obstructions; the signal is reflected off them and reaches the receiver along several paths with different delays. A short pulse arrives <b>spread out</b> and distorted, and the pattern keeps changing as things move.</p>
      ${callout('Slide note', 'Slide 6 writes the LTV relation with a summation sign but ends it with dτ — it is an integral, like the LTI case.')}
      ${use(['T5-01'])}`
    },
    {
      h: '3. Channel distortion — why we need equalization',
      html: `
      <p>If we knew the channel <b>precisely</b>, Part 1 already gives the answer: pick a suitable pair of transmit and receive filters (a matched filter and a Nyquist pulse), control the overall pulse shape, and the ISI at the sampling instants can be made arbitrarily small.</p>
      <p>In practice this does not fully work:</p>
      <ul>
        <li>the exact channel characteristics are <b>not known</b>, and some channels <b>vary over time</b>;</li>
        <li>the filters are physical circuits, and their implementations are <b>imprecise</b>.</li>
      </ul>
      <p>So some distortion is always left over — <b>residual distortion</b>. You cannot completely remove the ISI, but you can reduce it further. <b>Equalization</b> is the process that compensates for this residual distortion, caused by the distorting channel and by imprecise transmit and receive filters.</p>
      <h4>Where the equalizer goes</h4>
      <p>Always at the <b>receiver</b> — it corrects what the channel did. Three possible places:</p>
      <ol>
        <li><b>Before the decision device</b> (right after the sampler). The signal is already a sequence of samples, so this is a <b>digital equalizer</b>. It corrects the residual ISI. This is the usual choice.</li>
        <li><b>Before the sampler.</b> The signal is still continuous-time, so this is an <b>analog equalizer</b> — best for systems that are analog anyway.</li>
        <li><b>Combined with the receive filter</b>, so one response compensates both the residual channel distortion and the noise.</li>
      </ol>
      <h4>What equalization does to the eye</h4>
      <p>Transmitted signal: the eye is wide open. After the imperfect channel: the eye opening is much smaller (how small depends on the channel). After equalization: the eye is <b>reopened</b>, which makes detection more robust against noise and other distortion.</p>
      <h4>Three types of equalizer</h4>
      <p><b>Linear</b>, <b>nonlinear</b> and <b>adaptive</b>. An adaptive equalizer keeps adjusting its weights as a time-varying channel changes. Only linear and nonlinear are covered in this module.</p>
      ${use(['T5-09'])}`
    },
    {
      h: '4. The linear transversal filter (tapped delay line)',
      html: `
      <p>The linear equalizer studied here is the <b>linear transversal filter</b>, also called a <b>tapped delay line</b>. The received samples travel down a line of delay elements z<sup>−1</sup> (each one delays by one symbol, as in DSP). At every stage the signal is <b>tapped off</b>, multiplied by a weight, and all the weighted taps are added.</p>
      <p>Why "transversal"? <i>Transverse</i> means perpendicular: the signal is taken off <b>sideways at each stage</b> of the line instead of only at its end.</p>
      ${tdlFig()}
      ${mb('Î<sub>k</sub> = Σ<sub>j=−K</sub><sup>K</sup> c<sub>j</sub> v<sub>k−j</sub>')}
      ${where([['Î<sub>k</sub>', 'estimate of the k-th symbol after equalization'], ['k', 'sampling (symbol) index'], ['v<sub>k−j</sub>', 'received sample stored at tap j — v is the Part 1 sample y(iT<sub>b</sub>), now written with k'], ['c<sub>j</sub>', 'tap weight (coefficient) j — these are what we optimise'], ['K', 'filter length parameter — the weights are finite in number (you cannot build an infinite filter)']])}
      <p>Since there is a summation over discrete samples, this is clearly a <b>digital</b> equalizer, placed after the sampler.</p>
      <h4>Why use past and future samples?</h4>
      <p>From Part 1, every symbol's pulse (think of a sinc) spreads to <i>both</i> sides — into past and future symbol periods. So the estimate of the current symbol is built from the current sample and its neighbours. There are <b>2K + 1</b> taps in three groups:</p>
      <ul>
        <li><b>Centre tap</b>, j = 0 — the current symbol, the one we are trying to detect.</li>
        <li><b>K postcursor taps</b>, j &gt; 0 (1 … K) — compensate ISI from <b>past</b> symbols. "Post" = after, already happened.</li>
        <li><b>K precursor taps</b>, j &lt; 0 (−K … −1) — compensate ISI from <b>future</b> symbols. "Pre" = before it has happened; a future symbol still affects us because its pulse has a left side too.</li>
      </ul>
      <p>The estimate Î<sub>k</sub> is then <b>quantized</b> to the nearest allowed symbol, giving the decision Ĩ<sub>k</sub> (the tilde marks a quantized value). An <b>error</b> occurs when Ĩ<sub>k</sub> is not the transmitted symbol I<sub>k</sub>.</p>
      <p>How are the weights chosen? The two most common criteria are the <b>peak distortion criterion</b> and the <b>mean-square-error criterion</b>.</p>
      ${use(['T5-02'])}`
    },
    {
      h: '5. Peak distortion criterion → the zero-forcing equalizer',
      html: `
      <p><b>Peak distortion</b> is the worst-case ISI at the equalizer output. This criterion picks the weights that minimise it — ideally, make it zero.</p>
      <h4>Two stages in cascade</h4>
      <p>Lump everything the symbol went through before the equalizer — transmit filter, channel, receive filter — into one discrete-time response f<sub>n</sub> (sometimes just called "the channel", though it is really the whole system before equalization). The equalizer has response c<sub>n</sub>. Two systems in cascade combine by <b>convolution</b> (fold one, then shift):</p>
      ${mb('q<sub>n</sub> = Σ<sub>j=−∞</sub><sup>∞</sup> c<sub>j</sub> f<sub>n−j</sub>')}
      ${where([['f<sub>n</sub>', 'combined response of everything before the equalizer'], ['c<sub>j</sub>', 'equalizer taps (infinitely many, for now)'], ['q<sub>n</sub>', 'overall response: system followed by equalizer'], ['n', 'sample (time) index of the response']])}
      <h4>What comes out of the equalizer</h4>
      <p>The received samples contain the desired symbol, the neighbouring symbols spread by f<sub>n</sub>, and noise. Putting them through the equalizer and using q<sub>n</sub> gives three terms:</p>
      ${mb('Î<sub>k</sub> = q<sub>0</sub>I<sub>k</sub> + Σ<sub>n≠k</sub> I<sub>n</sub>q<sub>k−n</sub> + Σ<sub>j</sub> c<sub>j</sub>n<sub>k−j</sub>')}
      ${where([['q<sub>0</sub>I<sub>k</sub>', 'desired symbol (the one we want), scaled by q<sub>0</sub>'], ['I<sub>n</sub>q<sub>k−n</sub>, n ≠ k', 'intersymbol interference from all other symbols'], ['c<sub>j</sub>n<sub>k−j</sub>', 'noise, filtered by the equalizer'], ['I<sub>k</sub>', 'transmitted symbol k']])}
      <p>The peak value of the middle term is the <b>peak distortion</b>, written with a calligraphic 𝒟 as a function of the weight vector c:</p>
      ${mb('𝒟(c) = Σ<sub>n≠0</sub> |q<sub>n</sub>|')}
      ${where([['𝒟(c)', 'peak distortion (worst-case ISI)'], ['c', 'the vector of all tap weights (bold on the slides)'], ['|q<sub>n</sub>|, n ≠ 0', 'size of each ISI contribution (n = 0 is the desired symbol, so it is excluded)']])}
      <h4>Forcing the ISI to zero</h4>
      <p>𝒟 is zero when q<sub>n</sub> = 1 at n = 0 and 0 for every other n — the sequence …0 0 1 0 0…. To see what that means for the equalizer, take the <b>Z-transform</b> (the discrete-time version of the Fourier transform; it is evaluated on the unit circle, z = e<sup>jωT</sup>, and z<sup>−1</sup> means one symbol of delay). The Z-transform of …0 0 1 0 0… is just <b>1</b> — exactly like an impulse having a flat spectrum. Convolution becomes multiplication:</p>
      ${mb('Q(z) = C(z)F(z) = 1 &nbsp;⇒&nbsp; C(z) = ' + frac('1', 'F(z)'))}
      ${where([['Q(z), C(z), F(z)', 'Z-transforms of q<sub>n</sub>, c<sub>n</sub>, f<sub>n</sub>'], ['z', 'Z-transform variable; z<sup>−1</sup> = one symbol delay']])}
      <p>The equalizer is simply the <b>inverse filter</b> of the system before it. Because it tries to <i>force</i> the ISI to <i>zero</i>, it is called the <b>zero-forcing equalizer (ZFE)</b>.</p>
      ${use(['T5-04'])}`
    },
    {
      h: '6. A real (finite-length) equalizer and residual ISI',
      html: `
      <p>The zero-forcing result assumed infinitely many taps. A real equalizer has <b>2K + 1</b> taps (c<sub>j</sub> = 0 for |j| &gt; K). The system before it also has a finite response f<sub>n</sub> with <b>L + 1</b> taps — it has a kind of <b>memory</b>: when a symbol spreads out, it still affects the next L symbol intervals.</p>
      <p>Convolving a (2K + 1)-long sequence with an (L + 1)-long one gives a sequence of length (2K + 1) + (L + 1) − 1 = <b>2K + L + 1</b>. So q<sub>n</sub> has 2K + L + 1 non-zero values (n = −K … K + L), but we only have 2K + 1 weights to adjust. It is generally <b>impossible to eliminate the ISI completely</b>.</p>
      ${mb('𝒟(c) = Σ<sub>n=−K, n≠0</sub><sup>K+L</sup> |q<sub>n</sub>|')}
      ${where([['K', 'equalizer length parameter (2K + 1 taps)'], ['L', 'channel memory (f<sub>n</sub> has L + 1 taps)']])}
      <h4>When the method works: the eye must already be open</h4>
      ${mb('D<sub>0</sub> = ' + frac('1', '|f<sub>0</sub>|') + ' Σ<sub>n=1</sub><sup>L</sup> |f<sub>n</sub>| &lt; 1')}
      ${where([['D<sub>0</sub>', 'distortion at the equalizer input (before equalization)'], ['f<sub>0</sub>', 'response for the current symbol'], ['f<sub>1</sub> … f<sub>L</sub>', 'how much of the symbol spills into the next L intervals']])}
      <p>In words: the current symbol's response must be bigger than all the spill-over put together. That is the same as saying the <b>eye is already open before equalization</b> — distorted, but not closed. If the eye is closed, this equalizer cannot be relied on to fix it.</p>
      <p>When D<sub>0</sub> &lt; 1, the best solution is to zero-force only what we have weights for: make q<sub>n</sub> = 0 for 1 ≤ |n| ≤ K (by adjusting the c<sub>j</sub>). The values for K + 1 ≤ n ≤ K + L cannot be forced and remain as <b>residual ISI</b>.</p>
      ${use(['T5-03', 'T5-05', 'T5-06'])}`
    },
    {
      h: '7. Mean-square-error (MSE) criterion',
      html: `
      <p>The second way to choose the weights. The name says it all: take the error, square it, and average it. The error is the difference between the symbol that was actually transmitted and our estimate of it:</p>
      ${mb('ε<sub>k</sub> = I<sub>k</sub> − Î<sub>k</sub>, &nbsp; J = E|ε<sub>k</sub>|² = E|I<sub>k</sub> − Î<sub>k</sub>|²')}
      ${where([['ε<sub>k</sub>', 'error for symbol k'], ['I<sub>k</sub>', 'transmitted symbol'], ['Î<sub>k</sub>', 'equalizer estimate'], ['J', 'performance index to minimise (the mean-square error)'], ['E[·]', 'expectation (average)']])}
      <p>The weights c<sub>j</sub> are adjusted to <b>minimise J</b>. The magnitude-squared form also handles <b>complex</b> symbols (with amplitude and phase); for real symbols it is just the square.</p>
      <p>Substituting the expression for Î<sub>k</sub> makes J a <b>quadratic</b> function of the weights. To get solvable linear equations, the <b>orthogonality principle</b> is used: choose the weights so that the error is <b>orthogonal</b> to (uncorrelated with) every received sample. The derivation is long and was skipped in class; the result for an infinitely long equalizer is:</p>
      ${mb('C(z) = ' + frac('F*(1/z*)', 'F(z)F*(1/z*) + N<sub>0</sub>'))}
      ${where([['F(z)', 'discrete-time response of everything before the equalizer'], ['F*(1/z*)', 'complex-conjugate matched filter: F run in reverse — where F has delays z<sup>−n</sup>, this has advances z<sup>+n</sup>'], ['F(z)F*(1/z*)', 'folded power spectrum = |F|² on the unit circle (the system’s power)'], ['N<sub>0</sub>', 'noise power spectral density (roughly the noise variance)']])}
      <h4>The two important limits</h4>
      <ul>
        <li><b>Strong channel</b> (|F|² ≫ N<sub>0</sub>, good SNR): N<sub>0</sub> is negligible, the conjugates cancel, and C(z) ≈ 1/F(z). The MSE equalizer <b>becomes the zero-forcing equalizer</b> and removes the ISI. So MSE generalizes the peak-distortion result.</li>
        <li><b>Channel in a deep null</b> (|F|² ≪ N<sub>0</sub>, poor SNR): N<sub>0</sub> dominates the denominator. There is <b>no division by zero</b>, the weights stay finite, and the equalizer does <b>not amplify the noise</b>.</li>
      </ul>
      ${callout('Why that matters', 'A zero-forcing equalizer divides by F. Where the channel is weak, 1/F is huge and the noise gets boosted along with the signal. The N<sub>0</sub> term is what stops the MSE equalizer from doing that.')}
      ${use(['T5-07'])}`
    },
    {
      h: '8. The decision-feedback equalizer (nonlinear)',
      html: `
      <p>The <b>decision-feedback equalizer (DFE)</b> is the nonlinear equalizer. It has <b>two</b> transversal filters:</p>
      ${dfeFig()}
      <ul>
        <li>a <b>feedforward filter</b>, fed with the received samples v<sub>k</sub> (from the matched filter);</li>
        <li>a <b>feedback filter</b>, fed with the <b>already-detected (quantized) symbols</b> Ĩ. Its output is added to the feedforward output before the detector.</li>
      </ul>
      ${mb('Î<sub>k</sub> = Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>v<sub>k−j</sub> (feedforward) + Σ c<sub>j</sub>Ĩ<sub>k−j</sub> (feedback)')}
      ${where([['v<sub>k−j</sub>', 'received samples (feedforward input)'], ['Ĩ<sub>k−j</sub>', 'past decisions (feedback input) — quantized symbols'], ['c<sub>j</sub>', 'tap weights of each filter'], ['K<sub>1</sub>', 'feedforward length: K<sub>1</sub> + 1 taps'], ['K<sub>2</sub>', 'number of feedback taps']])}
      <h4>Who removes what</h4>
      <ul>
        <li>The <b>feedback filter removes postcursor ISI</b> — interference from <b>past</b> symbols. Those symbols are already detected, so we know them and can subtract their effect.</li>
        <li>The <b>feedforward filter attenuates precursor ISI</b> — interference from <b>future</b> symbols. This is hard to cancel completely, so the DFE is still <b>suboptimum</b>, but it is generally <b>better than a linear equalizer</b>.</li>
      </ul>
      <h4>Why it is called nonlinear</h4>
      <p>The detector output is quantized. Recall the quantizer's <b>staircase</b> function: the output is not linearly related to the input. Feeding that nonlinear signal back makes the whole equalizer nonlinear.</p>
      <h4>How its weights are found</h4>
      <p>Still the MSE criterion, now J(K<sub>1</sub>, K<sub>2</sub>) = E|I<sub>k</sub> − Î<sub>k</sub>|², assuming the past decisions fed back are correct. It leads to two sets of linear equations (derivation skipped in class — "sobrang haba"):</p>
      ${mb('Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> ψ<sub>lj</sub>c<sub>j</sub> = f*<sub>−l</sub> &nbsp; (feedforward), &nbsp;&nbsp; c<sub>k</sub> = −Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>f<sub>k−j</sub>, k = 1 … K<sub>2</sub> &nbsp; (feedback)')}
      ${where([['ψ<sub>lj</sub>', 'correlation matrix of the received samples (past, current, future), including the noise N<sub>0</sub>'], ['f*<sub>−l</sub>', 'target cross-correlation vector: how the received samples correlate with the desired symbol'], ['c<sub>k</sub>, k ≥ 1', 'feedback taps'], ['f<sub>n</sub>', 'system response before the equalizer']])}
      <p>In words: the <b>feedforward</b> taps depend on the autocorrelation of the received samples and on their cross-correlation with the desired symbol. Besides attenuating precursor ISI, the feedforward filter <b>whitens the noise</b> — after receiving and sampling, the noise samples become correlated, and making them uncorrelated again makes them easier to handle. The <b>feedback</b> taps depend on the feedforward taps and the system response, and work on the detected symbols.</p>
      ${callout('Slide note', 'Slide 28 writes the feedback sum from j = 0 with K<sub>2</sub> + 1 taps, but slide 29 uses k = 1 … K<sub>2</sub>. The feedback can only use <b>past</b> decisions (j ≥ 1) — the current decision does not exist yet.')}
      ${use(['T5-08'])}`
    },
    {
      h: '9. Synchronization: two jobs for the receiver',
      html: `
      <p>Even with the channel equalized, the receiver must be <b>in step</b> with the transmitter. Two synchronization tasks, both done at the receiver:</p>
      <ol>
        <li><b>Carrier estimation</b> — know the carrier's phase (and frequency) so demodulation works.</li>
        <li><b>Symbol timing estimation</b> — know when to sample, ideally where the eye is most open.</li>
      </ol>
      <h4>Carrier synchronization: two approaches</h4>
      <ul>
        <li><b>Pilot signal.</b> Multiplex a special signal — the <b>unmodulated carrier</b> — with the information-bearing signal, so the receiver can lock onto it. Wi-Fi does this with <b>pilot subcarriers</b>. Drawback: it costs transmit <b>power</b> and <b>bandwidth</b> for something that carries no data.</li>
        <li><b>Suppressed carrier.</b> Send no separate carrier and <b>derive the phase estimate from the modulated signal itself</b>. All the transmit power goes to the information. This saves power and bandwidth, is more common, and is the focus of the lecture.</li>
      </ul>`
    },
    {
      h: '10. Why the carrier phase must be accurate',
      html: `
      <p>Take an amplitude-modulated signal — the information is in the amplitude A(t) of a carrier at frequency f<sub>c</sub> with some phase φ. The receiver demodulates it by multiplying with its own carrier, whose phase φ̂ is only an <b>estimate</b>:</p>
      ${mb('s(t) = A(t)cos(2πf<sub>c</sub>t + φ), &nbsp; c(t) = cos(2πf<sub>c</sub>t + φ̂)')}
      ${where([['s(t)', 'received AM signal'], ['A(t)', 'information-bearing amplitude'], ['f<sub>c</sub>', 'carrier frequency'], ['φ', 'true carrier phase'], ['c(t)', 'receiver’s local carrier'], ['φ̂', 'receiver’s phase estimate']])}
      <p>Multiply them using the product-to-sum identity cos A cos B = ½[cos(A − B) + cos(A + B)] — one term with the <b>difference</b> of the angles, one with the <b>sum</b>:</p>
      ${mb('c(t)s(t) = ½A(t)cos(φ − φ̂) + ½A(t)cos(4πf<sub>c</sub>t + φ + φ̂)')}
      ${where([['cos(φ − φ̂)', 'difference term: only the phase error survives'], ['cos(4πf<sub>c</sub>t + …)', 'the double-frequency component']])}
      <p>The second term is at <b>twice the carrier frequency</b>. We know our signal's bandwidth, so anything up there is treated as unwanted and a <b>low-pass filter</b> removes it. What is left:</p>
      ${mb('y(t) = ½A(t)cos(φ − φ̂)')}
      ${where([['y(t)', 'demodulated output'], ['φ − φ̂', 'phase error']])}
      <p>Ideally φ̂ = φ, so cos 0 = 1 and we get exactly ½A(t) — the symbol. With a phase error the cosine is less than 1 and the <b>amplitude shrinks</b> (to half at 60°, to zero at 90°). The detection suffers — especially for <b>QPSK and QAM</b>, where the full 2π of phase is divided among the symbols, so even a modest phase error matters.</p>
      ${use(['T6-01'])}`
    },
    {
      h: '11. Estimating the phase: PLL and one-shot estimator',
      html: `
      <h4>Phase-locked loop (PLL)</h4>
      <p>A PLL gives the maximum-likelihood (ML) phase estimate of an unmodulated carrier. It has three parts:</p>
      <ul>
        <li>a <b>multiplier</b> (it compares the input with the local carrier),</li>
        <li>a <b>loop filter</b> — it acts as a <b>low-pass filter</b>, removing the double-frequency component,</li>
        <li>a <b>voltage-controlled oscillator (VCO)</b>, whose output is <b>fed back</b> to the multiplier.</li>
      </ul>
      <p>Because of the feedback, every pass improves the estimate: the PLL <b>continuously tracks</b> the phase.</p>
      <p>In control-systems form (reviewed, not computed in class):</p>
      ${mb('φ − φ̂ → ½ sin(φ̂ − φ) → G(s) → VCO ' + frac('K', 's') + ' → φ̂ (fed back)')}
      ${where([['φ, φ̂', 'true phase, estimated phase'], ['½ sin(φ̂ − φ)', 'what the multiplier produces after the double frequency is removed'], ['G(s)', 'loop filter'], ['K', 'VCO gain constant'], ['s', 'Laplace variable, s = σ + jω: σ describes exponential growth/decay (the transient), ω the angular frequency']])}
      <p>The Laplace transform converts the time domain to the complex-frequency domain. For steady state only (no σ), it behaves like the Fourier transform. Like any control system, the PLL has a <b>transient</b> and a <b>steady-state</b> response.</p>
      <h4>One-shot ML estimate</h4>
      <p>Multiply the received signal by cos 2πf<sub>c</sub>t and by −sin 2πf<sub>c</sub>t, integrate each over an interval, and divide:</p>
      ${mb('φ̂<sub>ML</sub> = tan<sup>−1</sup>(Y/X)')}
      ${where([['X', 'integral of r(t)·cos 2πf<sub>c</sub>t over T<sub>0</sub>'], ['Y', 'integral of r(t)·(−sin 2πf<sub>c</sub>t) over T<sub>0</sub>'], ['T<sub>0</sub>', 'integration (observation) interval']])}
      <p>This is <b>feedforward</b> — no feedback — so it gives one estimate per block and does <b>not</b> track continuously. Hence "one-shot".</p>
      ${use(['T6-02'])}`
    },
    {
      h: '12. Symbol timing: when to sample',
      html: `
      <p>The demodulator (matched-filter) output is sampled periodically, once per symbol, at precise instants:</p>
      ${mb('t<sub>n</sub> = nT + τ')}
      ${where([['t<sub>n</sub>', 'sampling instant for symbol n'], ['n', 'symbol number'], ['T', 'symbol interval (bit period for binary)'], ['τ', 'nominal delay — the propagation time from transmitter to receiver']])}
      <p>The receiver needs a clock and must know two things:</p>
      <ol>
        <li><b>The rate</b> 1/T at which to sample. Extracting this clock at the receiver is <b>symbol synchronization</b>, or <b>timing recovery</b>.</li>
        <li><b>When inside each interval</b> to sample — the middle? slightly left? slightly right? This choice of sampling instant is the <b>timing phase</b>.</li>
      </ol>
      <h4>Early, late and optimum</h4>
      <p>Recall the matched filter for a rectangular pulse (Part 1, Example 1): the output rises linearly, peaks when the pulse and filter overlap exactly, then falls. Sampling while the output is still <b>rising</b> (positive slope) is <b>early</b>; while it is <b>falling</b> (negative slope) is <b>late</b>; the <b>optimum</b> is the peak, where the slope is <b>zero</b>.</p>
      <h4>Three ways to get symbol synchronization</h4>
      <ol>
        <li><b>Master clock.</b> Transmitter and receiver are both locked to a master clock (some systems have a dedicated clock line). The receiver only estimates and compensates the relative delay.</li>
        <li><b>The transmitter sends the clock</b> (or a multiple of it) along with the data. The receiver extracts it with a <b>narrowband filter</b> tuned to that frequency. Very simple, but sending the clock costs power and bandwidth — worth it mainly when one clock is <b>shared by many users</b>.</li>
        <li><b>Self-synchronization.</b> The receiver extracts the timing from the received data signal itself — no separate clock needed.</li>
      </ol>
      ${use(['T6-04'])}`
    },
    {
      h: '13. Self-synchronization: decision-directed vs non-decision-directed',
      html: `
      <p>Both loops work the same way: matched filter → take the <b>slope</b> (d/dt) of its output → sample the slope at nT + τ̂ → multiply → sum → a voltage-controlled clock (VCC) moves the sampling instants. The estimated offset τ̂ is the delay needed to line the samples up with the <b>peak</b> of the matched-filter output — that is, estimating the timing phase, which gives symbol synchronization.</p>
      <h4>Decision-directed</h4>
      <p>The sampled slope is multiplied by the <b>detected symbol</b> I<sub>n</sub> — the decision is used as a reference to tell early from late:</p>
      ${tbl(['symbol', 'slope', 'product', 'meaning', 'what the loop does'], [
        ['+1', '+ (rising)', '+', 'early', 'move the clock forward a little'],
        ['+1', '− (falling)', '−', 'late', 'step the clock back'],
        ['−1', '+', '−', 'late', 'step back (for −1 the matched-filter output is an upside-down triangle)'],
        ['−1', '−', '+', 'early', 'move forward'],
        ['any', '0', '0', 'optimum', 'no change']
      ], 3)}
      ${where([['I<sub>n</sub>', 'detected symbol (±1)'], ['slope', 'd/dt of the matched-filter output, sampled at nT + τ̂']])}
      <p>Because the decisions are just ±1, the product is <b>normalised</b>: the method is simple and less prone to noise.</p>
      <h4>Non-decision-directed</h4>
      <p>The sampled slope is multiplied by the <b>sample itself</b>, y<sub>n</sub>, instead of the decision. The early/late logic is the same.</p>
      ${tbl(['', 'decision-directed', 'non-decision-directed'], [
        ['slope × …', 'detected symbol I<sub>n</sub>', 'sample y<sub>n</sub>'],
        ['advantage', 'normalised, simple, less noise-prone', 'does not rely on previously detected symbols'],
        ['disadvantage', 'needs correct decisions', 'worse SNR; more jitter, because the product scales with the sample size']
      ])}
      ${callout('Wrap-up of Module 2', 'Equalization reopens the eye after a distorting channel; synchronization makes sure we demodulate with the right phase and sample at the right instant. Together they let us detect our symbols even over band-limited channels.')}
      ${use(['T6-03', 'T6-05'])}`
    }
  ]
});
