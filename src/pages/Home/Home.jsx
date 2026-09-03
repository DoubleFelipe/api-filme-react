import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ErrorState } from "../../components/ErrorState/ErrorState.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getGenres,
  getMoviesByGenre,
} from "../../services/api.js";
import { imageUrl } from "../../utils/movie.js";
import "./Home.css";

/* ─── Configuração das seções em carrossel ─────────────────── */
const homeSections = [
  {
    key: "popular",
    eyebrow: "Tendências Globais",
    eyebrowColor: "var(--cs-primary-container)",
    title: "Filmes Populares",
    loader: getPopularMovies,
  },
  {
    key: "topRated",
    eyebrow: "O Panteão do Cinema",
    eyebrowColor: "var(--cs-tertiary)",
    title: "Mais Bem Avaliados de Todos os Tempos",
    loader: getTopRatedMovies,
  },
  {
    key: "nowPlaying",
    eyebrow: "Nas Telas Agora",
    eyebrowColor: "var(--cs-secondary)",
    title: "Em Cartaz",
    loader: getNowPlayingMovies,
  },
  {
    key: "upcoming",
    eyebrow: "Aguardados",
    eyebrowColor: "var(--cs-tertiary-fixed-dim)",
    title: "Próximos Lançamentos",
    loader: getUpcomingMovies,
  },
];

/* ─── Helper de scroll do carrossel ───────────────────────── */
function scrollRail(ref, amount) {
  if (ref.current) {
    ref.current.scrollBy({ left: amount, behavior: "smooth" });
  }
}

/* ─── Componente de Seção em Carrossel ────────────────────── */
function RailSection({ section, movies }) {
  const railRef = useRef(null);
  return (
    <section className="rail-section" aria-labelledby={`${section.key}-title`}>
      <div className="rail-header">
        <div className="rail-header__left">
          <div className="rail-eyebrow" style={{ color: section.eyebrowColor }}>
            {section.eyebrow}
          </div>
          <h2
            id={`${section.key}-title`}
            className="text-headline-lg"
            style={{ color: "var(--cs-on-surface)" }}
          >
            {section.title}
          </h2>
        </div>
        <div className="rail-controls">
          <button
            className="rail-btn"
            aria-label="Voltar"
            onClick={() => scrollRail(railRef, -340)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              chevron_left
            </span>
          </button>
          <button
            className="rail-btn"
            aria-label="Avançar"
            onClick={() => scrollRail(railRef, 340)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>
      <div className="movie-rail" ref={railRef}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

/* ─── Componente Hero ─────────────────────────────────────── */
function HeroSection({ movie, onFavorite, isFav }) {
  if (!movie) return null;

  const backdrop = imageUrl(movie.backdropPath, "original");
  const year = movie.releaseDate?.slice(0, 4);
  const genres = movie.genreNames?.slice(0, 3).join(" • ") ?? "";

  return (
    <section className="home-hero" aria-label="Filme em destaque">
      {/* Backdrop */}
      <div className="home-hero__backdrop" aria-hidden="true">
        {backdrop && (
          <img
            className="home-hero__backdrop-img"
            src={backdrop}
            alt=""
            loading="eager"
          />
        )}
        <div className="home-hero__backdrop-gradient" />
        <div className="home-hero__backdrop-accent" />
      </div>

      {/* Conteúdo */}
      <div className="home-hero__content">
        <div className="home-hero__inner">
          {/* Badges */}
          <div className="home-hero__badges">
            <span className="badge-featured">
              <span className="badge-featured__dot" />
              Em Destaque
            </span>
            <span className="badge-quality">4K Ultra HD</span>
          </div>

          {/* Título */}
          <h1 className="home-hero__title" id="home-title">
            {movie.title}
          </h1>

          {/* Meta */}
          <div className="home-hero__meta">
            {movie.voteAverage > 0 && (
              <div className="home-hero__rating">
                <span className="material-symbols-outlined">star</span>
                <strong>{movie.voteAverage?.toFixed(1)}</strong>
                <span style={{ color: "var(--cs-tertiary-fixed-dim)", fontSize: "0.6875rem" }}>
                  TMDB
                </span>
              </div>
            )}
            {year && (
              <>
                <span className="home-hero__dot">•</span>
                <span style={{ color: "var(--cs-on-surface)", fontWeight: 600 }}>{year}</span>
              </>
            )}
            {genres && (
              <>
                <span className="home-hero__dot">•</span>
                <span className="home-hero__genres">{genres}</span>
              </>
            )}
          </div>

          {/* Sinopse */}
          {movie.overview && (
            <p className="home-hero__overview">{movie.overview}</p>
          )}

          {/* Botões */}
          <div className="home-hero__actions">
            <Link
              to={`/movie/${movie.id}`}
              className="btn-primary"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Ver Detalhes
            </Link>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => onFavorite(movie)}
              aria-pressed={isFav}
            >
              <span className="material-symbols-outlined" style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}>
                favorite
              </span>
              {isFav ? "Nos Favoritos" : "+ Adicionar aos Favoritos"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Página Home ─────────────────────────────────────────── */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [genres, setGenres] = useState([]);
  const category = searchParams.get("category");
  const [categoryMovies, setCategoryMovies] = useState([]);
  const debouncedQuery = useDebounce(query, 450);
  const [sections, setSections] = useState({});
  const [homeStatus, setHomeStatus] = useState("loading");
  const [homeError, setHomeError] = useState("");
  const [heroMovie, setHeroMovie] = useState(null);
  const [searchState, setSearchState] = useState({
    status: "idle",
    error: "",
    movies: [],
    page: 1,
    totalPages: 1,
  });
  const [searchRetryCount, setSearchRetryCount] = useState(0);

  // Importar favoritos para o Hero
  const { isFavorite, toggleFavorite } = useFavorites();

  const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);
  const hasSearch = normalizedQuery.length > 0;

  // Sync query param → state
  useEffect(() => {
    const paramQ = searchParams.get("q") ?? "";
    setQuery(paramQ);
  }, [searchParams]);

  const loadHome = useCallback(async () => {
    setHomeStatus("loading");
    setHomeError("");
    try {
      const results = await Promise.all(
        homeSections.map(async (section) => [
          section.key,
          await section.loader(1),
        ])
      );
      const dataMap = Object.fromEntries(
        results.map(([key, value]) => [key, value.results.slice(0, 12)])
      );
      setSections(dataMap);
      // Usar o primeiro filme popular como hero
      if (dataMap.popular?.length) {
        setHeroMovie(dataMap.popular[0]);
      }
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

  useEffect(() => {
    if (category) {
      getMoviesByGenre(category)
        .then((data) => setCategoryMovies(data.results))
        .catch(() => setCategoryMovies([]));
    }
  }, [category]);

  useEffect(() => {
    let isCurrent = true;
    async function runSearch() {
      if (!normalizedQuery) {
        setSearchState({ status: "idle", error: "", movies: [], page: 1, totalPages: 1 });
        return;
      }
      setSearchState((s) => ({ ...s, status: "loading", error: "" }));
      try {
        const data = await searchMovies(normalizedQuery, 1);
        if (!isCurrent) return;
        setSearchState({
          status: "success",
          error: "",
          movies: data.results,
          page: data.page,
          totalPages: data.totalPages,
        });
      } catch (error) {
        if (!isCurrent) return;
        setSearchState((s) => ({ ...s, status: "error", error: error.message }));
      }
    }
    runSearch();
    return () => { isCurrent = false; };
  }, [normalizedQuery, searchRetryCount]);

  async function loadMoreSearchResults() {
    const nextPage = searchState.page + 1;
    setSearchState((s) => ({ ...s, status: "loadingMore" }));
    try {
      const data = await searchMovies(normalizedQuery, nextPage);
      setSearchState((s) => ({
        status: "success",
        error: "",
        movies: [...s.movies, ...data.results],
        page: data.page,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      setSearchState((s) => ({ ...s, status: "error", error: error.message }));
    }
  }

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="page page--home">
      {/* Hero — exibido quando não há busca */}
      {!hasSearch && !category && homeStatus === "success" && (
        <HeroSection
          movie={heroMovie}
          isFav={heroMovie ? isFavorite(heroMovie.id) : false}
          onFavorite={toggleFavorite}
        />
      )}

      {/* Barra de Gêneros Sticky */}
      <div className="genre-bar">
        <div className="genre-bar__inner">
          <div className="genre-bar__pills">
            <button
              className={`pill ${!category ? "pill--active" : "pill--default"}`}
              onClick={() => setSearchParams({})}
            >
              Todos os Gêneros
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                className={`pill ${
                  category === String(genre.id) ? "pill--active" : "pill--default"
                }`}
                onClick={() => setSearchParams({ category: String(genre.id) })}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <div className="genre-bar__sort">
            <span className="material-symbols-outlined">tune</span>
            <span>
              Classificar:{" "}
              <strong style={{ color: "var(--cs-on-surface)" }}>Mais Relevantes</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Conteúdo Principal ─────────────────────────────── */}

      {/* Categoria específica */}
      {category && (
        <div className="home-body">
          <section className="content-section" style={{ padding: 0 }}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Categoria</p>
                <h2 className="text-headline-lg">
                  {genres.find((g) => String(g.id) === category)?.name ?? "Filmes"}
                </h2>
              </div>
              <button
                className="btn-ghost category-clear-btn"
                onClick={() => setSearchParams({})}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>close</span>
                Limpar
              </button>
            </div>
            <div className="movie-grid">
              {categoryMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Resultados de busca */}
      {!category && hasSearch && (
        <div className="home-body search-section page-transition" aria-labelledby="search-title">
          <section className="content-section" style={{ padding: 0 }}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pesquisa</p>
                <h2 id="search-title" className="text-headline-lg">
                  Resultados para &quot;{normalizedQuery}&quot;
                </h2>
              </div>
            </div>

            {searchState.status === "loading" && <Loading />}
            {searchState.status === "error" && (
              <ErrorState
                message={searchState.error}
                onRetry={() => setSearchRetryCount((n) => n + 1)}
              />
            )}
            {searchState.status === "success" && searchState.movies.length === 0 && (
              <p className="search-empty muted-text">
                Nenhum filme encontrado para &ldquo;{normalizedQuery}&rdquo;.
              </p>
            )}
            {searchState.movies.length > 0 && (
              <div className="movie-grid">
                {searchState.movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {searchState.page < searchState.totalPages &&
              searchState.status !== "error" && (
                <div className="section-actions">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={loadMoreSearchResults}
                    disabled={searchState.status === "loadingMore"}
                  >
                    {searchState.status === "loadingMore" ? "Carregando..." : "Carregar mais"}
                    {searchState.status !== "loadingMore" && (
                      <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                        expand_more
                      </span>
                    )}
                  </button>
                </div>
              )}
          </section>
        </div>
      )}

      {/* Seções em carrossel (home normal) */}
      {!category && !hasSearch && (
        <div className="home-body page-transition">
          {homeStatus === "loading" && (
            <div style={{ padding: "0 var(--cs-gutter)" }}>
              <Loading count={12} />
            </div>
          )}
          {homeStatus === "error" && (
            <div style={{ padding: "0 var(--cs-gutter)" }}>
              <ErrorState message={homeError} onRetry={loadHome} />
            </div>
          )}
          {homeStatus === "success" &&
            homeSections.map((section) => (
              <RailSection
                key={section.key}
                section={section}
                movies={sections[section.key] || []}
              />
            ))}
        </div>
      )}
    </div>
  );
}

