# Documentacao da aplicacao CineScope

Este documento explica como a aplicacao funciona, de onde os dados sao buscados e qual e a responsabilidade de cada parte do projeto.

## Visao geral

O CineScope e uma aplicacao React criada com Vite para explorar filmes usando a API do TMDB. A aplicacao permite:

- ver listas de filmes populares, mais bem avaliados, em cartaz e proximos lancamentos;
- pesquisar filmes por nome;
- abrir a pagina de detalhes de um filme;
- assistir ao trailer quando ele existir;
- ver elenco principal e filmes semelhantes;
- salvar e remover filmes favoritos no navegador.

A aplicacao roda totalmente no frontend. Ela nao tem backend proprio: os dados dos filmes vem do TMDB, as imagens vem do CDN de imagens do TMDB e os trailers sao incorporados do YouTube.

## Tecnologias usadas

- React: cria a interface com componentes.
- Vite: servidor de desenvolvimento e build da aplicacao.
- React Router DOM: controla as rotas e paginas.
- Axios: faz requisicoes HTTP para a API do TMDB.
- Lucide React: fornece os icones usados na interface.
- ESLint e Prettier: ajudam a manter padrao de codigo e formatacao.

## Como a aplicacao inicia

O ponto de entrada do app e o arquivo `src/main.jsx`.

Fluxo inicial:

1. O navegador carrega `index.html`.
2. O `index.html` cria a div `<div id="root"></div>`.
3. O script `/src/main.jsx` e executado.
4. O React renderiza o componente `App`.
5. O `BrowserRouter` ativa o sistema de rotas.
6. O `FavoritesProvider` deixa os favoritos disponiveis para toda a aplicacao.

Arquivo principal:

```jsx
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

## Estrutura de pastas

```text
src/
|-- assets/              Arquivos estaticos do projeto
|-- components/          Componentes reutilizaveis da interface
|-- context/             Contextos globais, como favoritos
|-- hooks/               Hooks personalizados
|-- pages/               Paginas principais da aplicacao
|-- routes/              Configuracao das rotas
|-- services/            Comunicacao com APIs externas
|-- styles/              Estilos globais
|-- utils/               Funcoes auxiliares
|-- App.jsx              Layout principal
`-- main.jsx             Entrada da aplicacao
```

## Rotas da aplicacao

As rotas ficam em `src/routes/AppRoutes.jsx`.

| Rota | Pagina | O que faz |
| --- | --- | --- |
| `/` | `Home` | Mostra a pagina inicial com busca e listas de filmes. |
| `/favoritos` | `Favorites` | Mostra os filmes salvos como favoritos. |
| `/movie/:id` | `MovieDetails` | Mostra detalhes de um filme pelo ID. |
| `/:id` | `MovieDetails` | Rota alternativa para abrir detalhes pelo ID. |
| `*` | `NotFound` | Mostra mensagem para paginas inexistentes. |

O arquivo usa `lazy` e `Suspense`, entao as paginas sao carregadas sob demanda. Enquanto uma pagina esta carregando, aparece o componente `Loading`.

Tambem existe a funcao `ScrollToTop`, que faz a pagina voltar para o topo sempre que a rota muda.

## Layout principal

O arquivo `src/App.jsx` monta a estrutura comum de todas as telas:

- `ErrorBoundary`: captura erros inesperados de renderizacao.
- `skip-link`: link de acessibilidade para pular direto ao conteudo.
- `Header`: cabecalho com marca e navegacao.
- `main`: area onde as paginas sao renderizadas.
- `Footer`: rodape com credito dos dados do TMDB.

## De onde vem cada dado

### Chave da API

A chave da API vem do arquivo `.env`, pela variavel:

```env
VITE_TMDB_API_KEY=sua_chave_do_tmdb_aqui
```

No codigo, ela e lida em `src/services/api.js`:

```js
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
```

O prefixo `VITE_` e obrigatorio para que o Vite exponha a variavel ao frontend.

Importante: o arquivo `.env` nao deve ser enviado para o Git, porque contem a chave real. O arquivo `.env.example` serve apenas como modelo.

### Dados dos filmes

Os dados dos filmes vem da API do TMDB:

```text
https://api.themoviedb.org/3
```

O cliente Axios e criado em `src/services/api.js`:

```js
const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000,
});
```

Todas as requisicoes enviam:

- `api_key`: chave do TMDB;
- `language: "pt-BR"`: pede respostas em portugues do Brasil;
- parametros especificos de cada endpoint.

### Imagens dos filmes

As imagens nao vem diretamente das respostas completas. A API retorna caminhos como `poster_path`, `backdrop_path` e `profile_path`. A funcao `imageUrl`, em `src/utils/movie.js`, transforma esse caminho em uma URL completa:

```js
export function imageUrl(path, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
```

Exemplo:

```text
https://image.tmdb.org/t/p/w500/caminho-do-poster.jpg
```

Quando uma imagem nao existe ou falha ao carregar, o app usa imagens de fallback criadas em SVG dentro de `src/utils/movie.js`.

### Trailers

Os trailers vem dos videos retornados pelo TMDB no detalhe do filme. O codigo procura um video do YouTube e guarda apenas a chave do video em `trailerKey`.

Na pagina de detalhes, essa chave e usada em um `iframe`:

```text
https://www.youtube.com/embed/{trailerKey}
```

### Favoritos

Os favoritos nao vem do TMDB. Eles ficam salvos no navegador do usuario usando `localStorage`.

A chave usada e:

```text
cineScope:favorites
```

O controle dos favoritos fica em `src/context/FavoritesContext.jsx`, que usa o hook `src/hooks/useLocalStorage.js`.

## Servico de API

Arquivo: `src/services/api.js`

Esse arquivo concentra toda a comunicacao com o TMDB.

### `ApiError`

Classe de erro personalizada. Ela permite mostrar mensagens mais amigaveis quando:

- a chave da API nao existe;
- a chave e invalida;
- a API demora demais;
- o TMDB retorna dados em formato inesperado;
- acontece algum erro desconhecido.

### `assertApiKey`

Verifica se `VITE_TMDB_API_KEY` foi configurada. Se nao existir, interrompe a requisicao e mostra uma mensagem pedindo para configurar o `.env`.

### `request`

Funcao central das requisicoes. Ela:

- adiciona a chave da API;
- adiciona o idioma `pt-BR`;
- cria uma chave de cache;
- usa Axios para buscar os dados;
- trata erros;
- guarda a Promise em cache para evitar requisicoes repetidas iguais.

### Cache de requisicoes

O cache e feito com:

```js
const requestCache = new Map();
```

A chave do cache mistura o endpoint e os parametros. Assim, se a aplicacao pedir a mesma pagina de filmes populares duas vezes, ela pode reaproveitar a Promise em vez de chamar a API novamente.

### Normalizacao dos dados

O TMDB retorna muitos campos. A aplicacao transforma as respostas em objetos menores e padronizados.

`normalizeMovieSummary` retorna dados basicos:

- `id`;
- `title`;
- `overview`;
- `posterPath`;
- `backdropPath`;
- `releaseDate`;
- `voteAverage`;
- `voteCount`.

`normalizeMovieDetails` retorna dados completos:

- dados basicos do filme;
- generos;
- duracao;
- frase de destaque;
- elenco principal;
- chave do trailer;
- filmes semelhantes.

### Funcoes exportadas

| Funcao | Endpoint | Uso |
| --- | --- | --- |
| `getPopularMovies(page)` | `/movie/popular` | Busca filmes populares. |
| `getTopRatedMovies(page)` | `/movie/top_rated` | Busca filmes mais bem avaliados. |
| `getNowPlayingMovies(page)` | `/movie/now_playing` | Busca filmes em cartaz. |
| `getUpcomingMovies(page)` | `/movie/upcoming` | Busca proximos lancamentos. |
| `searchMovies(query, page)` | `/search/movie` | Pesquisa filmes por nome. |
| `getMovieDetails(id)` | `/movie/{id}` | Busca detalhes, elenco, videos e semelhantes. |

No detalhe do filme, o parametro abaixo pede dados extras na mesma chamada:

```text
append_to_response=credits,videos,similar
```

## Utilitarios de filme

Arquivo: `src/utils/movie.js`

Esse arquivo tem funcoes auxiliares usadas em varias telas.

### `POSTER_FALLBACK`

Imagem em SVG usada quando o poster do filme nao existe ou falha.

### `PROFILE_FALLBACK`

Imagem em SVG usada quando a foto de uma pessoa do elenco nao existe ou falha.

### `imageUrl(path, size)`

Monta a URL completa de uma imagem do TMDB.

Tamanhos usados no projeto:

- `w500`: poster nos cards;
- `w780`: poster maior na pagina de detalhes;
- `w185`: fotos do elenco;
- `original`: imagem de fundo da pagina de detalhes.

### `formatDate(date)`

Transforma uma data no formato do TMDB, como `2024-06-12`, em texto no padrao brasileiro.

Se nao existir data, retorna:

```text
Data indisponivel
```

### `formatRuntime(minutes)`

Transforma minutos em texto amigavel.

Exemplos:

- `95` vira `1h 35min`;
- `45` vira `45min`.

Se nao existir duracao, retorna:

```text
Duracao indisponivel
```

### `formatRating(rating)`

Transforma a nota em texto com uma casa decimal e virgula brasileira.

Exemplo:

```text
7.8 -> 7,8
```

Se nao existir nota, retorna:

```text
S/N
```

## Contexto de favoritos

Arquivo: `src/context/FavoritesContext.jsx`

O contexto permite que qualquer componente acesse e altere os favoritos sem precisar passar props manualmente por varias camadas.

Ele fornece:

- `favorites`: lista de filmes favoritos;
- `addFavorite(movie)`: adiciona um filme;
- `removeFavorite(movieId)`: remove um filme pelo ID;
- `isFavorite(movieId)`: verifica se um filme ja esta salvo;
- `toggleFavorite(movie)`: adiciona se nao estiver salvo, remove se ja estiver.

O contexto usa `useMemo` para evitar recriar o objeto de funcoes sem necessidade.

## Hooks personalizados

### `useLocalStorage`

Arquivo: `src/hooks/useLocalStorage.js`

Funciona como um `useState`, mas sincroniza o valor com o `localStorage`.

Ele:

1. tenta ler um valor salvo no navegador;
2. se nao existir, usa o valor inicial;
3. sempre que o valor muda, salva novamente no `localStorage`.

Esse hook e usado para persistir favoritos.

### `useDebounce`

Arquivo: `src/hooks/useDebounce.js`

Atrasa a atualizacao de um valor por alguns milissegundos. Na busca, isso evita chamar a API a cada tecla digitada.

Na `Home`, o debounce usado e de 450ms:

```js
const debouncedQuery = useDebounce(query, 450);
```

## Paginas

### Home

Arquivo: `src/pages/Home/Home.jsx`

A pagina inicial tem dois modos:

1. Sem busca: mostra secoes de filmes.
2. Com busca: mostra resultados para o texto digitado.

Secoes carregadas na home:

- Populares;
- Mais bem avaliados;
- Em cartaz;
- Proximos lancamentos.

Essas secoes sao definidas no array `homeSections`, que liga um titulo a uma funcao de carregamento:

```js
const homeSections = [
  { key: "popular", title: "Populares", loader: getPopularMovies },
  { key: "topRated", title: "Mais bem avaliados", loader: getTopRatedMovies },
  { key: "nowPlaying", title: "Em cartaz", loader: getNowPlayingMovies },
  { key: "upcoming", title: "Proximos lancamentos", loader: getUpcomingMovies },
];
```

Quando nao ha busca, `loadHome` chama todas essas funcoes em paralelo usando `Promise.all`.

Quando ha busca, a pagina usa:

- `SearchBar` para capturar o texto;
- `useDebounce` para esperar o usuario parar de digitar;
- `searchMovies` para buscar no TMDB;
- botao "Carregar mais" para buscar a proxima pagina de resultados.

Estados principais da Home:

- `homeStatus`: controla carregamento, sucesso e erro das secoes iniciais;
- `homeError`: guarda mensagem de erro da home;
- `searchState`: guarda status, erro, filmes, pagina atual e total de paginas da busca;
- `searchRetryCount`: permite tentar a busca novamente.

### MovieDetails

Arquivo: `src/pages/MovieDetails/MovieDetails.jsx`

Mostra os detalhes de um filme especifico.

O ID vem da URL:

```js
const { id } = useParams();
```

Com esse ID, a pagina chama:

```js
getMovieDetails(id)
```

Ela exibe:

- link para voltar;
- poster;
- imagem de fundo;
- titulo;
- tagline;
- nota;
- data de lancamento;
- duracao;
- generos;
- sinopse;
- botao para favoritar;
- trailer;
- elenco principal;
- filmes semelhantes.

A pagina tambem usa `useFavorites` para saber se o filme ja esta nos favoritos e para alternar entre adicionar/remover.

### Favorites

Arquivo: `src/pages/Favorites/Favorites.jsx`

Mostra os filmes salvos no `localStorage`.

Se existirem favoritos, renderiza uma grade de `MovieCard`.

Se nao existir nenhum favorito, mostra `EmptyState` com um link para voltar a explorar filmes.

### NotFound

Arquivo: `src/pages/NotFound/NotFound.jsx`

Pagina exibida quando o usuario acessa uma rota que nao existe. Usa `EmptyState` e oferece um link para voltar ao inicio.

## Componentes

### Header

Arquivo: `src/components/Header/Header.jsx`

Mostra:

- marca `CineScope`;
- link para Inicio;
- link para Favoritos.

Usa `NavLink`, entao o React Router consegue identificar qual link esta ativo.

### Footer

Arquivo: `src/components/Footer/Footer.jsx`

Mostra um texto informando que os dados sao fornecidos pelo TMDB e que o projeto usa a API publica para estudo.

### MovieCard

Arquivo: `src/components/MovieCard/MovieCard.jsx`

Card reutilizavel para exibir um filme em listas e grades.

Mostra:

- poster;
- titulo;
- nota;
- ano de lancamento;
- botao de favorito.

Ao clicar no poster ou titulo, o usuario vai para:

```text
/movie/{id}
```

O componente usa `memo` para evitar renderizacoes desnecessarias quando as props nao mudam.

### SearchBar

Arquivo: `src/components/SearchBar/SearchBar.jsx`

Campo de busca com:

- icone de pesquisa;
- input do tipo `search`;
- botao para limpar quando existe texto;
- label invisivel para acessibilidade.

O formulario impede o comportamento padrao de submit, porque a busca e controlada pelo estado da Home.

### Loading

Arquivo: `src/components/Loading/Loading.jsx`

Mostra cards de skeleton enquanto os filmes carregam.

Recebe:

- `label`: texto acessivel;
- `count`: quantidade de skeletons.

### ErrorState

Arquivo: `src/components/ErrorState/ErrorState.jsx`

Mostra mensagens de erro de requisicao ou carregamento.

Pode receber:

- `title`;
- `message`;
- `onRetry`.

Quando `onRetry` existe, o componente mostra o botao "Tentar novamente".

### EmptyState

Arquivo: `src/components/EmptyState/EmptyState.jsx`

Mostra um estado vazio com titulo, mensagem e uma acao opcional.

E usado em:

- lista de favoritos vazia;
- pagina nao encontrada.

### ErrorBoundary

Arquivo: `src/components/ErrorBoundary/ErrorBoundary.jsx`

Captura erros inesperados na renderizacao dos componentes filhos. Se algo quebrar fora dos fluxos tratados, mostra uma tela com botao para recarregar a pagina.

## Estilos

O arquivo `src/styles/global.css` define estilos globais:

- tema escuro;
- variaveis CSS de cores;
- fonte base;
- reset basico;
- foco visivel para acessibilidade;
- layout principal `.app-shell`;
- grade global `.movie-grid`;
- animacao de entrada `.page-transition`;
- classe `.sr-only` para textos acessiveis invisiveis;
- suporte a `prefers-reduced-motion`.

Cada componente e pagina tambem tem seu proprio arquivo `.css`, por exemplo:

- `Header.css`;
- `MovieCard.css`;
- `Home.css`;
- `MovieDetails.css`;
- `Favorites.css`.

## Arquivos publicos

A pasta `public/` contem arquivos servidos diretamente pelo Vite:

- `favicon.ico`: icone da aba do navegador;
- `manifest.json`: metadados para comportamento de app instalavel/PWA;
- `robots.txt`: orientacao para mecanismos de busca.

## Configuracoes do projeto

### `vite.config.js`

Configura o Vite com o plugin React.

```js
plugins: [react()]
```

Tambem define:

```js
server: {
  open: false,
}
```

Ou seja, o servidor de desenvolvimento nao abre o navegador automaticamente.

### `eslint.config.js`

Configura o ESLint para JavaScript e JSX, usando regras de:

- JavaScript recomendado;
- React;
- React Hooks;
- React Refresh.

A regra `react/prop-types` esta desligada porque o projeto nao usa PropTypes.

## Scripts do package.json

| Script | Comando | Para que serve |
| --- | --- | --- |
| `npm start` | `vite` | Inicia o servidor de desenvolvimento. |
| `npm run dev` | `vite` | Mesmo uso do start. |
| `npm run build` | `vite build` | Gera a versao final em `dist/`. |
| `npm run preview` | `vite preview` | Abre uma previa local do build. |
| `npm run lint` | `eslint .` | Analisa o codigo com ESLint. |
| `npm run format` | `prettier --write .` | Formata os arquivos do projeto. |

## Fluxo completo de uso

1. Usuario abre a aplicacao.
2. `main.jsx` renderiza `App`.
3. `App` mostra Header, rotas e Footer.
4. A rota `/` carrega `Home`.
5. `Home` chama as funcoes de `services/api.js`.
6. `api.js` busca dados no TMDB.
7. Os dados sao normalizados.
8. `Home` renderiza os filmes usando `MovieCard`.
9. O usuario pode pesquisar, abrir detalhes ou favoritar.
10. Ao abrir detalhes, `MovieDetails` busca dados completos do filme.
11. Ao favoritar, `FavoritesContext` atualiza o `localStorage`.
12. A pagina `/favoritos` le o contexto e mostra os filmes salvos.

## Tratamento de erros

A aplicacao trata erros em camadas:

- `api.js` transforma erros tecnicos em mensagens amigaveis.
- `Home` e `MovieDetails` mostram `ErrorState` quando uma requisicao falha.
- `ErrorBoundary` captura erros inesperados de renderizacao.
- Imagens quebradas usam fallbacks.
- Busca vazia retorna uma lista vazia sem chamar a API.

## Acessibilidade

O projeto tem alguns cuidados de acessibilidade:

- idioma `pt-BR` no `index.html`;
- `aria-label` em navegacao, botoes e regioes importantes;
- `aria-pressed` em botoes de favorito;
- `role="search"` no formulario de busca;
- `role="alert"` em estados de erro;
- link "Ir para o conteudo";
- foco visivel em links, botoes e inputs;
- suporte a reducao de movimento com `prefers-reduced-motion`.

## Resumo do papel de cada parte

| Parte | Responsabilidade |
| --- | --- |
| `main.jsx` | Inicializa React, rotas e contexto global. |
| `App.jsx` | Monta layout fixo da aplicacao. |
| `AppRoutes.jsx` | Define qual pagina aparece em cada URL. |
| `services/api.js` | Busca, valida, normaliza e trata dados do TMDB. |
| `utils/movie.js` | Formata imagens, datas, duracao e notas. |
| `FavoritesContext.jsx` | Controla favoritos globais. |
| `useLocalStorage.js` | Persiste dados no navegador. |
| `useDebounce.js` | Evita buscas a cada tecla. |
| `Home.jsx` | Mostra listas e resultados de pesquisa. |
| `MovieDetails.jsx` | Mostra detalhes completos de um filme. |
| `Favorites.jsx` | Mostra filmes favoritos salvos. |
| `NotFound.jsx` | Trata rotas inexistentes. |
| `MovieCard.jsx` | Exibe filme em formato de card. |
| `SearchBar.jsx` | Campo reutilizavel de pesquisa. |
| `Loading.jsx` | Skeleton de carregamento. |
| `ErrorState.jsx` | Mensagem de erro com tentativa novamente. |
| `EmptyState.jsx` | Mensagem para estados sem conteudo. |
| `ErrorBoundary.jsx` | Tela de emergencia para erros inesperados. |
