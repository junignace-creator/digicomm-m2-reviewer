/* Shared helpers: math markup + inline-SVG figure generators (stem plots, pole-zero plots, block diagrams). */
var PROBLEMS = [];

function frac(n, d) { return '<span class="frac"><span class="num">' + n + '</span><span class="den">' + d + '</span></span>'; }
function rt(x) { return '√<span class="rt">' + x + '</span>'; }
function mb(s) { return '<div class="math-block">' + s + '</div>'; }
function note(s) { return '<span class="formula-note">' + s + '</span>'; }
function warn(s) { return '<span class="formula-note"><span class="watch">⚠</span> ' + s + '</span>'; }
function steps(list) { return '<ol class="steps">' + list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; }
function tbl(head, rows, hlCol) {
  return '<table class="trace-table"><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i === hlCol ? ' class="hl"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
}
function qa(q, a) { return '<details class="qa"><summary>' + q + '</summary><div class="qa-a">' + a + '</div></details>'; }
function callout(tag, html) { return '<div class="callout"><span class="callout-tag">' + tag + '</span>' + html + '</div>'; }
function use(ids) { return '<p class="practice"><b>Practice →</b> ' + ids.map(function (i) { return '<a data-goto="' + i + '">' + i + '</a>'; }).join(' · ') + '</p>'; }
function gl(v) { return (+(+v).toFixed(4)).toString().replace('-', '−'); }

/* ---------- SVG primitives ---------- */
var figN = 0;
function svgFig(w, h, caption, label, build, minw) {
  figN++;
  var id = 'ah' + figN;
  return '<figure class="fig"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label.replace(/"/g, '&quot;') + '"' + (minw ? ' style="min-width:' + minw + 'px"' : '') +
    '><defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>' +
    build(id) + '</svg><figcaption>' + caption + '</figcaption></figure>';
}
function svgT(x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '"' + (cls ? ' class="' + cls + '"' : '') + ' text-anchor="' + (anchor || 'middle') + '">' + s + '</text>'; }
function svgL(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 'ax') + '"/>'; }
function svgP(pts, id, cls) { return '<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" class="' + (cls || 'arr') + '" marker-end="url(#' + id + ')"/>'; }
function svgB(x, y, w, h, txt) {
  var ls = txt.split('|'), lh = 13, y0 = y + h / 2 - (ls.length - 1) * lh / 2 + 4, o = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" class="box"/>';
  ls.forEach(function (l, i) { o += svgT(x + w / 2, y0 + i * lh, l, '', ''); });
  return o;
}
function svgS(cx, cy) { return '<circle cx="' + cx + '" cy="' + cy + '" r="11" class="box"/>' + svgT(cx, cy + 4, 'Σ', '', ''); }
function svgDot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3" class="dot"/>'; }

/* ---------- stem plot of a DT signal ---------- */
/* o: {pts:[[n,v],...], xlo, xhi, labels:{n:'text'}, cap, label} */
function stemFig(o) {
  var W = 560, H = o.h || 190, ml = 30, mr = 24, top = 26, bot = 30;
  var vals = o.pts.map(function (p) { return p[1]; });
  var vmax = Math.max.apply(null, vals.concat([0])), vmin = Math.min.apply(null, vals.concat([0])), span = (vmax - vmin) || 1;
  var plotH = H - top - bot, y0 = top + (vmax / span) * plotH;
  function X(n) { return ml + (n - o.xlo) / (o.xhi - o.xlo) * (W - ml - mr); }
  function Y(v) { return y0 - v / span * plotH; }
  return svgFig(W, H, o.cap, o.label, function () {
    var s = svgL(ml - 8, y0, W - mr + 8, y0, 'ax') + svgT(W - mr + 14, y0 + 4, 'n', 'sm', 'start');
    var step = (o.xhi - o.xlo) > 14 ? 2 : 1, n;
    for (n = o.xlo; n <= o.xhi; n += step) s += svgL(X(n), y0 - 3, X(n), y0 + 3, 'ax') + svgT(X(n), vmin < 0 ? H - 10 : y0 + 16, n, 'sm', '');
    o.pts.forEach(function (p) {
      var x = X(p[0]), y = Y(p[1]);
      if (p[1] !== 0) s += svgL(x, y0, x, y, 'wave');
      s += '<circle cx="' + x + '" cy="' + y + '" r="3.6" class="dot"/>';
      var t = (o.labels && o.labels[p[0]] !== undefined) ? o.labels[p[0]] : (+(+p[1]).toFixed(3)).toString().replace('-', '−');
      if (p[1] !== 0 || (o.labels && o.labels[p[0]] !== undefined)) s += svgT(x, p[1] >= 0 ? y - 8 : y + 16, t, 'sm', '');
    });
    return s;
  });
}

/* ---------- pole-zero plot ---------- */
/* o: {poles:[{re,im,t,m}], zeros:[...], roc:{type:'out'|'in'|'ann'|'all', r1, r2}, cap, label, scale} */
function pzFig(o) {
  return pzFigRaw(o).replace('<svg ', '<svg class="pz" ');
}
function pzFigRaw(o) {
  var W = 320, H = 300, cx = 160, cy = 150, S = o.scale || 64;
  function circPath(r) { var R = r * S; return 'M' + (cx - R) + ',' + cy + ' a' + R + ',' + R + ' 0 1,0 ' + (2 * R) + ',0 a' + R + ',' + R + ' 0 1,0 ' + (-2 * R) + ',0 Z '; }
  return svgFig(W, H, o.cap, o.label, function () {
    var s = '', r = o.roc;
    if (r) {
      var rect = 'M0,0 H' + W + ' V' + H + ' H0 Z ';
      if (r.type === 'out') s += '<path d="' + rect + circPath(r.r1) + '" fill-rule="evenodd" class="roc"/>';
      else if (r.type === 'in') s += '<path d="' + circPath(r.r2) + '" class="roc"/>';
      else if (r.type === 'ann') s += '<path d="' + circPath(r.r2) + circPath(r.r1) + '" fill-rule="evenodd" class="roc"/>';
      else s += '<path d="' + rect + '" class="roc"/>';
    }
    s += svgL(10, cy, W - 10, cy, 'ax') + svgL(cx, H - 8, cx, 8, 'ax') + svgT(W - 12, cy - 6, 'Re', 'sm', 'end') + svgT(cx + 6, 16, 'Im', 'sm', 'start');
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + S + '" class="circ"/>' + svgT(cx + S + 3, cy + 13, '1', 'sm', 'start');
    (o.zeros || []).forEach(function (z) {
      var x = cx + z.re * S, y = cy - z.im * S;
      s += '<circle cx="' + x + '" cy="' + y + '" r="5.5" class="zero"/>';
      if (z.t) s += svgT(x + (z.dx || 9), y + (z.dy === undefined ? -9 : z.dy), z.t, 'sm', 'start');
    });
    (o.poles || []).forEach(function (p) {
      var x = cx + p.re * S, y = cy - p.im * S;
      s += svgL(x - 5, y - 5, x + 5, y + 5, 'pole') + svgL(x - 5, y + 5, x + 5, y - 5, 'pole');
      if (p.t) s += svgT(x + (p.dx || 9), y + (p.dy === undefined ? -9 : p.dy), p.t, 'sm', 'start');
    });
    return s;
  });
}

/* ---------- block-diagram machinery ---------- */
/* Vertical chain of adders at x = xs. ins[k] = list of {side:'L'|'R', from:x}: horizontal wires arriving at row k.
   Rows with >=2 inputs (counting the carry from the row below) get a Σ circle; single inputs become plain corners. */
function adderChain(id, xs, K, Y, ins) {
  var s = '', carry = false, lastY = 0, circle0 = false, k, n, circ;
  for (k = K; k >= 0; k--) {
    n = ins[k].length + (carry ? 1 : 0);
    if (n === 0) continue;
    circ = n >= 2;
    if (circ) {
      s += svgS(xs, Y(k));
      ins[k].forEach(function (p) { s += svgP([[p.from, Y(k)], [p.side === 'L' ? xs - 11 : xs + 11, Y(k)]], id); });
      if (carry) s += svgP([[xs, lastY], [xs, Y(k) + 11]], id);
      if (k === 0) circle0 = true;
    } else if (ins[k].length === 1) {
      s += svgL(ins[k][0].from, Y(k), xs, Y(k), 'arr');
    } else {
      if (k === 0) s += svgL(xs, lastY, xs, Y(0), 'arr');
      continue;
    }
    carry = true; lastY = Y(k) - (circ ? 11 : 0);
  }
  return { svg: s, circle0: circle0 };
}
/* Vertical z^-1 chain at x, rows k0..k1; lab(k) gives the signal name at each tap. */
function delayChain(id, x, k0, k1, Y, lab, labAnchor) {
  var s = '', k, m;
  for (k = k0 + 1; k <= k1; k++) {
    m = (Y(k - 1) + Y(k)) / 2;
    s += svgL(x, Y(k - 1), x, m - 12, 'arr') + svgB(x - 19, m - 12, 38, 24, 'z⁻¹') + svgP([[x, m + 12], [x, Y(k) - 3]], id);
  }
  for (k = k0; k <= k1; k++) {
    s += svgDot(x, Y(k));
    if (lab(k)) s += svgT(x + (labAnchor === 'end' ? -8 : 8), Y(k) - 7, lab(k), 'sm', labAnchor || 'start');
  }
  return s;
}
function sig(name, k) { return name + '(n' + (k ? '−' + k : '') + ')'; }

/* Direct Form II. o:{b:[b0..bM], a:[a1..aN], cap, label}. Drawn feedback multiplier = −a_k. */
function df2Fig(o) {
  var b = o.b, a = o.a || [], M = b.length - 1, N = a.length, K = Math.max(M, N, 1);
  var rowH = 60, y0 = 42, W = 560, cx = 250, xl = 96, xr = 404, gL = cx - 72, gR = cx + 72, bw = 46, bh = 24;
  function Y(k) { return y0 + k * rowH; }
  return svgFig(W, Y(K) + 40, o.cap, o.label, function (id) {
    var s = svgT(10, y0 - 12, 'x(n)', 'sm', 'start') + svgT(W - 12, y0 - 12, 'y(n)', 'sm', 'end'), k, insL = [], insR = [];
    for (k = 0; k <= K; k++) { insL.push([]); insR.push([]); }
    insL[0].push({ side: 'L', from: 10 });
    for (k = 1; k <= N; k++) if (a[k - 1] !== 0) {
      insL[k].push({ side: 'R', from: gL - bw / 2 });
      s += svgP([[cx, Y(k)], [gL + bw / 2, Y(k)]], id) + svgB(gL - bw / 2, Y(k) - bh / 2, bw, bh, gl(-a[k - 1]));
    }
    for (k = 0; k <= M; k++) if (b[k] !== 0) {
      insR[k].push({ side: 'L', from: gR + bw / 2 });
      s += svgP([[cx, Y(k)], [gR - bw / 2, Y(k)]], id) + svgB(gR - bw / 2, Y(k) - bh / 2, bw, bh, gl(b[k]));
    }
    var cl = adderChain(id, xl, K, Y, insL), cr = adderChain(id, xr, K, Y, insR);
    s += cl.svg + cr.svg;
    s += svgP([[xl + (cl.circle0 ? 11 : 0), Y(0)], [cx - 4, Y(0)]], id);
    s += svgP([[xr + (cr.circle0 ? 11 : 0), Y(0)], [W - 12, Y(0)]], id);
    s += delayChain(id, cx, 0, K, Y, function (j) { return sig('w', j); });
    return s;
  }, 540);
}
/* Direct Form I. Same o as df2Fig. Input-side delays (x) on the left, output-side delays (y) on the right. */
function df1Fig(o) {
  var b = o.b, a = o.a || [], M = b.length - 1, N = a.length, K = Math.max(M, N, 1);
  var rowH = 56, y0 = 42, W = 560, xx = 80, xs = 280, gB = xs - 90, gA = xs + 90, xy = 480, bw = 46, bh = 24;
  function Y(k) { return y0 + k * rowH; }
  return svgFig(W, Y(K) + 40, o.cap, o.label, function (id) {
    var s = svgT(10, y0 - 12, 'x(n)', 'sm', 'start') + svgT(W - 12, y0 - 12, 'y(n)', 'sm', 'end'), k, ins = [];
    for (k = 0; k <= K; k++) ins.push([]);
    for (k = 0; k <= M; k++) if (b[k] !== 0) {
      ins[k].push({ side: 'L', from: gB + bw / 2 });
      s += svgP([[xx, Y(k)], [gB - bw / 2, Y(k)]], id) + svgB(gB - bw / 2, Y(k) - bh / 2, bw, bh, gl(b[k]));
    }
    for (k = 1; k <= N; k++) if (a[k - 1] !== 0) {
      ins[k].push({ side: 'R', from: gA - bw / 2 });
      s += svgP([[xy, Y(k)], [gA + bw / 2, Y(k)]], id) + svgB(gA - bw / 2, Y(k) - bh / 2, bw, bh, gl(-a[k - 1]));
    }
    var c = adderChain(id, xs, K, Y, ins);
    s += c.svg + svgP([[10, Y(0)], [xx - 4, Y(0)]], id);
    s += svgP([[xs + (c.circle0 ? 11 : 0), Y(0)], [xy - 4, Y(0)]], id) + svgP([[xy, Y(0)], [W - 12, Y(0)]], id);
    s += delayChain(id, xx, 0, Math.max(M, 1), Y, function (j) { return j ? sig('x', j) : ''; });
    s += delayChain(id, xy, 0, Math.max(N, 1), Y, function (j) { return j ? sig('y', j) : ''; }, 'end');
    return s;
  }, 540);
}
