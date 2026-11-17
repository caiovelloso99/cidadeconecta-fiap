/* Página Sobre/Contato: formulário com validação e histórico local */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  const erro = (campo, msg) => {
    document.querySelector(`[data-for="${campo}"]`).textContent = msg;
    $(campo).classList.toggle('invalid', !!msg);
    return !msg;
  };
  const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  function validar() {
    let ok = true;
    ok = erro('nome', $('nome').value.trim().length >= 3 ? '' : 'Informe seu nome (mín. 3 letras).') && ok;
    ok = erro('email', emailValido($('email').value.trim()) ? '' : 'Informe um e-mail válido.') && ok;
    ok = erro('assunto', $('assunto').value ? '' : 'Escolha um assunto.') && ok;
    ok = erro('mensagem', $('mensagem').value.trim().length >= 15 ? '' : 'Escreva pelo menos 15 caracteres.') && ok;
    return ok;
  }

  function renderMsgs() {
    const msgs = Store.get('mensagens', []);
    $('msgs').innerHTML = msgs.length
      ? msgs.map(m => `<li class="small">✉️ <strong>${esc(m.assunto)}</strong> — ${esc(m.nome)} · ${fmtDataHora(m.data)}<br><span class="muted">${esc(m.mensagem)}</span></li>`).join('')
      : '<li class="muted small">Nenhuma mensagem ainda.</li>';
    $('limpaMsgs').style.display = msgs.length ? '' : 'none';
  }

  $('contato').addEventListener('submit', e => {
    e.preventDefault();
    if (!validar()) { toast('Corrija os campos destacados.'); return; }
    const msgs = Store.get('mensagens', []);
    msgs.unshift({ nome: $('nome').value.trim(), email: $('email').value.trim(), assunto: $('assunto').value,
                   mensagem: $('mensagem').value.trim(), data: new Date().toISOString() });
    Store.set('mensagens', msgs);
    e.target.reset();
    toast('Mensagem enviada! (simulação: salva apenas neste navegador)');
    renderMsgs();
  });

  ['nome', 'email', 'assunto', 'mensagem'].forEach(c => $(c).addEventListener('blur', validar));
  $('limpaMsgs').addEventListener('click', () => { Store.set('mensagens', []); renderMsgs(); });
  renderMsgs();
});
