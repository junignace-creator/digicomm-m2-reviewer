/* Inline math: wrap formula-like runs in prose with <span class="m"> (STIX math font, italic variables).
   Works on HTML strings. Skips <svg>, .math-block and <code>. Pure function, also loadable in Node for testing. */
var inlineMath = (function () {
  var SUB = '(?:\\u0001[^\\u0002]*\\u0002|\\u0003[^\\u0004]*\\u0004|[₀-₉ₐ-ₜ⁰-⁹⁺⁻ⁿⁱᴹᴺᵏᵐ¹²³]+)';
  var FN = '(?:cos|sin|tan|log|ln|lim|max|min|lcm|exp)';
  var ARGS = '\\((?:[^()]|\\([^()]*\\))*\\)';
  var SYM = '(?<![A-Za-z])[A-Za-z](?![A-Za-z])';
  var GRK = '[Α-Ωα-ω]', NUM = '\\d+(?:\\.\\d+)?';
  var GROUP = '\\((?=[^()]*[=+−·×/<>≤≥≈\\u0001\\u0003\\d])(?:[^()]|\\([^()]*\\))*\\)';
  var TOK = '(?:' + FN + ARGS + '|(?:' + SYM + '|' + GRK + '|' + NUM + ')' + SUB + '*(?:' + ARGS + ')?|\\{[^{}]*\\}|' + GROUP + ')';
  var OP = '(?:[=+−·×*/≤≥≈≠∼→↔<>]|&lt;|&gt;)', SEP = '(?:\\s|&nbsp;)*';
  var RUN = '[−+]?' + TOK + '(?:' + SEP + OP + '+' + SEP + '[−+]?' + TOK + ')+';
  var STRONG = '(?:' + FN + ARGS + '|(?:' + SYM + '|' + GRK + '|' + NUM + ')' + SUB + '+(?:' + ARGS + ')?|' + SYM + ARGS + '|' + GRK + '(?:' + ARGS + ')?|\\{[^{}]*\\})';
  var LONE = '(?<![A-Za-z(\u0001-\u0004\'’.])[b-zB-HJ-Z](?![A-Za-z)0-9\u0001-\u0004.])';
  var RE = new RegExp(RUN + '|' + STRONG + '|' + LONE, 'g');

  function italic(s) {
    return s.replace(/[A-Za-z]+/g, function (m) { return (m.length === 1 && 'ejd'.indexOf(m) < 0) ? '<i>' + m + '</i>' : m; })
      .replace(/[α-ω]/g, function (c) { return c === 'π' ? c : '<i>' + c + '</i>'; });
  }
  return function (html) {
    var prot = [];
    html = html.replace(/<svg[\s\S]*?<\/svg>|<div class="math-block">[\s\S]*?<\/div>|<code>[\s\S]*?<\/code>/g, function (m) {
      prot.push(m); return String.fromCharCode(0xE000 + prot.length - 1);
    });
    html = html.replace(/<sub>([^<]*)<\/sub>/g, '\u0001$1\u0002').replace(/<sup>([^<]*)<\/sup>/g, '\u0003$1\u0004');
    html = html.split(/(<[^>]*>)/).map(function (seg) {
      if (seg.charAt(0) === '<') return seg;
      return seg.replace(RE, function (m) { return '<span class="m">' + italic(m) + '</span>'; });
    }).join('');
    html = html.replace(/\u0001/g, '<sub>').replace(/\u0002/g, '</sub>').replace(/\u0003/g, '<sup>').replace(/\u0004/g, '</sup>');
    return html.replace(/[\uE000-\uF8FF]/g, function (c) { return prot[c.charCodeAt(0) - 0xE000]; });
  };
})();
