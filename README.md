# CineScope - Filmes com React e TMDB

Aplicação React moderna para explorar filmes do TMDB, pesquisar títulos em tempo real, ver detalhes completos e salvar favoritos no navegador.

## Tecnologias

- React 19
- Vite
- React Router DOM
- Axios
- Lucide React
- ESLint
- Prettier
- TMDB API

## Estrutura

```text
src/
├── assets/
├── components/
│   ├── EmptyState/
│   ├── ErrorBoundary/
│   ├── ErrorState/
│   ├── Footer/
│   ├── Header/
│   ├── Loading/
│   ├── MovieCard/
│   └── SearchBar/
├── context/
├── hooks/
├── pages/
│   ├── Favorites/
│   ├── Home/
│   ├── MovieDetails/
│   └── NotFound/
├── routes/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

## Como executar

```bash
npm install
npm start
```

Também é possível usar:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Configuração do TMDB

1. Crie uma conta em `https://www.themoviedb.org/`.
2. Gere uma API Key em `https://www.themoviedb.org/settings/api`.
3. Copie `.env.example` para `.env`.
4. Preencha a variável:

```env
VITE_TMDB_API_KEY=sua_chave_do_tmdb_aqui
```

O arquivo `.env` está no `.gitignore`, então a chave local não deve ser enviada ao repositório.

## Login de teste

O login atual e apenas para demonstracao e nao possui backend. Usuarios, sessao e comentarios ficam salvos somente no navegador, em `localStorage`.

- E-mail: `teste@cinescope.com`
- Senha: `123456`

As funcionalidades incluem categorias por genero, compartilhamento da lista de favoritos por link e comentarios locais na pagina de cada filme.

## Funcionalidades

- Listas de filmes populares, mais bem avaliados, em cartaz e próximos lançamentos.
- Pesquisa por nome com debounce.
- Paginação moderna na busca com botão "Carregar mais".
- Página de detalhes com poster em alta resolução, sinopse, lançamento, nota, gêneros, duração, elenco, trailer do YouTube e filmes semelhantes.
- Favoritos com persistência em `localStorage`.
- Dark mode padrão com layout responsivo.
- Skeleton loading, feedbacks de erro, fallback de imagens e Error Boundary.
- Lazy loading de rotas, code splitting e cache simples de requisições.
- Melhorias de acessibilidade com labels, foco visível, navegação por teclado e link para pular ao conteúdo.
