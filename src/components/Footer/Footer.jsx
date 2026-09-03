import "./Footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="material-symbols-outlined">movie_filter</span>
          <span className="brand-name">Cine<em>Scope</em></span>
        </div>
        <p>Dados fornecidos pelo TMDB. Este projeto usa a API pública apenas para estudo.</p>
      </div>
    </footer>
  );
}
