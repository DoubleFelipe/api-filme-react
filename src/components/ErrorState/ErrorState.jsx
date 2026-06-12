import { AlertTriangle } from "lucide-react";
import "./ErrorState.css";

export function ErrorState({ title = "Não foi possível carregar", message, onRetry }) {
  return (
    <section className="feedback-state" role="alert">
      <AlertTriangle aria-hidden="true" size={34} />
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </section>
  );
}
