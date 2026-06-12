import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary" role="alert">
          <h1>Algo saiu do previsto.</h1>
          <p>Recarregue a página ou tente novamente em alguns instantes.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
