import { Heart, Star } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { formatRating, imageUrl, POSTER_FALLBACK } from "../../utils/movie.js";
import "./MovieCard.css";

function MovieCardComponent({ movie, showFavoriteButton = true }) {
  const [posterSrc, setPosterSrc] = useState(imageUrl(movie.posterPath) || POSTER_FALLBACK);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  return (
    <article className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-card__poster-link">
        <img
          src={posterSrc}
          alt={`Poster de ${movie.title}`}
          loading="lazy"
          onError={() => setPosterSrc(POSTER_FALLBACK)}
        />
      </Link>

      <div className="movie-card__body">
        <Link to={`/movie/${movie.id}`} className="movie-card__title">
          {movie.title}
        </Link>
        <div className="movie-card__meta">
          <span>
            <Star aria-hidden="true" size={15} />
            {formatRating(movie.voteAverage)}
          </span>
          {movie.releaseDate ? <span>{movie.releaseDate.slice(0, 4)}</span> : null}
        </div>
      </div>

      {showFavoriteButton ? (
        <button
          className="movie-card__favorite"
          type="button"
          onClick={() => toggleFavorite(movie)}
          aria-label={favorite ? `Remover ${movie.title} dos favoritos` : `Favoritar ${movie.title}`}
          aria-pressed={favorite}
        >
          <Heart aria-hidden="true" size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      ) : null}
    </article>
  );
}

export const MovieCard = memo(MovieCardComponent);
