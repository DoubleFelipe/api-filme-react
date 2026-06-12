import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage("cineScope:favorites", []);

  const value = useMemo(() => {
    function addFavorite(movie) {
      setFavorites((currentFavorites) => {
        if (currentFavorites.some((favorite) => favorite.id === movie.id)) {
          return currentFavorites;
        }

        return [movie, ...currentFavorites];
      });
    }

    function removeFavorite(movieId) {
      setFavorites((currentFavorites) =>
        currentFavorites.filter((favorite) => favorite.id !== movieId),
      );
    }

    function isFavorite(movieId) {
      return favorites.some((favorite) => favorite.id === movieId);
    }

    function toggleFavorite(movie) {
      if (isFavorite(movie.id)) {
        removeFavorite(movie.id);
        return;
      }

      addFavorite(movie);
    }

    return {
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
    };
  }, [favorites, setFavorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites deve ser usado dentro de FavoritesProvider.");
  }

  return context;
}
