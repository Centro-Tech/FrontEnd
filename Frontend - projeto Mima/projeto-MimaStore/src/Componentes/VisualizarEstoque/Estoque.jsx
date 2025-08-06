import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tabela } from "./Tabela";
import EstoquePopUp from "./EstoquePopUp";
import { Navbar } from "../../Componentes/Navbar";

import {
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Drawer,
  Slider,
  Typography,
} from "@mui/material";
import styles from "../../Componentes/Componentes - CSS/estiloTabelas.module.css";

export default function Estoque() {
  const [itens, setItens] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(7);
  const [modoDelecao, setModoDelecao] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Filtros
  const [filtroTamanhos, setFiltroTamanhos] = useState([]);
  const [filtroFornecedores, setFiltroFornecedores] = useState([]);
  const [filtroPreco, setFiltroPreco] = useState([0, 1000]);
  const [filtroQtd, setFiltroQtd] = useState([0, 1000]);

  // Guarda os valores mínimo e máximo reais para resetar filtros
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(1000);
  const [qtdMin, setQtdMin] = useState(0);
  const [qtdMax, setQtdMax] = useState(1000);

  useEffect(() => {
    buscarEstoque();
  }, []);

  const buscarEstoque = async () => {
    try {
      const res = await axios.get("http://localhost:3001/estoque-completo");
      setItens(res.data);
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
    }
  };

  // Atualiza filtroPreco e filtroQtd para o intervalo real após carregar os itens
  useEffect(() => {
    if (itens.length > 0) {
      const precos = itens.map((i) => i.preco || 0);
      const minPreco = Math.min(...precos);
      const maxPreco = Math.max(...precos);
      setPrecoMin(minPreco);
      setPrecoMax(maxPreco);
      setFiltroPreco([minPreco, maxPreco]);

      const qtds = itens.map((i) => i.qtd_estoque || 0);
      const minQtd = Math.min(...qtds);
      const maxQtd = Math.max(...qtds);
      setQtdMin(minQtd);
      setQtdMax(maxQtd);
      setFiltroQtd([minQtd, maxQtd]);
    }
  }, [itens]);

  // Filtragem combinada
  const itensFiltrados = itens.filter((item) => {
    const matchNome = item.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTamanho =
      filtroTamanhos.length === 0 || filtroTamanhos.includes(item.tamanho);
    const matchFornecedor =
      filtroFornecedores.length === 0 || filtroFornecedores.includes(item.fornecedor?.nome);
    const matchPreco =
      item.preco >= filtroPreco[0] && item.preco <= filtroPreco[1];
    const matchQtd =
      item.qtd_estoque >= filtroQtd[0] && item.qtd_estoque <= filtroQtd[1];

    return matchNome && matchTamanho && matchFornecedor && matchPreco && matchQtd;
  });

  // Filtra apenas os campos desejados para exibição
  const camposExibidos = ["codigo", "nome", "tamanho", "qtd_estoque", "preco"];
  const itensFiltradosParaTabela = itensFiltrados.map((item) => {
    const novoItem = { id: item.id }; // mantém o id para seleção/deleção
    camposExibidos.forEach((campo) => {
      novoItem[campo] = item[campo];
    });
    return novoItem;
  });

  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim = indexInicio + itensPorPagina;
  const itensPagina = itensFiltradosParaTabela.slice(indexInicio, indexFim);
  const totalPaginas = Math.ceil(itensFiltradosParaTabela.length / itensPorPagina);

  const handleSelecionar = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((itemId) => itemId !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const itensParaRemover = itens.filter((item) => selecionados.includes(item.id));

  const abrirPopup = () => setMostrarPopup(true);
  const fecharPopup = () => setMostrarPopup(false);

  const handleConfirmarRemocao = async () => {
    try {
      await axios.delete("http://localhost:3001/itens", {
        data: { ids: selecionados },
      });
      await buscarEstoque();
      setSelecionados([]);
      setModoDelecao(false);
      setMostrarPopup(false);
    } catch (err) {
      console.error("Erro ao deletar itens:", err);
    }
  };

  // Resetar todos filtros para o estado inicial (incluindo busca e página)
  const resetarFiltros = () => {
    setBusca("");
    setFiltroTamanhos([]);
    setFiltroFornecedores([]);
    setFiltroPreco([precoMin, precoMax]);
    setFiltroQtd([qtdMin, qtdMax]);
    setPaginaAtual(1);
  };

  // Utilitários para montar opções de filtro únicas
  const tamanhosDisponiveis = [
    ...new Set(itens.map((i) => i.tamanho).filter(Boolean)),
  ];
  const fornecedoresDisponiveis = [
    ...new Set(itens.map((i) => i.fornecedor?.nome).filter(Boolean)),
  ];

  return (
     <>
         <Navbar />
    <Box className={`${styles["container"]} ${styles["page-container"]}`} sx={{ padding: "0 0 32px 0" }}>
      <div className={styles["estoque-title"]}>Estoque</div>
      <div className={styles["estoque-content-center"]}>
        <Box className={styles["estoque-filtros-bar"]}>
          <TextField
            label="Pesquisar por termo"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button
            variant="outlined"
            onClick={() => setFiltrosAbertos(true)}
          >
            Filtros
          </Button>
          <Button
            className={styles["estoque-delete-btn"]}
            variant="contained"
            color={modoDelecao ? "error" : "primary"}
            onClick={() => (modoDelecao ? abrirPopup() : setModoDelecao(true))}
            disabled={modoDelecao && selecionados.length === 0}
          >
            {modoDelecao ? "Confirmar remoção" : "DELETAR PEÇAS"}
          </Button>
        </Box>

        <Tabela
          itens={itensPagina}
          modoDelecao={modoDelecao}
          selecionados={selecionados}
          aoSelecionar={handleSelecionar}
        />

        <Box className={styles["estoque-pagination"]}>
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            &lt; Página anterior
          </button>
          <span>
            {/* Página {paginaAtual} de {totalPaginas} */}
          </span>
          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima página &gt;
          </button>
        </Box>
      </div>

      {/* Pop-up de confirmação */}
      <EstoquePopUp
        mostrar={mostrarPopup}
        itens={itensParaRemover}
        onConfirmar={handleConfirmarRemocao}
        onCancelar={fecharPopup}
      />

      <Drawer
        anchor="right"
        open={filtrosAbertos}
        onClose={() => setFiltrosAbertos(false)}
      >
        <Box sx={{ width: 240, padding: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 16, mb: 1 }}>Filtros</Typography>

          <Typography variant="subtitle1" sx={{ fontSize: 14, mt: 1 }}>Tamanhos</Typography>
          {tamanhosDisponiveis.map((tamanho) => (
            <FormControlLabel
              key={tamanho}
              control={
                <Checkbox
                  checked={filtroTamanhos.includes(tamanho)}
                  onChange={(e) => {
                    setFiltroTamanhos((prev) =>
                      e.target.checked
                        ? [...prev, tamanho]
                        : prev.filter((t) => t !== tamanho)
                    );
                  }}
                  size="small"
                />
              }
              label={<span style={{ fontSize: 13 }}>{tamanho}</span>}
            />
          ))}

          <Typography variant="subtitle1" sx={{ fontSize: 14, mt: 2 }}>Fornecedores</Typography>
          {fornecedoresDisponiveis.map((fornecedor) => (
            <FormControlLabel
              key={fornecedor}
              control={
                <Checkbox
                  checked={filtroFornecedores.includes(fornecedor)}
                  onChange={(e) => {
                    setFiltroFornecedores((prev) =>
                      e.target.checked
                        ? [...prev, fornecedor]
                        : prev.filter((f) => f !== fornecedor)
                    );
                  }}
                  size="small"
                />
              }
              label={<span style={{ fontSize: 13 }}>{fornecedor}</span>}
            />
          ))}

          <Typography variant="subtitle1" sx={{ fontSize: 14, mt: 2 }}>Preço</Typography>
          <Slider
            value={filtroPreco}
            onChange={(e, novoValor) => setFiltroPreco(novoValor)}
            valueLabelDisplay="auto"
            min={precoMin}
            max={precoMax}
            size="small"
            sx={{ mt: 1 }}
          />

          <Typography variant="subtitle1" sx={{ fontSize: 14, mt: 2 }}>Quantidade em Estoque</Typography>
          <Slider
            value={filtroQtd}
            onChange={(e, novoValor) => setFiltroQtd(novoValor)}
            valueLabelDisplay="auto"
            min={qtdMin}
            max={qtdMax}
            size="small"
            sx={{ mt: 1 }}
          />

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2, mb: 1, fontSize: 13, height: 30 }}
            onClick={resetarFiltros}
          >
            Resetar filtros
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 0, fontSize: 13, height: 30 }}
            onClick={() => setFiltrosAbertos(false)}
          >
            Fechar
          </Button>
        </Box>
      </Drawer>
    </Box>
    </>
  );
}
