// Tiny static file server for local preview:  node serve.js  ->  http://localhost:8123
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = process.env.PORT || 8123;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.md': 'text/plain; charset=utf-8', '.json': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('not found'); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(port, () => console.log('DigiComm Module 2 reviewer on http://localhost:' + port));
