import React from "react";
import estiloStyles from "./Componentes - CSS/estiloTabelas.module.css";
import fornecedorStyles from "./Componentes - CSS/GestaoFornecedor.module.css";

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from "@mui/material";

export function Tabela({
  itens = [],
  modoDelecao = false,
  selecionados = [],
  aoSelecionar = () => {},
  botaoEditar = false,
  onEditar = () => {},
  botaoRemover = false,
  onRemover = () => {},
  renderBotaoEditar,
  renderBotaoRemover,
  theme = "default",
}) {
  const styles = theme === "fornecedor" ? fornecedorStyles : estiloStyles;

  // ✅ MAPEAMENTO FIXO DAS COLUNAS (controla nome visual e ordem)
  const colunas = [
    { key: "nome", label: "NOME" },
    // { key: "tamanho", label: "TAMANHO" },
    // { key: "cor", label: "COR" },
    // { key: "categoria", label: "CATEGORIA" },
    { key: "preco", label: "PREÇO" },
    { key: "qtd_estoque", label: "QTD_ESTOQUE" },
    { key: "codigo", label: "CÓDIGO" }
  ];

  /* ========================
     TEMA FORNECEDOR (tabela HTML simples)
     ======================== */
  if (theme === "fornecedor") {
    if (itens.length === 0) {
      return (
        <div className={styles["tabela-wrapper"]}>
          <table className={styles["tabela-fornecedores"]}>
            <thead>
              <tr>
                <th>Nenhum dado encontrado</th>
              </tr>
            </thead>
          </table>
        </div>
      );
    }

    return (
      <div className={styles["tabela-wrapper"]} style={{ maxWidth: '100%', marginLeft: 0, overflowX: 'auto' }}>
        <table className={styles["tabela-fornecedores"]} style={{ width: '100%' }}>
          <thead>
            <tr>
              {modoDelecao && <th />}
              {colunas.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(botaoEditar || botaoRemover) && <th>AÇÕES</th>}
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={item.id ?? index}>
                {modoDelecao && (
                  <td>
                    <Checkbox
                      checked={selecionados.includes(item.id)}
                      onChange={() => aoSelecionar(item.id)}
                    />
                  </td>
                )}

                {colunas.map((col) => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}

                {(botaoEditar || botaoRemover) && (
                  <td className={styles["acoes-celula"]}>
                    {botaoEditar && (
                      renderBotaoEditar ? (
                        renderBotaoEditar(item, () => onEditar(item))
                      ) : (
                        <button
                          className={styles["btn-editar"]}
                          onClick={() => onEditar(item)}
                        >
                          Editar
                        </button>
                      )
                    )}
                    {botaoRemover && (
                      renderBotaoRemover ? (
                        renderBotaoRemover(item, () => onRemover(item))
                      ) : (
                        <button
                          className={styles["btn-deletar"]}
                          onClick={() => onRemover(item)}
                        >
                          Remover
                        </button>
                      )
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ========================
     TEMA PADRÃO (MUI)
     ======================== */
  if (itens.length === 0) {
    return (
      <Box className={styles["estoque-content-center"]}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Nenhum dado encontrado</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box className={styles["estoque-content-center"]}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {modoDelecao && <TableCell />}
              {colunas.map((col) => (
                <TableCell key={col.key}>
                  {col.label}
                </TableCell>
              ))}
              {(botaoEditar || botaoRemover) && <TableCell>AÇÕES</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {itens.map((item, index) => (
              <TableRow key={item.id ?? index}>
                {modoDelecao && (
                  <TableCell>
                    <Checkbox
                      checked={selecionados.includes(item.id)}
                      onChange={() => aoSelecionar(item.id)}
                    />
                  </TableCell>
                )}

                {colunas.map((col) => (
                  <TableCell key={col.key}>
                    {item[col.key]}
                  </TableCell>
                ))}

                {(botaoEditar || botaoRemover) && (
                  <TableCell>
                    {botaoEditar && (
                      renderBotaoEditar ? (
                        renderBotaoEditar(item, () => onEditar(item))
                      ) : (
                        <Button
                          onClick={() => onEditar(item)}
                          variant="outlined"
                          size="small"
                        >
                          Editar
                        </Button>
                      )
                    )}
                    {botaoRemover && (
                      renderBotaoRemover ? (
                        renderBotaoRemover(item, () => onRemover(item))
                      ) : (
                        <Button
                          onClick={() => onRemover(item)}
                          variant="outlined"
                          color="error"
                          size="small"
                        >
                          Remover
                        </Button>
                      )
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
