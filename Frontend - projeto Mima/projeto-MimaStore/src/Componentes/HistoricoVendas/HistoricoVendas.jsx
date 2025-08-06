import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tabela } from "../VisualizarEstoque/Tabela";
import EstoquePopUp from "../VisualizarEstoque/EstoquePopUp";
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

const MOCK_CLIENTES = [
  {
    vendaId: 1,
    data: "2025-08-01T17:41:13.000Z",
    cliente: "Maria Oliveira",
    valor_total: 189.7,
    quantidade: "3",
    id: 1,
  },
  {
    vendaId: 2,
    data: "2025-08-01T17:41:13.000Z",
    cliente: "João Pereira",
    valor_total: 129.9,
    quantidade: "1",
    id: 2,
  },
  {
    vendaId: 4,
    data: "2025-07-25T03:00:00.000Z",
    cliente: "João Pereira",
    valor_total: 0,
    quantidade: "0",
    id: 4,
  },
  {
    vendaId: 3,
    data: "2025-07-24T03:00:00.000Z",
    cliente: "Maria Oliveira",
    valor_total: 0,
    quantidade: "0",
    id: 3,
  },
];

// Mock de itens caso falhe a chamada de /venda/:id/itens
const MOCK_ITENS = [
  {
    id: 1,
    nome: "Vestido Floral",
    preco: 120.0,
    quantidade: 1,
    fornecedor: "Fornecedor A",
    cor: "Rosa",
  },
  {
    id: 2,
    nome: "Blusa de Linho",
    preco: 69.9,
    quantidade: 2,
    fornecedor: "Fornecedor B",
    cor: "Branco",
  },
];

export default function HistoricoVendas() {
  const [clientes, setClientes] = useState([]);
  const [buscaClientes, setBuscaClientes] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [itensPagina, setItensPagina] = useState([]);
  const [paginaAtualItens, setPaginaAtualItens] = useState(1);
  const itensPorPaginaItens = 7;

  const [buscaItens, setBuscaItens] = useState("");
  const [filtrosAbertosItens, setFiltrosAbertosItens] = useState(false);

  const [filtrosAbertosVendas, setFiltrosAbertosVendas] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroValor, setFiltroValor] = useState([0, 100000]);
  const [valorMin, setValorMin] = useState(0);
  const [valorMax, setValorMax] = useState(100000);

  const [filtroCoresItens, setFiltroCoresItens] = useState([]);
  const [filtroFornecedoresItens, setFiltroFornecedoresItens] = useState([]);
  const [filtroPrecoItens, setFiltroPrecoItens] = useState([0, 100000]);
  const [precoMinItens, setPrecoMinItens] = useState(0);
  const [precoMaxItens, setPrecoMaxItens] = useState(100000);
  const [opcoesCoresItens, setOpcoesCoresItens] = useState([]);
  const [opcoesFornecedoresItens, setOpcoesFornecedoresItens] = useState([]);

  const [carregandoItens, setCarregandoItens] = useState(false);

  const [mostrarPopUp, setMostrarPopUp] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/vendas-clientes")
      .then((res) => {
        let clientesComId = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          clientesComId = res.data.map((c) => ({ ...c, id: c.vendaId }));
        } else {
          // fallback para mock se vier vazio
          clientesComId = MOCK_CLIENTES;
        }
        setClientes(clientesComId);
        setClientesFiltrados(clientesComId);

        if (clientesComId.length > 0) {
          const valores = clientesComId.map((c) => Number(c.valor_total) || 0);
          const min = Math.min(...valores);
          const max = Math.max(...valores);
          setValorMin(min);
          setValorMax(max);
          setFiltroValor([min, max]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar vendas:", err);
        // fallback em caso de erro de conexão
        setClientes(MOCK_CLIENTES);
        setClientesFiltrados(MOCK_CLIENTES);
        if (MOCK_CLIENTES.length > 0) {
          const valores = MOCK_CLIENTES.map((c) => Number(c.valor_total) || 0);
          const min = Math.min(...valores);
          const max = Math.max(...valores);
          setValorMin(min);
          setValorMax(max);
          setFiltroValor([min, max]);
        }
      });
  }, []);

  useEffect(() => {
    let filtrados = clientes;

    if (buscaClientes) {
      const termo = buscaClientes.toLowerCase();
      filtrados = filtrados.filter(
        (c) =>
          c.cliente.toLowerCase().includes(termo) ||
          String(c.vendaId).includes(termo) ||
          String(c.valor_total).includes(termo)
      );
    }

    if (filtroCliente) {
      filtrados = filtrados.filter((c) =>
        c.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }

    filtrados = filtrados.filter(
      (c) =>
        Number(c.valor_total) >= filtroValor[0] &&
        Number(c.valor_total) <= filtroValor[1]
    );

    setClientesFiltrados(filtrados);
  }, [buscaClientes, clientes, filtroCliente, filtroValor]);

  const handleEditar = (cliente) => {
    setCarregandoItens(true);
    axios
      .get(`http://localhost:3001/venda/${cliente.vendaId}/itens`)
      .then((res) => {
        let itensComId = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          itensComId = res.data.map((item, index) => ({
            ...item,
            id: item.id ?? index,
            cor: item.cor || null,
            fornecedor: item.fornecedor || null,
            preco: item.preco ?? 0,
            quantidade: item.quantidade ?? item.qtdParaVender ?? 0,
          }));
        } else {
          // fallback se vazio
          itensComId = MOCK_ITENS.map((i) => ({
            ...i,
            fornecedor: { nome: i.fornecedor },
            cor: i.cor,
          }));
        }

        const clienteComItens = { ...cliente, itens: itensComId };
        setClienteSelecionado(clienteComItens);
        setItensFiltrados(itensComId);
        setBuscaItens("");

        if (itensComId.length > 0) {
          const precos = itensComId.map((i) => Number(i.preco) || 0);
          const min = Math.min(...precos);
          const max = Math.max(...precos);
          setPrecoMinItens(min);
          setPrecoMaxItens(max);
          setFiltroPrecoItens([min, max]);

          const coresUnicas = [
            ...new Set(
              itensComId
                .map((i) => (typeof i.cor === "string" ? i.cor.toLowerCase() : null))
                .filter(Boolean)
            ),
          ];
          setOpcoesCoresItens(coresUnicas);
          setFiltroCoresItens([]);

          const fornecedoresUnicos = [
            ...new Set(
              itensComId
                .map((i) =>
                  i.fornecedor
                    ? typeof i.fornecedor === "string"
                      ? i.fornecedor
                      : i.fornecedor.nome
                    : null
                )
                .filter(Boolean)
            ),
          ];
          setOpcoesFornecedoresItens(fornecedoresUnicos);
          setFiltroFornecedoresItens([]);
        }

        setPaginaAtualItens(1);
      })
      .catch((err) => {
        console.error("Erro ao buscar itens da venda:", err);
        // fallback para mock caso falhe
        const itensComId = MOCK_ITENS.map((i) => ({
          ...i,
          fornecedor: { nome: i.fornecedor },
          cor: i.cor,
        }));
        const clienteComItens = { ...cliente, itens: itensComId };
        setClienteSelecionado(clienteComItens);
        setItensFiltrados(itensComId);
        setBuscaItens("");

        const precos = itensComId.map((i) => Number(i.preco) || 0);
        const min = Math.min(...precos);
        const max = Math.max(...precos);
        setPrecoMinItens(min);
        setPrecoMaxItens(max);
        setFiltroPrecoItens([min, max]);

        const coresUnicas = [
          ...new Set(
            itensComId
              .map((i) => (typeof i.cor === "string" ? i.cor.toLowerCase() : null))
              .filter(Boolean)
          ),
        ];
        setOpcoesCoresItens(coresUnicas);
        setFiltroCoresItens([]);

        const fornecedoresUnicos = [
          ...new Set(
            itensComId
              .map((i) =>
                i.fornecedor
                  ? typeof i.fornecedor === "string"
                    ? i.fornecedor
                    : i.fornecedor.nome
                  : null
              )
              .filter(Boolean)
          ),
        ];
        setOpcoesFornecedoresItens(fornecedoresUnicos);
        setFiltroFornecedoresItens([]);

        setPaginaAtualItens(1);
      })
      .finally(() => setCarregandoItens(false));
  };

  const itensFiltradosComFiltros = (clienteSelecionado?.itens || []).filter((item) => {
    const termo = buscaItens.toLowerCase();
    const matchBusca =
      (item.nome?.toLowerCase().includes(termo)) ||
      String(item.quantidade).includes(termo);

    const matchCor =
      filtroCoresItens.length === 0 || filtroCoresItens.includes(item.cor?.toLowerCase());
    const matchFornecedor =
      filtroFornecedoresItens.length === 0 ||
      filtroFornecedoresItens.includes(
        item.fornecedor ? item.fornecedor.nome || item.fornecedor : ""
      );
    const precoItem = Number(item.preco) || 0;
    const matchPreco = precoItem >= filtroPrecoItens[0] && precoItem <= filtroPrecoItens[1];

    return matchBusca && matchCor && matchFornecedor && matchPreco;
  });

  const indexInicioItens = (paginaAtualItens - 1) * itensPorPaginaItens;
  const indexFimItens = indexInicioItens + itensPorPaginaItens;
  const itensPaginaFinal = itensFiltradosComFiltros.slice(indexInicioItens, indexFimItens);
  const totalPaginasItens = Math.ceil(itensFiltradosComFiltros.length / itensPorPaginaItens);

  const handleRemover = (item) => {
    setItemParaRemover(item);
    setMostrarPopUp(true);
  };

  const confirmarExclusao = (item) => {
    axios
      .delete(`http://localhost:3001/itemvenda/${item.id}`)
      .then(() => {
        const novosItens = clienteSelecionado.itens.filter((i) => i.id !== item.id);
        setClienteSelecionado((prev) => ({ ...prev, itens: novosItens }));
        setMostrarPopUp(false);
        setItemParaRemover(null);
      })
      .catch((err) => console.error("Erro ao excluir item:", err));
  };

  const cancelarExclusao = () => {
    setMostrarPopUp(false);
    setItemParaRemover(null);
  };

  const resetarFiltrosItens = () => {
    setBuscaItens("");
    setFiltroCoresItens([]);
    setFiltroFornecedoresItens([]);
    setFiltroPrecoItens([precoMinItens, precoMaxItens]);
    setPaginaAtualItens(1);
  };

  const resetarFiltrosVendas = () => {
    setFiltroCliente("");
    setFiltroValor([valorMin, valorMax]);
  };

  const renderBotaoEditar = (linha, onEditar) => (
    <Button
      variant="contained"
      onClick={() => onEditar(linha)}
      sx={{
        background: "#bdbdbd",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "7px",
        minWidth: 80,
        fontSize: "0.95rem",
        boxShadow: "none",
        textTransform: "uppercase",
        "&:hover": { background: "#a0a0a0", color: "#fff" },
      }}
    >
      EDITAR
    </Button>
  );

  const renderBotaoRemover = (linha, onRemover) => (
    <Button
      variant="contained"
      onClick={() => onRemover(linha)}
      sx={{
        background: "#c62828",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "7px",
        minWidth: 80,
        fontSize: "0.95rem",
        boxShadow: "none",
        textTransform: "uppercase",
        "&:hover": { background: "#b71c1c", color: "#fff" },
      }}
    >
      REMOVER
    </Button>
  );

  function formatarData(dataString) {
    if (!dataString) return "";
    const data = new Date(dataString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} - ${pad(
      data.getHours()
    )}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`;
  }

  function mapClientesParaTabela(clientes) {
    return clientes.map((c) => ({
      id: c.vendaId,
      idVenda: c.vendaId,
      Nome: c.cliente,
      "Data / Hora": formatarData(c.data),
      Quantidade: c.quantidade ?? 0,
      "Valor Total": Number(c.valor_total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    }));
  }

  return (
     <>
     <Navbar />
    <div className={styles["page-container"]}>
      <h1 className={styles["page-title"]}>Histórico de Vendas</h1>

      <div
        className={styles["estoque-content-center"]}
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        {!clienteSelecionado ? (
          <>
            <Box
              className={styles["estoque-filtros-bar"]}
              sx={{
                mb: 2,
                maxWidth: 900,
                margin: "0 auto",
                width: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <TextField
                label="Pesquisar cliente, ID ou valor"
                value={buscaClientes}
                onChange={(e) => setBuscaClientes(e.target.value)}
                size="small"
                sx={{
                  minWidth: 260,
                  fontSize: 15,
                  background: "#fff",
                  borderRadius: "7px",
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setFiltrosAbertosVendas(true)}
                className={styles["estoque-filtros-btn"]}
                sx={{
                  background: "#fff",
                  color: "#6c217e",
                  border: "1.5px solid #6c217e",
                  borderRadius: "7px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  minWidth: "105px",
                  height: "36px",
                  boxShadow: "none",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  "&:hover": {
                    background: "#f6eaf7",
                    borderColor: "#6c217e",
                  },
                }}
              >
                FILTROS
              </Button>
            </Box>

            <Tabela
              itens={mapClientesParaTabela(clientesFiltrados)}
              botaoEditar
              onEditar={(linha) => {
                const original = clientesFiltrados.find(
                  (c) => c.vendaId === linha.idVenda
                );
                handleEditar(original);
              }}
              renderBotaoEditar={renderBotaoEditar}
            />
            <Drawer
              anchor="right"
              open={filtrosAbertosVendas}
              onClose={() => setFiltrosAbertosVendas(false)}
            >
              <Box sx={{ width: 260, p: 2 }}>
                <Typography variant="h6" sx={{ fontSize: 16 }}>
                  Filtros de vendas
                </Typography>

                <Typography variant="subtitle1" mt={2} sx={{ fontSize: 14 }}>
                  Cliente
                </Typography>
                <TextField
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  size="small"
                  placeholder="Nome do cliente"
                  fullWidth
                  sx={{ mb: 1 }}
                />

                <Typography variant="subtitle1" mt={2} sx={{ fontSize: 14 }}>
                  Valor total
                </Typography>
                <Slider
                  value={filtroValor}
                  onChange={(e, novoValor) => setFiltroValor(novoValor)}
                  valueLabelDisplay="auto"
                  min={valorMin}
                  max={valorMax}
                  size="small"
                  sx={{ mt: 1 }}
                />

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2, mb: 1, fontSize: 13, height: 30 }}
                  onClick={resetarFiltrosVendas}
                >
                  Resetar filtros
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 0, fontSize: 13, height: 30 }}
                  onClick={() => setFiltrosAbertosVendas(false)}
                >
                  Fechar
                </Button>
              </Box>
            </Drawer>
          </>
        ) : (
          <>
            <h2
              style={{
                fontSize: 22,
                margin: "18px 0 10px 0",
                textAlign: "center",
              }}
            >
              Itens da venda de {clienteSelecionado.cliente}
            </h2>

            <Box
              className={styles["estoque-filtros-bar"]}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                mb: 2,
                maxWidth: 900,
                margin: "0 auto",
                width: "100%",
                position: "relative",
              }}
            >
              <TextField
                label="Pesquisar itens"
                value={buscaItens}
                onChange={(e) => setBuscaItens(e.target.value)}
                size="small"
                sx={{
                  minWidth: 260,
                  fontSize: 15,
                  background: "#fff",
                  borderRadius: "7px",
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setFiltrosAbertosItens(true)}
                className={styles["estoque-filtros-btn"]}
                sx={{
                  background: "#fff",
                  color: "#6c217e",
                  border: "1.5px solid #6c217e",
                  borderRadius: "7px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  minWidth: "105px",
                  height: "36px",
                  boxShadow: "none",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  "&:hover": {
                    background: "#f6eaf7",
                    borderColor: "#6c217e",
                  },
                }}
              >
                FILTROS
              </Button>
            </Box>

            <div
              className={styles["table-container"]}
              style={{ maxWidth: 900, margin: "0 auto" }}
            >
              {carregandoItens ? (
                <p style={{ padding: "16px" }}>Carregando itens da venda...</p>
              ) : (
                <Tabela
                  itens={itensPaginaFinal.map((item) => ({
                    id: item.id,
                    Nome: item.nome,
                    Fornecedor:
                      item.fornecedor
                        ? typeof item.fornecedor === "string"
                          ? item.fornecedor
                          : item.fornecedor.nome
                        : "",
                    Quantidade: item.quantidade,
                    Preço: Number(item.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                  }))}
                  botaoRemover
                  onRemover={handleRemover}
                  renderBotaoRemover={renderBotaoRemover}
                />
              )}
            </div>

            <Box
              className={styles["estoque-pagination"]}
              sx={{
                fontSize: 15,
                marginTop: 8,
                maxWidth: 900,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <button
                onClick={() => setPaginaAtualItens((p) => Math.max(p - 1, 1))}
                disabled={paginaAtualItens === 1}
              >
                &lt; Página anterior
              </button>
              <span>
                Página {paginaAtualItens} de {totalPaginasItens || 1}
              </span>
              <button
                onClick={() =>
                  setPaginaAtualItens((p) => Math.min(p + 1, totalPaginasItens))
                }
                disabled={paginaAtualItens === totalPaginasItens || totalPaginasItens === 0}
              >
                Próxima página &gt;
              </button>
            </Box>

            <Button
              className={styles["return-button"]}
              onClick={() => {
                setClienteSelecionado(null);
                setBuscaItens("");
                setItensFiltrados([]);
                setFiltroCoresItens([]);
                setFiltroFornecedoresItens([]);
                setFiltroPrecoItens([0, 100000]);
                setPaginaAtualItens(1);
              }}
              sx={{
                mt: 3,
                background: "#bdbdbd",
                color: "#222",
                fontWeight: "bold",
                borderRadius: "7px",
                fontSize: "0.95rem",
                boxShadow: "none",
                textTransform: "uppercase",
                "&:hover": { background: "#a0a0a0" },
                maxWidth: 200,
                margin: "24px auto 0 auto",
                display: "block",
              }}
            >
              VOLTAR
            </Button>

            <Drawer
              anchor="right"
              open={filtrosAbertosItens}
              onClose={() => setFiltrosAbertosItens(false)}
            >
              <Box sx={{ width: 260, p: 2 }}>
                <Typography variant="h6" sx={{ fontSize: 16 }}>
                  Filtros de itens
                </Typography>

                <Typography variant="subtitle1" mt={2} sx={{ fontSize: 14 }}>
                  Cores
                </Typography>
                {opcoesCoresItens.length === 0 && (
                  <Typography>Nenhuma cor disponível</Typography>
                )}
                {opcoesCoresItens.map((cor) => (
                  <FormControlLabel
                    key={cor}
                    control={
                      <Checkbox
                        checked={filtroCoresItens.includes(cor)}
                        onChange={(e) => {
                          setFiltroCoresItens((prev) =>
                            e.target.checked ? [...prev, cor] : prev.filter((c) => c !== cor)
                          );
                        }}
                        size="small"
                      />
                    }
                    label={<span style={{ fontSize: 13 }}>{cor}</span>}
                  />
                ))}

                <Typography variant="subtitle1" mt={2} sx={{ fontSize: 14 }}>
                  Fornecedores
                </Typography>
                {opcoesFornecedoresItens.length === 0 && (
                  <Typography>Nenhum fornecedor disponível</Typography>
                )}
                {opcoesFornecedoresItens.map((fornecedor) => (
                  <FormControlLabel
                    key={fornecedor}
                    control={
                      <Checkbox
                        checked={filtroFornecedoresItens.includes(fornecedor)}
                        onChange={(e) => {
                          setFiltroFornecedoresItens((prev) =>
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

                <Typography variant="subtitle1" mt={2} sx={{ fontSize: 14 }}>
                  Preço
                </Typography>
                <Slider
                  value={filtroPrecoItens}
                  onChange={(e, novoValor) => setFiltroPrecoItens(novoValor)}
                  valueLabelDisplay="auto"
                  min={precoMinItens}
                  max={precoMaxItens}
                  size="small"
                  sx={{ mt: 1 }}
                />

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2, mb: 1, fontSize: 13, height: 30 }}
                  onClick={resetarFiltrosItens}
                >
                  Resetar filtros
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 0, fontSize: 13, height: 30 }}
                  onClick={() => setFiltrosAbertosItens(false)}
                >
                  Fechar
                </Button>
              </Box>
            </Drawer>
          </>
        )}
      </div>
      

      <EstoquePopUp
        mostrar={mostrarPopUp}
        itens={itemParaRemover ? [itemParaRemover] : []}
        onConfirmar={() => confirmarExclusao(itemParaRemover)}
        onCancelar={cancelarExclusao}
      />
    </div>
     </>
  );
}
