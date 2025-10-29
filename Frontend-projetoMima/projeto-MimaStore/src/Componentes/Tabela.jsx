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
  renderBotaoEditar, // optional custom renderer
  renderBotaoRemover, // optional custom renderer
  theme = "default", // 'default' uses MUI-based estiloStyles, 'fornecedor' uses plain table styles
}) {
  const styles = theme === "fornecedor" ? fornecedorStyles : estiloStyles;

  // fornecedor theme: render a plain semantic table using fornecedorStyles classes
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

    const colunas = Object.keys(itens[0]).filter((col) => col !== "id");

    return (
      <div className={styles["tabela-wrapper"]} style={{ maxWidth: '100%', marginLeft: 0, overflowX: 'auto' }}>
        <table className={styles["tabela-fornecedores"]} style={{ minWidth: 0, width: '100%' }}>
          <thead>
            <tr>
              {modoDelecao && <th />}
              {colunas.map((col) => (
                <th key={col}>{col.toUpperCase()}</th>
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
                  <td key={col}>{item[col]}</td>
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

  // default MUI-based rendering (original behavior)
  if (itens.length === 0) {
    return (
      <Box className={styles["estoque-content-center"]}>
        <TableContainer component={Paper} className={styles["MuiTableContainer-root"]}>
          <Table className={styles["MuiTable-root"]}>
            <TableHead>
              <TableRow>
                <TableCell className={styles["MuiTableHead-root"]} align="center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  const colunas = Object.keys(itens[0]).filter((col) => col !== "id");

  return (
    <Box className={styles["estoque-content-center"]}>
      <TableContainer component={Paper} className={styles["MuiTableContainer-root"]}>
        <Table className={styles["MuiTable-root"]}>
          <TableHead>
            <TableRow>
              {modoDelecao && <TableCell className={styles["MuiTableHead-root"]} />}
              {colunas.map((col) => (
                <TableCell key={col} className={styles["MuiTableHead-root"]}>
                  {col.toUpperCase()}
                </TableCell>
              ))}
              {(botaoEditar || botaoRemover) && (
                <TableCell className={styles["MuiTableHead-root"]}>AÇÕES</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item, index) => (
              <TableRow key={item.id ?? index} className={styles["MuiTableBody-root"]}>
                {modoDelecao && (
                  <TableCell className={styles["MuiTableBody-root"]}>
                    <Checkbox
                      checked={selecionados.includes(item.id)}
                      onChange={() => aoSelecionar(item.id)}
                    />
                  </TableCell>
                )}
                {colunas.map((col) => (
                  <TableCell key={col} className={styles["MuiTableBody-root"]}>
                    {item[col]}
                  </TableCell>
                ))}
                {(botaoEditar || botaoRemover) && (
                  <TableCell className={styles["MuiTableBody-root"]}>
                    {botaoEditar && (
                      <Button
                        onClick={() => onEditar(item)}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: "#555",
                          borderColor: "#ccc",
                          borderRadius: "12px",
                          textTransform: "none",
                          fontWeight: "bold",
                          marginRight: 1,
                          "&:hover": {
                            borderColor: "#aaa",
                            backgroundColor: "#f0f0f0",
                          },
                        }}
                      >
                        Editar
                      </Button>
                    )}
                    {botaoRemover && (
                      <Button
                        onClick={() => onRemover(item)}
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Remover
                      </Button>
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
