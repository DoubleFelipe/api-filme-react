import { Link } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState/EmptyState.jsx";

export default function NotFound() {
  return (
    <div className="page page-transition">
      <EmptyState
        title="Página não encontrada"
        message="O endereço acessado não existe nesta aplicação."
        action={
          <Link className="primary-link" to="/">
            Voltar ao início
          </Link>
        }
      />
    </div>
  );
}
