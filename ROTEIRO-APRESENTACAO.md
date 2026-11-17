# Roteiro de apresentação — CidadeConecta (5 minutos)

> Dica: antes de começar, abra o site e rode `localStorage.clear()` no console (F12) para voltar aos dados de exemplo. Deixe `index.html` aberto.

## 0:00–0:45 · Abertura e problema (Integrante 1)
- "Muita gente não sabe a quem recorrer quando vê um buraco na rua, não recebe alerta a tempo de uma enchente e perde um dia na fila por falta de um documento."
- "Criamos o **CidadeConecta**, um portal único com três soluções: ocorrências, risco de enchentes e serviços públicos."
- Alinhamento: **ODS 11** (cidades sustentáveis) e **ODS 13** (ação contra a mudança do clima).
- Mostre a **página inicial**: números da cidade e o banner de alerta.

## 0:45–2:00 · Demo 1: Ocorrências (Integrante 1)
1. Abra **Ocorrências**. Clique em "Enviar" com o formulário vazio → mostram-se as **validações**.
2. Preencha: *Bueiro entupido · Beira-Rio · Rua do Porto, 50 · gravidade Alta* → envie. Mostre o **protocolo** gerado no aviso.
3. Use os **filtros** (status, tipo, busca) e a ordenação "Mais apoiadas".
4. Clique em **"Também afeta"** (apoio da comunidade ajuda a priorizar).
5. Ative o **Modo gestor** → "Avançar status" → "Ver andamento" para mostrar a **linha do tempo**. Explique: "simula a prefeitura atualizando o caso".
6. Consulte pelo protocolo `CC-2026-1001`.

## 2:00–3:30 · Demo 2: Enchentes (Integrante 2)
1. Abra **Enchentes**. Clique em **Garoa** → tudo verde.
2. Clique em **Temporal** → o mapa muda de cor e surgem **alertas**. Explique a conta: *vulnerabilidade da região × (chuva/20 + bônus do solo)*.
3. Clique na **Zona Leste** (perto do rio): mostre o texto e "O que fazer agora".
4. Mostre as abas **Antes / Durante / Depois**.
5. Marque itens do **kit de emergência** (progresso salvo).
6. Aponte a lista **"Ocorrências ligadas a chuvas"**: "são as ocorrências de bueiro/alagamento da outra página, aqui o conteúdo se conecta".
7. Volte à **Início**: o banner de alerta reflete a simulação.

## 3:30–4:30 · Demo 3: Serviços públicos (Integrante 3)
1. Abra **Serviços**. Digite "certidao" (sem acento) → a busca ignora acentos.
2. Filtre por categoria **Saúde**.
3. Abra um serviço: **onde ir, documentos, custo, prazo, site oficial**.
4. Marque os documentos → o selo vira **"Docs 3/3"** e aparece uma mensagem de sucesso.
5. Clique em **Imprimir** para levar o checklist.

## 4:30–5:00 · Fechamento (Integrante 1)
- Tecnologias: HTML5 semântico, CSS (Grid/Flexbox, modo escuro), JavaScript puro, `localStorage`, SVG, acessibilidade (ARIA e teclado).
- Funciona no celular (responsivo).
- Próximos passos: banco de dados e login, mapa real, dados oficiais da Defesa Civil/INMET, notificações por SMS ou e-mail.
- "Obrigado! Perguntas?"

---

## Perguntas que podem aparecer
| Pergunta | Resposta curta |
|---|---|
| Os dados são reais? | Não, são fictícios e o site avisa isso. É um protótipo de demonstração. |
| Onde os dados ficam salvos? | No `localStorage` do navegador. Em produção, seriam um banco de dados com API. |
| Como o risco é calculado? | `calcularRisco()` em `js/common.js`: vulnerabilidade da região (1 a 5) × fator de chuva e solo, com faixas baixo/moderado/alto/crítico. |
| O que é o "Modo gestor"? | Simula o painel da prefeitura. Em produção seria uma área com login. |
| Como evitam código malicioso nos formulários? | Função `esc()` em `js/common.js` escapa o HTML de tudo que o usuário digita antes de exibir. |
| E a acessibilidade? | Menu e mapa navegáveis por teclado, rótulos ARIA, foco visível, contraste e risco indicado por texto além da cor. |
| Por que juntar três temas? | Atende públicos diferentes e os temas se conectam (ex.: bueiro entupido vira risco de alagamento). |

## Checklist final
- [ ] Nomes e RMs em `sobre.html`
- [ ] Testado em outro navegador (Chrome/Edge) e no celular
- [ ] Todos sabem qual parte vão apresentar
- [ ] Combinar quem navega pelo site durante a fala
