---
slug: chatbot-handoff
short: Service desk de chatbot
title: Quando chatbots não são suficientes
kicker: Product Design · Conversation Design · UX Research · MoSCoW · Testes de usabilidade
subtitle: O redesign do service desk que faz a passagem do chatbot para o atendente humano
seoTitle: Service desk de chatbot: handoff do bot para o atendente humano
description: Case de UX e produto na Rhizom: pesquisa, personas, MoSCoW, user stories e duas rodadas de teste no Maze para o handoff do chatbot ao atendente.
card: O service desk que resolve a passagem do chatbot para o atendente humano, priorizado com MoSCoW e validado com usuários.
cover: c_cover
coverAlt: Ícone de robô em forma de balão de conversa, com rosto sorridente em pixel, sobre fundo roxo com padrão de personagens
skills: [Conversation Design, UX Research, MoSCoW, User Stories, Backlog, Testes de usabilidade, Maze, Ant Design]
company: Rhizom · plataforma de chatbots B2B
role: UX/UI Designer
period: Entre 2018 e 2022, na Rhizom
team: 1 UX/UI Designer, 1 PO e 3 devs
stat1: 4 | fontes de pesquisa cruzadas
stat2: 5 | necessidades encontradas
stat3: 2 | rodadas de teste no Maze
stat4: 100% | dos testadores acharam fáceis as demais missões na 2ª rodada
---

## Sobre o projeto

O service desk da plataforma de chatbots da Rhizom é onde um atendente humano assume a conversa quando o bot não dá conta. A versão nativa só permitia assumir a conversa e devolvê-la ao bot, e por isso clientes pagavam a mais para integrar outro service desk. O projeto redesenhou essa passagem do chatbot para o atendente.

## Desafios

- Descobrir por que os clientes pagavam por outro service desk em vez de usar o nativo.
- Ir além do "assumir e devolver": histórico, prioridade, notificações, transferência e encerramento.
- Caber no MVP, com escopo priorizado junto com o PO e os devs.
- Validar o fluxo principal com usuários antes do desenvolvimento.

<!-- fim-topo -->

## Contexto de negócio

Assistentes virtuais nem sempre dão conta de cenários inesperados, e muitos usuários ainda os acham frios ou confusos. Quando um humano é necessário no meio da conversa, o fluxo do chatbot prevê a passagem para um atendente.

O service desk nativo da plataforma da Rhizom era um MVP: só permitia assumir a conversa e devolvê-la ao bot. Clientes que precisavam de mais preferiam pagar para integrar outra solução. Descobrir por quê virou o ponto de partida.

![Fluxo do chatbot com a etapa de controle humano](img:c12)

## Kick-off

O ponto de partida do projeto:

- **Objetivo:** entender por que clientes preferiam pagar por outro service desk e entregar um MVP que resolvesse o que vem depois de assumir a conversa.
- **Perfis atendidos:** atendentes e administradores de service desk.
- **Escopo de UX/UI:** o plano de pesquisa, as personas, a arquitetura da tela em três colunas, as métricas do painel de administração, o roteiro dos testes no Maze e as user stories do backlog.
- **Responsabilidades:** UX/UI com a designer do projeto; a priorização MoSCoW, em conjunto com o PO e os devs, por viabilidade e prazo; o desenvolvimento, com os 3 devs.
- **Como medir:** testes de usabilidade no Maze, com missões baseadas em Jobs to Be Done.

## Time e período

- **Time:** 1 UX/UI Designer, 1 PO e 3 devs.
- **Período:** entre 2018 e 2022, na Rhizom.
- **Ferramentas:** Figma, Maze e Ant Design.

## Hipótese

Pergunta de partida: por que clientes preferiam pagar por outro service desk em vez de usar o nativo?

Hipótese de trabalho: os clientes integravam outras soluções porque o service desk nativo parava no "assumir e devolver". A pesquisa testou essa leitura com quatro fontes e a confirmou, já que as cinco necessidades encontradas aparecem todas depois que o atendente assume a conversa.

## Pesquisa

A pesquisa cruzou quatro fontes:

- **Uso próprio e observação:** o service desk foi usado em um chatbot da própria designer, e atendentes da empresa foram observados, com consentimento.
- **Questionário** com clientes que já tinham testado a solução.
- **Entrevistas** com usuários atuais e antigos.
- **Desk research** das soluções que eles citavam.

O resultado foram cinco necessidades claras: histórico do cliente, priorização, notificações, encerrar ou transferir a conversa e um painel de administração.

Duas personas guiaram as decisões: **Mayara**, 23 anos, estudante de TI e atendente que já usou vários service desks, e **Felipe**, 32 anos, administrador de service desk e chefe de atendimento. As dores que eles compartilhavam:

- **Interface complicada:** curva de aprendizado longa; novos atendentes demoravam para render.
- **Ações limitadas:** não dava para transferir para outro atendente nem encerrar.
- **Sem prioridade:** nenhuma etiqueta, prioridade ou tipo de conversa.
- **Sem histórico:** o atendente começava cada conversa sem contexto.
- **Sem métricas:** administradores sabiam pouco sobre o desempenho do time.

![Matriz CSD com certezas, suposições e dúvidas do projeto](img:c11)

## Decisões e trade-offs

- **MoSCoW para caber no MVP.** A pesquisa gerou mais oportunidades do que cabia na primeira entrega. A priorização foi por viabilidade e prazo, separando desejos de necessidades.
- **User stories centradas nas personas,** como "Como atendente, quero ver minha fila de conversas atribuídas para priorizar meu atendimento".
- **Ant Design, a mesma biblioteca da plataforma:** a interface nova reaproveita os componentes que o produto já usava.

Na matriz MoSCoW, cada funcionalidade ganhou um lugar: o que precisava entrar no MVP, o que deveria entrar, o que poderia entrar e o que ficaria de fora.

![Priorização MoSCoW das funcionalidades](img:c8)

Depois da priorização, cada funcionalidade virou uma user story no backlog, escrita a partir das personas.

![User stories no backlog](img:c7)

## Solução

Três colunas, com todas as ações à mão:

- **À esquerda:** lista de chats com busca, filtro e a fila do grupo.
- **No centro:** a conversa, com o canal de origem e os comandos para assumir, priorizar, transferir e encerrar.
- **À direita:** painel recolhível com dados e histórico do cliente, onde o atendente define prioridade e tipo, adiciona tags e comentários.

![Service desk em alta fidelidade com lista de chats à esquerda, conversa no centro e detalhes do cliente à direita](img:c3)

Para administradores, um dashboard reúne as métricas que surgiram nas entrevistas: chats ativos, chats na fila, chats sem atendente, atendentes disponíveis, tempo médio de chat, tempo médio de espera, taxa de abandono e distribuição por status, tipo e prioridade.

![Dashboard de administração com métricas de atendimento](img:c2)

## Validação

Do quadro branco ao Figma, o protótipo foi testado no Maze com missões baseadas em Jobs to Be Done, de forma remota e não moderada.

- **Primeira rodada:** a missão de encontrar um chat novo e sem prioridade teve muitos cliques errados. Era um caso típico de administrador, não de atendente. O protótipo e a missão foram ajustados.
- **Segunda rodada:** a tarefa crítica passou a ser avaliada como fácil e a experiência como intuitiva. As demais missões foram avaliadas como fáceis por 100% dos testadores, sem desistências.

![Resultados do teste de usabilidade no Maze](img:c4)

## Como foi medido

- **Objetivo e hipótese:** entender por que clientes pagavam por outro service desk e entregar um MVP que resolvesse o que vem depois de assumir a conversa. A hipótese: o service desk nativo parava no "assumir e devolver".
- **Métrica norte:** facilidade da tarefa crítica no teste de usabilidade, avaliada por quem testou, porque o MVP só faria sentido se o fluxo principal funcionasse.
- **Métricas de apoio:** cliques errados, desistências e facilidade das demais missões.
- **Coleta:** Maze, de forma remota e não moderada, com missões baseadas em Jobs to Be Done, em duas rodadas. A linha de base é a primeira rodada.
- **Coleta, amostra:** [PREENCHER: quantas pessoas testaram em cada rodada?]
- **Resultado (antes → depois):** na primeira rodada, a missão crítica teve muitos cliques errados. Na segunda, a tarefa crítica passou a ser avaliada como fácil e as demais missões foram avaliadas como fáceis por 100% dos testadores, sem desistências.
- **O que mudou na decisão:** a primeira rodada mostrou que a missão crítica era típica do administrador, não do atendente. O protótipo e a missão foram ajustados e, depois da segunda rodada, o MVP seguiu para desenvolvimento.
- **Limitações do dado:** o teste foi feito com protótipo, não com uso real, e o material do projeto não traz dados depois do lançamento.

## Resultado pós-lançamento

- O MVP foi definido e seguiu para desenvolvimento.

## Aprendizados

- A primeira rodada mostrou que a missão crítica refletia o trabalho do administrador, não do atendente. Missões de teste precisam partir da persona certa.
- Para uma próxima vez: separar desde a primeira rodada os roteiros de atendente e de administrador, para não misturar no mesmo teste tarefas das duas personas.
