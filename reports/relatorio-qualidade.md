# Relatório de qualidade

Gerado por `scripts/audit.mjs` em 2026-11-18, sobre 22 páginas do sitemap.

> O Lighthouse oficial não pôde rodar neste ambiente (sem acesso ao registro do npm). Esta auditoria mede o mesmo que ele mede no celular, com Chromium, rede de 150 ms e 1,6 Mbps e CPU 4× mais lenta (perfil Moto G Power). O relatório oficial do Lighthouse é gerado automaticamente pelo workflow do GitHub depois de cada publicação, e o workflow falha se alguma categoria ficar abaixo de 90.

## Desempenho no celular

A nota estimada usa as curvas e os pesos do Lighthouse 10+ (FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%). Speed Index foi aproximado pelo FCP. Medido em servidor local: em produção, somam-se DNS e TLS, em geral de 0,1 a 0,3 s.

| Página | FCP | LCP | TBT | CLS | Transferido | Nota estimada |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 0.47 s | 0.47 s | 93 ms | 0 | 141 KB | 100 |
| `/projetos` | 0.44 s | 1.00 s | 41 ms | 0 | 182 KB | 100 |
| `/processo` | 0.50 s | 0.50 s | 87 ms | 0 | 73 KB | 100 |
| `/projetos/editora-futura` | 0.54 s | 0.54 s | 154 ms | 0 | 88 KB | 98 |
| `/en/` | 0.46 s | 0.46 s | 73 ms | 0 | 141 KB | 100 |
| `/projetos/mr-brain` | 0.47 s | 0.47 s | 83 ms | 0 | 108 KB | 100 |

## Acessibilidade, SEO e boas práticas

- Páginas verificadas: 22. Problemas encontrados: 0.
- Teclado: o primeiro Tab leva ao link "Pular para o conteúdo" (ok); foco visível nos primeiros 14 elementos (ok).
- Verificado em todas as páginas: contraste de texto (WCAG AA), um único H1 e títulos sem saltos, nome acessível em links e botões, rótulos em campos, texto alternativo em imagens, IDs únicos, alvos de toque de pelo menos 24 × 24 px, ausência de rolagem horizontal a 390 px, title, description, canonical, Open Graph, idioma, dados estruturados (`Person` e, nos cases, `CreativeWork`), erros no console e conteúdo completo com JavaScript desligado.

Nenhuma pendência nas verificações automáticas.

## Conteúdo sem JavaScript

| Página | Palavras no conteúdo principal |
| --- | --- |
| `/` | 407 |
| `/en/` | 403 |
| `/projetos` | 240 |
| `/en/projects` | 231 |
| `/processo` | 1705 |
| `/en/process` | 1687 |
| `/projetos/editora-futura` | 1919 |
| `/en/projects/editora-futura` | 1839 |
| `/projetos/lideranca-seedts` | 1269 |
| `/en/projects/lideranca-seedts` | 1149 |
| `/projetos/mr-brain` | 1936 |
| `/en/projects/mr-brain` | 1847 |
| `/projetos/chatbot-handoff` | 1134 |
| `/en/projects/chatbot-handoff` | 1086 |
| `/projetos/futura-kids` | 1248 |
| `/en/projects/futura-kids` | 1157 |
| `/projetos/hypha` | 1140 |
| `/en/projects/hypha` | 1074 |
| `/projetos/orbitos` | 565 |
| `/en/projects/orbitos` | 548 |
| `/projetos/designcollectors` | 788 |
| `/en/projects/designcollectors` | 739 |
