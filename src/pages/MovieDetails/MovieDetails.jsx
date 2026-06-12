import { ArrowLeft, Calendar, Clock, Heart, Play, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/ErrorState/ErrorState.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
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

  useEffect(() => {
    let isCurrent = true;

    async function loadMovie() {
      setState({ status: "loading", movie: null, error: "" });

      try {
        const movie = await getMovieDetails(id);

        if (!isCurrent) {
          return;
        }

        setPosterSrc(imageUrl(movie.posterPath, "w780") || POSTER_FALLBACK);
        setState({ status: "success", movie, error: "" });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setState({ status: "error", movie: null, error: error.message });
      }
    }

    loadMovie();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="page">
        <Loading count={6} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="page">
        <ErrorState message={state.error} />
      </div>
    );
  }

  const movie = state.movie;
  const favorite = isFavorite(movie.id);
  const backdrop = imageUrl(movie.backdropPath, "original");

  return (
    <div className="page page-transition">
      <section
        className="details-hero"
        style={backdrop ? { "--backdrop": `url(${backdrop})` } : undefined}
      >
        <Link to="/" className="back-link">
          <ArrowLeft aria-hidden="true" size={18} />
          Voltar
        </Link>

        <div className="details-hero__grid">
          <img
            className="details-poster"
            src={posterSrc}
            alt={`Poster de ${movie.title}`}
            onError={() => setPosterSrc(POSTER_FALLBACK)}
          />

          <div className="details-copy">
            <p className="eyebrow">Detalhes do filme</p>
            <h1>{movie.title}</h1>
            {movie.tagline ? <p className="tagline">{movie.tagline}</p> : null}

            <div className="details-meta" aria-label="Informações principais">
              <span>
                <Star aria-hidden="true" size={18} />
                {formatRating(movie.voteAverage)}
              </span>
              <span>
                <Calendar aria-hidden="true" size={18} />
                {formatDate(movie.releaseDate)}
              </span>
              <span>
                <Clock aria-hidden="true" size={18} />
                {formatRuntime(movie.runtime)}
              </span>
            </div>

            {movie.genres.length ? (
              <ul className="genre-list" aria-label="Gêneros">
                {movie.genres.map((genre) => (
                  <li key={genre.id}>{genre.name}</li>
                ))}
              </ul>
            ) : null}

            <p className="overview">
              {movie.overview || "Sinopse indisponível para este filme."}
            </p>

            <button
              className="favorite-action"
              type="button"
              onClick={() => toggleFavorite(movie)}
              aria-pressed={favorite}
            >
              <Heart aria-hidden="true" size={19} fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </button>
          </div>
        </div>
      </section>

      {movie.trailerKey ? (
        <section className="content-section" aria-labelledby="trailer-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Vídeo</p>
              <h2 id="trailer-title">Trailer</h2>
            </div>
            <Play aria-hidden="true" size={24} />
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
      ) : null}

      {movie.cast.length ? (
        <section className="content-section" aria-labelledby="cast-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Elenco</p>
              <h2 id="cast-title">Elenco principal</h2>
            </div>
          </div>
          <div className="cast-grid">
            {movie.cast.map((person) => (
              <article className="cast-card" key={person.id}>
                <img
                  src={imageUrl(person.profilePath, "w185") || PROFILE_FALLBACK}
                  alt={`Foto de ${person.name}`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = PROFILE_FALLBACK;
                  }}
                />
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.character || "Personagem não informado"}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {movie.similar.length ? (
        <section className="content-section" aria-labelledby="similar-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Descoberta</p>
              <h2 id="similar-title">Filmes semelhantes</h2>
            </div>
          </div>
          <div className="movie-grid">
            {movie.similar.map((similarMovie) => (
              <MovieCard key={similarMovie.id} movie={similarMovie} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
