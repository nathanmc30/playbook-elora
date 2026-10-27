// Playbook do SDR · ELORA — cada página é um arquivo .md em conteudo/; o botão Editar abre esse arquivo no GitHub.
(function () {
  const REPO = 'nathanmc30/playbook-elora';
  const RAMO = 'main';
  // Ordem do menu. Página nova: crie o .md em conteudo/ e acrescente uma linha aqui.
  const PAGINAS = [
    { id: 'inicio', arquivo: '00-mapa.md', menu: 'Início' },
    { id: '01-abrir-a-conversa', arquivo: '01-abrir-a-conversa.md', menu: '1. Abrir a conversa' },
    { id: '02-ouvir-a-dor', arquivo: '02-ouvir-a-dor.md', menu: '2. Ouvir a dor' },
    { id: '03-repetir-e-resolver', arquivo: '03-repetir-e-resolver.md', menu: '3. Repetir e resolver' },
    { id: '04-convidar-e-horarios', arquivo: '04-convidar-e-horarios.md', menu: '4. Convidar e oferecer horários' },
    { id: '05-amarrar', arquivo: '05-amarrar.md', menu: '5. Amarrar: marcar, confirmar e lembrar' },
    { id: '06-objecoes', arquivo: '06-objecoes.md', menu: '6. Objeções' },
    { id: '07-quando-some', arquivo: '07-quando-some.md', menu: '7. Quando some' },
    { id: '08-faltou-ou-cancelou', arquivo: '08-faltou-ou-cancelou.md', menu: '8. Faltou ou cancelou' },
    { id: '09-orcamento-e-fechamento', arquivo: '09-orcamento-e-fechamento.md', menu: '9. Orçamento e fechamento' },
    { id: '10-seu-dia-e-kommo', arquivo: '10-seu-dia-e-kommo.md', menu: '10. Seu dia e o Kommo' },
    { id: 'anexo-a', arquivo: 'A-biblioteca-de-mensagens.md', menu: 'Anexo A. Biblioteca de mensagens' },
  ];
  const porArquivo = Object.fromEntries(PAGINAS.map(p => [p.arquivo, p]));
  const fontes = {}; // id -> markdown

  const $ = id => document.getElementById(id);
  const texto = $('texto'), editar = $('editar'), vizinhos = $('vizinhos');
  const lista = $('paginas'), busca = $('busca'), resultados = $('resultados');
  const lateral = $('lateral'), botaoMenu = document.querySelector('.menu');

  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // links para outro .md viram navegação interna; títulos ganham âncora
  marked.use({
    renderer: {
      link(href, title, text) {
        const alvo = href && porArquivo[href.replace(/^\.\//, '')];
        if (alvo) return `<a href="#/${alvo.id}">${text}</a>`;
        const t = title ? ` title="${title}"` : '';
        return `<a href="${href}"${t} target="_blank" rel="noopener">${text}</a>`;
      },
      heading(text, nivel, cru) {
        return `<h${nivel} id="${slug((cru || text).replace(/[*_`]/g, ''))}">${text}</h${nivel}>`;
      },
    },
  });

  async function carregar(p) {
    if (fontes[p.id] !== undefined) return fontes[p.id];
    const r = await fetch(`conteudo/${p.arquivo}`, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${p.arquivo}: ${r.status}`);
    fontes[p.id] = await r.text();
    return fontes[p.id];
  }

  // mensagem pronta (citação que começa com aspas) ganha botão Copiar; diálogo vira conversa
  function enfeitar(raiz) {
    raiz.querySelectorAll('blockquote').forEach(bq => {
      const plano = bq.textContent.trim();
      if (/^["“]/.test(plano)) {
        bq.classList.add('mensagem');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'copiar'; b.textContent = 'Copiar';
        b.addEventListener('click', async () => {
          const limpo = plano.replace(/^["“]\s*/, '').replace(/\s*["”]$/, '');
          try { await navigator.clipboard.writeText(limpo); b.textContent = 'Copiado'; }
          catch { b.textContent = 'Selecione e copie'; }
          setTimeout(() => { b.textContent = 'Copiar'; }, 1600);
        });
        bq.appendChild(b);
      } else if (/^(Paciente|SDR)\b/.test(plano)) {
        bq.classList.add('dialogo');
      }
    });
    raiz.querySelectorAll('table').forEach(t => {
      const caixa = document.createElement('div');
      caixa.className = 'tabela';
      t.parentNode.insertBefore(caixa, t);
      caixa.appendChild(t);
    });
  }

  function montarMenu(atual) {
    lista.innerHTML = PAGINAS.map(p =>
      `<li><a href="#/${p.id}"${p.id === atual ? ' aria-current="page"' : ''}>${p.menu}</a></li>`).join('');
  }

  async function mostrar() {
    const [, id = 'inicio', ancora] = (location.hash || '#/inicio').split('/');
    const p = PAGINAS.find(x => x.id === id) || PAGINAS[0];
    montarMenu(p.id);
    editar.href = `https://github.com/${REPO}/edit/${RAMO}/conteudo/${p.arquivo}`;
    fecharMenu();
    try {
      texto.innerHTML = marked.parse(await carregar(p));
      enfeitar(texto);
      const h1 = texto.querySelector('h1');
      document.title = (h1 ? h1.textContent + ' · ' : '') + 'Playbook do SDR · ELORA';
    } catch (e) {
      texto.innerHTML = `<p class="erro">Não consegui carregar esta página (${e.message}).</p>`;
    }
    const i = PAGINAS.indexOf(p);
    const ant = PAGINAS[i - 1], prox = PAGINAS[i + 1];
    vizinhos.innerHTML = (ant ? `<a class="ant" href="#/${ant.id}">← ${ant.menu}</a>` : '<span></span>') +
      (prox ? `<a class="prox" href="#/${prox.id}">${prox.menu} →</a>` : '');
    const alvo = ancora && document.getElementById(decodeURIComponent(ancora));
    if (alvo) alvo.scrollIntoView(); else window.scrollTo(0, 0);
  }

  // busca nos títulos de todas as páginas (situações, objeções, seções)
  async function indexar() {
    await Promise.all(PAGINAS.map(p => carregar(p).catch(() => '')));
  }
  function buscar(termo) {
    const q = slug(termo);
    if (q.length < 2) { resultados.hidden = true; lista.hidden = false; return; }
    const achados = [];
    PAGINAS.forEach(p => {
      (fontes[p.id] || '').split('\n').forEach(l => {
        const m = l.match(/^(#{2,3})\s+(.+)$/);
        if (m && slug(m[2]).includes(q)) achados.push({ p, titulo: m[2].replace(/[*_`]/g, '') });
      });
    });
    resultados.innerHTML = achados.length
      ? achados.slice(0, 30).map(a => `<li><a href="#/${a.p.id}/${slug(a.titulo)}">${a.titulo}<small>${a.p.menu}</small></a></li>`).join('')
      : '<li class="vazio">Nada com esse nome.</li>';
    resultados.hidden = false; lista.hidden = true;
  }
  busca.addEventListener('input', () => buscar(busca.value));
  resultados.addEventListener('click', e => { if (e.target.closest('a')) { busca.value = ''; buscar(''); } });

  function fecharMenu() { lateral.classList.remove('aberta'); botaoMenu.setAttribute('aria-expanded', 'false'); }
  botaoMenu.addEventListener('click', () => {
    const aberta = lateral.classList.toggle('aberta');
    botaoMenu.setAttribute('aria-expanded', String(aberta));
  });

  window.addEventListener('hashchange', mostrar);
  mostrar().then(indexar);
})();
