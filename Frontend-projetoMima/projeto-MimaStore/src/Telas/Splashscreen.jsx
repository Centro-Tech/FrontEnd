import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Componentes/Componentes - CSS/Splashscreen.module.css";
import atendimentoImg from "../Componentes/assets/Atendimento.png";

export default function Splashscreen() {
  const navigate = useNavigate();

  const handlePrimeiroAcesso = () => {
    navigate('/primeiro-acesso');
  };

  const handleFazerLogin = () => {
      navigate('/login');
  };

  return (
    <div className={styles.splashscreenBg}>
      <div className={styles.splashscreenCard}>
        <div className={styles.splashscreenLeft}>
          <h1 className={styles.splashscreenTitle}>
            MIMA<br />STORE
          </h1>
          <p className={styles.splashscreenDesc}>
            Gerencie seu estoque e acompanhe suas vendas<br />
            de forma simples, rápida e eficiente
          </p>
          <div className={styles.splashscreenButtons}>
            <button className={styles.splashscreenBtn} onClick={handlePrimeiroAcesso}>
              Primeiro acesso
            </button>
            <button className={styles.splashscreenBtn} onClick={handleFazerLogin}>
              Fazer login
            </button>
          </div>
        </div>
        <div className={styles.splashscreenRight}>
          <img
            src={atendimentoImg}
            alt="Ilustração de atendimento"
            className={styles.splashscreenImg}
          />
        </div>
      </div>
    </div>
  );
}
