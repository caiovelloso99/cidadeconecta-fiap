/* =========================================================
   CidadeConecta - utilitários compartilhados por todas as páginas
   ========================================================= */

// ---- Armazenamento (localStorage com fallback seguro) ----
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('cc_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('cc_' + key, JSON.stringify(value)); } catch (e) { /* ignora */ }
  }
};

// ---- Escapa HTML para evitar injeção de código vindo de formulários ----
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtData = iso => new Date(iso).toLocaleDateString('pt-BR');
const fmtDataHora = iso => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// ---- Dados da cidade fictícia (usados em ocorrências e enchentes) ----
// vuln = vulnerabilidade a alagamentos (1 = baixa ... 5 = muito alta)
const REGIOES = [
  { id: 'norte',  nome: 'Zona Norte',  vuln: 1, bairros: ['Vila Esperança', 'Jardim das Flores', 'Alto da Serra'],
    desc: 'Região mais alta da cidade. Alagamentos são raros, mas encostas pedem atenção em chuvas longas (risco de deslizamento).' },
  { id: 'centro', nome: 'Centro',      vuln: 2, bairros: ['Sé Nova', 'Praça Velha', 'Mercado'],
    desc: 'Muito asfalto e pouca área de infiltração. Bueiros entupidos causam alagamentos pontuais em ruas e avenidas.' },
  { id: 'oeste',  nome: 'Zona Oeste',  vuln: 3, bairros: ['Vila Industrial', 'Morro Verde', 'Cohab Nova'],
    desc: 'Relevo misto. Córregos canalizados podem transbordar com chuva forte e cheia de bueiros.' },
  { id: 'sul',    nome: 'Zona Sul',    vuln: 3, bairros: ['Parque Aurora', 'Vila Nova', 'Jardim Ipê'],
    desc: 'Áreas planas e baixas, com drenagem antiga. Pontos de alagamento recorrentes em dias de temporal.' },
  { id: 'leste',  nome: 'Zona Leste',  vuln: 5, bairros: ['Beira-Rio', 'Várzea Alegre', 'Santa Clara'],
    desc: 'Região de várzea ao lado do rio. É a mais exposta a enchentes e a primeira a receber alertas.' }
];
const bairroParaRegiao = b => (REGIOES.find(r => r.bairros.includes(b)) || {}).id;

const TIPOS_OCORRENCIA = ['Buraco na via', 'Poste sem luz', 'Calçada quebrada', 'Bueiro entupido', 'Alagamento', 'Lixo / entulho', 'Árvore em risco', 'Outro'];
const STATUS = [
  { id: 'aberto',    nome: 'Aberto' },
  { id: 'analise',   nome: 'Em análise' },
  { id: 'andamento', nome: 'Em andamento' },
  { id: 'resolvido', nome: 'Resolvido' }
];
const statusNome = id => (STATUS.find(s => s.id === id) || {}).nome || id;

// ---- Ocorrências: carrega do localStorage ou cria exemplos iniciais ----
function diasAtras(n) { return new Date(Date.now() - n * 86400000).toISOString(); }

function seedOcorrencias() {
  const base = [
    { tipo: 'Buraco na via', bairro: 'Vila Nova', endereco: 'Rua das Acácias, 120', descricao: 'Buraco grande no meio da rua, já causou dano em dois carros.', gravidade: 'alta', status: 'andamento', dias: 9, apoios: 14 },
    { tipo: 'Poste sem luz', bairro: 'Jardim das Flores', endereco: 'Av. Brasil, em frente ao nº 800', descricao: 'Poste apagado há mais de uma semana. Rua muito escura à noite.', gravidade: 'media', status: 'analise', dias: 5, apoios: 8 },
    { tipo: 'Bueiro entupido', bairro: 'Beira-Rio', endereco: 'Rua do Porto, esquina com Rua 7', descricao: 'Bueiro cheio de lixo. Alaga a rua inteira quando chove.', gravidade: 'alta', status: 'aberto', dias: 2, apoios: 21 },
    { tipo: 'Calçada quebrada', bairro: 'Sé Nova', endereco: 'Praça Central, lado norte', descricao: 'Calçada com buracos e lajotas soltas, perigosa para idosos e cadeirantes.', gravidade: 'media', status: 'resolvido', dias: 20, apoios: 6 },
    { tipo: 'Alagamento', bairro: 'Várzea Alegre', endereco: 'Rua dos Ipês, 45', descricao: 'Água acumulada na rua por dias após a última chuva.', gravidade: 'alta', status: 'analise', dias: 3, apoios: 17 },
    { tipo: 'Lixo / entulho', bairro: 'Cohab Nova', endereco: 'Terreno ao lado da escola municipal', descricao: 'Entulho acumulado atraindo ratos e mosquitos.', gravidade: 'baixa', status: 'aberto', dias: 1, apoios: 3 },
    { tipo: 'Árvore em risco', bairro: 'Alto da Serra', endereco: 'Rua da Encosta, 300', descricao: 'Árvore inclinada sobre a fiação, com risco de queda.', gravidade: 'media', status: 'resolvido', dias: 15, apoios: 5 }
  ];
  return base.map((o, i) => {
    const criada = diasAtras(o.dias);
    const hist = [{ status: 'aberto', data: criada, nota: 'Ocorrência registrada pelo cidadão.' }];
    if (o.status !== 'aberto') hist.push({ status: 'analise', data: diasAtras(o.dias - 1), nota: 'Equipe da prefeitura analisando o caso.' });
    if (o.status === 'andamento' || o.status === 'resolvido') hist.push({ status: 'andamento', data: diasAtras(Math.max(o.dias - 3, 0)), nota: 'Equipe enviada ao local.' });
    if (o.status === 'resolvido') hist.push({ status: 'resolvido', data: diasAtras(Math.max(o.dias - 6, 0)), nota: 'Problema solucionado.' });
    return {
      id: 'seed' + i, protocolo: 'CC-2026-' + String(1001 + i),
      tipo: o.tipo, bairro: o.bairro, endereco: o.endereco, descricao: o.descricao,
      gravidade: o.gravidade, status: o.status, criada, apoios: o.apoios, historico: hist
    };
  });
}

function getOcorrencias() {
  let lista = Store.get('ocorrencias', null);
  if (!lista) { lista = seedOcorrencias(); Store.set('ocorrencias', lista); }
  return lista;
}
const saveOcorrencias = l => Store.set('ocorrencias', l);

// ---- Cálculo de risco de enchente (simulação) ----
// fator = intensidade da chuva (mm/h) / 20 + bônus de solo encharcado
// pontuação = vulnerabilidade da região * fator
const NIVEIS = [
  { id: 'baixo',    nome: 'Baixo',    max: 3 },
  { id: 'moderado', nome: 'Moderado', max: 6 },
  { id: 'alto',     nome: 'Alto',     max: 10 },
  { id: 'critico',  nome: 'Crítico',  max: Infinity }
];
function calcularRisco(regiao, chuva, solo) {
  const bonus = { seco: 0, umido: 0.5, encharcado: 1 }[solo] || 0;
  const pontos = regiao.vuln * (chuva / 20 + bonus);
  return NIVEIS.find(n => pontos < n.max);
}
const getSimulacao = () => Store.get('sim', { chuva: 25, solo: 'umido' });

// ---- Toast (mensagem rápida) ----
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}

// ---- Cabeçalho e rodapé injetados em todas as páginas ----
function montarLayout() {
  const pagina = document.body.dataset.page;
  const links = [
    ['index', 'index.html', 'Início'],
    ['ocorrencias', 'ocorrencias.html', 'Ocorrências'],
    ['enchentes', 'enchentes.html', 'Enchentes'],
    ['servicos', 'servicos.html', 'Serviços Públicos'],
    ['sobre', 'sobre.html', 'Sobre / Contato']
  ];
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container nav">
      <a class="brand" href="index.html" aria-label="CidadeConecta - página inicial">🏙️ Cidade<span>Conecta</span></a>
      <nav aria-label="Principal" style="flex:1">
        <ul id="menu" style="justify-content:flex-end">
          ${links.map(l => `<li><a class="link ${l[0] === pagina ? 'active' : ''}" href="${l[1]}" ${l[0] === pagina ? 'aria-current="page"' : ''}>${l[2]}</a></li>`).join('')}
        </ul>
      </nav>
      <div class="nav-tools">
        <button class="icon-btn" id="tema" aria-label="Alternar modo escuro">🌙</button>
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Abrir menu" aria-expanded="false">☰</button>
      </div>
    </div>`;
  document.body.prepend(header);

  const skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#conteudo'; skip.textContent = 'Pular para o conteúdo';
  document.body.prepend(skip);

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container cols">
      <div><strong>CidadeConecta</strong> — Projeto acadêmico FIAP · Global Solution<br>
      Os dados exibidos (bairros, ocorrências e níveis de risco) são fictícios e servem apenas para demonstração.</div>
      <div><strong>Emergências:</strong> Defesa Civil 199 · Bombeiros 193 · SAMU 192 · Polícia 190</div>
    </div>`;
  document.body.appendChild(footer);

  // Menu mobile
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  btn.addEventListener('click', () => {
    const aberto = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', aberto);
  });

  // Tema claro/escuro
  const aplicarTema = t => {
    document.documentElement.dataset.theme = t;
    document.getElementById('tema').textContent = t === 'dark' ? '☀️' : '🌙';
  };
  aplicarTema(Store.get('tema', 'light'));
  document.getElementById('tema').addEventListener('click', () => {
    const novo = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    Store.set('tema', novo);
    aplicarTema(novo);
  });
}

// aplica o tema salvo o mais cedo possível (evita "piscar" branco)
document.documentElement.dataset.theme = Store.get('tema', 'light');
document.addEventListener('DOMContentLoaded', montarLayout);
