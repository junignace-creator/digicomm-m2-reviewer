/* Design problems: spec → design / sizing → verify → trade-offs.
   PROBLEMS.push({ id: 'DS-01', lec: 'T1', kind: 'design', title: '…', q: `…`, a: steps([…]) }); */

PROBLEMS.push({
  id: 'DS-01', lec: 'T2', kind: 'design',
  title: 'Pick a bit rate and roll-off for a 4 kHz baseband channel',
  q: `<p><b>Spec:</b> a baseband cable passes 0–4 kHz. The pulse-shaping filter must be practical, which here means α ≥ 0.25. Zero ISI is required.</p>
  <p>Design the highest possible bit rate. Give R<sub>b</sub>, T<sub>b</sub>, W, f<sub>1</sub> and the pulse zero crossings, then compare with α = 0 and α = 1.</p>`,
  a: steps([
    '<b>Spec → constraint.</b> All of P(f) must fit in the channel: B<sub>T</sub> = W(1 + α) ≤ 4000 Hz. A larger R<sub>b</sub> needs a larger W, so use the smallest allowed α = 0.25.',
    '<b>Design.</b> W = 4000/1.25 = 3200 Hz ⇒ R<sub>b</sub> = 2W = <b>6400 bps</b>, T<sub>b</sub> = 156.25 µs. f<sub>1</sub> = W(1 − α) = <b>2400 Hz</b>: flat up to 2.4 kHz, cosine roll-off from 2.4 to 4 kHz.',
    '<b>Verify.</b> B<sub>T</sub> = 2W − f<sub>1</sub> = 6400 − 2400 = 4000 Hz ✓. p(t) = sinc(6400t)·cos(2π·800t)/(1 − 16(0.0625)(3200)²t²) is zero at t = nT<sub>b</sub> = n·156.25 µs ⇒ zero ISI ✓.',
    tbl(['α', 'R<sub>b</sub> in 4 kHz', 'comment'], [
      ['0', '8000 bps', 'unrealizable brick wall, slow 1/|t| tails'],
      ['0.25', '6400 bps', 'chosen: practical, 25 % excess bandwidth'],
      ['1', '4000 bps', 'easiest filter, fastest decay, half the rate']
    ]),
    '<b>Trade-off.</b> α buys realizability and timing tolerance at the cost of bandwidth (or, for a fixed channel, bit rate).'
  ])
});

PROBLEMS.push({
  id: 'DS-02', lec: 'T4', kind: 'design',
  title: 'Received power needed for P<sub>e</sub> = 10<sup>−5</sup> with a matched filter',
  q: `<p><b>Spec:</b> polar binary signalling at R<sub>b</sub> = 1 Mbps, matched-filter receiver, white thermal noise at T<sub>e</sub> = 290 K, target bit-error probability 10<sup>−5</sup>, raised-cosine pulses with α = 0.35.</p>
  <p>Find the required E/N<sub>0</sub>, the minimum received power (W and dBm), and the transmission bandwidth.</p>`,
  a: steps([
    '<b>Error model.</b> With h(t) = g(T − t) the sample is y(T) = ±E + noise, with noise variance (N<sub>0</sub>/2)E (noise power formula with ∫|h|² = E). So P<sub>e</sub> = Q(E/√(N<sub>0</sub>E/2)) = Q(√(2E/N<sub>0</sub>)) = Q(√SNR<sub>max</sub>).',
    '<b>Invert Q.</b> Q(x) = 10<sup>−5</sup> ⇒ x ≈ 4.265 (Q-table). So 2E/N<sub>0</sub> = 4.265² = 18.19 ⇒ <b>E/N<sub>0</sub> = 9.09 = 9.59 dB</b>.',
    '<b>Noise.</b> N<sub>0</sub> = kT<sub>e</sub> = 4.004×10<sup>−21</sup> W/Hz ⇒ E = 9.09 × 4.004×10<sup>−21</sup> = 3.64×10<sup>−20</sup> J per bit.',
    '<b>Power.</b> P<sub>r</sub> = E·R<sub>b</sub> = 3.64×10<sup>−20</sup> × 10<sup>6</sup> = <b>3.64×10<sup>−14</sup> W = −104.4 dBm</b>.',
    '<b>Bandwidth.</b> B<sub>T</sub> = (R<sub>b</sub>/2)(1 + α) = 0.5 MHz × 1.35 = <b>675 kHz</b>.',
    '<b>Trade-offs.</b> Every 10× in R<sub>b</sub> costs +10 dB in power for the same P<sub>e</sub>; a real receiver adds a noise figure and implementation loss on top of this ideal number.'
  ])
});
