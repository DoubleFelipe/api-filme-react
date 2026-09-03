import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState/EmptyState.jsx";
import { MovieCard } from "../../components/MovieCard/MovieCard.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import "./Favorites.css";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [params] = useSearchParams();
  const shared = params.get("shared");
  const sharedFavorites = shared ? JSON.parse(atob(shared)) : null;
  const list = sharedFavorites || favorites;
  
  function share() { 
    const url = `${window.location.origin}/favoritos?shared=${btoa(JSON.stringify(favorites))}`; 
    navigator.clipboard?.writeText(url); 
    window.history.replaceState({}, "", url); 
    alert("Link da lista copiado!"); 
  }

  return (
    <div className="page page-transition favorites-page">
      <section className="content-section" aria-labelledby="favorites-title">
        <div className="section-heading favorites-header">
          <div className="favorites-header__title">
            <p className="eyebrow">Minha Lista</p>
            <h1 id="favorites-title" className="text-display-hero">Favoritos</h1>
          </div>
          <div className="favorites-header__actions">
            <span className="favorites-count">{list.length} {list.length === 1 ? "filme" : "filmes"}</span>
            {!sharedFavorites && favorites.length > 0 && (
              <button className="btn-ghost" onClick={share}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>share</span>
                Compartilhar
              </button>
            )}
          </div>
        </div>

        {list.length ? (
          <div className="movie-grid" style={{ paddingTop: "1.5rem" }}>
            {list.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showFavoriteButton={!sharedFavorites} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sua lista está vazia"
            message="Use o botão de coração nos cards ou na página de detalhes para salvar filmes."
            action={
              <Link className="btn-primary" to="/">
                Explorar Filmes
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
