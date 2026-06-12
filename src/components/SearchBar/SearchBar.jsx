import { Search, X } from "lucide-react";
import "./SearchBar.css";

export function SearchBar({ value, onChange, onClear }) {
  return (
    <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="movie-search" className="sr-only">
        Pesquisar filmes
      </label>
      <Search aria-hidden="true" size={22} />
      <input
        id="movie-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pesquise por nome do filme"
        autoComplete="off"
      />
      {value ? (
        <button type="button" onClick={onClear} aria-label="Limpar pesquisa">
          <X aria-hidden="true" size={18} />
        </button>
      ) : null}
    </form>
  );
}
