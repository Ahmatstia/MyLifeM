// Temporary localhost audit proxy. Adds SQLite-web isolation headers only.
// This does not modify Metro, app.json, deployment, or application source.
const http = require('node:http');
const server = http.createServer((req, res) => {
  const upstream = http.request({ hostname: '127.0.0.1', port: 8085, path: req.url, method: req.method, headers: req.headers }, response => {
    res.writeHead(response.statusCode, { ...response.headers, 'cross-origin-opener-policy': 'same-origin', 'cross-origin-embedder-policy': 'require-corp' });
    response.pipe(res);
  });
  upstream.on('error', error => { if (!res.headersSent) res.writeHead(502); res.end(String(error)); });
  req.pipe(upstream);
  req.on('aborted', () => upstream.destroy());
});
server.listen(8087, '127.0.0.1', () => console.log('Audit-only COI proxy on 127.0.0.1:8087; PID ' + process.pid));
