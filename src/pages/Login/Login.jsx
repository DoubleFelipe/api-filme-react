import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

export default function Login() {
  const { currentUser, login, register } = useAuth();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({ name: "", email: "teste@cinescope.com", password: "123456" });
  const [error, setError] = useState("");
  
  if (currentUser) return <Navigate to="/" replace />;
  
  function submit(event) {
    event.preventDefault(); 
    setError("");
    try { 
      registering ? register(form.name, form.email, form.password) : login(form.email, form.password); 
      navigate("/"); 
    } catch (err) { 
      setError(err.message); 
    }
  }
  
  return (
    <div className="page auth-page page-transition">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-card__brand">
          <div className="auth-card__brand-icon">
            <span className="material-symbols-outlined">movie_filter</span>
          </div>
          <span className="auth-card__brand-name">Cine<em>Scope</em></span>
        </div>
        
        <h1>{registering ? "Criar conta" : "Acesse sua conta"}</h1>
        
        {registering && (
          <input 
            required 
            placeholder="Nome completo" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
        )}
        <input 
          required 
          type="email" 
          placeholder="E-mail" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        <input 
          required 
          minLength="6" 
          type="password" 
          placeholder="Senha" 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />
        
        {error && <p className="auth-error">{error}</p>}
        
        <button className="primary-action" type="submit">
          {registering ? "Cadastrar" : "Entrar"}
        </button>
        
        <div className="auth-divider">ou</div>
        
        <button className="text-button" type="button" onClick={() => setRegistering(!registering)}>
          {registering ? "Já tenho uma conta" : "Criar uma conta"}
        </button>
      </form>
    </div>
  );
}
