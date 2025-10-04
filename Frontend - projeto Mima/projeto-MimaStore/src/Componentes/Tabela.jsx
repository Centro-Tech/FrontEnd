import React from "react";
import styles from "./Componentes - CSS/estiloTabelas.module.css";

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
}) {
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
