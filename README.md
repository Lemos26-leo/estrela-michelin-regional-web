# Estrela Michelin Regional — Web

Front React + TypeScript (Vite) do **UC-C04 Buscar restaurantes por
contexto**. Consome a API em
[`estrela-michelin-regional-api`](../estrela-michelin-regional-api); a
documentação do projeto fica em `estrela-michelin-regional`.

- Node 20 ou mais novo
- Porta local: `5173`

## Rodar

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173
```

A API precisa estar rodando na porta 3000. Para trabalhar sem ela, coloque
`VITE_USE_MOCK=true` no `.env`: a tela passa a usar `src/api/mock.json`, no
formato do contrato.

```bash
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `src/api/types.ts` | Tipos do contrato e formatadores de preço e nota |
| `src/api/client.ts` | `getSearchOptions()` e `searchRestaurants(criteria)` |
| `src/api/mock.json` | Resposta de exemplo, para rodar sem a API |
| `src/pages/SearchPage.tsx` | Critérios na URL, chamada à API e escolha do estado da tela |
| `src/pages/RestaurantPage.tsx` | Placeholder do UC-C06 |
| `src/components/SearchFilters.tsx` | Cidade, culinária, ocasião, vibe, preço, nota mínima e comodidades |
| `src/components/RestaurantCard.tsx` | Nome, bairro, preço, nota, compatibilidade, tags coincidentes e selo "Novidade" |
| `src/components/ResultList.tsx` | Lista ordenada e aviso do tipo de ordenação |
| `src/components/ui/` | Biblioteca do grupo: Button, Select, Chip, Badge, Card, Rating, EmptyState |
| `src/styles/tokens.css` | Tokens do design system (cor, tipografia, espaço, raio) |

## Design system

A estilização sai do design system do grupo, sem Tailwind e sem biblioteca
pronta. `src/styles/tokens.css` vem do design system; cada componente de
`src/components/ui/` é um TSX com CSS Modules, e o cabeçalho de cada
`.module.css` diz de qual classe `emr-*` do design system ele veio.
`src/styles/components.reference.css` é o bundle original, mantido só como
referência — a aplicação não o importa.

Regras herdadas do design system: nenhuma cor, tamanho de fonte,
espaçamento ou raio fora dos tokens; separação por linha fina, não por
sombra; e os dois temas (claro e escuro) saindo dos mesmos tokens. O botão
no cabeçalho troca o tema, que é gravado em `localStorage`.

A fonte de texto é a Inter, carregada pelo Google Fonts. A de títulos usa a
Palatino do sistema; para ficar idêntica à documentação, é preciso hospedar
a TeX Gyre Pagella Bold.

## Como a tela funciona

Os critérios ficam na query string. Antes da primeira busca a tela está no
estado inicial; depois dela, alterar qualquer filtro refaz a busca (fluxo
5a), e a URL pode ser compartilhada ou recarregada sem perder os critérios.

| Estado | O que aparece |
| --- | --- |
| Inicial | "O que você está planejando?", filtros vazios e um aviso para começar pela ocasião |
| Carregando | Indicador no lugar da lista |
| Com resultados | Cartões ordenados e o texto "Ordenado por compatibilidade" ou "Ordenado por nota" |
| Nenhum resultado | Mensagem e botão "Remover \<critério\>", que refaz a busca sem ele (fluxo 5c) |
| Erro de rede | "Não foi possível buscar agora" e botão "Tentar de novo" |

O cliente logado do RN-C09 é simulado: o cliente guarda um identificador em
`localStorage` e o manda no cabeçalho `X-Client-Id` de cada busca, que é o
que faz a API gravar o histórico.
