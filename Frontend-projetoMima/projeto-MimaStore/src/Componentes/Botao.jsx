// Botao.jsx
import React from "react";
import styles from "../../Componentes/Componentes - CSS/estiloTabelas.module.css";

export function Botao({ termoPesquisa, setTermoPesquisa, handlePesquisar, handleFiltrarPorM, handleLimpar }) {
  return (
    <div className={styles["estoque-filtros-bar"]} style={{ marginBottom: 20, flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Pesquisar..."
        value={termoPesquisa}
        onChange={(e) => setTermoPesquisa(e.target.value)}
        style={{ marginRight: 10, padding: 5, flex: "1 1 200px" }}
      />
      <button onClick={handlePesquisar} style={{ marginRight: 10, padding: "6px 12px" }}>
        Pesquisar
      </button>
      <button onClick={handleFiltrarPorM} style={{ marginRight: 10, padding: "6px 12px" }}>
        Filtrar por tamanho: M
      </button>
      <button onClick={handleLimpar} style={{ padding: "6px 12px" }}>
        Limpar
      </button>
    </div>
  );
}
