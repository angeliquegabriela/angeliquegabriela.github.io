// Transforma reports/audit.json em reports/relatorio-qualidade.md.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/audit.json'), 'utf8'));
// Pontuação de desempenho no modelo do Lighthouse 10+ (curvas log-normais oficiais, celular).
function logNormalScore(value, p10, median) {
  if (value <= 0) return 1;
  const sigma = Math.abs(Math.log(median / p10)) / (Math.SQRT2 * 0.9061938024368232);
  const z = Math.log(value / median) / (Math.SQRT2 * sigma);
  const erfc = x => { const t = 1 / (1 + 0.5 * Math.abs(x)); const r = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; };
  return Math.max(0, Math.min(1, 0.5 * erfc(z)));
}
const W = { fcp: [1800, 3000, 0.10], si: [3387, 5800, 0.10], lcp: [2500, 4000, 0.25], tbt: [200, 600, 0.30], cls: [0.1, 0.25, 0.25] };
const rows = Object.entries(a.perf).map(([u, m]) => {
  const si = m.fcp; // aproximação: sem filmstrip, Speed Index ≈ FCP em páginas que pintam o texto de uma vez
  const s = W.fcp[2] * logNormalScore(m.fcp, W.fcp[0], W.fcp[1]) + W.si[2] * logNormalScore(si, W.si[0], W.si[1]) + W.lcp[2] * logNormalScore(m.lcp, W.lcp[0], W.lcp[1]) + W.tbt[2] * logNormalScore(m.tbt, W.tbt[0], W.tbt[1]) + W.cls[2] * logNormalScore(m.cls, W.cls[0], W.cls[1]);
  return `| \`${u}\` | ${(m.fcp / 1000).toFixed(2)} s | ${(m.lcp / 1000).toFixed(2)} s | ${m.tbt} ms | ${m.cls} | ${m.transferKB} KB | ${Math.round(s * 100)} |`;
});
const issues = Object.entries(a.pages).filter(([, p]) => p.issues.length);
const md = `# Relatório de qualidade

Gerado por \`scripts/audit.mjs\` em ${new Date().toISOString().slice(0, 10)}, sobre ${a.summary.pages} páginas do sitemap.

> O Lighthouse oficial não pôde rodar neste ambiente (sem acesso ao registro do npm). Esta auditoria mede o mesmo que ele mede no celular, com Chromium, rede de 150 ms e 1,6 Mbps e CPU 4× mais lenta (perfil Moto G Power). O relatório oficial do Lighthouse é gerado automaticamente pelo workflow do GitHub depois de cada publicação, e o workflow falha se alguma categoria ficar abaixo de 90.

## Desempenho no celular

A nota estimada usa as curvas e os pesos do Lighthouse 10+ (FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%). Speed Index foi aproximado pelo FCP. Medido em servidor local: em produção, somam-se DNS e TLS, em geral de 0,1 a 0,3 s.

| Página | FCP | LCP | TBT | CLS | Transferido | Nota estimada |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Acessibilidade, SEO e boas práticas

- Páginas verificadas: ${a.summary.pages}. Problemas encontrados: ${a.summary.problems}.
- Teclado: o primeiro Tab leva ao link "Pular para o conteúdo" (${a.skipLinkFirst ? 'ok' : 'falhou'}); foco visível nos primeiros ${a.keyboard.length} elementos (${a.keyboardIssue ? a.keyboardIssue : 'ok'}).
- Verificado em todas as páginas: contraste de texto (WCAG AA), um único H1 e títulos sem saltos, nome acessível em links e botões, rótulos em campos, texto alternativo em imagens, IDs únicos, alvos de toque de pelo menos 24 × 24 px, ausência de rolagem horizontal a 390 px, title, description, canonical, Open Graph, idioma, dados estruturados (\`Person\` e, nos cases, \`CreativeWork\`), erros no console e conteúdo completo com JavaScript desligado.
${issues.length ? '\n### Pendências\n\n' + issues.map(([u, p]) => `- \`${u}\`: ${p.issues.join('; ')}`).join('\n') + '\n' : '\nNenhuma pendência nas verificações automáticas.\n'}
## Conteúdo sem JavaScript

| Página | Palavras no conteúdo principal |
| --- | --- |
${Object.entries(a.pages).map(([u, p]) => `| \`${u}\` | ${p.words} |`).join('\n')}
`;
fs.writeFileSync(path.join(ROOT, 'reports/relatorio-qualidade.md'), md);
console.log(md.split('\n').slice(0, 24).join('\n'));
