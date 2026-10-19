/* Study plan: sessions of checkable tasks. Each task = [html, 'NNm']. Links: P(...problem ids), C(topicIndex, section[, toSection]). */
function P() { return Array.prototype.map.call(arguments, function (i) { return '<a data-goto="' + i + '">' + i + '</a>'; }).join(', '); }
function C(t, a, b) { return '<a data-concept="' + (t - 1) + ':' + (a - 1) + '">Topic ' + t + ' Concepts §' + a + (b && b !== a ? '–' + b : '') + '</a>'; }

/* N(part, fromSection[, toSection]) links to the Lecture Notes tab (part 1 = M2-1, part 2 = M2-2). */
function N(part, a, b) { return '<a data-notes="' + (part - 1) + ':' + (a - 1) + '">' + (part === 1 ? 'M2-1' : 'M2-2') + ' Lecture Notes §' + a + (b && b !== a ? '–' + b : '') + '</a>'; }

var PLAN = {
  loop: [
    '<b>Read</b> the Lecture Notes section first, then the short Concepts summary. Open every <i>? check yourself</i> box and answer it first.',
    '<b>Try</b> the matching problem for at least 5 minutes <i>before</i> opening the solution.',
    '<b>Compare:</b> show the solution and follow it step by step against the recipe.',
    '<b>Redo:</b> hide the solution and solve the same problem again from a blank page.',
    '<b>Grade honestly:</b> <i>Got it</i> only if the redo worked without peeking; otherwise <i>Missed</i>.'
  ],
  quick: {
    title: 'Short on time? The survival set',
    when: 'One evening before a quiz on Part 1. These cover the computations most likely to be asked.',
    tasks: [
      ['Nyquist bandwidth and raised-cosine bandwidth: ' + P('T2-01', 'T2-03', 'T2-04') + '. Read ' + C(2, 3) + ' and ' + C(2, 6) + '.', '35m'],
      ['Q-function with normalisation: ' + P('T3-01', 'T3-04') + '. Read ' + C(3, 3) + '.', '25m'],
      ['Matched filter examples from the slides: ' + P('T4-01', 'T4-02', 'T4-03') + '.', '40m'],
      ['ISI by hand: ' + P('T1-02') + '.', '15m'],
      ['<b>Identification</b> tab, all topics, Quiz me + Shuffle: one full pass. Then read the whole <b>Cheat List</b>.', '30m']
    ]
  },
  sessions: [
    {
      day: 'Session 1', focus: 'T1 · Baseband PAM and ISI',
      tasks: [
        ['<b>Read first:</b> ' + N(1, 1, 6) + ' (what changes in Module 2, the PAM chain, convolution, ISI). Read slowly; check every <i>where</i> list.', '35m'],
        ['Read ' + C(1, 1, 2) + ': the block diagram and why three convolutions become one p(t).', '20m'],
        ['Solve ' + P('T1-01') + ' (PNRZ and s(t)).', '15m'],
        ['Read ' + C(1, 3, 4) + ' (ISI, the pulse-shaping problem).', '15m'],
        ['Solve ' + P('T1-02', 'T1-03', 'T1-04') + ' using <b>Recipes → ISI at a sampling instant</b>.', '40m'],
        ['Essay practice: write your own answer to ' + P('T1-05') + ' before opening the model answer.', '15m'],
        ['<b>Identification</b> tab → filter T1, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 2', focus: 'T2 · Nyquist channel and raised cosine',
      tasks: [
        ['<b>Read first:</b> ' + N(1, 7, 12) + ' (Nyquist criterion, brick wall and sinc, raised cosine, bandwidth). Read slowly; check every <i>where</i> list.', '40m'],
        ['Read ' + C(2, 1, 4) + ': zero-ISI condition, Nyquist criterion, brick wall ↔ sinc, why it is impractical.', '30m'],
        ['Solve ' + P('T2-01') + '.', '10m'],
        ['Read ' + C(2, 5, 6) + ' (raised cosine, α, B<sub>T</sub>).', '25m'],
        ['Solve ' + P('T2-02', 'T2-03', 'T2-04', 'T2-05', 'T2-06') + '.', '50m'],
        ['Essay practice: ' + P('T2-08') + ' (Nyquist channel vs raised cosine).', '15m'],
        ['Bit-rate design: ' + P('T2-07') + '.', '20m'],
        ['<b>Identification</b> tab → filter T2, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 3', focus: 'T3 · Gaussian noise, Q-function, random processes',
      tasks: [
        ['<b>Read first:</b> ' + N(1, 13, 18) + ' (Gaussian RVs, Q-function, CLT, random processes, autocorrelation, PSD, white noise). Read slowly; check every <i>where</i> list.', '50m'],
        ['Read ' + C(3, 1, 3) + '. Practise reading the Q-table on Q(1), Q(2), Q(2.5).', '30m'],
        ['Solve ' + P('T3-01', 'T3-02', 'T3-04') + '.', '35m'],
        ['Read ' + C(3, 4, 7) + ' (CLT, stationarity, autocorrelation, PSD, white noise).', '35m'],
        ['Solve ' + P('T3-03', 'T3-10', 'T3-05', 'T3-06', 'T3-07') + ' — convert °C to K first.', '45m'],
        ['Concept + essay: ' + P('T3-09', 'T3-08') + ' (stationarity, why noise is AWGN).', '25m'],
        ['<b>Identification</b> tab → filter T3, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 4', focus: 'T4 · Matched filter and eye pattern',
      tasks: [
        ['<b>Read first:</b> ' + N(1, 19, 22) + ' (optimal receiver, Cauchy–Schwarz, matched filter worked by convolution, eye pattern). Read slowly; check every <i>where</i> list.', '35m'],
        ['Read ' + C(4, 1, 3) + '. Re-derive SNR ≤ 2E·P<sub>d</sub>/N<sub>0</sub> on paper once.', '30m'],
        ['Solve the slide examples ' + P('T4-01', 'T4-02') + ' with <b>Recipes → Matched-filter output</b>.', '35m'],
        ['Solve ' + P('T4-03', 'T4-04', 'T4-05') + '.', '30m'],
        ['Read ' + C(4, 4) + ' and solve ' + P('T4-06', 'T4-08') + '.', '35m'],
        ['Power budget: ' + P('T4-07') + '.', '25m'],
        ['<b>Identification</b> tab → filter T4, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 5', focus: 'T5 · Channel models and equalizers (M2-2)',
      tasks: [
        ['<b>Read first:</b> ' + N(2, 1, 8) + ' (channel models, why equalize, transversal filter, zero forcing, MSE, DFE). Read slowly; check every <i>where</i> list.', '50m'],
        ['Read ' + C(5, 1, 3) + ': channel models (cave analogy), why equalize, where the equalizer goes, the tapped delay line.', '30m'],
        ['Solve ' + P('T5-01', 'T5-02') + '.', '20m'],
        ['Read ' + C(5, 4) + ' (peak distortion → zero forcing). Then solve ' + P('T5-03', 'T5-04', 'T5-05', 'T5-06') + ' with <b>Recipes → 3-tap zero-forcing design</b>.', '60m'],
        ['Read ' + C(5, 5, 6) + ' (MSE criterion, DFE). Solve ' + P('T5-07', 'T5-08') + '.', '40m'],
        ['Essay practice: ' + P('T5-09') + '.', '15m'],
        ['<b>Identification</b> tab → filter T5, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 6', focus: 'T6 · Carrier and symbol-timing synchronization (M2-2)',
      tasks: [
        ['<b>Read first:</b> ' + N(2, 9, 13) + ' (carrier sync, phase error, PLL, symbol timing, early/late). Read slowly; check every <i>where</i> list.', '35m'],
        ['Read ' + C(6, 1, 4) + ': pilot vs suppressed carrier, why the phase matters, PLL vs one-shot.', '30m'],
        ['Solve ' + P('T6-01', 'T6-02') + '.', '25m'],
        ['Read ' + C(6, 5, 6) + ': timing recovery vs timing phase, early/late, decision-directed vs non-decision-directed.', '25m'],
        ['Solve ' + P('T6-03', 'T6-04') + ', then the essay ' + P('T6-05') + '.', '40m'],
        ['<b>Identification</b> tab → filter T6, switch on <i>Quiz me</i>, and say every definition out loud before revealing it. Repeat the ones you missed.', '15m']
      ]
    },
    {
      day: 'Session 7', focus: 'Mixed review',
      tasks: [
        ['<b>Drill</b> tab, all topics, "Unsolved + missed": 6 problems against the clock.', '60m'],
        ['Formula Sheet: cover the right side and recite each formula.', '20m'],
        ['<b>Identification</b>, all topics, Quiz me + Shuffle, twice.', '25m'],
        ['Redo everything marked <i>Missed</i>, then read the Cheat List.', '40m']
      ]
    }
  ]
};
