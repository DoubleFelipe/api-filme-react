import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/ErrorState/ErrorState.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { useComments } from "../../context/CommentsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMovieDetails } from "../../services/api.js";
import {
  formatDate,
  formatRating,
  formatRuntime,
  imageUrl,
  POSTER_FALLBACK,
  PROFILE_FALLBACK,
} from "../../utils/movie.js";
import "./MovieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ status: "loading", movie: null, error: "" });
  const [posterSrc, setPosterSrc] = useState(POSTER_FALLBACK);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { comments, addComment } = useComments();
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const similarRailRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;
    async function loadMovie() {
      setState({ status: "loading", movie: null, error: "" });
      try {
        const movie = await getMovieDetails(id);
        if (!isCurrent) return;
        setPosterSrc(imageUrl(movie.posterPath, "w780") || POSTER_FALLBACK);
        setState({ status: "success", movie, error: "" });
      } catch (error) {
        if (!isCurrent) return;
        setState({ status: "error", movie: null, error: error.message });
      }
    }
    loadMovie();
    return () => { isCurrent = false; };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="page" style={{ padding: "8rem var(--cs-gutter) 3rem" }}>
        <Loading count={6} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="page" style={{ padding: "8rem var(--cs-gutter) 3rem" }}>
        <ErrorState message={state.error} />
      </div>
    );
  }

  const movie = state.movie;
  const favorite = isFavorite(movie.id);
  const backdrop = imageUrl(movie.backdropPath, "original");

  return (
    <div className="page page--details page-transition">
      {/* ── Hero ── */}
      <section className="details-hero" aria-label={`Detalhes de ${movie.title}`}>
        {/* Backdrop */}
        <div className="details-hero__backdrop" aria-hidden="true">
          {backdrop && (
            <img
              className="details-hero__backdrop-img"
              src={backdrop}
              alt=""
              loading="eager"
            />
          )}
          <div className="details-hero__backdrop-gradient" />
        </div>

        <div className="details-hero__content">
          {/* Botão voltar */}
          <Link to="/" className="back-link">
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </Link>

          <div className="details-hero__grid">
            {/* Pôster */}
            <img
              className="details-poster"
              src={posterSrc}
              alt={`Poster de ${movie.title}`}
              onError={() => setPosterSrc(POSTER_FALLBACK)}
            />

            {/* Informações */}
            <div className="details-copy">
              <p className="eyebrow">Detalhes do Filme</p>
              <h1>{movie.title}</h1>
              {movie.tagline && <p className="tagline">&ldquo;{movie.tagline}&rdquo;</p>}

              {/* Badges de meta */}
              <div className="details-meta" aria-label="Informações do filme">
                {movie.voteAverage > 0 && (
                  <div className="meta-badge meta-badge--rating">
                    <span className="material-symbols-outlined">star</span>
                    <strong>{formatRating(movie.voteAverage)}</strong>
                    <span style={{ color: "var(--cs-muted)", fontSize: "0.75rem" }}>
                      TMDB
                    </span>
                  </div>
                )}
                {movie.releaseDate && (
                  <div className="meta-badge">
                    <span className="material-symbols-outlined">calendar_month</span>
                    {formatDate(movie.releaseDate)}
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="meta-badge">
                    <span className="material-symbols-outlined">schedule</span>
                    {formatRuntime(movie.runtime)}
                  </div>
                )}
              </div>

              {/* Gêneros */}
              {movie.genres?.length > 0 && (
                <ul className="genre-list" aria-label="Gêneros">
                  {movie.genres.map((genre) => (
                    <li key={genre.id}>{genre.name}</li>
                  ))}
                </ul>
              )}

              {/* Sinopse */}
              <p className="overview">
                {movie.overview || "Sinopse indisponível para este filme."}
              </p>

              {/* Ações */}
              <div className="details-actions">
                <button
                  className="favorite-action"
                  type="button"
                  onClick={() => toggleFavorite(movie)}
                  aria-pressed={favorite}
                >
                  <span className="material-symbols-outlined">
                    {favorite ? "favorite" : "favorite_border"}
                  </span>
                  {favorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corpo de Seções ── */}
      <div className="details-body">
        {/* Trailer */}
        {movie.trailerKey && (
          <section className="content-section" style={{ padding: 0 }} aria-labelledby="trailer-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Vídeo</p>
                <h2 id="trailer-title">Trailer Oficial</h2>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "var(--cs-primary-container)" }}>
                play_circle
              </span>
            </div>
            <div className="trailer-frame">
              <iframe
                title={`Trailer de ${movie.title}`}
                src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Elenco */}
        {movie.cast?.length > 0 && (
          <section className="content-section" style={{ padding: 0 }} aria-labelledby="cast-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Elenco</p>
                <h2 id="cast-title">Elenco Principal</h2>
              </div>
            </div>
            <div className="cast-grid">
              {movie.cast.map((person) => (
                <article className="cast-card" key={person.id}>
                  <img
                    src={imageUrl(person.profilePath, "w185") || PROFILE_FALLBACK}
                    alt={`Foto de ${person.name}`}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = PROFILE_FALLBACK; }}
                  />
                  <div className="cast-card__info">
                    <h3>{person.name}</h3>
                    <p>{person.character || "Personagem não informado"}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Filmes Similares em Carrossel */}
        {movie.similar?.length > 0 && (
          <section aria-labelledby="similar-title">
            <div className="rail-header" style={{ marginBottom: "1.25rem" }}>
              <div className="rail-header__left">
                <div className="rail-eyebrow" style={{ color: "var(--cs-secondary)" }}>
                  Descoberta
                </div>
                <h2 id="similar-title" className="text-headline-lg">
                  Filmes Semelhantes
                </h2>
              </div>
              <div className="rail-controls">
                <button
                  className="rail-btn"
                  aria-label="Voltar"
                  onClick={() => similarRailRef.current?.scrollBy({ left: -340, behavior: "smooth" })}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>chevron_left</span>
                </button>
                <button
                  className="rail-btn"
                  aria-label="Avançar"
                  onClick={() => similarRailRef.current?.scrollBy({ left: 340, behavior: "smooth" })}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>chevron_right</span>
                </button>
              </div>
            </div>
            <div className="movie-rail" ref={similarRailRef}>
              {movie.similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}

        {/* Comentários */}
        <section
          className="content-section comments-section"
          style={{ padding: 0 }}
          aria-labelledby="comments-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Comunidade</p>
              <h2 id="comments-title">Comentários</h2>
            </div>
          </div>

          {currentUser ? (
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) {
                  addComment(movie.id, comment);
                  setComment("");
                }
              }}
            >
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva seu comentário sobre o filme..."
                aria-label="Comentário"
              />
              <button className="btn-primary" type="submit">
                Comentar
              </button>
            </form>
          ) : (
            <p className="muted-text">
              <Link to="/login" style={{ color: "var(--cs-secondary)" }}>Faça login</Link> para deixar um comentário.
            </p>
          )}

          <div className="comments-list">
            {(comments[movie.id] || []).map((item) => (
              <article className="comment-card" key={item.id}>
                <strong>{item.author}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
