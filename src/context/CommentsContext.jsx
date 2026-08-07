import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useAuth } from "./AuthContext.jsx";

const CommentsContext = createContext(null);

export function CommentsProvider({ children }) {
  const [comments, setComments] = useLocalStorage("cineScope:comments", {});
  const { currentUser } = useAuth();
  function addComment(movieId, text) {
    if (!currentUser) throw new Error("Faça login para comentar.");
    const comment = { id: Date.now(), author: currentUser.name, text: text.trim(), date: new Date().toISOString() };
    setComments((items) => ({ ...items, [movieId]: [comment, ...(items[movieId] || [])] }));
  }
  const value = { comments, addComment };
  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (!context) throw new Error("useComments deve ser usado dentro de CommentsProvider.");
  return context;
}
