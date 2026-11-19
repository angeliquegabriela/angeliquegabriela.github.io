// Servidor local que imita o Cloudflare Pages: /a/b -> a/b.html, /a/ -> a/index.html, 404.html.
// Uso: node scripts/serve.mjs [porta].
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function resolve(urlPath) {
  const p = decodeURIComponent(urlPath.split('?')[0]);
  const cands = p.endsWith('/') ? [p + 'index.html'] : [p, p + '.html', p + '/index.html'];
  for (const c of cands) {
    const f = path.join(ROOT, c);
    if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

http.createServer((req, res) => {
  const f = resolve(req.url);
  const file = f || path.join(ROOT, '404.html');
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  let body = fs.readFileSync(file);
  const headers = { 'content-type': type, 'cache-control': f && req.url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' };
  if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body); headers['content-encoding'] = 'gzip'; }
  res.writeHead(f ? 200 : 404, headers);
  res.end(body);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
