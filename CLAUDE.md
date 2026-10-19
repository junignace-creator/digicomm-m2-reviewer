# DigiComm Module 2 Drill — project notes for Claude

Static site (no build step, no dependencies). Sister project of `../dsp-reviewer` (same shell, styling and helpers).
The user chats with Claude about this repo to add problems, fix answers, and drill topics.

## Conventions
- Each module part has its own data files: M2-1 → `problems.js`, `glossary.js`, `concepts.js`, `reference.js`; M2-2 →
  `problems-m22.js`, `glossary-m22.js`, `concepts-m22.js`, `reference-m22.js` (they `push` onto the same globals). New files must be
  added to the `<script>` list in `index.html` **and** the load list in `verify.js`.
- Topics live in `data/topics.js` (`TOPICS = { T1: 'T1 · …', … }`). Filters, list headings and drill checkboxes are built from it — no topic ids are hard-coded in `app.js`.
- **Focus: sample problems + identification. No design-problem section** (user preference for DigiComm — exam is computation + ID).
- Problems: `PROBLEMS.push({id, lec, kind: 'solve', title, q, a})` in `data/problems.js`.
  - `id`: `T<n>-NN`. `lec` is a `TOPICS` key. Keep problems ordered by topic.
  - `q`/`a` are HTML. Helpers in `lib.js`: `steps`, `tbl`, `mb`, `frac`, `rt`, `note`, `warn`, `qa`, `use`, `callout`, plus SVG figures.
  - Use `−` (U+2212) for minus in prose; unicode or `<sub>/<sup>` for sub/superscripts.
- **Every numeric claim must be backed by a `check(...)` in `verify.js`.** Helpers there: `Q`, `erfc`, `dB`, `undB`, `dBm`, `log2`, `k_B`.
  `verify.js` also checks unique ids, valid topics, that every `data-goto` link resolves, and that every problem appears in the study plan once sessions exist.
- Identification terms: `data/glossary.js`, `GLOSSARY = [[term, definition, topic]]`. Add terms for every new topic (definitions 1–2 sentences,
  phrased the way the slides/lecturer phrase them). Each study-plan session gets an Identification task.
- Inline math is auto-formatted by `inline.js`; formula sheet runs `mathify()`. Don't hand-italicize.
- localStorage keys: `digicomm-m2-state-v1`, `digicomm-m2-plan-v1`, `digicomm-m2-concept-tab` — don't rename without migrating.
- Preview: `node serve.js` → http://localhost:8123.

## Source material
Slides and notes go in `source/slides/` and `source/notes/` (git-ignored — instructor's material).
Extract PDF text with `pdftotext -layout` (poppler under Git Bash; Python isn't installed).
Record here which slide problems were used directly and any assumptions made where slide text was unreadable.
- The M2 PDFs have their equations in a font with no text layer: `pdftotext` drops every math symbol. Render pages to PNG with the
  Windows PDF API (Windows.Data.Pdf via PowerShell; no poppler `pdftoppm` here) and read the images.
- M2-2 (41 slides, Proakis & Salehi notation): T5 slides 3–30, T6 slides 31–40. No worked examples on the slides; all M2-2
  problems are original. Slide quirks noted in problems: slide 6 LTV relation written with Σ but ends in dτ (integral); slide 28
  feedback sum starts at j = 0 with K2 + 1 taps while slide 29 uses k = 1…K2 (feedback can only use past decisions).
  Videos 1–2 summarised in `source/notes/M2-2_videos1-2_highlights.md`.
- M2-1 (83 slides): T1 slides 2–14, T2 15–33, T3 34–58, T4 59–79. Slide problems used: matched-filter Example 1 (T4-01, answer on slide)
  and Example 2 (T4-02, no answer on slide — derived and verified). Everything else is original, built on the slide formulas.
- Lecture transcripts (Taglish) are summarised in `source/notes/M2-1_videos1-2_highlights.md` and `…videos3-5_highlights.md`
  (lecturer analogies/examples, corrections, exam hints). Lecturer examples are called out in Concepts as `callout('Lecture …')`.
- Exam format (stated for SA on Module 1, likely the same style later): 40% knowledge questions (identification), 60% problem
  solving/analysis which may include **essay** questions; closed notes, 2 h, calculator. So each topic gets at least one
  essay-style “explain” problem with a model answer in steps.

## Status
- 2026-10-20: skeleton created.
- 2026-10-20: M2-1 Part 1 added (topics T1–T4). All 5 lecture videos received and folded in: 31 sample problems (incl. essays),
  81 ID terms. M2-1 is complete. Example 2 (T4-02) is the assigned homework (by convolution); MATLAB convolution demo promised later. M2-2 (Equalization & Synchronization) PDF exists in the user's OneDrive Documents\Digicomms folder but not added yet.
- 2026-10-20: M2-2 added from the slides + both lecture videos: topics T5 (equalization) and T6 (synchronization), 14 sample
  problems (incl. essays), 54 ID terms, 2 new study sessions. Totals: 45 problems, 135 terms. Module 2 complete.
- Summative 2 on 2026-10-24 covers Module 1 only, not M2-1.

## Ideas for next sessions
- Add problems from any homework/quiz the instructor posts for M2-1.
