import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary.jsx";
import { Footer } from "./components/Footer/Footer.jsx";
import { Header } from "./components/Header/Header.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <Header />
      <main id="main-content" className="app-shell">
        <AppRoutes />
      </main>
      <Footer />
    </ErrorBoundary>
  );
}
