import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorState } from "../../components/ErrorState/ErrorState.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { SearchBar } from "../../components/SearchBar/SearchBar.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getGenres,
  getMoviesByGenre,
} from "../../services/api.js";
import "./Home.css";

const homeSections = [
  { key: "popular", title: "Populares", loader: getPopularMovies },
  { key: "topRated", title: "Mais bem avaliados", loader: getTopRatedMovies },
  { key: "nowPlaying", title: "Em cartaz", loader: getNowPlayingMovies },
  { key: "upcoming", title: "Próximos lançamentos", loader: getUpcomingMovies },
];

function MovieGrid({ movies }) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const category = searchParams.get("category");
  const [categoryMovies, setCategoryMovies] = useState([]);
  const debouncedQuery = useDebounce(query, 450);
  const [sections, setSections] = useState({});
  const [homeStatus, setHomeStatus] = useState("loading");
  const [homeError, setHomeError] = useState("");
  const [searchState, setSearchState] = useState({
    status: "idle",
    error: "",
    movies: [],
    page: 1,
    totalPages: 1,
  });
  const [searchRetryCount, setSearchRetryCount] = useState(0);

  const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);
  const hasSearch = normalizedQuery.length > 0;

  const loadHome = useCallback(async () => {
    setHomeStatus("loading");
    setHomeError("");

    try {
      const results = await Promise.all(
        homeSections.map(async (section) => [section.key, await section.loader(1)]),
      );
      setSections(
        Object.fromEntries(
          results.map(([key, value]) => [key, value.results.slice(0, 12)]),
        ),
      );
      setHomeStatus("success");
    } catch (error) {
      setHomeError(error.message);
      setHomeStatus("error");
    }
  }, []);

  useEffect(() => {
    loadHome();
    getGenres().then(setGenres).catch(() => {});
  }, [loadHome]);

  useEffect(() => { if (category) getMoviesByGenre(category).then((data) => setCategoryMovies(data.results)).catch(() => setCategoryMovies([])); }, [category]);

  useEffect(() => {
    let isCurrent = true;

    async function runSearch() {
      if (!normalizedQuery) {
        setSearchState({
          status: "idle",
          error: "",
          movies: [],
          page: 1,
          totalPages: 1,
        });
        return;
      }

      setSearchState((current) => ({ ...current, status: "loading", error: "" }));

      try {
        const data = await searchMovies(normalizedQuery, 1);

        if (!isCurrent) {
          return;
        }

        setSearchState({
          status: "success",
          error: "",
          movies: data.results,
          page: data.page,
          totalPages: data.totalPages,
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setSearchState((current) => ({
          ...current,
          status: "error",
          error: error.message,
        }));
      }
    }

    runSearch();

    return () => {
      isCurrent = false;
    };
  }, [normalizedQuery, searchRetryCount]);

  async function loadMoreSearchResults() {
    const nextPage = searchState.page + 1;
    setSearchState((current) => ({ ...current, status: "loadingMore" }));

    try {
      const data = await searchMovies(normalizedQuery, nextPage);
      setSearchState((current) => ({
        status: "success",
        error: "",
        movies: [...current.movies, ...data.results],
        page: data.page,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      setSearchState((current) => ({
        ...current,
        status: "error",
        error: error.message,
      }));
    }
  }

  return (
    <div className="page page--home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="eyebrow">TMDB Explorer</p>
          <h1 id="home-title">Encontre filmes, veja detalhes e salve favoritos.</h1>
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
          />
          <div className="category-menu">{genres.map((genre) => <button key={genre.id} type="button" onClick={() => setSearchParams({ category: String(genre.id) })}>{genre.name}</button>)}</div>
        </div>
      </section>

      {category ? <section className="content-section"><div className="section-heading"><h2>Categoria: {genres.find((g) => String(g.id) === category)?.name}</h2><button className="text-button" onClick={() => setSearchParams({})}>Limpar categoria</button></div><MovieGrid movies={categoryMovies} /></section> : hasSearch ? (
        <section className="content-section page-transition" aria-labelledby="search-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pesquisa</p>
              <h2 id="search-title">Resultados para &quot;{normalizedQuery}&quot;</h2>
            </div>
          </div>

          {searchState.status === "loading" ? <Loading /> : null}
          {searchState.status === "error" ? (
            <ErrorState
              message={searchState.error}
              onRetry={() => setSearchRetryCount((count) => count + 1)}
            />
          ) : null}
          {searchState.status === "success" && searchState.movies.length === 0 ? (
            <p className="muted-text">Nenhum filme encontrado com esse nome.</p>
          ) : null}
          {searchState.movies.length > 0 ? <MovieGrid movies={searchState.movies} /> : null}

          {searchState.page < searchState.totalPages && searchState.status !== "error" ? (
            <div className="section-actions">
              <button
                className="primary-action"
                type="button"
                onClick={loadMoreSearchResults}
                disabled={searchState.status === "loadingMore"}
              >
                {searchState.status === "loadingMore" ? "Carregando..." : "Carregar mais"}
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="page-transition">
          {homeStatus === "loading" ? <Loading count={12} /> : null}
          {homeStatus === "error" ? (
            <ErrorState message={homeError} onRetry={loadHome} />
          ) : null}
          {homeStatus === "success"
            ? homeSections.map((section) => (
                <section
                  className="content-section"
                  aria-labelledby={`${section.key}-title`}
                  key={section.key}
                >
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Coleção</p>
                      <h2 id={`${section.key}-title`}>{section.title}</h2>
                    </div>
                  </div>
                  <MovieGrid movies={sections[section.key] || []} />
                </section>
              ))
            : null}
        </div>
      )}
    </div>
  );
}
