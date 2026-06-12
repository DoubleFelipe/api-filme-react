import { Link } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState/EmptyState.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import "./Favorites.css";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="page page-transition favorites-page">
      <section className="content-section" aria-labelledby="favorites-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Minha lista</p>
            <h1 id="favorites-title">Favoritos</h1>
          </div>
          <span className="favorites-count">
            {favorites.length} {favorites.length === 1 ? "filme" : "filmes"}
          </span>
        </div>

        {favorites.length ? (
          <div className="movie-grid">
            {favorites.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sua lista está vazia"
            message="Use o botão de coração nos cards ou na página de detalhes para salvar filmes."
            action={
              <Link className="primary-link" to="/">
                Explorar filmes
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
