import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { useState } from "react";

export function Header() {
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [mobileSearch, setMobileSearch] = useState("");

  function handleMobileSearch(e) {
    if (e.key === "Enter" && mobileSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch("");
    }
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* ── Esquerda: Marca + Nav ── */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <NavLink to="/" className="brand" aria-label="Ir para a página inicial">
            <div className="brand__icon">
              <span className="material-symbols-outlined">movie_filter</span>
            </div>
            <div className="brand__text">
              <span className="brand__name">
                Cine<em>Scope</em>
              </span>
              <span className="brand__sub">Premiere</span>
            </div>
          </NavLink>

          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink to="/" end>
              Início
            </NavLink>
            <NavLink to="/?explore=1">
              Explorar
            </NavLink>
            <NavLink to="/favoritos">
              Favoritos
              {favorites.length > 0 && (
                <span className="nav-badge">{favorites.length}</span>
              )}
            </NavLink>
          </nav>
        </div>

        {/* ── Centro: Busca Desktop ── */}
        <div className="header-search">
          <div className="header-search__wrap">
            <span className="material-symbols-outlined header-search__icon">search</span>
            <input
              type="search"
              className="header-search__input"
              placeholder="Buscar filmes, diretores, atores..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(`/?q=${encodeURIComponent(e.target.value.trim())}`);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>

        {/* ── Direita: Ações ── */}
        <div className="header-actions">
          {/* Busca mobile */}
          <button
            className="btn-search-mobile"
            aria-label="Buscar"
            onClick={() => navigate("/")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.35rem" }}>search</span>
          </button>

          {currentUser ? (
            <button
              className="header-user"
              onClick={logout}
              title="Sair da conta"
            >
              <div className="header-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span style={{ display: "none" }}>Sair</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Entrar
              </Link>
              <div className="header-avatar" aria-hidden="true">
                <span className="material-symbols-outlined">person</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
