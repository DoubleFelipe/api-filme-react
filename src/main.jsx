import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CommentsProvider } from "./context/CommentsContext.jsx";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider><CommentsProvider><FavoritesProvider><App /></FavoritesProvider></CommentsProvider></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
