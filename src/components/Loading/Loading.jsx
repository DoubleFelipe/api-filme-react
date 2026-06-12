import "./Loading.css";

export function Loading({ label = "Carregando filmes", count = 8 }) {
  return (
    <div className="skeleton-grid" aria-label={label} aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-card__poster" />
          <div className="skeleton-card__line" />
          <div className="skeleton-card__line skeleton-card__line--short" />
        </div>
      ))}
    </div>
  );
}
