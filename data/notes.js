/* Lecture Notes: the lectures rewritten as readable notes, in teaching order (like the Module 1 drill's Lecture Notes).
   NOTES = [{ label, intro, sections: [{ h, html }] }]. Every mb() is followed by where(). Source: slides + lecture transcripts. */
var NOTES = [

/* =====================================================================================
   M2-1 · BASEBAND PULSE TRANSMISSION
   ===================================================================================== */
{
  label: 'M2-1 · Baseband Pulse Transmission',
  intro: '<b>Lecture coverage:</b> 5 videos — the PAM system and ISI, the Nyquist channel, the raised-cosine spectrum, channel noise (Gaussian RVs → random processes → white noise), the matched filter, and the eye pattern. Read top to bottom; each section ends with the problems that practise it.',
  sections: [
    {
      h: '1. What changes in Module 2',
      html: `
      <p>Module 2 is called <b>Band-Limited Channels and Equalization</b>. Up to now (Module 1) we assumed the channel did only one bad thing to our signal: it <b>added noise</b>. It never changed the <i>shape</i> of what we sent.</p>
      <p>Real channels are not like that. A cable, a phone line or a radio link only passes a limited range of frequencies — it is <b>band-limited</b> — and every filter in the transmitter and receiver also cuts off some frequencies. Cutting frequencies changes the shape of a pulse in time: a sharp rectangular pulse comes out rounded and <b>spread out</b>. Module 2 is about what that spreading does and how to live with it.</p>
      <h4>Baseband vs passband</h4>
      <p>We start with <b>baseband</b> transmission: the pulses are sent at their own, original low frequencies. There is <b>no carrier modulation</b> — nothing is shifted up to a higher frequency. (Passband, where the data is put on a carrier as in ASK/PSK/QAM, was Module 1.3.) Keeping it baseband lets us study the channel's effect without the carrier getting in the way.</p>
      ${callout('In plain words', 'Module 1: "the channel adds noise." Module 2: "the channel adds noise <i>and</i> smears the pulses in time, so neighbouring pulses start to overlap." The rest of this lecture is the consequences of that one fact.')}`
    },
    {
      h: '2. The baseband PAM system, block by block',
      html: `
      <p>In <b>pulse-amplitude modulation (PAM)</b> the information is carried by the <i>height</i> (amplitude) of each transmitted pulse, and the height can only take a few discrete values. Follow one bit through the system:</p>
      <ol>
        <li><b>Source.</b> We assume it already produces bits. If the source were analog (a continuous-time, continuous-value signal), Module 1.2 applies first: sample it (→ discrete-time, continuous-value), then quantize it (→ discrete-time, discrete-value) to get bits.</li>
        <li><b>Level encoder (line code).</b> Each bit becomes a voltage level, timed by a clock. With <b>polar NRZ</b>: bit 1 → +A, bit 0 → −A, held for the whole bit ("non-return-to-zero" = it does not drop back to 0 inside the bit).</li>
        <li><b>Transmit filter.</b> A row of perfectly rectangular pulses needs a <i>huge</i> bandwidth — sharp edges need many harmonics. So the levels pass through a pulse-shaping filter g(t) that gives each symbol a pulse shape fit for the channel. Its output s(t) is the transmitted signal.</li>
        <li><b>Channel.</b> The channel filters the signal (impulse response h(t)) and may add noise. Its output is x(t).</li>
        <li><b>Receive filter.</b> q(t) cleans up the received signal; its output is y(t).</li>
        <li><b>Sampler.</b> y(t) is still a continuous-time signal, so it is sampled once per bit, at t = iT<sub>b</sub> (i = 0, 1, 2, …).</li>
        <li><b>Decision device.</b> Each sample is compared with a threshold to decide whether a 1 or a 0 was sent.</li>
      </ol>
      ${where([['b<sub>k</sub>', 'the k-th bit from the source (0 or 1), emitted at t = kT<sub>b</sub>'], ['T<sub>b</sub>', 'bit duration (s): one bit is emitted every T<sub>b</sub> seconds; bit rate R<sub>b</sub> = 1/T<sub>b</sub>'], ['a<sub>k</sub>', 'the voltage level for bit k (e.g. +A or −A)'], ['A', 'pulse amplitude (V)'], ['g(t), h(t), q(t)', 'transmit filter, channel, receive filter (impulse responses)'], ['s(t), x(t), y(t)', 'transmitted signal, channel output, receive-filter output'], ['i', 'sample number at the receiver']])}
      <h4>Lecture example: 1 0 0 1 1 0 in polar NRZ</h4>
      <p>The bits become +A, −A, −A, +A, +A, −A. With a rectangular transmit pulse one bit wide, each level becomes one rectangle, and the k-th rectangle starts k bit periods later than the first. So the pulse of the k-th symbol is "a<sub>k</sub> times g, shifted by kT<sub>b</sub>".</p>
      ${use(['T1-01'])}`
    },
    {
      h: '3. From levels to a waveform: the convolution behind s(t)',
      html: `
      <p>"Apply a<sub>k</sub> to the transmit filter" really means <b>convolution</b> — the operation that gives the output of any filter when you know its impulse response. The lecturer's reminder of what convolution does: take one signal, <b>flip</b> it, then <b>slide</b> it across the other step by step, and at every position integrate the product. It describes how one signal gets reshaped ("blended") by another.</p>
      <p>The trick to convolve a list of numbers a<sub>k</sub> with a continuous g(t): first write the numbers as a continuous-time signal made of impulses — one Dirac impulse at each kT<sub>b</sub>, with height a<sub>k</sub>. Convolving a <b>shifted impulse</b> with g(t) simply gives a <b>shifted copy of g</b>. So the whole convolution collapses to a sum of shifted, scaled pulses:</p>
      ${mb('s(t) = a(t) ∗ g(t) = Σ<sub>k</sub> a<sub>k</sub> g(t − kT<sub>b</sub>)')}
      ${where([['s(t)', 'transmitted PAM signal'], ['a(t) = Σa<sub>k</sub>δ(t − kT<sub>b</sub>)', 'the levels written as impulses so they can be convolved'], ['δ(t)', 'Dirac impulse (very tall, very narrow; zero everywhere else)'], ['g(t − kT<sub>b</sub>)', 'the transmit pulse delayed by k bit periods'], ['∗', 'convolution'], ['k', 'symbol index']])}
      ${callout('In plain words', 'Every symbol launches its own copy of the pulse shape, scaled by its level and started at its own time slot. The transmitted signal is just all those copies added together.')}`
    },
    {
      h: '4. Through the channel and receive filter: one overall pulse p(t)',
      html: `
      <p>The channel is assumed <b>linear</b> (it does not create new frequencies) and, for now, the noise is negligible. Then the signal is convolved twice more: once by the channel, once by the receive filter. That is <b>three convolutions</b> in a row — transmit filter, channel, receive filter.</p>
      <p>Because everything is linear, the three can be lumped into <b>one</b> pulse shape p(t). The receiver then sees each symbol as a copy of p(t), not of g(t):</p>
      ${mb('p(t) = g(t) ∗ h(t) ∗ q(t), &nbsp; y(t) = Σ<sub>k</sub> a<sub>k</sub> p(t − kT<sub>b</sub>)')}
      ${where([['p(t)', 'overall pulse: what one symbol looks like after all three filters'], ['g, h, q', 'transmit filter, channel, receive filter'], ['y(t)', 'receive-filter output'], ['a<sub>k</sub>', 'symbol k'], ['T<sub>b</sub>', 'bit duration']])}
      <p>In the frequency domain the three convolutions become a product, P(f) = G(f)H(f)Q(f). That is why the whole receiver can be drawn as a single block "P(f)" followed by the sampler — the simplified picture used for the rest of the lecture.</p>
      ${callout('Why this matters', 'In Module 1.3 we simply assumed some pulse p(t). Here we ask the real design question: what should p(t) look like, given that we control g and q but not h?')}`
    },
    {
      h: '5. Sampling — and where intersymbol interference comes from',
      html: `
      <p>Two indices, two meanings (the lecturer stressed this): <b>k</b> is the transmitter's <i>symbol</i> index — when a bit was sent. <b>i</b> is the receiver's <i>sampling</i> index — when we look. Transmitter and receiver are coherent (they agree on T<sub>b</sub>), so we sample at t = iT<sub>b</sub>:</p>
      ${mb('y(iT<sub>b</sub>) = Σ<sub>k</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)')}
      ${where([['y(iT<sub>b</sub>)', 'the i-th sample of the receive-filter output (t = iT<sub>b</sub>)'], ['a<sub>k</sub>', 'symbol k'], ['p((i − k)T<sub>b</sub>)', 'symbol k’s pulse, seen (i − k) bit periods after its own peak'], ['T<sub>b</sub>', 'bit duration']])}
      <p>At sample i we <i>want</i> symbol a<sub>i</sub> — that is the term k = i. Pull it out of the sum:</p>
      ${mb('y(iT<sub>b</sub>) = a<sub>i</sub> p(0) + Σ<sub>k≠i</sub> a<sub>k</sub> p((i − k)T<sub>b</sub>)')}
      ${where([['y(iT<sub>b</sub>)', 'the i-th sample'], ['a<sub>i</sub>p(0)', 'the desired symbol, weighted by the pulse at its own peak'], ['a<sub>k</sub>p((i − k)T<sub>b</sub>), k ≠ i', 'pieces of the other symbols’ pulses that land on our sampling instant'], ['p(0)', 'pulse peak; p(0) = √E, with E = ∫|p(t)|²dt the pulse energy (√E = 1 for a normalised pulse)']])}
      <p>The second term is <b>intersymbol interference (ISI)</b>: the combined effect of all the other symbols, <i>before and after</i> the one we want. It exists because the pulses are continuous in time — after filtering, each one spills into its neighbours' bit periods, so when we sample "our" symbol we also pick up the tails of the others.</p>
      <p>With no ISI the sample would be just y(iT<sub>b</sub>) = a<sub>i</sub>p(0) = √E·a<sub>i</sub>, for every i.</p>
      ${callout('Why ISI is dangerous', 'ISI pushes the sample towards — or across — the decision threshold, so bits can be wrong even with no noise at all. It is not random: it depends on the neighbouring data and the pulse shape, which is why it can be designed away.')}
      ${use(['T1-02', 'T1-03', 'T1-04', 'T1-05'])}`
    },
    {
      h: '6. The pulse-shaping problem',
      html: `
      <p>We usually cannot change the channel H(f). What we <i>can</i> design is the transmit filter G(f) and the receive filter Q(f). The <b>pulse-shaping problem</b>: given H(f), choose G(f) and Q(f) so that</p>
      <ol><li>the <b>ISI is zero</b>, and</li><li>the <b>transmission bandwidth is conserved</b> (no more bandwidth than necessary).</li></ol>
      <p>The first answer is the <b>Nyquist channel</b> — a very ideal one, as we will see, but it is where the practical design starts.</p>`
    },
    {
      h: '7. The zero-ISI condition and the Nyquist criterion',
      html: `
      <p>Look again at the sampled signal. The ISI sum disappears if the overall pulse is <b>non-zero at its own sampling instant and exactly zero at every other one</b>:</p>
      ${mb('p((i − k)T<sub>b</sub>) = √E if i = k; &nbsp; 0 if i ≠ k')}
      ${where([['p(·)', 'overall pulse'], ['i, k', 'sampling index, symbol index'], ['T<sub>b</sub>', 'bit duration = sampling interval'], ['E', 'pulse energy']])}
      <p>Between sampling instants the pulse may do anything — only its values at multiples of T<sub>b</sub> matter. Now translate this condition to the frequency domain, where it is easier to design. The lecture does it in two ways and shows they must agree.</p>
      <h4>Approach 1 — what sampling does to a spectrum</h4>
      <p>Sampling p(t) every T<sub>b</sub> is the same as multiplying it by an <b>impulse train</b> (one impulse every T<sub>b</sub>). Multiplication in time is convolution in frequency, and the impulse train's spectrum is another impulse train spaced R<sub>b</sub> = 1/T<sub>b</sub> apart. Convolving P(f) with impulses just copies it to each impulse, so the sampled pulse's spectrum is <b>P(f) repeated every R<sub>b</sub></b>, scaled by 1/T<sub>b</sub> (the Poisson sum formula).</p>
      <h4>Approach 2 — what the zero-ISI samples look like</h4>
      <p>If the zero-ISI condition holds, the sampled pulse is just <b>one impulse</b> of height √E at t = 0 and nothing else. The Fourier transform of a single impulse is <b>flat</b> — the same value at every frequency.</p>
      <h4>Put them together</h4>
      <p>Both describe the same sampled pulse, so the sum of the shifted copies must be flat:</p>
      ${mb(frac('1', 'T<sub>b</sub>') + ' Σ<sub>n=−∞</sub><sup>∞</sup> P(f − n/T<sub>b</sub>) = √E &nbsp; (= 1 for a normalised pulse)')}
      ${where([['P(f)', 'spectrum of the overall pulse'], ['n', 'which copy: P(f − n/T<sub>b</sub>) is P shifted by n·R<sub>b</sub>'], ['1/T<sub>b</sub> = R<sub>b</sub>', 'bit rate = spacing between the copies (Hz)'], ['f', 'frequency (Hz)']])}
      ${callout('The Nyquist criterion, in words', 'Slide copies of the pulse spectrum P(f) along the frequency axis by every multiple of the bit rate and add them up. If the total is <b>flat</b> — no gaps, no bumps — the pulse gives <b>zero ISI</b> when sampled every T<sub>b</sub>.')}`
    },
    {
      h: '8. The ideal Nyquist channel: brick wall in frequency, sinc in time',
      html: `
      <p>The simplest spectrum whose copies add up flat is a <b>rectangle</b> — a "brick wall": flat between −W and +W, zero outside.</p>
      ${mb('P<sub>opt</sub>(f) = √E/(2W) for −W &lt; f &lt; W, 0 elsewhere &nbsp;⇔&nbsp; p<sub>opt</sub>(t) = √E sinc(2Wt) = √E ' + frac('sin(2πWt)', '2πWt'))}
      ${where([['P<sub>opt</sub>(f)', 'brick-wall (ideal) spectrum'], ['p<sub>opt</sub>(t)', 'its time-domain pulse (inverse Fourier transform)'], ['W', 'width of the brick wall = Nyquist bandwidth (Hz)'], ['sinc(x)', 'sin(πx)/(πx), the normalised sinc'], ['E', 'pulse energy']])}
      ${callout('Correction from the lecture', 'An early version of the slide had the sinc written wrongly; the corrected form is √E·sin(2πWt)/(2πWt). The normalised sinc divides by π inside: sinc(x) = sin(πx)/(πx).')}
      <h4>How wide must the brick wall be?</h4>
      <p>Draw the copy at 0 (from −W to W) and the copy shifted by R<sub>b</sub> (from R<sub>b</sub> − W to R<sub>b</sub> + W). For the sum to be flat they must touch <b>edge to edge</b>: no gap (a dip in the sum) and no overlap (a bump). The right edge of the first copy, W, must equal the left edge of the next, R<sub>b</sub> − W:</p>
      ${mb('W = R<sub>b</sub> − W &nbsp;⇒&nbsp; W = ' + frac('R<sub>b</sub>', '2') + ' = ' + frac('1', '2T<sub>b</sub>'))}
      ${where([['W', 'Nyquist bandwidth: the minimum bandwidth for zero ISI (Hz)'], ['R<sub>b</sub>', 'bit rate; R<sub>b</sub> = 2W is the Nyquist rate — the maximum theoretical rate in bandwidth W'], ['T<sub>b</sub>', 'bit duration']])}
      <h4>Why the sinc gives no ISI even though the pulses overlap</h4>
      <p>The sinc has a tall peak at t = 0 and then oscillates with shrinking ripples on both sides — but it passes through <b>zero at every multiple of 1/(2W) = T<sub>b</sub></b>. In the lecture's plot of 1 0 1 1 0 1 0 sent with sinc pulses, every pulse clearly spills into the neighbouring bit periods, yet at each sampling instant only one pulse is at its peak while all the others are exactly at a zero crossing. We read only the amplitude we want.</p>
      ${use(['T2-01'])}`
    },
    {
      h: '9. Why the ideal Nyquist channel cannot be built',
      html: `
      <p>The Nyquist channel solves the pulse-shaping problem with the least possible bandwidth, but it has two serious problems:</p>
      <ol>
        <li><b>The spectrum is physically unrealizable.</b> It must be perfectly flat right up to ±W and then drop to zero instantly. No real filter has such an abrupt roll-off.</li>
        <li><b>The sinc decays too slowly.</b> Its tails shrink only like 1/|t|. If the sampling clock is even slightly off, the tails are no longer at their zero crossings, and with so many slowly decaying tails the leftover ISI adds up to a lot. The system is very sensitive to timing error.</li>
      </ol>
      ${callout('In plain words', 'Problem 1 is in frequency (the edge is too sharp to build). Problem 2 is in time (the tails are too long). Both come from the same discontinuity at ±W — so the fix is to smooth that edge.')}`
    },
    {
      h: '10. The raised-cosine spectrum',
      html: `
      <p>Instead of dropping abruptly at W, let the spectrum <b>roll off gradually</b>. It now has two parts: a <b>flat portion</b> for 0 ≤ |f| &lt; f<sub>1</sub>, and a <b>roll-off portion</b> for f<sub>1</sub> ≤ |f| &lt; 2W − f<sub>1</sub> shaped like "1 + cosine" — that is why it is called <b>raised cosine</b> (a cosine raised by adding 1).</p>
      ${mb('P(f) = √E/(2W), &nbsp; 0 ≤ |f| &lt; f<sub>1</sub><br>P(f) = ' + frac('√E', '4W') + '[1 + cos(' + frac('π(|f| − f<sub>1</sub>)', '2(W − f<sub>1</sub>)') + ')], &nbsp; f<sub>1</sub> ≤ |f| &lt; 2W − f<sub>1</sub><br>P(f) = 0, &nbsp; |f| ≥ 2W − f<sub>1</sub>')}
      ${where([['P(f)', 'raised-cosine spectrum'], ['f<sub>1</sub>', 'boundary between the flat part and the roll-off (adjustable)'], ['W', 'Nyquist bandwidth = R<sub>b</sub>/2'], ['2W − f<sub>1</sub>', 'upper limit: the spectrum is zero beyond it (it never reaches 2W unless f<sub>1</sub> = 0)'], ['E', 'pulse energy']])}
      <p>The roll-off is <b>symmetric about W</b> (it passes through half height there), so when the copies are added, the dip of one copy is exactly filled by the tail of the next — the sum stays flat and the Nyquist criterion still holds.</p>
      <h4>The roll-off factor α</h4>
      <p>f<sub>1</sub> is the knob, but it is usually described by the <b>roll-off factor</b>:</p>
      ${mb('α = 1 − ' + frac('f<sub>1</sub>', 'W') + ' &nbsp; ⇔ &nbsp; f<sub>1</sub> = W(1 − α)')}
      ${where([['α', 'roll-off factor, 0 ≤ α ≤ 1'], ['f<sub>1</sub>', 'end of the flat part'], ['W', 'Nyquist bandwidth']])}
      <ul>
        <li><b>α = 0</b> ⇒ f<sub>1</sub> = W: no roll-off at all — back to the ideal brick wall (Nyquist channel).</li>
        <li><b>α = 1</b> ⇒ f<sub>1</sub> = 0: no flat part, the whole thing is roll-off — the <b>full raised cosine</b>.</li>
        <li><b>0 &lt; α &lt; 1</b>: practical systems. Negative α adds nothing new (only |f| matters, the spectrum is mirrored), and α &gt; 1 would push past the limit.</li>
      </ul>
      ${use(['T2-02', 'T2-05'])}`
    },
    {
      h: '11. The raised-cosine pulse in time: faster-decaying tails',
      html: `
      <p>The inverse Fourier transform of the raised-cosine spectrum (not derived in class) is:</p>
      ${mb('p(t) = √E sinc(2Wt) · ' + frac('cos(2παWt)', '1 − 16α²W²t²'))}
      ${where([['sinc(2Wt)', 'the Nyquist-channel part — it keeps the zero crossings at every multiple of T<sub>b</sub>, so ISI is still zero'], ['cos(2παWt)/(1 − 16α²W²t²)', 'the extra factor that reduces the tails as |t| grows'], ['α', 'roll-off factor'], ['W', 'Nyquist bandwidth'], ['t', 'time']])}
      <h4>Worked in class: the α = 1 case</h4>
      <p>Put α = 1 and write sinc(2Wt) = sin(2πWt)/(2πWt). The numerator now has sin(2πWt)·cos(2πWt). Using the identity sin θ cos θ = ½ sin 2θ, this becomes ½ sin(4πWt), and the expression turns into another sinc with double the argument:</p>
      ${mb('α = 1: &nbsp; p(t) = √E ' + frac('sinc(4Wt)', '1 − 16W²t²'))}
      ${where([['sinc(4Wt)', 'a sinc twice as "fast" — from sin θ cos θ = ½ sin 2θ'], ['1 − 16W²t²', 'grows like t², so the tails die very quickly']])}
      <h4>Reading the plots: the trade-off</h4>
      <ul>
        <li><b>α = 0</b>: brick wall; steepest roll-off; slowest decay in time (big ripples far from the centre).</li>
        <li><b>α = 1</b>: no flat part; the bandwidth <b>doubles</b>; but the tails decay fastest.</li>
        <li><b>α = ½</b>: still a flat part, bandwidth up by 50 %; decay faster than α = 0, slower than α = 1.</li>
      </ul>
      ${callout('In plain words', 'α buys you a pulse that is easy to build and forgiving of timing error, and you pay for it in bandwidth. You choose α by how much extra bandwidth you can afford — e.g. 30 % extra ⇒ α = 0.3.')}
      ${use(['T2-06', 'T2-08'])}`
    },
    {
      h: '12. How much bandwidth does the raised cosine need?',
      html: `
      <p>The spectrum ends at 2W − f<sub>1</sub>, so that is the transmission bandwidth. Substitute f<sub>1</sub> = W(1 − α), as done in class:</p>
      ${mb('B<sub>T</sub> = 2W − f<sub>1</sub> = 2W − W(1 − α) = W + αW = ' + frac('R<sub>b</sub>', '2') + '(1 + α)')}
      ${where([['B<sub>T</sub>', 'transmission bandwidth (Hz)'], ['W', 'Nyquist bandwidth = R<sub>b</sub>/2 — the minimum'], ['αW', 'excess bandwidth: the extra paid for a realizable, robust pulse'], ['α', 'roll-off factor']])}
      <p>This is why α is also called the <b>excess-bandwidth factor</b>: α = 0 means no excess (but unrealizable); α = 1 doubles the bandwidth. The excess bandwidth is the price of sending at R<sub>b</sub> = 1/T<sub>b</sub> with zero ISI <i>in a way that can actually be built</i>.</p>
      ${use(['T2-03', 'T2-04', 'T2-07'])}`
    },
    {
      h: '13. Channel noise and the Gaussian random variable',
      html: `
      <p>So far we ignored noise. Channel noise is the other source of bit errors in baseband systems, and it is modelled as <b>additive white Gaussian noise (AWGN)</b>: it simply adds to the signal.</p>
      ${mb('x(t) = s(t) + n(t)')}
      ${where([['x(t)', 'received signal'], ['s(t)', 'transmitted signal'], ['n(t)', 'channel noise']])}
      <p><b>White</b> = present at all frequencies (like white light). <b>Gaussian</b> = its amplitude follows a Gaussian (normal) distribution with zero mean. To justify these words we first refresh random variables.</p>
      <h4>Gaussian random variable</h4>
      <p>A random variable whose value can be anything in a range (infinitely many values) is <b>continuous</b> and is described by a <b>probability density function (PDF)</b>. (A die is <i>discrete</i> — six values — and uses a probability mass function instead.) The Gaussian PDF is the bell curve:</p>
      ${mb('f<sub>X</sub>(x) = ' + frac('1', '√(2πσ²)') + ' exp(−' + frac('(x − μ)²', '2σ²') + ')')}
      ${where([['X', 'the random variable (capital letter)'], ['x', 'one particular value of it (small letter)'], ['f<sub>X</sub>(x)', 'its PDF'], ['μ', 'mean — the centre of the bell'], ['σ²', 'variance; σ is the standard deviation (if you are given σ, square it to get the variance)'], ['exp(·)', 'e (Euler’s number) raised to the bracket']])}
      <p>It extends from −∞ to +∞ and is <b>symmetric about the mean</b>. Notation: X ~ N(μ, σ²) means "X is Gaussian with mean μ and variance σ²".</p>
      <h4>Properties — and why they make life easy</h4>
      <ol>
        <li>Completely described by its mean and variance.</li>
        <li><b>Add a constant</b> c: still Gaussian; the bell just <b>shifts</b> — mean μ + c, same variance.</li>
        <li><b>Multiply by a constant</b> c: still Gaussian; mean cμ, variance c²σ².</li>
        <li><b>Add two independent Gaussians</b>: still Gaussian; means add and <b>variances add</b>.</li>
        <li>A weighted sum of N independent Gaussians is Gaussian.</li>
        <li>If two Gaussians have <b>zero covariance</b> (uncorrelated), they are also <b>independent</b> — their joint probability is just the product of the individual ones. This is special to Gaussians.</li>
      </ol>
      ${callout('Why the lecturer likes Gaussians', 'Whatever you do to a Gaussian — shift it, scale it, add more Gaussians — it stays Gaussian. So the received signal plus noise stays Gaussian and the computations stay simple.')}
      ${use(['T3-02'])}`
    },
    {
      h: '14. Standard Gaussian, CDF, PDF and the Q-function',
      html: `
      <p>The <b>standard Gaussian</b> is the special case with mean 0 and variance 1, N(0, 1). Its CDF — the <b>cumulative distribution function</b> — is the probability of being <i>at most</i> a value: the area under the PDF from −∞ up to that value. As the value grows, more area is collected, so the CDF rises from 0 to 1 (an S-shaped curve).</p>
      <h4>Properties</h4>
      <ul>
        <li><b>CDF:</b> always between 0 and 1; F(∞) = 1 (sure event); F(−∞) = 0 (impossible event); Pr{a ≤ X ≤ b} = F(b) − F(a); and the <b>complement</b> Pr{X &gt; a} = 1 − F(a), because "≤ a" and "&gt; a" are mutually exclusive and together have probability 1.</li>
        <li><b>PDF:</b> never negative; total area 1; integrating it from −∞ to a gives the CDF (the PDF is the derivative of the CDF); integrating from a to b gives Pr{a ≤ X ≤ b}.</li>
      </ul>
      ${where([['F(x)', 'CDF, Pr{X ≤ x}'], ['Pr{·}', 'probability of the event in braces'], ['a, b', 'interval limits']])}
      <h4>The Q-function</h4>
      <p>The Gaussian CDF has no closed-form answer, so tables are used. The <b>Q-function</b> is the <b>tail</b> probability of the standard Gaussian — the chance it <i>exceeds</i> a value. It is the complement of the CDF:</p>
      ${mb('Q(x) = Pr{Z &gt; x} = 1 − Φ(x) = ' + frac('1', '√(2π)') + '∫<sub>x</sub><sup>∞</sup> exp(−s²/2) ds')}
      ${where([['Q(x)', 'probability that a standard Gaussian exceeds x'], ['Z', 'standard Gaussian, N(0, 1)'], ['Φ(x)', 'CDF of the standard Gaussian'], ['s', 'dummy integration variable']])}
      <p>Notice it is the same bell-curve integral as the CDF, just integrated from x to ∞ instead of from −∞ to x. In Module 1.3 every error probability ended up as a Q-function — that is where it comes from.</p>
      ${callout('Exam note from the lecturer', 'A <b>Q-table will be given</b> in the exam — practise using it. Before looking up a value, make sure it is <b>normalised</b> (mean 0, variance 1): Pr{X &gt; a} = Q((a − μ)/σ).')}
      ${use(['T3-01', 'T3-04'])}`
    },
    {
      h: '15. The central limit theorem',
      html: `
      <p>Take many random variables X<sub>1</sub>, X<sub>2</sub>, …, X<sub>n</sub> that are <b>statistically independent</b> (no correlation between them) and have the <b>same PDF</b> — Gaussian or not. Such variables are called <b>i.i.d.</b>: independent and identically distributed. Add them all into a new variable Y.</p>
      <p>The theorem says that if you <b>normalise</b> Y (subtract its mean, divide by its standard deviation), the result approaches a <b>standard Gaussian</b> as n grows — no matter what the individual distributions were:</p>
      ${mb('Z = ' + frac('Y − E[Y]', 'σ<sub>Y</sub>') + ' → N(0, 1) as n → ∞, &nbsp; Y = Σ<sub>i=1</sub><sup>n</sup> X<sub>i</sub>')}
      ${where([['X<sub>i</sub>', 'the i.i.d. random variables being added'], ['n', 'how many are added'], ['Y', 'their sum'], ['E[Y]', 'mean of Y'], ['σ<sub>Y</sub>', 'standard deviation of Y'], ['Z', 'normalised sum']])}
      ${callout('Why it matters', 'This is why Gaussian random variables are everywhere: add enough of almost anything and you get a Gaussian. And once it is Gaussian we can use all its properties and the Q-function.')}
      ${use(['T3-06'])}`
    },
    {
      h: '16. Random processes and stationarity',
      html: `
      <p>White noise is technically not a random <i>variable</i> but a <b>Gaussian random process</b> — Gaussian "by virtue of the central limit theorem". A <b>random process</b> is an ensemble (collection) of random variables evolving over time.</p>
      ${callout('Lecture analogy: N audio generators', 'Imagine N audio generators, each producing different values. Hook one of them to an oscilloscope and watch it over time: that single waveform is a <b>realization</b>, or <b>sample function</b>. Now read <i>all</i> the generators at the same instant t<sub>1</sub>: the set of values you get is a <b>random variable</b>. The whole collection of generators, changing over time, is the <b>random process</b>.')}
      ${where([['X(t)', 'the random process'], ['x<sub>i</sub>(t)', 'one realization (one generator)'], ['X(t<sub>1</sub>)', 'the random variable at time t<sub>1</sub>']])}
      <h4>Stationary vs non-stationary</h4>
      <p>Cut the process into time intervals and compute its statistics (mean, standard deviation, …) in each. If they are the <b>same in every interval</b>, the process is <b>stationary</b>. <b>Noise</b> is the lecture's example of stationary. <b>Weather temperature</b> is the example of non-stationary: it fluctuates daily, but over the year its statistics drift up or down, so one interval does not look like another.</p>
      <h4>Orders of stationarity</h4>
      <ul>
        <li><b>First order:</b> the distribution observed at t<sub>1</sub> is the same as at any other time. Consequence: the <b>mean and variance are constant</b> over time (single-point statistics).</li>
        <li><b>Second order:</b> take two samples at t<sub>1</sub> and t<sub>2</sub>, then shift both by the same Δt. If their <b>joint</b> distribution does not change, the process is second-order stationary. Consequence: <b>covariance and correlation</b> (two-point statistics) depend only on the <b>lag</b> τ = t<sub>2</sub> − t<sub>1</sub>, not on where you start.</li>
        <li><b>Strict-sense stationary (SSS):</b> the same holds for every order k and every shift — mathematically complex to show.</li>
        <li><b>Wide-sense stationary (WSS):</b> only first and second order. This is <b>sufficient</b> for communications computations.</li>
      </ul>
      ${where([['t<sub>1</sub>, t<sub>2</sub>', 'two observation times'], ['Δt', 'a common time shift'], ['τ', 'lag, t<sub>2</sub> − t<sub>1</sub>'], ['k', 'order (number of time points)']])}
      <h4>Why noise is a WSS Gaussian random process</h4>
      <p>Noise comes from the random motion of electrons in the circuit. Each electron's motion is like a random variable; the huge number of electrons makes an ensemble — a random process. Adding all their contributions gives, by the CLT, a Gaussian. So the noise is <b>WSS and Gaussian</b>.</p>
      <p>A random process can be described in the <b>amplitude domain</b> (PDF, CDF) or in the <b>time domain</b> (autocorrelation and power spectral density) — next.</p>
      ${use(['T3-09', 'T3-08'])}`
    },
    {
      h: '17. Autocorrelation and power spectral density',
      html: `
      <p><b>Autocorrelation</b> is the correlation of a signal <i>with itself</i> ("auto", as in autobiography — the author writing about themselves). It measures how alike two observations of the process are when taken τ apart: the average of the product of the two samples.</p>
      ${mb('R<sub>X</sub>(τ) = E[X(t)X(t − τ)]')}
      ${where([['R<sub>X</sub>(τ)', 'autocorrelation of the process X'], ['τ', 'delay (lag) between the two samples'], ['E[·]', 'expectation: the average']])}
      ${callout('Lecture plots: slow vs fast processes', 'A <b>slowly fluctuating</b> signal still looks like itself after a small delay, so R(τ) is <b>wide</b> — neighbouring samples stay correlated. A <b>rapidly fluctuating</b> signal like noise stops resembling itself almost immediately, so R(τ) <b>drops quickly</b>. Values near 0 mean uncorrelated; near 1, highly correlated; negative, correlated in the opposite direction.')}
      <h4>Properties for a WSS process</h4>
      <ol>
        <li><b>R<sub>X</sub>(0) = E[X²] = average power.</b> Squaring a voltage gives power (normalised 1 Ω), and averaging gives the average power — a handy way to get power.</li>
        <li><b>Even symmetry:</b> R<sub>X</sub>(−τ) = R<sub>X</sub>(τ) — the left side mirrors the right.</li>
        <li><b>Maximum at zero lag:</b> a signal matches itself best with no shift, so |R<sub>X</sub>(τ)| ≤ R<sub>X</sub>(0).</li>
      </ol>
      <h4>Power spectral density</h4>
      <p>The <b>PSD</b> (W/Hz) tells how the power is spread over frequency. For a <i>deterministic</i> signal you just take its Fourier transform. But our signals are <b>random</b> — the data is random and the noise is random — so instead we take the Fourier transform of the <b>autocorrelation</b> (the <b>Wiener–Khintchine theorem</b>):</p>
      ${mb('S<sub>X</sub>(f) = ∫<sub>−∞</sub><sup>∞</sup> R<sub>X</sub>(τ) e<sup>−j2πfτ</sup> dτ')}
      ${where([['S<sub>X</sub>(f)', 'power spectral density (W/Hz)'], ['R<sub>X</sub>(τ)', 'autocorrelation'], ['e<sup>−j2πfτ</sup>', 'the Fourier-transform kernel'], ['f', 'frequency']])}
      <h4>PSD properties</h4>
      <ul>
        <li>Area under the PSD = mean-square value = <b>power</b> (W/Hz × Hz = W).</li>
        <li>Always <b>non-negative</b>; <b>even</b> in f for a real process.</li>
        <li>Through a linear filter H(f): <b>S<sub>Y</sub>(f) = |H(f)|² S<sub>X</sub>(f)</b>. The filter <i>shapes</i> the spectrum; it is squared because the PSD comes from the autocorrelation, which already multiplies two samples.</li>
      </ul>
      ${use(['T3-05'])}`
    },
    {
      h: '18. White noise: autocorrelation, PSD and band-limited noise',
      html: `
      <p>Noise changes so quickly that samples at different times are <b>uncorrelated</b>. Its autocorrelation is therefore an impulse — non-zero only at zero lag:</p>
      ${mb('R<sub>W</sub>(τ) = ' + frac('N<sub>0</sub>', '2') + ' δ(τ) &nbsp; ⇔ &nbsp; S<sub>W</sub>(f) = ' + frac('N<sub>0</sub>', '2'))}
      ${where([['R<sub>W</sub>(τ)', 'autocorrelation of white noise w(t)'], ['δ(τ)', 'impulse at τ = 0'], ['S<sub>W</sub>(f)', 'noise PSD (W/Hz)'], ['N<sub>0</sub>/2', 'two-sided noise level — the noise power (variance) per Hz']])}
      <p>Applying the Fourier transform: N<sub>0</sub>/2 is a constant and comes out of the integral; the Fourier transform of δ(τ) is 1. So the PSD is a <b>flat N<sub>0</sub>/2 at every frequency</b> — noise is present at all frequencies and can never be completely avoided. That is the meaning of "white".</p>
      ${mb('N<sub>0</sub> = kT, &nbsp; k = 1.380649 × 10<sup>−23</sup> J/K, &nbsp; T(K) = T(°C) + 273.15')}
      ${where([['N<sub>0</sub>', 'thermal-noise density (W/Hz)'], ['k', 'Boltzmann’s constant'], ['T', 'temperature in kelvin']])}
      ${callout('From the lecture', 'k and 273.15 are built-in constants on the scientific calculator (the lecturer used constant 25 and constant 38 on theirs — check your own model). Always convert °C to kelvin first.')}
      <h4>Band-limited noise</h4>
      <p>Pass white noise through a filter and, by the PSD property, its spectrum becomes (N<sub>0</sub>/2)|H(f)|². It is still noise, but only inside the filter's band — <b>band-limited noise</b>. A brick-wall filter over ±W leaves a flat N<sub>0</sub>/2 only between −W and W; a full-raised-cosine filter would give a raised-cosine-shaped noise PSD.</p>
      ${callout('AWGN, finally justified', '<b>Additive</b>: it adds to the signal (and Gaussian + constant stays Gaussian). <b>White</b>: flat PSD, all frequencies present. <b>Gaussian</b>: zero-mean Gaussian amplitude, by the CLT.')}
      ${use(['T3-03', 'T3-07', 'T3-10'])}`
    },
    {
      h: '19. The optimal receiver: setting up the SNR',
      html: `
      <p>Now we design the receiver knowing all of that. Assumptions for this part: the channel is <b>wideband and LTI</b> — it does <i>not</i> reshape the signal, it only adds noise, so x(t) = s(t) + n(t). The receive filter is renamed from q(t) to <b>h(t)</b> (books switch notation). For simplicity one symbol is sent, s(t) = a<sub>0</sub>g(t), and the filter output is sampled at t = T.</p>
      <p>Passing through the filter is a convolution, and convolution distributes over the sum — <b>even the noise gets convolved</b> by the filter:</p>
      ${mb('y(t) = [s(t) + n(t)] ∗ h(t) = a<sub>0</sub>g(t) ∗ h(t) + n(t) ∗ h(t)')}
      ${where([['y(t)', 'receive-filter output'], ['s(t) = a<sub>0</sub>g(t)', 'the received signal (one symbol)'], ['n(t)', 'noise'], ['h(t)', 'receive filter'], ['∗', 'convolution — it distributes over the sum']])}
      ${mb('y(T) = a<sub>0</sub>∫g(T − τ)h(τ)dτ (signal) + ∫n(T − τ)h(τ)dτ (noise)')}
      ${where([['a<sub>0</sub>', 'the transmitted symbol (e.g. ±A, or ±3A for 4-level)'], ['g(t)', 'transmit pulse'], ['h(t)', 'receive filter'], ['n(t)', 'white Gaussian noise'], ['T', 'symbol duration = sampling instant'], ['τ', 'integration variable inside the convolution']])}
      <p>The receiver is <b>optimal</b> when the SNR at t = T is as high as possible: big signal component, small noise component.</p>
      <h4>Signal power</h4>
      <p>Square the signal term and average it. a<sub>0</sub> is <b>random</b> (it depends on the data), so its average square becomes the data power P<sub>d</sub>. The convolution of the two filters is <b>deterministic</b> — averaging it changes nothing:</p>
      ${mb('P<sub>S</sub> = E[a<sub>0</sub>²](∫g(T − τ)h(τ)dτ)² = P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²')}
      ${where([['P<sub>S</sub>', 'signal power at the sampling instant'], ['P<sub>d</sub>', 'power of the data symbols, E[a<sub>0</sub>²] (1 if normalised)']])}
      <h4>Noise power</h4>
      <p>The noise is WSS, so its power is the area under its PSD. After the filter the PSD is (N<sub>0</sub>/2)|H(f)|²; N<sub>0</sub>/2 is constant and comes out. By <b>Parseval's relation</b> (energy is the same whether computed in time or in frequency) the remaining integral can be done in time:</p>
      ${mb('P<sub>N</sub> = ∫' + frac('N<sub>0</sub>', '2') + '|H(f)|²df = ' + frac('N<sub>0</sub>', '2') + '∫|h(τ)|²dτ')}
      ${where([['P<sub>N</sub>', 'noise power at the filter output'], ['H(f)', 'receive filter frequency response'], ['N<sub>0</sub>/2', 'noise PSD']])}
      ${mb('SNR = ' + frac('P<sub>d</sub>(∫g(T − τ)h(τ)dτ)²', '(N<sub>0</sub>/2)∫|h(τ)|²dτ'))}
      ${where([['SNR', 'signal power ÷ noise power at t = T']])}`
    },
    {
      h: '20. Cauchy–Schwarz and the matched filter',
      html: `
      <p>The SNR looks complicated, but one inequality simplifies it. <b>Cauchy–Schwarz</b> (not proved in class): the square of the integral of a product is at most the product of the two separate integrals of squares — like |A·B|² ≤ |A|²|B|² for vectors. Equality holds only when the two functions are <b>proportional</b>.</p>
      ${mb('(∫u v)² ≤ ∫u² · ∫v², &nbsp; equality when u = k·v')}
      ${where([['u, v', 'any two functions — here u = g(T − τ) and v = h(τ)'], ['k', 'any constant']])}
      <p>Apply it to the numerator. The ∫|h|² term then appears on top and bottom and <b>cancels</b>, leaving an upper limit that no longer depends on h:</p>
      ${mb('SNR ≤ ' + frac('2P<sub>d</sub>', 'N<sub>0</sub>') + '∫|g(T − τ)|²dτ = ' + frac('2E', 'N<sub>0</sub>') + 'P<sub>d</sub>')}
      ${where([['E', 'pulse energy ∫|g|² — folding or shifting a pulse does not change its energy'], ['P<sub>d</sub>', 'data power'], ['N<sub>0</sub>', 'noise density']])}
      <p>The SNR reaches this maximum exactly when equality holds, i.e. when the receive filter is <b>proportional to the transmit pulse</b>, folded and shifted:</p>
      ${mb('h<sub>opt</sub>(t) = k g(T − t)')}
      ${where([['h<sub>opt</sub>', 'optimum receive filter'], ['k', 'any amplitude — only the shape matters'], ['g(T − t)', 'g folded (g(−t)) and then shifted right by T']])}
      <p>The receive filter is "matched" to the transmit pulse — the <b>matched filter</b>.</p>
      ${callout('Fold, then shift (as drawn in class)', 'Start with g(t) on 0…T. Fold it: g(−t) now sits on −T…0. Shift it right by T: g(T − t) is back on 0…T. For a rectangle the result looks identical to g; for an unsymmetric pulse it is the mirror image.')}
      <h4>Implications</h4>
      <ol>
        <li>The maximum SNR does <b>not</b> depend on the pulse's waveform — only on its <b>energy</b> (and the data power).</li>
        <li>The <b>design</b> of the matched filter does depend on the pulse shape (it copies it).</li>
        <li>All signals with the same energy are <b>equally good</b> at fighting additive white noise.</li>
      </ol>
      ${use(['T4-03', 'T4-04', 'T4-05'])}`
    },
    {
      h: '21. Worked in class: matched filter for a rectangular pulse',
      html: `
      <p><b>Example 1.</b> g(t) = A for 0 ≤ t ≤ T. (a) Sketch the matched filter. (b) Plot its output. (c) Find the peak.</p>
      <p><b>(a)</b> Fold, then shift by T: the rectangle comes back unchanged, so h<sub>opt</sub>(t) = A on 0…T.</p>
      <p><b>(b)</b> The output is the convolution y(t) = ∫g(τ)h(t − τ)dτ. The lecturer did it by sliding the folded signal across the filter and splitting into cases by how much they overlap (the product of the heights is A·A = A²):</p>
      ${tbl(['case', 'what is happening', 'overlap', 'y(t)'], [
        ['t &lt; 0', 'signal has not entered the filter yet', 'none', '0'],
        ['0 ≤ t ≤ T', 'signal entering', '0 … t', '∫<sub>0</sub><sup>t</sup>A²dτ = A²t (rising line)'],
        ['T ≤ t ≤ 2T', 'signal leaving', 't − T … T', '∫<sub>t−T</sub><sup>T</sup>A²dτ = A²(2T − t) (falling line)'],
        ['t &gt; 2T', 'signal has left', 'none', '0']
      ], 3)}
      ${where([['τ', 'integration variable — use a different letter from the limit t'], ['t', 'how far the signal has slid'], ['A²', 'height of the product of the two rectangles']])}
      <p><b>(c)</b> The output is a triangle that peaks at <b>t = T</b>, where the two rectangles overlap completely: <b>y(T) = A²T</b> — exactly the pulse energy. That is why the matched filter is sampled at t = T.</p>
      ${callout('Correction made in class', 'For the falling case the lecturer first wrote the integration limits wrongly and corrected them on the board: the lower limit is t − T and the upper limit is T.')}
      <p><b>Example 2</b> (split pulse +A/2 then −A/2) was assigned as <b>homework</b>, to be done by convolution the same way; a MATLAB demonstration of convolution comes later.</p>
      ${use(['T4-01', 'T4-02'])}`
    },
    {
      h: '22. The eye pattern',
      html: `
      <p>Take the receive-filter output (before the threshold), cut it into symbol intervals, and <b>superimpose</b> them all — like an oscilloscope triggered once per symbol. Because each interval is distorted a little differently by the channel and noise, the traces form the shape of an <b>eye</b>. The eye shows at a glance how badly the signal is distorted.</p>
      <h4>Reading the eye</h4>
      <ul>
        <li><b>Best sampling time:</b> where the eye is most open, usually the <b>middle</b> — that is where the margin is largest.</li>
        <li><b>Margin over noise:</b> the vertical opening at that time. Distortion at the sampling time shrinks it.</li>
        <li><b>Time interval over which the wave can be sampled:</b> the horizontal opening.</li>
        <li><b>Slope of the sides:</b> sensitivity to timing error — it tells you whether you are sampling early or late.</li>
        <li><b>Distortion of the zero crossings:</b> ideally all traces cross zero at one point; channel distortion or noise spreads them.</li>
      </ul>
      <h4>M-level eyes</h4>
      <p>For M-ary PAM with levels +3, +1, −1, −3 every transition between levels is overlaid, giving <b>three eyes</b> stacked vertically. Sample in the middle of the eye and compare with the decision boundaries <b>+2, 0, −2</b>, half-way between levels.</p>
      ${where([['M', 'number of amplitude levels; there are M − 1 eyes']])}
      <h4>Bandwidth limitation, noise and ISI</h4>
      <p>Without a bandwidth limit (filter much wider than the signal) the eyes are clean and wide open. With a bandwidth limit they are less open, so detection errors become more likely — and <i>every</i> real system is band-limited. So the receive filter's bandwidth matters:</p>
      <ul>
        <li><b>Too low</b> ⇒ <b>ISI</b>: some traces leave the usual paths, the eye closes and becomes timing-sensitive — you cannot sample near the zero crossings.</li>
        <li><b>Too high</b> ⇒ more <b>noise</b> passes: the traces get fuzzy and the opening shrinks.</li>
      </ul>
      ${use(['T4-06', 'T4-08'])}`
    }
  ]
}
];
