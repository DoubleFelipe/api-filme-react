import { Film, Heart, Home, LogIn, LogOut, Tags } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../context/AuthContext.jsx";

export function Header() {
  const { currentUser, logout } = useAuth();
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
        <NavLink to="/?category=28"><Tags size={18} /><span>Categorias</span></NavLink>
        {currentUser ? <button className="header-user" onClick={logout}><LogOut size={18} />{currentUser.name}</button> : <NavLink to="/login"><LogIn size={18} /><span>Entrar</span></NavLink>}
      </nav>
    </header>
  );
}
