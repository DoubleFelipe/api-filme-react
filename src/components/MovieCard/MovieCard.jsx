import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { formatRating, imageUrl, POSTER_FALLBACK } from "../../utils/movie.js";
import "./MovieCard.css";

function MovieCardComponent({ movie, showFavoriteButton = true }) {
  const [posterSrc, setPosterSrc] = useState(
    imageUrl(movie.posterPath) || POSTER_FALLBACK
  );
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  // Primeiro gênero do filme (se disponível)
  const genre = movie.genreNames?.[0] ?? movie.genres?.[0]?.name ?? null;
  const year = movie.releaseDate?.slice(0, 4) ?? null;

  return (
    <article className="movie-card">
      <div className="movie-card__poster-wrap">
        <Link to={`/movie/${movie.id}`} className="movie-card__poster-link" tabIndex={-1}>
          <img
            src={posterSrc}
            alt={`Poster de ${movie.title}`}
            loading="lazy"
            onError={() => setPosterSrc(POSTER_FALLBACK)}
          />
        </Link>

        {/* Overlay gradiente */}
        <div className="movie-card__overlay" aria-hidden="true" />

        {/* Badge de nota */}
        {movie.voteAverage > 0 && (
          <div className="movie-card__rating" aria-label={`Nota: ${formatRating(movie.voteAverage)}`}>
            <span className="material-symbols-outlined">star</span>
            <span>{formatRating(movie.voteAverage)}</span>
          </div>
        )}

        {/* Botão favoritar */}
        {showFavoriteButton && (
          <button
            className="movie-card__favorite"
            type="button"
            onClick={() => toggleFavorite(movie)}
            aria-label={
              favorite
                ? `Remover ${movie.title} dos favoritos`
                : `Favoritar ${movie.title}`
            }
            aria-pressed={favorite}
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
        )}
      </div>

      <div className="movie-card__body">
        <Link to={`/movie/${movie.id}`} className="movie-card__title">
          {movie.title}
        </Link>
        <div className="movie-card__meta">
          <span>{year ?? "—"}</span>
          {genre && <span className="movie-card__genre">{genre}</span>}
        </div>
      </div>
    </article>
  );
}

export const MovieCard = memo(MovieCardComponent);
