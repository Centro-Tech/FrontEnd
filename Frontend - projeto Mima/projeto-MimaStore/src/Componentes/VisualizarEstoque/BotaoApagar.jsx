// BotaoApagar.jsx
import React from "react";
import { Button } from "@mui/material";
import styles from "../../Componentes/Componentes - CSS/estiloTabelas.module.css";

export function BotaoApagar({ linha, onApagar }) {
  return (
    <Button
      variant="contained"
      color="error"
      onClick={() => onApagar(linha)}
      sx={{ borderRadius: 5, minWidth: 80, textTransform: "uppercase", fontWeight: "bold" }}
      className={styles["estoque-delete-btn"]}
    >
      APAGAR
    </Button>
  );
}
