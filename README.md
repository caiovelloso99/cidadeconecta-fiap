# CidadeConecta — Global Solution FIAP

Portal que reúne três soluções para o cidadão:

| Página | Arquivo | O que faz |
|---|---|---|
| Início | `index.html` | Painel com números, alerta de enchente e últimas ocorrências |
| Ocorrências | `ocorrencias.html` | Cadastro de problemas urbanos, filtros, apoio, protocolo e acompanhamento de status |
| Enchentes | `enchentes.html` | Simulador de chuva, mapa de risco por região, alertas, orientações e kit de emergência |
| Serviços públicos | `servicos.html` | Busca de serviços, documentos necessários (checklist), custo, prazo e onde ir |
| Sobre / Contato | `sobre.html` | Objetivo do projeto, ODS, FAQ e formulário validado |

## Como abrir
Dê duplo clique em `index.html`. Não precisa instalar nada nem de servidor.

## Funcionalidades em JavaScript
- Validação de formulários com mensagens de erro (ocorrências e contato)
- Persistência com `localStorage` (ocorrências, apoios, kit, checklist, tema, mensagens)
- Filtros, busca (sem diferenciar acentos) e ordenação em tempo real
- Simulador de risco de enchente (função `calcularRisco` em `js/common.js`) com mapa SVG interativo
- Abas, acordeões, modal (`<dialog>`), contadores animados, toast, modo escuro
- Integração entre páginas: ocorrências de bueiro/alagamento aparecem na página de enchentes; o alerta da última simulação aparece na página inicial

## Estrutura
```
index.html · ocorrencias.html · enchentes.html · servicos.html · sobre.html
css/style.css
js/common.js          (layout, storage, dados, cálculo de risco)
js/home.js · ocorrencias.js · enchentes.js · servicos.js · sobre.js
js/servicos-dados.js  (base dos serviços)
```

## Observações
- Dados de bairros, ocorrências e riscos são **fictícios** (demonstração).
- Informações dos serviços são gerais; confirme no órgão oficial.
- Para resetar os dados de exemplo: no console do navegador, `localStorage.clear()`.
- Antes de entregar, troque os nomes/RMs em `sobre.html`.
