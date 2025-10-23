import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Componentes/Navbar";
import { FaixaSair } from "../Componentes/FaixaSair";
import styles from "../Componentes/Componentes - CSS/PrimeiroAcesso.module.css";
import API from "../Provider/API";

export default function Login() {
  const navigate = useNavigate();
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
      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setSucesso(true);

      // redireciona após 2s
      setTimeout(() => {
        navigate("/menu-inicial");
      }, 2000);
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
              src="src/Componentes/assets/roupasLogin.png"
              alt="Roupas"
              className={styles.img}
            />
            <p>
              Faça login para acessar sua conta e continuar gerenciando tudo com praticidade e segurança.
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
              {erro && <div className={styles.erro}>{erro}</div>}
              <div className={styles.link}>
              Esqueceu sua senha? <span onClick={() => navigate("/mudar-senha")}>Clique aqui!</span>
            </div>
              <button type="submit" className={styles.btn}>Entrar</button>
            </form>
            <div className={styles.link}>
              Primeiro acesso? <span onClick={handlePrimeiroAcesso}>Clique aqui!</span>
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
