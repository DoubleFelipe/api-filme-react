import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const AuthContext = createContext(null);
const TEST_USER = { name: "Usuário Teste", email: "teste@cinescope.com", password: "123456" };

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage("cineScope:users", [TEST_USER]);
  const [currentUser, setCurrentUser] = useLocalStorage("cineScope:currentUser", null);

  function login(email, password) {
    const user = users.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
    if (!user) throw new Error("E-mail ou senha inválidos.");
    setCurrentUser({ name: user.name, email: user.email });
  }

  function register(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email === normalizedEmail)) throw new Error("Este e-mail já está cadastrado.");
    setUsers((items) => [...items, { name: name.trim(), email: normalizedEmail, password }]);
    setCurrentUser({ name: name.trim(), email: normalizedEmail });
  }

  const value = { currentUser, login, register, logout: () => setCurrentUser(null) };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
