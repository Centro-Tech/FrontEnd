import React from "react";
import styles from "./Componentes - CSS/estiloTabelas.module.css";

export default function EstoquePopUp({ mostrar, itens, onConfirmar, onCancelar }) {
  if (!mostrar || !itens.length) return null;

  const isVendaItem = itens[0] && "quantidade" in itens[0];

  return (
    <div className={styles["popup-estoque-overlay"]}>
      <div className={styles["popup-estoque-box"]}>
        <div className={styles["popup-estoque-title"]}>
          {isVendaItem
            ? "O(s) seguinte(s) item(ns) serão removidos da venda:"
            : "O(s) seguinte(s) item(ns) serão removidos do estoque:"}
        </div>
        <table className={styles["popup-estoque-table"]}>
          <thead>
            <tr>
                    {isVendaItem ? (
                <>
                  <th>NOME</th>
                  <th>FORNECEDOR</th>
                  <th>QTD</th>
                  <th>PREÇO</th>
                </>
              ) : (
                <>
                  <th>CÓDIGO</th>
                  <th>NOME</th>
                  <th>TAMANHO</th>
                  <th>QTD</th>
                  <th>VALOR</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) =>
              isVendaItem ? (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.fornecedor || ""}</td>
                  <td>{item.quantidade}</td>
                  <td>
                    {item.preco !== undefined
                      ? `R$${Math.max(0, Number(item.preco)).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : ""}
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.nome}</td>
                  <td>{item.tamanho}</td>
                  <td>{item.qtd_estoque}</td>
                  <td>
                    {item.preco !== undefined
                      ? `R$${Math.max(0, Number(item.preco)).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : ""}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <div className={styles["popup-estoque-btns"]}>
          <button className={`${styles["popup-btn"]} ${styles["cancelar"]}`} onClick={onCancelar}>
            Cancelar
          </button>
          <button className={`${styles["popup-btn"]} ${styles["remover"]}`} onClick={onConfirmar}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
