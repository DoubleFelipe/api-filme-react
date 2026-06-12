import { Film, Heart, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Header.css";

export function Header() {
  return (
    <header className="site-header">
      <NavLink to="/" className="brand" aria-label="Ir para a página inicial">
        <Film aria-hidden="true" size={28} />
        <span>CineScope</span>
      </NavLink>

      <nav className="main-nav" aria-label="Navegação principal">
        <NavLink to="/" end>
          <Home aria-hidden="true" size={18} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/favoritos">
          <Heart aria-hidden="true" size={18} />
          <span>Favoritos</span>
        </NavLink>
      </nav>
    </header>
  );
}
