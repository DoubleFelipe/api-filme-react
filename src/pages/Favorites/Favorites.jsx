import { Link, useSearchParams } from "react-router-dom";
import { Share2 } from "lucide-react";
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
  function share() { const url = `${window.location.origin}/favoritos?shared=${btoa(JSON.stringify(favorites))}`; navigator.clipboard?.writeText(url); window.history.replaceState({}, "", url); alert("Link da lista copiado!"); }

  return (
    <div className="page page-transition favorites-page">
      <section className="content-section" aria-labelledby="favorites-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Minha lista</p>
            <h1 id="favorites-title">Favoritos</h1>
          </div>
          <span className="favorites-count">{list.length} {list.length === 1 ? "filme" : "filmes"}</span>
        </div>
        {!sharedFavorites && favorites.length ? <button className="primary-action" onClick={share}><Share2 size={18} /> Compartilhar lista</button> : null}

        {list.length ? (
          <div className="movie-grid">
            {list.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showFavoriteButton={!sharedFavorites} />
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
