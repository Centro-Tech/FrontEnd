import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Componentes/Navbar.jsx";
import { FaixaSair } from "../Componentes/FaixaSair.jsx";
import styles from "../Componentes/Componentes - CSS/PrimeiroAcesso.module.css";
import API from "../Provider/API";
import roupasImg from "../Componentes/assets/roupas.png";

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

  const handleSubmit = async (e) => {
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

    try {
      const loginResp = await API.post("/usuarios/login", {
        email: form.email,
        senha: form.senhaProvisoria,
      });

      const loginData = loginResp?.data || {};

      const token =
        loginData.token ||
        loginData.jwt ||
        loginData.tokenJwt ||
        (loginData.tokenDto && loginData.tokenDto.token) ||
        (loginData.usuarioToken && loginData.usuarioToken.token);

      if (!token) {
        setErro(
          "Não foi possível obter o token do servidor após autenticação. Verifique email e senha provisória."
        );
        return;
      }

      await API.post("/usuarios/redefinir-senha", {
        token: token,
        novaSenha: form.novaSenha,
      });

      setSucesso(true);
      setTimeout(() => navigate("/login"), 7000);
    } catch (error) {
      if (error?.response?.status === 401) {
        setErro("Usuário inexistente");
        return;
      }

      const serverMessage =
        (error?.response?.data &&
          (typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message)) ||
        error?.message;

      setErro(
        typeof serverMessage === "string"
          ? serverMessage
          : JSON.stringify(serverMessage)
      );
    }
  };

  const handleSair = () => {
    navigate("/splash");
  };

  return (
    <div>
       <Navbar mostrarHamburguer={false} mostrarPerfil={false}  />
      <FaixaSair aoClicar={handleSair} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.left}>
            <img
              src={roupasImg}
              alt="Roupas"
              className={styles.img}
            />
            <p>Caso seu cadastro já tenha sido realizado, configure o seu primeiro login!</p>
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
              {erro && (
                <div className={styles.erro}>
                  {erro}
                  {erro !== "Usuário inexistente" && (
                    <button
                      type="button"
                      className={styles.closeErro}
                      onClick={() => setErro("")}
                      aria-label="Fechar mensagem de erro"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
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