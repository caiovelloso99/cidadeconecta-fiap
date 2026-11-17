/* Página de enchentes: simulador de risco, mapa, alertas, orientações e kit */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const estado = { ...getSimulacao(), regiao: 'leste' };

  const ORIENTACOES = {
    antes: [
      'Acompanhe os alertas da Defesa Civil (telefone 199) e da previsão do tempo.',
      'Separe o kit de emergência e deixe-o em local alto e de fácil acesso.',
      'Guarde documentos importantes em saco plástico ou pasta impermeável.',
      'Combine com a família um ponto de encontro e um plano de saída.',
      'Não jogue lixo nas ruas ou bueiros: isso piora os alagamentos.',
      'Se mora perto de rio ou encosta, identifique o abrigo mais próximo.'
    ],
    durante: [
      'Desligue a energia elétrica e o gás se a água começar a entrar em casa.',
      'Nunca atravesse ruas alagadas a pé ou de carro: 30 cm de água já podem arrastar um veículo.',
      'Evite tocar em fios, postes e aparelhos ligados à tomada.',
      'Procure um local alto e seguro; siga para o abrigo se for orientado.',
      'Ajude primeiro crianças, idosos e pessoas com deficiência.',
      'Ligue 193 (Bombeiros) ou 199 (Defesa Civil) em caso de risco de vida.'
    ],
    depois: [
      'Só volte para casa quando as autoridades liberarem.',
      'Não consuma alimentos que tiveram contato com a água; descarte-os.',
      'Use botas e luvas na limpeza; a água de enchente pode transmitir doenças (como leptospirose).',
      'Ferva ou clore a água de beber até a rede ser considerada segura.',
      'Antes de religar a energia, peça a um eletricista para verificar a instalação.',
      'Registre o problema na página de Ocorrências para que a prefeitura possa agir.'
    ]
  };

  const KIT = ['Água potável (3 litros por pessoa)', 'Alimentos não perecíveis', 'Lanterna e pilhas extras', 'Rádio a pilha',
    'Kit de primeiros socorros', 'Remédios de uso contínuo', 'Documentos em saco plástico', 'Carregador portátil (power bank)',
    'Apito para pedir ajuda', 'Cópia dos telefones de emergência'];

  const ACOES = {
    baixo: 'Sem risco imediato. Mantenha-se informado.',
    moderado: 'Atenção: pontos de alagamento podem surgir. Evite áreas baixas e redobre o cuidado ao dirigir.',
    alto: 'Risco alto de alagamento. Evite sair de casa, afaste-se de córregos e prepare o kit de emergência.',
    critico: 'RISCO CRÍTICO. Se mora em área alagável, deixe o local e siga para um abrigo. Ligue 199 se precisar de ajuda.'
  };

  // ---------- Atualização principal ----------
  function atualizar() {
    Store.set('sim', { chuva: estado.chuva, solo: estado.solo });
    $('chuvaValor').textContent = estado.chuva + ' mm/h';
    $('chuva').value = estado.chuva;
    $('solo').value = estado.solo;

    const riscos = REGIOES.map(r => ({ regiao: r, nivel: calcularRisco(r, estado.chuva, estado.solo) }));

    // cores do mapa
    riscos.forEach(({ regiao, nivel }) => {
      const g = document.querySelector(`.zone-g[data-id="${regiao.id}"]`);
      const rect = g.querySelector('.zone');
      rect.setAttribute('class', `zone level-${nivel.id}` + (estado.regiao === regiao.id ? ' selected' : ''));
      g.querySelector('.zone-label').classList.toggle('dark', nivel.id === 'moderado');
      g.setAttribute('aria-label', `${regiao.nome}: risco ${nivel.nome.toLowerCase()}`);
    });

    // detalhes da região escolhida
    const sel = riscos.find(r => r.regiao.id === estado.regiao);
    $('detalheRegiao').innerHTML = `
      <h2>${esc(sel.regiao.nome)} <span class="badge b-${sel.nivel.id}">Risco ${sel.nivel.nome}</span></h2>
      <p>${esc(sel.regiao.desc)}</p>
      <p><strong>O que fazer agora:</strong> ${ACOES[sel.nivel.id]}</p>
      <p class="muted small">Bairros: ${sel.regiao.bairros.map(esc).join(', ')}.<br>
      Vulnerabilidade da região: ${'●'.repeat(sel.regiao.vuln)}${'○'.repeat(5 - sel.regiao.vuln)} (${sel.regiao.vuln}/5)</p>`;

    // alertas (ordem do mais grave para o menos grave)
    const ativos = riscos.filter(r => r.nivel.id !== 'baixo')
      .sort((a, b) => NIVEIS.indexOf(b.nivel) - NIVEIS.indexOf(a.nivel));
    $('alertas').innerHTML = ativos.length
      ? ativos.map(({ regiao, nivel }) => `
        <div class="alert ${nivel.id}">
          <strong>${esc(regiao.nome)} — alerta ${nivel.nome.toLowerCase()}</strong><br>
          <span class="small">${ACOES[nivel.id]}</span>
        </div>`).join('')
      : '<div class="alert baixo"><strong>Nenhum alerta ativo.</strong><br><span class="small">Com a chuva atual, todas as regiões estão com risco baixo.</span></div>';

    relacionadas();
  }

  // ---------- Integração com as ocorrências ----------
  function relacionadas() {
    const abertas = getOcorrencias().filter(o =>
      ['Bueiro entupido', 'Alagamento'].includes(o.tipo) && o.status !== 'resolvido');
    $('relacionadas').innerHTML = abertas.length
      ? abertas.map(o => {
          const r = REGIOES.find(x => x.id === bairroParaRegiao(o.bairro));
          return `<li>📍 <strong>${esc(o.tipo)}</strong> — ${esc(o.bairro)}${r ? ' (' + esc(r.nome) + ')' : ''}
                  <span class="badge b-${o.status}">${statusNome(o.status)}</span></li>`;
        }).join('')
      : '<li class="muted">Nenhuma ocorrência pendente. 🎉</li>';
  }

  // ---------- Controles ----------
  $('chuva').addEventListener('input', e => { estado.chuva = Number(e.target.value); atualizar(); });
  $('solo').addEventListener('change', e => { estado.solo = e.target.value; atualizar(); });
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const [chuva, solo] = b.dataset.preset.split(',');
    estado.chuva = Number(chuva); estado.solo = solo; atualizar();
  }));
  document.querySelectorAll('.zone-g').forEach(g => {
    const escolher = () => { estado.regiao = g.dataset.id; atualizar(); };
    g.addEventListener('click', escolher);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(); } });
  });

  // ---------- Abas de orientação ----------
  function abrirAba(nome) {
    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === nome));
    $('painelOrient').setAttribute('aria-labelledby', 'tab-' + nome);
    $('painelOrient').innerHTML = '<ul class="clean">' + ORIENTACOES[nome].map(t => `<li>✅ ${t}</li>`).join('') + '</ul>';
  }
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => abrirAba(t.dataset.tab)));
  abrirAba('antes');

  // ---------- Kit de emergência (salvo no localStorage) ----------
  let marcados = new Set(Store.get('kit', []));
  function renderKit() {
    $('kit').innerHTML = KIT.map((item, i) => `
      <li><label><input type="checkbox" data-i="${i}" ${marcados.has(i) ? 'checked' : ''}> ${item}</label></li>`).join('');
    const pct = Math.round(marcados.size / KIT.length * 100);
    $('barraKitFill').style.width = pct + '%';
    $('barraKit').setAttribute('aria-valuenow', pct);
    $('kitTexto').textContent = `${marcados.size} de ${KIT.length} itens (${pct}%)` + (pct === 100 ? ' — kit completo! 👏' : '');
  }
  $('kit').addEventListener('change', e => {
    const i = Number(e.target.dataset.i);
    e.target.checked ? marcados.add(i) : marcados.delete(i);
    Store.set('kit', [...marcados]);
    renderKit();
  });
  $('kitLimpar').addEventListener('click', () => { marcados = new Set(); Store.set('kit', []); renderKit(); });
  renderKit();

  atualizar();
});
