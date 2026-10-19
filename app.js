/* App logic: tabs, problem cards, self-grading (localStorage), filters, drill mode, cheat list. */
var STATE_KEY = 'digicomm-m2-state-v1';
function loadState() { try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch (e) { return {}; } }
function saveState() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { } }
var state = loadState();

var LEC_NAMES = TOPICS; /* from data/topics.js: { T1: '…', T2: '…' } */
var LEC_IDS = Object.keys(LEC_NAMES);
var byId = {}; PROBLEMS.forEach(function (p) { byId[p.id] = p; });
var SOLVE = PROBLEMS.filter(function (p) { return p.kind === 'solve'; });

function updateProgress() {
  var done = PROBLEMS.filter(function (p) { return state[p.id] === 'solved'; }).length;
  document.getElementById('progressPill').textContent = done + ' / ' + PROBLEMS.length + ' solved';
}
function chipFor(id) { return state[id] === 'solved' ? ['solved', 'Got it'] : state[id] === 'missed' ? ['missed', 'Missed'] : ['', '']; }

/* ----- a single problem card (used by lists and by the drill) ----- */
function probCard(p, onGrade) {
  var div = document.createElement('div');
  div.className = 'prob'; div.id = 'prob-' + p.id;
  div.innerHTML =
    '<div class="prob-head"><span class="prob-id">' + p.id + '</span><span class="kind-tag">' + p.lec + '</span><span class="status-chip"></span></div>' +
    '<div class="prob-title">' + inlineMath(p.title) + '</div><div class="prob-body">' + inlineMath(p.q) + '</div>' +
    '<button class="reveal-btn" type="button">Show solution</button>' +
    '<div class="answer" hidden>' + inlineMath(p.a) +
    '<div class="grade"><span>How did you do?</span><button type="button" data-g="solved">Got it ✓</button><button type="button" data-g="missed">Missed ✗</button><button type="button" data-g="">Clear</button></div></div>';
  var chip = div.querySelector('.status-chip'), btn = div.querySelector('.reveal-btn'), ans = div.querySelector('.answer');
  function paint() { var c = chipFor(p.id); chip.className = 'status-chip ' + c[0]; chip.textContent = c[1]; }
  paint();
  btn.addEventListener('click', function () { ans.hidden = !ans.hidden; btn.textContent = ans.hidden ? 'Show solution' : 'Hide solution'; if (!ans.hidden && onGrade && onGrade.onReveal) onGrade.onReveal(); });
  div.querySelector('.grade').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-g]'); if (!b) return;
    if (b.dataset.g) state[p.id] = b.dataset.g; else delete state[p.id];
    saveState(); paint(); updateProgress(); renderMissed();
    if (onGrade && onGrade.onGrade) onGrade.onGrade(b.dataset.g);
  });
  return div;
}

/* ----- list tabs with lecture + status filters ----- */
function buildList(prefix, items) {
  var f = { lec: 'all', st: 'all' };
  var bar = document.getElementById('filters' + prefix), list = document.getElementById('list' + prefix);
  var lecs = ['all'].concat(LEC_IDS), sts = ['all', 'todo', 'missed', 'solved'];
  var stLabel = { all: 'Any status', todo: 'Unsolved', missed: 'Missed', solved: 'Solved' };
  function draw() {
    bar.innerHTML = lecs.map(function (l) { return '<button type="button" data-k="lec" data-v="' + l + '" class="' + (f.lec === l ? 'active' : '') + '">' + (l === 'all' ? 'All topics' : l) + '</button>'; }).join('') +
      '<span class="sep"></span>' + sts.map(function (s) { return '<button type="button" data-k="st" data-v="' + s + '" class="' + (f.st === s ? 'active' : '') + '">' + stLabel[s] + '</button>'; }).join('');
    list.innerHTML = '';
    var shown = items.filter(function (p) {
      if (f.lec !== 'all' && p.lec !== f.lec) return false;
      var s = state[p.id] || '';
      if (f.st === 'todo') return s !== 'solved';
      if (f.st === 'missed') return s === 'missed';
      if (f.st === 'solved') return s === 'solved';
      return true;
    });
    var last = '';
    shown.forEach(function (p) {
      if (p.lec !== last) { var h = document.createElement('div'); h.className = 'topic-h'; h.textContent = LEC_NAMES[p.lec]; list.appendChild(h); last = p.lec; }
      list.appendChild(probCard(p));
    });
    if (!shown.length) list.innerHTML = '<p class="empty">' + (items.length ? 'Nothing matches this filter.' : 'No problems yet — they will be added once the Module 2 notes are in.') + '</p>';
  }
  bar.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; f[b.dataset.k] = b.dataset.v; draw(); });
  draw();
  return { redraw: draw, filters: f };
}

/* ----- tabs ----- */
function showPane(name) {
  document.querySelectorAll('#tabs button').forEach(function (b) { b.classList.toggle('active', b.dataset.pane === name); });
  document.querySelectorAll('section.pane').forEach(function (p) { p.classList.toggle('active', p.id === 'pane-' + name); });
  try { history.replaceState(null, '', '#' + name); } catch (e) { }
  window.scrollTo(0, 0);
}
document.getElementById('tabs').addEventListener('click', function (e) { var b = e.target.closest('button[data-pane]'); if (b) showPane(b.dataset.pane); });

var listP;
function gotoProblem(id) {
  var p = byId[id]; if (!p) return;
  listP.filters.lec = 'all'; listP.filters.st = 'all'; listP.redraw();
  showPane('problems');
  var el = document.getElementById('prob-' + id); if (el) el.scrollIntoView({ block: 'start' });
}

/* ----- drill ----- */
var drill = { timer: null, t0: 0 };
function fmtTime(s) { var m = Math.floor(s / 60); s = s % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
function buildDrill() {
  var ctl = document.getElementById('drillCtl'), out = document.getElementById('drillOut');
  ctl.innerHTML =
    LEC_IDS.map(function (l) { return '<label><input type="checkbox" data-lec="' + l + '" checked>' + l + '</label>'; }).join('') +
    '<select id="dPool"><option value="open">Unsolved + missed</option><option value="missed">Missed only</option><option value="all">Everything</option></select>' +
    '<button class="big-btn" id="dGo" type="button">Draw a problem</button>';
  function pool() {
    var lecs = Array.prototype.map.call(ctl.querySelectorAll('input[data-lec]:checked'), function (i) { return i.dataset.lec; });
    var mode = document.getElementById('dPool').value;
    return PROBLEMS.filter(function (p) {
      if (lecs.indexOf(p.lec) < 0) return false;
      var s = state[p.id] || '';
      return mode === 'all' || (mode === 'missed' ? s === 'missed' : s !== 'solved');
    });
  }
  function stop() { if (drill.timer) { clearInterval(drill.timer); drill.timer = null; } }
  function draw() {
    stop();
    var pl = pool();
    if (!pl.length) { out.innerHTML = '<p class="empty">No problems in this pool — widen the filters or switch to "Everything".</p>'; return; }
    var p = pl[Math.floor(Math.random() * pl.length)];
    out.innerHTML = '<div class="timer" id="dTimer" style="text-align:right;margin:0 0 6px">00:00</div><div id="dCard"></div><p style="margin-top:10px"><button class="ghost-btn" id="dNext" type="button">Next problem →</button> <span class="formula-note" style="display:inline">' + pl.length + ' in pool</span></p>';
    drill.t0 = Date.now();
    drill.timer = setInterval(function () { var el = document.getElementById('dTimer'); if (el) el.textContent = fmtTime(Math.floor((Date.now() - drill.t0) / 1000)); }, 500);
    document.getElementById('dCard').appendChild(probCard(p, { onReveal: stop }));
    document.getElementById('dNext').addEventListener('click', draw);
  }
  document.getElementById('dGo').addEventListener('click', draw);
}

/* ----- identification (glossary) ----- */
function buildGlossary() {
  var f = { lec: 'all', q: '', quiz: false }, order = GLOSSARY.map(function (g, i) { return i; });
  var bar = document.getElementById('glossFilters'), list = document.getElementById('glossList');
  function draw() {
    bar.innerHTML = ['all'].concat(LEC_IDS).map(function (l) { return '<button type="button" data-lec="' + l + '" class="' + (f.lec === l ? 'active' : '') + '">' + (l === 'all' ? 'All topics' : l) + '</button>'; }).join('') +
      '<span class="sep"></span><button type="button" data-act="quiz" class="' + (f.quiz ? 'active' : '') + '">Quiz me</button><button type="button" data-act="shuffle">Shuffle</button><button type="button" data-act="reset">A–Z order</button>';
    var q = f.q.trim().toLowerCase(), n = 0;
    list.className = 'card' + (f.quiz ? ' quiz' : '');
    list.innerHTML = order.map(function (i) {
      var g = GLOSSARY[i];
      if (f.lec !== 'all' && g[2] !== f.lec) return '';
      if (q && (g[0] + ' ' + g[1]).replace(/<[^>]+>/g, '').toLowerCase().indexOf(q) < 0) return '';
      n++;
      return '<div class="gloss-item"><div class="gloss-term">' + g[0] + '<span class="kind-tag">' + g[2] + '</span></div><div class="gloss-def">' + inlineMath(g[1]) + '</div></div>';
    }).join('') || '<p class="empty">No terms match.</p>';
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.lec) f.lec = b.dataset.lec;
    else if (b.dataset.act === 'quiz') f.quiz = !f.quiz;
    else if (b.dataset.act === 'shuffle') { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; } }
    else if (b.dataset.act === 'reset') order = GLOSSARY.map(function (g, i) { return i; }).sort(function (x, y) { return GLOSSARY[x][0].replace(/<[^>]+>/g, '').localeCompare(GLOSSARY[y][0].replace(/<[^>]+>/g, '')); });
    draw();
  });
  list.addEventListener('click', function (e) { var it = e.target.closest('.gloss-item'); if (it && f.quiz) it.classList.toggle('shown'); });
  document.getElementById('glossSearch').addEventListener('input', function (e) { f.q = e.target.value; draw(); });
  draw();
}

/* ----- recipes, formulas, cheat ----- */
function renderRecipes() {
  var root = document.getElementById('recipeList');
  root.innerHTML = '<div class="exam-note">Short, repeatable procedures. If a problem stalls, find its recipe here and follow the numbered steps literally.</div>';
  RECIPES.forEach(function (g) {
    var h = document.createElement('div'); h.className = 'topic-h'; h.textContent = g.topic; root.appendChild(h);
    g.items.forEach(function (r) {
      var c = document.createElement('div'); c.className = 'card note-sec';
      c.innerHTML = '<h3>' + r.name + '</h3>' + (r.when ? '<p style="color:var(--muted);margin:4px 0 6px">' + inlineMath(r.when) + '</p>' : '') + '<ol>' + r.steps.map(function (s) { return '<li>' + inlineMath(s) + '</li>'; }).join('') + '</ol>' + (r.tip ? '<div class="callout"><span class="callout-tag">Watch out</span>' + inlineMath(r.tip) + '</div>' : '');
      root.appendChild(c);
    });
  });
}
/* italicize single-letter variables and lowercase Greek in formula text (not inside tags; e, j, d, π stay upright) */
function mathify(html) {
  return html.split(/(<[^>]*>)/).map(function (seg) {
    if (seg.charAt(0) === '<') return seg;
    return seg.replace(/[A-Za-z]+/g, function (m) { return (m.length === 1 && 'ejd'.indexOf(m) < 0) ? '<i>' + m + '</i>' : m; })
      .replace(/[α-ωϕθλμσδφω]/g, function (c) { return c === 'π' ? c : '<i>' + c + '</i>'; });
  }).join('');
}
function renderConcepts() {
  var tabs = document.getElementById('conceptTabs'), body = document.getElementById('conceptBody'), cur = 0;
  try { cur = +localStorage.getItem('digicomm-m2-concept-tab') || 0; } catch (e) { }
  if (cur >= CONCEPTS.length) cur = 0;
  if (!CONCEPTS.length) { body.innerHTML = '<p class="empty">Concept notes will appear here once the Module 2 material is added.</p>'; return; }
  function draw() {
    tabs.innerHTML = CONCEPTS.map(function (c, i) { return '<button type="button" data-i="' + i + '" class="' + (i === cur ? 'active' : '') + '">' + c.label + '</button>'; }).join('');
    body.innerHTML = CONCEPTS[cur].sections.map(function (s) { return '<div class="card note-sec"><h3>' + s.h + '</h3>' + inlineMath(s.html) + '</div>'; }).join('');
  }
  window.openConcept = function (i, s) { cur = i; try { localStorage.setItem('digicomm-m2-concept-tab', cur); } catch (x) { } draw(); showPane('concepts'); var c = body.querySelectorAll('.card')[s]; if (c) c.scrollIntoView({ block: 'start' }); };
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (!b) return; cur = +b.dataset.i; try { localStorage.setItem('digicomm-m2-concept-tab', cur); } catch (x) { } draw(); window.scrollTo(0, 0); });
  draw();
}
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[data-goto]'); if (a) gotoProblem(a.dataset.goto);
  var c = e.target.closest('a[data-concept]'); if (c) { var p = c.dataset.concept.split(':'); window.openConcept(+p[0], +p[1]); }
});
var PLAN_KEY = 'digicomm-m2-plan-v1', planState = {};
try { planState = JSON.parse(localStorage.getItem(PLAN_KEY) || '{}'); } catch (e) { planState = {}; }
function renderPlan() {
  document.getElementById('planLoop').innerHTML = '<h3>How to study every problem (the loop)</h3><ol>' + PLAN.loop.map(function (s) { return '<li>' + inlineMath(s) + '</li>'; }).join('') + '</ol>';
  function taskList(prefix, tasks) {
    return '<ul class="tasklist">' + tasks.map(function (t, i) {
      var id = prefix + '-t' + i, on = !!planState[id];
      return '<li class="' + (on ? 'done' : '') + '"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><label class="tasktext" for="' + id + '">' + inlineMath(t[0]) + '</label><span class="taskmin">' + t[1] + '</span></li>';
    }).join('') + '</ul>';
  }
  function mins(tasks) { return tasks.reduce(function (s, t) { return s + parseInt(t[1], 10); }, 0); }
  var q = PLAN.quick;
  if (q) document.getElementById('planQuick').innerHTML = '<div class="card note-sec"><h3>' + q.title + '</h3><p style="color:var(--muted);margin:4px 0 0">' + q.when + '</p>' + taskList('q', q.tasks) + '</div>';
  var list = document.getElementById('planList');
  list.innerHTML = '<span class="plan-pill" id="planPill"></span>' + PLAN.sessions.map(function (s, n) {
    return '<div class="card note-sec"><div class="night-head"><div><span class="night-tag">' + s.day + '</span><div style="margin-top:6px;font-weight:600">' + s.focus + '</div></div><div class="night-mins">~' + mins(s.tasks) + ' min</div></div>' + taskList('s' + n, s.tasks) + '</div>';
  }).join('');
  function pill() {
    var boxes = list.querySelectorAll('input[type=checkbox]'), done = list.querySelectorAll('input[type=checkbox]:checked').length;
    document.getElementById('planPill').textContent = 'Plan progress: ' + done + ' / ' + boxes.length + ' tasks';
  }
  document.getElementById('pane-plan').addEventListener('change', function (e) {
    if (!e.target.matches('input[type=checkbox]')) return;
    planState[e.target.id] = e.target.checked;
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(planState)); } catch (x) { }
    e.target.closest('li').classList.toggle('done', e.target.checked);
    pill();
  });
  pill();
}
function renderFormulas() {
  var root = document.getElementById('formulaList');
  root.innerHTML = '<div class="exam-note">Grouped by topic. Anything flagged <span class="watch">⚠</span> is a spot where notation or a sign is easy to get wrong.</div>';
  FORMULAS.forEach(function (g) {
    var h = document.createElement('div'); h.className = 'topic-h'; h.textContent = g.topic; root.appendChild(h);
    var card = document.createElement('div'); card.className = 'card';
    g.items.forEach(function (it) {
      var d = document.createElement('div'); d.className = 'formula-item';
      d.innerHTML = '<div class="formula-name">' + it.name + '</div><div class="math-block">' + mathify(it.eq) + '</div>' + (it.note ? '<div class="formula-note">' + inlineMath(it.note) + '</div>' : '') + (it.vars ? inlineMath(where(it.vars)) : '');
      card.appendChild(d);
    });
    root.appendChild(card);
  });
}
function renderCheat() {
  document.getElementById('cheatStatic').innerHTML = CHEAT.map(function (g) {
    return '<div class="card note-sec"><h3>' + g.title + '</h3><ul>' + g.items.map(function (i) { return '<li>' + inlineMath(i) + '</li>'; }).join('') + '</ul></div>';
  }).join('');
}
function renderMissed() {
  var box = document.getElementById('missedBox');
  var m = PROBLEMS.filter(function (p) { return state[p.id] === 'missed'; });
  box.innerHTML = m.length ? '<ul class="missed-list">' + m.map(function (p) { return '<li><a data-id="' + p.id + '">' + p.id + '</a> — ' + p.title + '</li>'; }).join('') + '</ul>' : '<p class="empty">Nothing marked <i>Missed</i> yet.</p>';
}
document.getElementById('missedBox').addEventListener('click', function (e) { var a = e.target.closest('a[data-id]'); if (a) gotoProblem(a.dataset.id); });
document.getElementById('resetBtn').addEventListener('click', function () {
  if (!confirm('Clear all Got it / Missed marks on this device?')) return;
  state = {}; saveState(); updateProgress(); renderMissed(); listP.redraw();
});

listP = buildList('Problems', SOLVE);
renderPlan(); renderConcepts(); buildGlossary(); buildDrill(); renderRecipes(); renderFormulas(); renderCheat(); renderMissed(); updateProgress();
(function () { var h = (location.hash || '').slice(1); if (h && document.getElementById('pane-' + h)) showPane(h); })();
