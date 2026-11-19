# Portfólio · Gabriela Angelique

Site estático do portfólio de **Gabriela Angelique**: Product Design, UX, Conversation Design, design systems e IA aplicada.

- Sem framework, sem iframe e sem imagens em base64: cada página é um arquivo HTML com o texto completo, legível por buscadores, robôs de IA, leitores de tela e quem desliga o JavaScript.
- Uma URL por case e por post do Log, em português e em inglês. A página inicial mostra 4 cases; todos ficam em `/projetos`.
- O build não tem dependências: `node build.mjs` gera tudo em `dist/`.

## Estrutura

```
build.mjs                 gerador do site (lê src/ e escreve dist/)
src/config.mjs            nome, links, apresentação, link do currículo (Google Drive), ordem dos cases e textos da interface
src/content/cases/pt|en   um arquivo Markdown por case (estrutura padrão obrigatória)
src/content/log/pt|en     posts do Log (inclui a Metrica); o Log está desligado em FEATURES.log
src/content/pages/pt|en   página Processo (desligada em FEATURES.process; os arquivos ficam só no computador)
src/assets/               CSS, JS (inclui a animação dos pássaros), fontes, imagens originais e o logo (icons/)
src/generated/            imagens otimizadas (AVIF/WebP) e imagens Open Graph
scripts/                  imagens, quadros de processo, favicon, Open Graph, servidor local e auditoria
.cache/PENDENCIAS.md      lista dos campos [PREENCHER], gerada a cada build (fica fora do site e do GitHub)
```

### URLs

| Página | Português | Inglês |
| --- | --- | --- |
| Início | `/` | `/en/` |
| Todos os projetos | `/projetos` | `/en/projects` |
| Case | `/projetos/editora-futura` | `/en/projects/editora-futura` |
| Log (desligado por enquanto) | `/log`, `/log/metrica` | `/en/log`, `/en/log/metrica` |

O CV está fora do site (`FEATURES.cv: false` em `src/config.mjs`). Para religar, mude para `true`: o PDF vai para `/cv/` (arquivos em `src/assets/cv/`, PT e EN; sem o EN, as páginas em inglês usam o PT). Com o Log desligado, `/log`, `/projetos/metrica` e os posts redirecionam para o início.

Links antigos no formato `#/projetos/...` redirecionam para a página nova.

## Editar o conteúdo

- **Cases:** edite `src/content/cases/pt/<case>.md` e o equivalente em `en/`. O topo (entre `---`) tem título, descrição, resumo em 3 linhas (`problem`, `did`, `result`), empresa, papel, período e time. O corpo precisa ter estas seções, nesta ordem (o build falha se faltar alguma): Contexto de negócio · Meu papel · Time e período · Hipótese · Pesquisa · Decisões e trade-offs · Solução · Validação · Como medimos · Resultado pós-lançamento · Aprendizados e o que faria diferente. Seções extras são permitidas.
- **Ocultar um case sem apagar:** coloque `hidden: true` no topo do arquivo e tire o case de `CASE_ORDER` (é o caso do Huzaar). Ele fica guardado em `src/content`, sem página, sem link e fora do sitemap.
- **Imagens:** coloque o arquivo em `src/assets/img/src/` e use `![texto alternativo descritivo](img:nome-do-arquivo)` no Markdown. Duas imagens em linhas seguidas viram uma grade.
- **Apresentação, cases em destaque e currículo:** em `src/config.mjs` (`HOME.featured` define os 4 cases da página inicial; `PERSON.email` e `PERSON.cvFiles` são o e-mail e os currículos).
- **Campos sem dado:** escreva `[PREENCHER]` ou `[PREENCHER: dica]`. A linha fica fora do site e entra em `.cache/PENDENCIAS.md`. Para ver os pendentes marcados no site, rode o build com `MOSTRAR_PENDENTES=1`.
- **Ligar e desligar seções e links:** em `src/config.mjs`, `FEATURES.log` liga o Log (menu, página inicial e páginas), `FEATURES.cv` liga o CV, `FEATURES.process` liga a página Processo e `PERSON.hiddenLinks` tira redes do site sem apagar o endereço (hoje, o Behance).
- **Quadros de processo e notas de pesquisa:** `node scripts/boards.mjs` gera os quadros no estilo FigJam (Editora Futura, Futura Kids e Mr. Brain), as notas no estilo Obsidian (Editora Futura) e a montagem da tela do Illustrator (Mr. Brain) a partir do texto dos cases, em PT e EN, como WebP em `src/assets/img/src`. As poses do Mr. Brain usadas nos quadros são recortadas das ilustrações originais (e7, e8 e e9). Para gerar só alguns, passe prefixos: `node scripts/boards.mjs ef_ mb_`. Depois, rode `npm run images`.
- **Pacote .zip:** para caber no limite de envio, o .zip não traz `src/generated/`. Antes de rodar `node build.mjs` a partir do .zip, rode `npm install` e `npm run assets` para recriar as imagens otimizadas. Para publicar sem rodar nada, use a pasta `dist/`, que já vem pronta.
- **Favicon:** o logo fica em `src/assets/icons/logo-source.png`; `node scripts/icons.mjs` gera `favicon.ico`, `favicon-32x32.png` e `apple-touch-icon.png` (180 × 180).

## Rodar no computador

Precisa do Node 20 ou mais novo.

```bash
npm install                       # sharp e playwright (só para imagens, favicon e Open Graph)
npx playwright install chromium
npm run assets                    # imagens otimizadas, favicon e Open Graph
npm run dev                       # gera o site e abre em http://localhost:8080
```

Para só gerar o HTML, basta `node build.mjs`.

## Publicar

- **GitHub Pages:** o arquivo `.github/workflows/pages.yml` gera e publica o site a cada envio para a branch `main`, em `https://angeliquegabriela.github.io`. Como o repositório se chama `angeliquegabriela.github.io`, o site fica na raiz do endereço. Em **Settings → Pages**, a fonte é **GitHub Actions**. O build ajusta sozinho endereço e caminhos (variáveis `SITE_URL` e `BASE_PATH`), inclusive se o repositório for renomeado para outra subpasta.
- **Netlify:** arraste a pasta `dist/` gerada no computador para o painel do Netlify (`https://gabrielaangelique.netlify.app`).

## Analítica (Umami)

1. Crie uma conta gratuita em [cloud.umami.is](https://cloud.umami.is), adicione o site e copie o **Website ID**.
2. No GitHub, coloque o ID na variável `UMAMI_WEBSITE_ID` (Settings › Secrets and variables › Actions › Variables). Sem ela, o site é publicado sem script de analítica.
Eventos registrados: `contato-linkedin`, `cv-abrir` (com o local do clique), `abrir-case` (com o case e o local), `ver-todos-projetos`, `case-view`, `terminal` e `scroll` (25%, 50%, 75% e 100%).

## Ser encontrada

- `robots.txt` libera buscadores e robôs de IA (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot e outros) e aponta o `sitemap.xml`, que lista todas as páginas com as versões PT/EN.
- Cada página tem title, description, canonical, hreflang, Open Graph com imagem 1200×630 e dados estruturados (`Person` com `sameAs` para LinkedIn, GitHub e Behance; `CreativeWork` e `BreadcrumbList` em cada case; `BlogPosting` no Log).
- **Google Search Console:** adicione a propriedade do domínio, verifique, envie `https://<seu-endereço>/sitemap.xml` e peça a indexação de `/`, `/projetos` e dos cases principais. Repita no Bing Webmaster Tools (dá para importar do Search Console).
- **Domínio próprio:** no GitHub, em Settings › Pages › Custom domain. O build usa o endereço que o GitHub informar para canonical, sitemap e Open Graph.

## Qualidade

- `npm run audit` (com `npm run dev` rodando) verifica contraste, títulos, textos alternativos, rótulos, alvos de toque, foco visível, conteúdo sem JavaScript, dados estruturados e métricas de carregamento no celular com rede e CPU limitadas. O resultado fica em `reports/audit.json`.

## Acessibilidade

Link "Pular para o conteúdo", foco visível em todos os elementos, navegação por teclado (Esc fecha menu e intro), `prefers-reduced-motion` respeitado, botão para pular a animação dos pássaros (que é desenhada por cima e nunca esconde o texto), contraste AA, textos alternativos descritivos e terminal com região `aria-live`.

## Arquivos que ficam só no seu computador

O PDF do CV (`src/assets/cv/`), os cases ocultos, a página Processo, parte dos posts do Log e as imagens usadas só neles não vão para o GitHub: estão no `.gitignore`. O build funciona sem eles.
