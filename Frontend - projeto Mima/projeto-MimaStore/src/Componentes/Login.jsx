import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { FaixaSair } from "./FaixaSair";
import styles from "./Componentes - CSS/primeiroAcesso.module.css"; // Reaproveitando o CSS

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    if (!form.email || !form.senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    // Simula sucesso
    setSucesso(true);
    setTimeout(() => {
      navigate("/menu-inicial");
    }, 2000);
  };

  const handleSair = () => {
    navigate("/splash");
  };

  const handlePrimeiroAcesso = () => {
    navigate("/PrimeiroAcesso");
  };

  return (
    <div>
      <Navbar />
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
            <h2>Acesse sua conta!</h2>
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
              <button type="submit" className={styles.btn}>
                ENTRAR
              </button>
            </form>
            <div className={styles.link}>
              Primeiro acesso?{" "}
              <span onClick={handlePrimeiroAcesso}>Clique aqui!</span>
            </div>
          </div>
        </div>
      </div>
      {sucesso && (
        <div className={styles.sucessoWrapper}>
          <div className={styles.sucesso}>
            Login Realizado Com Sucesso!<br /><br />
            <span style={{ fontWeight: 400, fontSize: "1rem" }}>
              Redirecionando para o menu principal....
            </span>
          </div>
        </div>
      )}
    </div>
  );
}