/* Página de serviços: busca, filtro por categoria e checklist de documentos */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const categorias = [...new Set(SERVICOS.map(s => s.categoria))];
  let categoria = 'Todos';
  let abertos = new Set();
  let marcados = new Set(Store.get('docsMarcados', []));

  // remove acentos para a busca funcionar com "certidao" e "certidão"
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function renderChips() {
    $('chips').innerHTML = ['Todos', ...categorias].map(c =>
      `<button class="chip" type="button" aria-pressed="${c === categoria}" data-cat="${c}">${c}</button>`).join('');
  }

  function progresso(s) {
    const feitos = s.docs.filter((_, i) => marcados.has(`${s.id}:${i}`)).length;
    return { feitos, total: s.docs.length };
  }

  function render() {
    const q = norm($('busca').value.trim());
    const lista = SERVICOS.filter(s =>
      (categoria === 'Todos' || s.categoria === categoria) &&
      (!q || norm([s.nome, s.categoria, s.onde, s.docs.join(' ')].join(' ')).includes(q)));

    $('resumo').textContent = `${lista.length} serviço(s) encontrado(s)`;
    if (!lista.length) { $('lista').innerHTML = '<div class="card empty">Nada encontrado. Tente outra palavra ou escolha "Todos".</div>'; return; }

    $('lista').innerHTML = lista.map(s => {
      const p = progresso(s);
      return `
      <details class="service" data-id="${s.id}" ${abertos.has(s.id) ? 'open' : ''}>
        <summary>
          <span>${esc(s.nome)}</span>
          <span><span class="tag">${esc(s.categoria)}</span>
          <span class="badge ${p.feitos === p.total ? 'b-resolvido' : 'b-aberto'}">Docs ${p.feitos}/${p.total}</span></span>
        </summary>
        <div class="body">
          <div><h4>📍 Onde ir</h4><p>${esc(s.onde)}</p>
               <h4>🕘 Horário</h4><p>${esc(s.horario)}</p></div>
          <div><h4>📄 Documentos necessários</h4>
            <ul class="clean check">
              ${s.docs.map((d, i) => `<li><label><input type="checkbox" data-k="${s.id}:${i}" ${marcados.has(`${s.id}:${i}`) ? 'checked' : ''}> ${esc(d)}</label></li>`).join('')}
            </ul></div>
          <div><h4>💰 Custo</h4><p>${esc(s.custo)}</p>
               <h4>⏱️ Prazo</h4><p>${esc(s.prazo)}</p>
               <a class="btn small" href="${s.link}" target="_blank" rel="noopener noreferrer">Site oficial ↗</a></div>
        </div>
      </details>`;
    }).join('');
  }

  // Eventos
  $('busca').addEventListener('input', render);
  $('chips').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    categoria = b.dataset.cat; renderChips(); render();
  });
  $('lista').addEventListener('change', e => {
    const k = e.target.dataset.k;
    if (!k) return;
    e.target.checked ? marcados.add(k) : marcados.delete(k);
    Store.set('docsMarcados', [...marcados]);
    // atualiza só o selo de progresso (mantém o card aberto)
    const det = e.target.closest('details');
    const s = SERVICOS.find(x => x.id === det.dataset.id);
    const p = progresso(s);
    const badge = det.querySelector('summary .badge');
    badge.textContent = `Docs ${p.feitos}/${p.total}`;
    badge.className = 'badge ' + (p.feitos === p.total ? 'b-resolvido' : 'b-aberto');
    if (p.feitos === p.total) toast('Documentação completa para este serviço! ✅');
  });
  $('lista').addEventListener('toggle', e => {
    const d = e.target.closest ? e.target.closest('details.service') : null;
    if (!d) return;
    d.open ? abertos.add(d.dataset.id) : abertos.delete(d.dataset.id);
  }, true);

  $('abrirTodos').addEventListener('click', () => {
    const todosAbertos = [...document.querySelectorAll('details.service')].every(d => d.open);
    document.querySelectorAll('details.service').forEach(d => d.open = !todosAbertos);
    $('abrirTodos').textContent = todosAbertos ? 'Abrir todos' : 'Fechar todos';
  });
  $('imprimir').addEventListener('click', () => {
    document.querySelectorAll('details.service').forEach(d => d.open = true);
    window.print();
  });

  renderChips();
  render();
});
