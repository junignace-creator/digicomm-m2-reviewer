/* Recipes, formulas and cheat-list entries for M2-2 (T5, T6). Appended to the arrays in data/reference.js. */
RECIPES.push(
  {
    topic: 'T5 · Equalization', items: [
      { name: 'Transversal equalizer output', when: 'Given taps c<sub>j</sub> and the samples in the delay line.',
        steps: ['List j = −K…K. Pair each c<sub>j</sub> with v<sub>k−j</sub> (j = −1 ↔ v<sub>k+1</sub>, j = 1 ↔ v<sub>k−1</sub>).', 'Multiply and add: Î<sub>k</sub> = Σc<sub>j</sub>v<sub>k−j</sub>.', 'Quantize to the nearest symbol → Ĩ<sub>k</sub>.'],
        tip: 'Negative j = precursor = future sample. Positive j = postcursor = past sample.' },
      { name: '3-tap zero-forcing design', when: 'Given f<sub>n</sub>, K = 1.',
        steps: ['Check the eye first: D<sub>0</sub> = Σ<sub>n≠0</sub>|f<sub>n</sub>|/|f<sub>0</sub>| must be < 1.', 'Write q<sub>n</sub> = Σ<sub>j</sub>c<sub>j</sub>f<sub>n−j</sub> for n = −1, 0, 1 (each row uses f at n − j).', 'Set q<sub>−1</sub> = 0, q<sub>0</sub> = 1, q<sub>1</sub> = 0 and solve the 3 equations.', 'Residual ISI: compute q<sub>n</sub> for |n| = 2 (up to K + L); peak distortion = Σ|q<sub>n</sub>| over n ≠ 0.'],
        tip: 'Infinite length: C(z) = 1/F(z); expand as a series to get the taps.' },
      { name: 'DFE by hand', when: 'Given f<sub>n</sub>, feedforward taps, symbols.',
        steps: ['Received samples v<sub>k</sub> = Σf<sub>n</sub>I<sub>k−n</sub>.', 'Feedback taps: c<sub>k</sub> = −Σ<sub>j≤0</sub>c<sub>j</sub>f<sub>k−j</sub>, k = 1…K<sub>2</sub>.', 'For each k: Î<sub>k</sub> = (feedforward sum) + Σ c<sub>k′</sub>Ĩ<sub>k−k′</sub> using <b>past decisions</b>, then decide Ĩ<sub>k</sub>.'],
        tip: 'With correct past decisions the postcursor ISI cancels exactly.' }
    ]
  },
  {
    topic: 'T6 · Synchronization', items: [
      { name: 'Phase error loss', when: 'Local carrier phase φ̂ ≠ φ.',
        steps: ['y = ½A cos(φ − φ̂) after the LPF.', 'Amplitude factor cos(φ − φ̂); loss in dB = 20 log cos(φ − φ̂).'],
        tip: '30° → −1.25 dB, 60° → −6 dB, 90° → signal gone.' },
      { name: 'One-shot phase estimate', when: 'Given correlator outputs X (cos) and Y (−sin).',
        steps: ['φ̂ = tan<sup>−1</sup>(Y/X).', 'Fix the quadrant from the signs of X and Y (add 180° if X < 0).'] },
      { name: 'Early / late decision', when: 'Timing loop sign.',
        steps: ['Decision-directed: product = Ĩ<sub>n</sub> × slope. Non-decision-directed: product = y<sub>n</sub> × slope.', 'Product > 0 ⇒ early ⇒ move the sampling later.', 'Product < 0 ⇒ late ⇒ move it earlier.', 'Slope 0 ⇒ at the peak ⇒ optimum.'] }
    ]
  }
);

FORMULAS.push(
  {
    topic: 'T5 · Channel models & equalizers', items: [
      { name: 'Channel models', eq: 'r = αs + n; &nbsp; r = s ∗ h + n; &nbsp; r = s ∗ h(τ, t) + n', note: 'Additive noise / LTI filter / LTV filter (time-varying multipath).', vars: [['r','received signal'],['s','transmitted signal'],['n','additive noise'],['α','attenuation'],['h(t)','LTI channel impulse response'],['h(τ, t)','LTV response at time t to an impulse at t − τ'],['∗','convolution']] },
      { name: 'Linear transversal equalizer', eq: 'Î<sub>k</sub> = Σ<sub>j=−K</sub><sup>K</sup> c<sub>j</sub>v<sub>k−j</sub>', note: '2K + 1 taps: centre (j = 0), K postcursor (j > 0, past), K precursor (j < 0, future).', vars: [['Î<sub>k</sub>','estimate of symbol k'],['c<sub>j</sub>','tap weight j'],['v<sub>k−j</sub>','received sample at tap j'],['K','filter length parameter (2K + 1 taps)']] },
      { name: 'Combined response', eq: 'q<sub>n</sub> = Σ<sub>j</sub> c<sub>j</sub>f<sub>n−j</sub>', vars: [['q<sub>n</sub>','system + equalizer combined response'],['c<sub>j</sub>','equalizer taps'],['f<sub>n</sub>','system response before the equalizer']] },
      { name: 'Equalizer output split', eq: 'Î<sub>k</sub> = q<sub>0</sub>I<sub>k</sub> + Σ<sub>n≠k</sub>I<sub>n</sub>q<sub>k−n</sub> + Σ<sub>j</sub>c<sub>j</sub>n<sub>k−j</sub>', note: 'Desired + ISI + filtered noise.', vars: [['I<sub>k</sub>','transmitted symbol k'],['q<sub>0</sub>','desired-symbol weight'],['I<sub>n</sub>q<sub>k−n</sub>','ISI terms'],['n<sub>k−j</sub>','noise samples']] },
      { name: 'Peak distortion', eq: '𝒟(c) = Σ<sub>n≠0</sub>|q<sub>n</sub>|', vars: [['𝒟(c)','peak distortion (worst-case ISI)'],['c','vector of tap weights'],['q<sub>n</sub>','combined response']] },
      { name: 'Zero-forcing (infinite)', eq: 'q<sub>n</sub> = δ<sub>n</sub> ⇔ C(z)F(z) = 1 ⇔ C(z) = 1/F(z)', vars: [['δ<sub>n</sub>','1 at n = 0, 0 elsewhere'],['C(z), F(z)','Z-transforms of equalizer and system'],['z<sup>−1</sup>','one symbol delay']] },
      { name: 'Eye-open condition', eq: 'D<sub>0</sub> = (1/|f<sub>0</sub>|)Σ<sub>n=1</sub><sup>L</sup>|f<sub>n</sub>| < 1', note: 'Finite ZF: q<sub>n</sub> = 0 for 1 ≤ |n| ≤ K; residual ISI for K + 1 ≤ n ≤ K + L; 2K + L + 1 non-zero q<sub>n</sub>.', vars: [['D<sub>0</sub>','input distortion before equalization'],['f<sub>0</sub>','main (current-symbol) response'],['f<sub>n</sub>','spill-over responses'],['L','channel memory (L + 1 taps)'],['K','equalizer length parameter']] },
      { name: 'MSE criterion', eq: 'J = E|ε<sub>k</sub>|² = E|I<sub>k</sub> − Î<sub>k</sub>|²', vars: [['J','mean-square error'],['ε<sub>k</sub>','error'],['I<sub>k</sub>, Î<sub>k</sub>','transmitted symbol, estimate']] },
      { name: 'MSE equalizer', eq: 'C(z) = F*(1/z*) / (F(z)F*(1/z*) + N<sub>0</sub>)', note: '|F|² ≫ N<sub>0</sub> ⇒ ZFE; |F|² ≪ N<sub>0</sub> ⇒ no division by zero, no noise amplification.', vars: [['C(z)','equalizer transfer function'],['F(z)','system response'],['F*(1/z*)','conjugate matched filter'],['N<sub>0</sub>','noise PSD']] },
      { name: 'DFE output', eq: 'Î<sub>k</sub> = Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>v<sub>k−j</sub> + Σ c<sub>j</sub>Ĩ<sub>k−j</sub>', note: '<span class="watch">⚠</span> Feedback uses past decisions only (k = 1…K<sub>2</sub> on slide 29).', vars: [['v<sub>k−j</sub>','received samples (feedforward input)'],['Ĩ<sub>k−j</sub>','past decisions (feedback input)'],['K<sub>1</sub>','feedforward length (K<sub>1</sub> + 1 taps)'],['c<sub>j</sub>','tap weights']] },
      { name: 'DFE feedback taps', eq: 'c<sub>k</sub> = −Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> c<sub>j</sub>f<sub>k−j</sub>, &nbsp; k = 1…K<sub>2</sub>', vars: [['c<sub>k</sub>, k ≥ 1','feedback taps'],['c<sub>j</sub>, j ≤ 0','feedforward taps'],['f<sub>n</sub>','system response'],['K<sub>2</sub>','number of feedback taps']] },
      { name: 'DFE feedforward taps', eq: 'Σ<sub>j=−K<sub>1</sub></sub><sup>0</sup> ψ<sub>lj</sub>c<sub>j</sub> = f*<sub>−l</sub>, &nbsp; ψ<sub>lj</sub> = Σ<sub>m=0</sub><sup>−l</sup> f*<sub>m</sub>f<sub>m+l−j</sub> + N<sub>0</sub>δ<sub>lj</sub>', vars: [['ψ<sub>lj</sub>','correlation matrix of the received samples (incl. noise)'],['f*<sub>−l</sub>','cross-correlation with the desired symbol'],['δ<sub>lj</sub>','1 if l = j, else 0'],['N<sub>0</sub>','noise PSD']] }
    ]
  },
  {
    topic: 'T6 · Synchronization', items: [
      { name: 'Demodulation with phase error', eq: 'c(t)s(t) = ½A cos(φ − φ̂) + ½A cos(4πf<sub>c</sub>t + φ + φ̂)', note: 'After the LPF: y = ½A cos(φ − φ̂).', vars: [['A','information amplitude A(t)'],['f<sub>c</sub>','carrier frequency (Hz)'],['φ, φ̂','true phase, estimated phase']] },
      { name: 'One-shot ML phase', eq: 'φ̂<sub>ML</sub> = tan<sup>−1</sup>(Y/X)', vars: [['φ̂<sub>ML</sub>','ML phase estimate'],['X, Y','correlations with cos and −sin of the carrier']] },
      { name: 'PLL model', eq: 'φ − φ̂ → ½ sin(φ̂ − φ) → G(s) → K/s (VCO)', vars: [['G(s)','loop filter'],['K/s','VCO (K = gain constant)'],['s','Laplace variable σ + jω']] },
      { name: 'Sampling instants', eq: 't<sub>n</sub> = nT + τ', vars: [['t<sub>n</sub>','n-th sampling instant'],['T','symbol interval (s)'],['τ','nominal propagation delay (s)']] }
    ]
  }
);

CHEAT.push(
  {
    title: 'M2-2 red flags',
    items: [
      'j < 0 is <b>pre</b>cursor (future symbols); j > 0 is <b>post</b>cursor (past symbols). Don\'t swap them.',
      'ZF = 1/F: perfect ISI removal with infinite taps, but it amplifies noise where F is small. MSE adds N<sub>0</sub> in the denominator.',
      'Peak-distortion design needs D<sub>0</sub> < 1 (eye already open). A finite equalizer always leaves residual ISI.',
      'DFE feedback uses past <b>decisions</b> (quantized), not samples — that is what makes it nonlinear. Feedback ⇒ postcursor; feedforward ⇒ precursor + noise whitening.',
      'PLL = feedback, continuous tracking. One-shot = feedforward, no tracking.',
      'Pilot = extra power and bandwidth; suppressed carrier = all power to information.',
      'Decision-directed uses ±1 decisions (normalized); non-decision-directed uses the sample (more jitter, worse SNR).',
      'Timing recovery = the clock rate 1/T; timing phase = where inside T you sample.'
    ]
  }
);
