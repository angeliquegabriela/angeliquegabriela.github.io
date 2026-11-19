// Fonte única de dados do site.
// Edite aqui: nome, links, apresentação e textos da interface. O restante sai de src/content/.
// Campos sem dado ficam como [PREENCHER] (ocultos no site e listados em .cache/PENDENCIAS.md).

// Endereço público do site. No Netlify, a variável URL já vem preenchida com o endereço principal do site.
export const SITE_URL = (process.env.SITE_URL || process.env.URL || 'https://gabrielaangelique.netlify.app').replace(/\/$/, '');

export const PERSON = {
  name: 'Gabriela Angelique',
  email: 'briela.angelique@gmail.com',
  // CVs em PDF hospedados no próprio site: coloque os arquivos em src/assets/cv/
  // (gabriela-angelique-cv-pt.pdf e gabriela-angelique-cv-en.pdf). Sem a versão em inglês, as páginas em inglês usam a em português.
  cvFiles: { pt: 'gabriela-angelique-cv-pt.pdf', en: 'gabriela-angelique-cv-en.pdf' },
  // Sem o PDF local (ex.: build a partir do GitHub), os links de CV usam este endereço; vazio = sem link de CV
  cvUrl: '',
  jobTitle: { pt: 'Senior Product Designer', en: 'Senior Product Designer' },
  worksFor: 'Editora Futura',
  links: {
    linkedin: 'https://www.linkedin.com/in/gabrielaangelique/',
    github: 'https://github.com/angeliquegabriela',
    behance: 'https://www.behance.net/gabrielangelique',
    instagram: 'https://www.instagram.com/briela/',
    youtube: 'https://www.youtube.com/@brielangelique',
  },
  // Links fora do site por enquanto (continuam guardados aqui).
  hiddenLinks: ['behance'],
  // O widget de contribuições do GitHub fica desligado enquanto o perfil estiver vazio.
  showGithubGraph: false,
};

// Seções que podem ser ligadas e desligadas sem apagar conteúdo.
// log: false tira o Log do menu, da página inicial e do ar (os posts ficam em src/content/log).
// cv: false tira o CV de todo o site (links, terminal e PDF), mesmo com o PDF em src/assets/cv.
// process: false tira do ar a página Processo (/processo e /en/process), que redireciona para o início.
export const FEATURES = { log: false, cv: false, process: false };

// Página inicial: apresentação geral, sem nomes de empresas. Mostra 4 cases; os demais ficam em /projetos.
export const HOME = {
  title: {
    pt: 'Gabriela Angelique · Product Designer | UX | Conversation Design',
    en: 'Gabriela Angelique · Product Designer | UX | Conversation Design',
  },
  description: {
    pt: 'Portfólio de Gabriela Angelique, líder de design: equipes, design systems e IA aplicada na prática. Cases de EdTech com IA, chatbots, Web3 e design systems.',
    en: 'Portfolio of Gabriela Angelique, design leader: teams, design systems and AI applied in practice. Case studies in AI EdTech, chatbots, Web3 and design systems.',
  },
  intro: {
    pt: 'Líder de design com formação em engenharia e artes, atuando na construção de times, em design systems e no uso real da IA no trabalho.',
    en: 'A design leader with an engineering and arts background, working on team building, design systems and how AI is actually used in the work.',
  },
  featured: ['editora-futura', 'mr-brain', 'chatbot-handoff', 'futura-kids'],
};

// Ordem dos cases em /projetos e em "Próximo case". Só os cases desta lista são publicados.
// Cases com `hidden: true` no arquivo (como o Huzaar) ficam guardados em src/content, sem página nem link.
export const CASE_ORDER = ['editora-futura', 'mr-brain', 'chatbot-handoff', 'futura-kids', 'orbitos', 'designcollectors'];

// Ferramentas do Sobre, em grupos. Em `strong`, liste as ferramentas em que você é mais forte:
// elas ganham destaque e a legenda aparece. Vazio = nenhum destaque.
export const SKILLS = {
  groups: [
    { label: { pt: 'Design e prototipação', en: 'Design and prototyping' }, items: ['Figma', 'FigJam', 'Framer', 'Webflow', 'Zeplin'] },
    { label: { pt: 'Pesquisa e validação', en: 'Research and validation' }, items: ['Maze', 'Hotjar'] },
    { label: { pt: 'Colaboração e documentação', en: 'Collaboration and documentation' }, items: ['Miro', 'Notion', 'Whimsical'] },
    { label: { pt: 'IA e prototipação rápida', en: 'AI and rapid prototyping' }, items: ['Replit', 'Lovable', 'Midjourney'] },
  ],
  tech: ['React', 'JavaScript', 'HTML', 'CSS', 'Python'],
  strong: [],
};

// Textos da interface.
export const UI = {
  pt: {
    lang: 'pt-BR', ogLocale: 'pt_BR', other: 'en', otherLabel: 'EN', otherName: 'English',
    skip: 'Pular para o conteúdo', skipIntro: 'Pular intro', menu: 'Menu', close: 'Fechar',
    nav: { projects: 'Projetos', leadership: 'Liderança', process: 'Processo', about: 'Sobre', log: 'Log', contact: 'Contato' },
    cvLink: 'CV (PDF)', cvLinkFallback: 'CV (PDF)',
    statsLabel: 'Em números', caseStats: 'Números-chave', seeProjects: 'Ver projetos', projectsTitle: 'Projetos selecionados', allProjects: 'Ver todos os projetos', projectsIntro: 'Todos os cases, com problema, papel, decisões e resultados.', viewCase: 'Ver case',
    about: 'Sobre', aboutProcess: 'Como ela trabalha',
    log: 'Log', logIntro: 'Textos, notas e aprendizados sobre design, produto e tecnologia.', allPosts: 'Ver tudo', read: 'Ler', min: 'min de leitura', nextPost: 'Próximo post', backLog: 'Voltar ao Log',
    contact: 'Contato',
    terminalTitle: 'terminal', terminalHint: 'Digite ajuda e pressione Enter.', terminalLabel: 'Comando do terminal',
    footer: 'Feito bloco a bloco.', backTop: 'Voltar ao topo',
    case: {
      company: 'Empresa', role: 'Papel', period: 'Período', team: 'Time',
      next: 'Próximo case', back: 'Todos os projetos', breadcrumbHome: 'Início', breadcrumbProjects: 'Projetos',
      measure: 'Como foi medido',
    },
    process: {
      title: 'Processo', h1: 'Como ela trabalha', crumb: 'Processo',
      intro: 'Métodos, rituais e decisões que aparecem nos projetos, cada um com um exemplo real. No fim, como as métricas entram nas decisões.',
      onPage: 'Nesta página', example: 'Exemplo',
    },
    notFound: 'Página não encontrada', notFoundText: 'O endereço pode ter mudado. Os cases agora têm páginas próprias.', goHome: 'Ir para o início',
    newTab: '(abre em nova aba)', todo: 'Campo a preencher',
  },
  en: {
    lang: 'en', ogLocale: 'en_US', other: 'pt', otherLabel: 'PT', otherName: 'Português',
    skip: 'Skip to content', skipIntro: 'Skip intro', menu: 'Menu', close: 'Close',
    nav: { projects: 'Projects', leadership: 'Leadership', process: 'Process', about: 'About', log: 'Log', contact: 'Contact' },
    cvLink: 'CV (PDF)', cvLinkFallback: 'CV (PDF, in Portuguese)',
    statsLabel: 'In numbers', caseStats: 'Key numbers', seeProjects: 'See projects', projectsTitle: 'Selected projects', allProjects: 'See all projects', projectsIntro: 'Every case study, with the problem, the role, decisions and results.', viewCase: 'View case',
    about: 'About', aboutProcess: 'How she works',
    log: 'Log', logIntro: 'Writing, notes and lessons on design, product and technology.', allPosts: 'See all', read: 'Read', min: 'min read', nextPost: 'Next post', backLog: 'Back to Log',
    contact: 'Contact',
    terminalTitle: 'terminal', terminalHint: 'Type help and press Enter.', terminalLabel: 'Terminal command',
    footer: 'Built block by block.', backTop: 'Back to top',
    case: {
      company: 'Company', role: 'Role', period: 'Timeline', team: 'Team',
      next: 'Next case', back: 'All projects', breadcrumbHome: 'Home', breadcrumbProjects: 'Projects',
      measure: 'How it was measured',
    },
    process: {
      title: 'Process', h1: 'How she works', crumb: 'Process',
      intro: 'Methods, rituals and decisions that show up in the projects, each with a real example. At the end, how metrics feed decisions.',
      onPage: 'On this page', example: 'Example',
    },
    notFound: 'Page not found', notFoundText: 'The address may have changed. Case studies now have their own pages.', goHome: 'Go to home',
    newTab: '(opens in a new tab)', todo: 'Field to fill in',
  },
};

// Seções obrigatórias de todo case, na ordem (o build falha se faltar alguma).
export const CASE_SECTIONS = {
  pt: ['Contexto de negócio', 'Kick-off', 'Time e período', 'Hipótese', 'Pesquisa', 'Decisões e trade-offs', 'Solução', 'Validação', 'Como foi medido', 'Resultado pós-lançamento', 'Aprendizados'],
  en: ['Business context', 'Kick-off', 'Team and timeline', 'Hypothesis', 'Research', 'Decisions and trade-offs', 'Solution', 'Validation', 'How it was measured', 'Post-launch results', 'Learnings'],
};
