# DigiComm Module 2 Drill — project notes for Claude

Static site (no build step, no dependencies). Sister project of `../dsp-reviewer` (same shell, styling and helpers).
The user chats with Claude about this repo to add problems, fix answers, and drill topics.

## Conventions
- Topics live in `data/topics.js` (`TOPICS = { T1: 'T1 · …', … }`). Filters, list headings and drill checkboxes are built from it — no topic ids are hard-coded in `app.js`.
- Problems: `PROBLEMS.push({id, lec, kind, title, q, a})` in `data/problems.js` (solve) and `data/design.js` (design).
  - `id`: `T<n>-NN` for solve, `DS-NN` for design. `lec` is a `TOPICS` key. Keep problems ordered by topic.
  - `q`/`a` are HTML. Helpers in `lib.js`: `steps`, `tbl`, `mb`, `frac`, `rt`, `note`, `warn`, `qa`, `use`, `callout`, plus SVG figures.
  - Use `−` (U+2212) for minus in prose; unicode or `<sub>/<sup>` for sub/superscripts.
- **Every numeric claim must be backed by a `check(...)` in `verify.js`.** Helpers there: `Q`, `erfc`, `dB`, `undB`, `dBm`, `log2`, `k_B`.
  `verify.js` also checks unique ids, valid topics, that every `data-goto` link resolves, and that every problem appears in the study plan once sessions exist.
- Inline math is auto-formatted by `inline.js`; formula sheet runs `mathify()`. Don't hand-italicize.
- localStorage keys: `digicomm-m2-state-v1`, `digicomm-m2-plan-v1`, `digicomm-m2-concept-tab` — don't rename without migrating.
- Preview: `node serve.js` → http://localhost:8123.

## Source material
Slides and notes go in `source/slides/` and `source/notes/` (git-ignored — instructor's material).
Extract PDF text with `pdftotext -layout` (poppler under Git Bash; Python isn't installed).
Record here which slide problems were used directly and any assumptions made where slide text was unreadable.

## Status
- 2026-10-20: skeleton created; waiting for Module 2 files and notes.
