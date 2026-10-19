# DigiComm Module 2 Drill

A problem-focused reviewer for **Digital Communications — Module 2**, built like the DSP Problem Drill.

| Topic | Covers |
|---|---|
| T1 · Baseband PAM & ISI | PAM chain, overall pulse p(t), ISI at the sampling instant |
| T2 · Nyquist channel & raised cosine | Zero-ISI condition, Nyquist criterion, brick wall ↔ sinc, roll-off α, B<sub>T</sub> = W(1 + α) |
| T3 · Noise & random processes | AWGN, Gaussian RV properties, CDF/PDF, Q-function, CLT, stationarity, autocorrelation, PSD |
| T4 · Matched filter & eye pattern | Optimal receiver, h = g(T − t), SNR = 2E/N<sub>0</sub>, eye diagram reading |
| T5 · Channel models & equalizers | Additive / LTI / LTV channels, linear transversal equalizer, peak distortion & zero forcing, MSE equalizer, DFE |
| T6 · Synchronization | Pilot vs suppressed carrier, phase error, PLL & one-shot estimate, symbol timing, decision-directed vs non-decision-directed |

Both parts are in: M2-1 Baseband Pulse Transmission (T1–T4) and M2-2 Equalization & Synchronization (T5–T6), from the slides and all lecture videos.

## What's inside

- **Study Plan** — sessions in topic order; tick tasks off, links jump to the concept section or problem.
- **Concepts** — plain-language explanation of every idea, a tiny hand-checkable example each, self-check questions.
- **Sample Problems** (45, including essay-style “explain” questions) — worked solutions in steps. Self-grade each with *Got it* / *Missed*.
- **Identification** (135 terms) — searchable glossary with a *Quiz me* mode (definitions hidden until tapped) and shuffle, for the ID part of the exam.
- **Drill** — random problem from a pool you pick, with a timer.
- **Recipes**, **Formula Sheet** and **Cheat List**.

Progress is stored in `localStorage` on the device (`digicomm-m2-state-v1`).

## Run it

```bash
node serve.js        # http://localhost:8123
```

To publish with GitHub Pages: repo **Settings → Pages → Deploy from a branch → `main` / root**.

## Verify the math

```bash
node verify.js       # should print: all NN checks passed
```

## Layout

```
index.html         page shell + CSS
app.js             tabs, problem cards, grading, filters, drill, cheat list
inline.js          auto-formats inline math in prose
lib.js             math helpers + SVG generators
data/topics.js     Module 2 topic list (drives filters, headings, drill)
data/problems.js   sample problems, M2-1 (T1–T4)
data/problems-m22.js  sample problems, M2-2 (T5–T6)
data/glossary.js   identification terms (M2-1); glossary-m22.js for M2-2
data/concepts.js   concept notes (M2-1); concepts-m22.js for M2-2
data/plan.js       study plan
data/reference.js  recipes, formula sheet, cheat list (M2-1); reference-m22.js for M2-2
verify.js          numerical + data-integrity checks
serve.js           tiny static server for local preview
source/            slides and notes (git-ignored)
```

Lecture slides are the instructor's material and are **not** included in this repo.
