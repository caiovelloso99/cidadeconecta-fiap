/* Página de ocorrências: cadastro, filtros, apoio, protocolo e status */
document.addEventListener('DOMContentLoaded', () => {
  let ocorrencias = getOcorrencias();
  const $ = id => document.getElementById(id);
  const PESO_GRAV = { alta: 3, media: 2, baixa: 1 };
  const NOME_GRAV = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  const apoiados = new Set(Store.get('apoiados', []));

  // ---- Preenche selects ----
  $('tipo').innerHTML = '<option value="">Selecione...</option>' + TIPOS_OCORRENCIA.map(t => `<option>${t}</option>`).join('');
  $('bairro').innerHTML = '<option value="">Selecione...</option>' + REGIOES.map(r =>
    `<optgroup label="${r.nome}">${r.bairros.map(b => `<option>${b}</option>`).join('')}</optgroup>`).join('');
  $('fStatus').innerHTML += STATUS.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
  $('fTipo').innerHTML += TIPOS_OCORRENCIA.map(t => `<option>${t}</option>`).join('');

  // ---- Validação do formulário ----
  const erro = (campo, msg) => {
    document.querySelector(`[data-for="${campo}"]`).textContent = msg;
    $(campo).classList.toggle('invalid', !!msg);
    return !msg;
  };
  function validar() {
    let ok = true;
    ok = erro('tipo', $('tipo').value ? '' : 'Escolha o tipo do problema.') && ok;
    ok = erro('bairro', $('bairro').value ? '' : 'Escolha o bairro.') && ok;
    ok = erro('endereco', $('endereco').value.trim().length >= 5 ? '' : 'Informe o endereço (mín. 5 caracteres).') && ok;
    ok = erro('descricao', $('descricao').value.trim().length >= 10 ? '' : 'Descreva com pelo menos 10 caracteres.') && ok;
    return ok;
  }
  $('descricao').addEventListener('input', () => $('contador').textContent = $('descricao').value.length + '/300');

  function novoProtocolo() {
    const maior = ocorrencias.reduce((m, o) => Math.max(m, parseInt(o.protocolo.split('-')[2], 10)), 1000);
    return 'CC-2026-' + (maior + 1);
  }

  $('form').addEventListener('submit', e => {
    e.preventDefault();
    if (!validar()) { toast('Corrija os campos destacados.'); return; }
    const agora = new Date().toISOString();
    const nova = {
      id: 'o' + Date.now(), protocolo: novoProtocolo(),
      tipo: $('tipo').value, bairro: $('bairro').value, endereco: $('endereco').value.trim(),
      descricao: $('descricao').value.trim(), gravidade: $('gravidade').value,
      status: 'aberto', criada: agora, apoios: 0,
      historico: [{ status: 'aberto', data: agora, nota: 'Ocorrência registrada pelo cidadão.' }]
    };
    ocorrencias.unshift(nova);
    saveOcorrencias(ocorrencias);
    e.target.reset();
    $('contador').textContent = '0/300';
    ['tipo', 'bairro', 'endereco', 'descricao'].forEach(c => erro(c, ''));
    toast('Ocorrência enviada! Protocolo: ' + nova.protocolo);
    render();
  });

  // ---- Lista com filtros ----
  function filtradas() {
    const q = $('fBusca').value.trim().toLowerCase();
    let l = ocorrencias.filter(o =>
      (!$('fStatus').value || o.status === $('fStatus').value) &&
      (!$('fTipo').value || o.tipo === $('fTipo').value) &&
      (!q || [o.tipo, o.bairro, o.endereco, o.descricao, o.protocolo].join(' ').toLowerCase().includes(q)));
    const ordem = $('fOrdem').value;
    if (ordem === 'apoios') l.sort((a, b) => b.apoios - a.apoios);
    else if (ordem === 'gravidade') l.sort((a, b) => PESO_GRAV[b.gravidade] - PESO_GRAV[a.gravidade]);
    else l.sort((a, b) => new Date(b.criada) - new Date(a.criada));
    return l;
  }

  function render() {
    const l = filtradas();
    const gestor = $('modoGestor').checked;
    $('resumo').textContent = `${l.length} de ${ocorrencias.length} ocorrências · ${ocorrencias.filter(o => o.status === 'resolvido').length} resolvidas`;
    if (!l.length) { $('lista').innerHTML = '<div class="card empty">Nenhuma ocorrência encontrada com esses filtros.</div>'; return; }
    $('lista').innerHTML = l.map(o => `
      <article class="card occ" data-id="${o.id}">
        <header>
          <h3>${esc(o.tipo)} <span class="muted small">· ${esc(o.protocolo)}</span></h3>
          <span class="badge b-${o.status}">${statusNome(o.status)}</span>
        </header>
        <div class="muted small">📍 ${esc(o.bairro)} — ${esc(o.endereco)} · ${fmtData(o.criada)}</div>
        <p style="margin:4px 0">${esc(o.descricao)}</p>
        <div><span class="tag">Gravidade: ${NOME_GRAV[o.gravidade]}</span></div>
        <div class="occ-actions">
          <button class="btn small ghost" data-acao="apoiar" ${apoiados.has(o.id) ? 'disabled' : ''}>👍 ${apoiados.has(o.id) ? 'Apoiado' : 'Também afeta'} (${o.apoios})</button>
          <button class="btn small ghost" data-acao="detalhe">Ver andamento</button>
          ${gestor && o.status !== 'resolvido' ? '<button class="btn small accent" data-acao="avancar">Avançar status ➜</button>' : ''}
          ${gestor ? '<button class="btn small danger" data-acao="excluir">Excluir</button>' : ''}
        </div>
      </article>`).join('');
  }

  // ---- Ações (delegação de eventos) ----
  $('lista').addEventListener('click', e => {
    const btn = e.target.closest('button[data-acao]');
    if (!btn) return;
    const id = btn.closest('[data-id]').dataset.id;
    const o = ocorrencias.find(x => x.id === id);
    const acao = btn.dataset.acao;

    if (acao === 'apoiar' && !apoiados.has(id)) {
      o.apoios++; apoiados.add(id);
      Store.set('apoiados', [...apoiados]); saveOcorrencias(ocorrencias);
      toast('Obrigado! Seu apoio ajuda a priorizar este problema.');
    } else if (acao === 'detalhe') {
      abrirDetalhe(o); return;
    } else if (acao === 'avancar') {
      const i = STATUS.findIndex(s => s.id === o.status);
      const prox = STATUS[Math.min(i + 1, STATUS.length - 1)];
      const notas = { analise: 'Equipe da prefeitura analisando o caso.', andamento: 'Equipe enviada ao local.', resolvido: 'Problema solucionado.' };
      o.status = prox.id;
      o.historico.push({ status: prox.id, data: new Date().toISOString(), nota: notas[prox.id] });
      saveOcorrencias(ocorrencias);
      toast(`Status atualizado para "${prox.nome}".`);
    } else if (acao === 'excluir') {
      if (!confirm('Excluir esta ocorrência? Esta ação não pode ser desfeita.')) return;
      ocorrencias = ocorrencias.filter(x => x.id !== id);
      saveOcorrencias(ocorrencias);
      toast('Ocorrência excluída.');
    }
    render();
  });

  // ---- Detalhe com linha do tempo ----
  function abrirDetalhe(o) {
    $('detConteudo').innerHTML = `
      <h2 id="detTitulo">${esc(o.tipo)}</h2>
      <p class="muted small">Protocolo ${esc(o.protocolo)} · ${esc(o.bairro)} — ${esc(o.endereco)}</p>
      <p>${esc(o.descricao)}</p>
      <h3>Andamento</h3>
      <ul class="timeline">
        ${o.historico.map(h => `<li><span class="badge b-${h.status}">${statusNome(h.status)}</span>
          <span class="muted small"> ${fmtDataHora(h.data)}</span><br>${esc(h.nota)}</li>`).join('')}
      </ul>`;
    $('detalhe').showModal();
  }
  $('fechar').addEventListener('click', () => $('detalhe').close());

  // ---- Consulta por protocolo ----
  function buscarProtocolo() {
    const p = $('buscaProto').value.trim().toUpperCase();
    if (!p) { toast('Digite o número do protocolo.'); return; }
    const o = ocorrencias.find(x => x.protocolo === p);
    if (o) abrirDetalhe(o); else toast('Protocolo não encontrado.');
  }
  $('btnProto').addEventListener('click', buscarProtocolo);
  $('buscaProto').addEventListener('keydown', e => { if (e.key === 'Enter') buscarProtocolo(); });

  ['fBusca', 'fStatus', 'fTipo', 'fOrdem', 'modoGestor'].forEach(id => $(id).addEventListener('input', render));
  render();
});
