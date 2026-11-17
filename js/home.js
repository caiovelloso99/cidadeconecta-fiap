/* Página inicial: contadores, banner de alerta e últimas ocorrências */
document.addEventListener('DOMContentLoaded', () => {
  const ocorrencias = getOcorrencias();
  const sim = getSimulacao();
  const riscos = REGIOES.map(r => ({ regiao: r, nivel: calcularRisco(r, sim.chuva, sim.solo) }));
  const emRisco = riscos.filter(r => ['alto', 'critico'].includes(r.nivel.id));

  // Banner de alerta baseado na última simulação da página de enchentes
  const pior = riscos.reduce((a, b) => NIVEIS.indexOf(b.nivel) > NIVEIS.indexOf(a.nivel) ? b : a);
  const banner = document.getElementById('bannerAlerta');
  if (pior.nivel.id !== 'baixo') {
    banner.innerHTML = `<div class="banner ${pior.nivel.id}"><div class="container">
      ⚠️ Alerta ${pior.nivel.nome.toLowerCase()} de enchente: ${esc(pior.regiao.nome)} (chuva simulada de ${sim.chuva} mm/h).
      <a href="enchentes.html" style="color:inherit;text-decoration:underline">Veja as orientações</a></div></div>`;
  }

  // Contadores animados
  const alvo = {
    nTotal: ocorrencias.length,
    nResolvidas: ocorrencias.filter(o => o.status === 'resolvido').length,
    nRegioes: emRisco.length,
    nServicos: typeof SERVICOS !== 'undefined' ? SERVICOS.length : 0
  };
  Object.entries(alvo).forEach(([id, fim]) => {
    const el = document.getElementById(id);
    let atual = 0;
    const passo = Math.max(1, Math.ceil(fim / 30));
    const timer = setInterval(() => {
      atual = Math.min(fim, atual + passo);
      el.textContent = atual;
      if (atual >= fim) clearInterval(timer);
    }, 30);
  });

  // 3 ocorrências mais recentes
  const recentes = [...ocorrencias].sort((a, b) => new Date(b.criada) - new Date(a.criada)).slice(0, 3);
  document.getElementById('ultimas').innerHTML = recentes.map(o => `
    <article class="card occ">
      <header><h3>${esc(o.tipo)}</h3><span class="badge b-${o.status}">${statusNome(o.status)}</span></header>
      <div class="muted small">📍 ${esc(o.bairro)} · ${fmtData(o.criada)}</div>
      <p style="margin:6px 0 0">${esc(o.descricao)}</p>
    </article>`).join('');
});
