import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Componentes/Navbar.jsx";
import { FaixaSair } from "../Componentes/FaixaSair.jsx";
import styles from "../Componentes/Componentes - CSS/PrimeiroAcesso.module.css"; // Crie um CSS para estilizar

export default function PrimeiroAcesso() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    senhaProvisoria: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    if (
      !form.email ||
      !form.senhaProvisoria ||
      !form.novaSenha ||
      !form.confirmarSenha
    ) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    // Simula sucesso
    setSucesso(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const handleSair = () => {
    navigate("/splash");
  };

  return (
    <div>
      <Navbar />
      <FaixaSair aoClicar={handleSair} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.left}>
            <img
              src="src/Componentes/assets/roupas.png"
              alt="Roupas"
              className={styles.img}
            />
            <p>Configure seu acesso para fazer seu primeiro login!</p>
          </div>
          <div className={styles.right}>
            <h2>Configure seu acesso!</h2>
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
                name="senhaProvisoria"
                placeholder="Senha provisória"
                value={form.senhaProvisoria}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <input
                type="password"
                name="novaSenha"
                placeholder="Nova senha"
                value={form.novaSenha}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <input
                type="password"
                name="confirmarSenha"
                placeholder="Confirmar nova senha"
                value={form.confirmarSenha}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {erro && <div className={styles.erro}>{erro}</div>}
              <button type="submit" className={styles.btn}>
                Entrar
              </button>
            </form>
            <div className={styles.link}>
              Não é seu primeiro acesso? <span onClick={() => navigate("/login")}>Clique aqui!</span>
            </div>
            {sucesso && (
              <div className={styles.sucessoWrapper}>
              <div className={styles.sucesso}>
               <br /> Senha Cadastrada Com Sucesso!<br /><br />
                Redirecionando para a página de login...
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}