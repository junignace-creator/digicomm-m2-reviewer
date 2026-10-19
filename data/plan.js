/* Study plan: sessions of checkable tasks. Each task = [html, 'NNm']. Links: P(...problem ids), C(topicIndex, section[, toSection]). */
function P() { return Array.prototype.map.call(arguments, function (i) { return '<a data-goto="' + i + '">' + i + '</a>'; }).join(', '); }
function C(t, a, b) { return '<a data-concept="' + (t - 1) + ':' + (a - 1) + '">Topic ' + t + ' Concepts §' + a + (b && b !== a ? '–' + b : '') + '</a>'; }

var PLAN = {
  loop: [
    '<b>Read</b> the concept section slowly. Open every <i>? check yourself</i> box and answer it first.',
    '<b>Try</b> the matching problem for at least 5 minutes <i>before</i> opening the solution.',
    '<b>Compare:</b> show the solution and follow it step by step against the recipe.',
    '<b>Redo:</b> hide the solution and solve the same problem again from a blank page.',
    '<b>Grade honestly:</b> <i>Got it</i> only if the redo worked without peeking; otherwise <i>Missed</i>.'
  ],
  quick: null,
  sessions: []
};
