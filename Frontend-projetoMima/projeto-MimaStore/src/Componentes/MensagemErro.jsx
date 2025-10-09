import React from "react";
import styles from "./Componentes - CSS/PrimeiroAcesso.module.css";

export function MensagemErro({ mensagem }) {
  if (!mensagem) return null;
  return <div className={styles.erro}>{mensagem}</div>;
}