import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Componentes/Navbar";
import { FaixaSair } from "../Componentes/FaixaSair";
import styles from "../Componentes/Componentes - CSS/PrimeiroAcesso.module.css";
import API from "../Provider/API";
import { AuthContext } from '../Provider/AuthProvider';
import { useLocation } from 'react-router-dom';
import roupasLoginImg from "../Componentes/assets/roupasLogin.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.email || !form.senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      // envia email e senha no formato que o backend espera
      const response = await API.post(
        "/usuarios/login", // endpoint exato
        { email: form.email, senha: form.senha }, 
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.token;
      try { auth.login(token); } catch(e) { localStorage.setItem("token", token); API.defaults.headers.common["Authorization"] = `Bearer ${token}`; }

      try {
        const getEmailFromToken = (token) => {
          try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const obj = JSON.parse(jsonPayload);
            return obj.sub || obj.user_name || obj.email || null;
          } catch (e) {
            return null;
          }
        };

        const email = getEmailFromToken(token);
        if (email) {
          const res = await API.get('/usuarios');
          const lista = res.data || [];
          const encontrado = lista.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
          if (encontrado && (encontrado.id || encontrado.id === 0)) {
            try { sessionStorage.setItem('funcionarioId', String(encontrado.id)); } catch(e) { /* no-op */ }
          }
        }
      } catch (err) {
        
        console.warn('Não foi possível armazenar funcionarioId no sessionStorage', err);
      }

      setSucesso(true);

      const dest = location.state?.from?.pathname || '/menu-inicial';
      setTimeout(() => {
        navigate(dest);
      }, 900);
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("Erro ao realizar login. Tente novamente.");
      }
    }
  };

  const handleSair = () => navigate("/splash");
  const handlePrimeiroAcesso = () => navigate("/primeiro-acesso");

  return (
    <div>
      <Navbar mostrarHamburguer={false} mostrarPerfil={false} />
      <FaixaSair aoClicar={handleSair} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.left}>
            <img
              src={roupasLoginImg}
              alt="Roupas"
              className={styles.img}
            />
            <p>
              Faça login para acessar sua conta! <br />Primeiro acesso? <span onClick={handlePrimeiroAcesso}>Clique aqui!</span>
            </p>
          </div>
          <div className={styles.right}>
            <h2>Acesse sua conta!!</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
              />
              <input
                type="password"
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                autoComplete="current-password"
              />
             
              <button type="submit" className={styles.btn}>Entrar</button>
            </form>
             {erro && <div className={styles.erro}>{erro}</div>}
              <div className={styles.link}>
              Esqueceu sua senha? <span onClick={() => navigate("/mudar-senha")}>Clique aqui!</span>
            </div>
           
          </div>
        </div>
      </div>
      {sucesso && (
        <div className={styles.sucessoWrapper}>
          <div className={styles.sucesso}>
            Login realizado com sucesso!<br /><br />
            <span style={{ fontWeight: 400, fontSize: "1rem" }}>
              Redirecionando para o menu principal...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
