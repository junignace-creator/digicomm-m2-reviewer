# DigiComm Module 2 Drill

A problem-focused reviewer for **Digital Communications — Module 2**, built like the DSP Problem Drill.

| Topic | Covers |
|---|---|
| _to be filled in from the module notes_ | |

## What's inside

- **Study Plan** — sessions in topic order; tick tasks off, links jump to the concept section or problem.
- **Concepts** — plain-language explanation of every idea, a tiny hand-checkable example each, self-check questions.
- **Sample Problems** — worked solutions in steps. Self-grade each with *Got it* / *Missed*.
- **Design Problems** — spec → design / sizing → verify → trade-offs.
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
data/problems.js   solve problems
data/design.js     design problems
data/concepts.js   concept notes
data/plan.js       study plan
data/reference.js  recipes, formula sheet, cheat list
verify.js          numerical + data-integrity checks
serve.js           tiny static server for local preview
source/            slides and notes (git-ignored)
```

Lecture slides are the instructor's material and are **not** included in this repo.
