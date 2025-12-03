import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Componentes - CSS/HistoricoVendas.module.css";
import { Navbar } from "./Navbar";
import { FaixaVoltar } from "./FaixaVoltar";
import API from "../Provider/API";
import { Tabela } from "./Tabela";
import FiltroCalendario from "./FiltroCalendario";

export default function HistoricoVendasFixed() {
  const navigate = useNavigate();
  const hoje = new Date();
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const inicioAnoISO = inicioAno.toISOString().split("T")[0];
  const hojeISO = hoje.toISOString().split("T")[0];
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [buscaClientes, setBuscaClientes] = useState("");
  const [filtroInicio, setFiltroInicio] = useState(inicioAnoISO);
  const [filtroFim, setFiltroFim] = useState(hojeISO);
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [vendasPage, setVendasPage] = useState(0);
  const [totalPaginasVendas, setTotalPaginasVendas] = useState(null);
  const [totalVendasCount, setTotalVendasCount] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarModalVenda, setMostrarModalVenda] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [vendaItens, setVendaItens] = useState([]);
  const [removerConfirm, setRemoverConfirm] = useState(null); // { index, item }
  const [removerLoading, setRemoverLoading] = useState(false);
  const [calendarioMesBase, setCalendarioMesBase] = useState(hoje.getMonth() + 1);
  const [calendarioAnoBase, setCalendarioAnoBase] = useState(hoje.getFullYear());
  const filtroInicialAplicado = useRef(false);

  const voltarAoMenu = () => navigate("/menu-inicial");

  const obterValorTotalVenda = (venda) => {
    if (!venda) return 0;
    const bruto =
      venda.valorTotal ??
      venda.valor_total ??
      venda.valor ??
      venda.total ??
      (venda.dadosVenda ? venda.dadosVenda.valorTotal : undefined);
    const numero = Number(bruto);
    return Number.isFinite(numero) ? numero : 0;
  };

  const filtrarPorData = async () => {
    if (!filtroInicio || !filtroFim) return;
    
    setCarregando(true);
    const res = await API.get('/vendas/filtrar-por-data', { 
      params: { inicio: filtroInicio, fim: filtroFim } 
    });
    
    const content = res.data;
    const clientesComId = content.map((venda) => ({
      vendaId: venda.id,
      cliente: venda.clienteId ? `Cliente ${venda.clienteId}` : "Sem cliente",
      valor_total: obterValorTotalVenda(venda),
      data: venda.data,
      id: venda.id,
      itens: venda.itensVenda || [],
      __raw: venda,
    }));

    setClientes(clientesComId);
    setClientesFiltrados(clientesComId);
    setTotalVendasCount(clientesComId.length);
    setTotalPaginasVendas(null);
    setCarregando(false);
  };

  useEffect(() => {
    const vendasSize = 10;
    setCarregando(true);
    
    if (filtroInicio && filtroFim) {
      setCarregando(false);
      return;
    }

    API.get(`/vendas`, { params: { page: vendasPage, size: vendasSize } })
      .then((res) => {
        const content = res.data.content;

        const clientesComId = content.map((venda) => ({
          vendaId: venda.id,
          cliente: venda.clienteId ? `Cliente ${venda.clienteId}` : "Sem cliente",
          valor_total: obterValorTotalVenda(venda),
          data: venda.data,
          id: venda.id,
          itens: venda.itensVenda || [],
          __raw: venda,
        }));

        setClientes(clientesComId);
        setClientesFiltrados(clientesComId);

        setTotalVendasCount(res.data.totalElements);
        setTotalPaginasVendas(res.data.totalPages);
      })
      .catch(() => {
        setClientes([]);
        setClientesFiltrados([]);
        setTotalPaginasVendas(null);
      })
      .finally(() => setCarregando(false));
  }, [vendasPage, filtroInicio, filtroFim]);

  useEffect(() => {
    if (!filtroInicialAplicado.current && filtroInicio && filtroFim) {
      filtroInicialAplicado.current = true;
      filtrarPorData();
    }
  }, [filtroInicio, filtroFim]);

  const limparFiltro = () => {
    setFiltroInicio('');
    setFiltroFim('');
    // reload page 0 to reset listing
    setVendasPage(0);
  };

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
    setClientesFiltrados(filtrados);
  }, [buscaClientes, clientes]);

  function formatarData(dataString) {
    if (!dataString) return "-";
    const data = new Date(dataString);
    if (Number.isNaN(data.getTime())) return "-";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} - ${pad(
      data.getHours()
    )}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`;
  }

  function mapClientesParaTabela(clientes) {
    return clientes.map((c) => ({
      id: c.vendaId,
      "ID Venda": c.vendaId,
      "Data / Hora": formatarData(c.data),
      "Valor Total": (() => {
        const raw = c.valor_total ?? obterValorTotalVenda(c.__raw);
        const num = Number(raw) || 0;
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      })(),
      __raw: c,
    }));
  }

  const abrirModalEditarVenda = (row) => {
    const raw = row.__raw || row;
    const vendaId = raw.vendaId || raw.id;
    const itens = raw.itens || raw.itensVenda || [];
    setVendaSelecionada(vendaId);
    setVendaItens(itens.slice());
    setMostrarModalVenda(true);
  };

  const fecharModalEditar = () => {
    setMostrarModalVenda(false);
    setVendaSelecionada(null);
    setVendaItens([]);
  };

  // When user clicks remove, open confirmation modal
  const removerItemLocal = (index, item) => {
    setRemoverConfirm({ index, item });
  };

  const cancelarRemocao = () => setRemoverConfirm(null);

  const confirmarRemocao = async () => {
    if (!removerConfirm) return;
    const { index, item } = removerConfirm;
    const idItemVenda = item.id;
    
    setRemoverLoading(true);
    await API.delete(`/vendas/${vendaSelecionada}/itens/${idItemVenda}`);

    setVendaItens((prev) => {
      const novo = prev.slice();
      novo.splice(index, 1);
      return novo;
    });

    setClientes((antes) =>
      antes.map((c) => (c.vendaId === vendaSelecionada ? 
        { ...c, itens: (c.itens || []).filter((_, i) => i !== index), valor_total: calcularValorTotal((c.itens || []).filter((_, i) => i !== index)) } 
        : c))
    );
    setClientesFiltrados((antes) =>
      antes.map((c) => (c.vendaId === vendaSelecionada ? 
        { ...c, itens: (c.itens || []).filter((_, i) => i !== index), valor_total: calcularValorTotal((c.itens || []).filter((_, i) => i !== index)) } 
        : c))
    );

    setRemoverConfirm(null);
    setRemoverLoading(false);
  };

  function calcularValorTotal(itensArray) {
    return itensArray.reduce((acc, item) => {
      const qtd = item.qtdParaVender || 0;
      const valor = item.valorUnitario || 0;
      return acc + qtd * valor;
    }, 0);
  }

  useEffect(() => {
    const carregarDiasHistorico = async () => {
      try {
        const inicioHistorico = "2015-01-01";
        const fimHistorico = new Date().toISOString().split("T")[0];
        const resp = await API.get(`/vendas/filtrar-por-data?inicio=${inicioHistorico}&fim=${fimHistorico}`);
        const vendas = Array.isArray(resp.data)
          ? resp.data
          : Array.isArray(resp.data?.content)
          ? resp.data.content
          : [];
        const dias = vendas
          .map((v) => {
            if (!v?.data) return null;
            try {
              return new Date(v.data).toISOString().split("T")[0];
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
        const unicosOrdenados = Array.from(new Set(dias)).sort();
        setDatasDisponiveis(unicosOrdenados);
      } catch (error) {
        console.error("Erro ao carregar dias com vendas para o calendário:", error);
        setDatasDisponiveis([]);
      }
    };

    carregarDiasHistorico();
  }, []);

  const handleDataInicioChange = (valor) => {
    setFiltroInicio(valor);
    if (filtroFim && valor && valor > filtroFim) {
      setFiltroFim("");
    }
  };

  const handleDataFimChange = (valor) => {
    if (filtroInicio && valor && valor < filtroInicio) {
      setFiltroInicio(valor);
    }
    setFiltroFim(valor);
  };

  const dataMinDisponivel = datasDisponiveis.length ? datasDisponiveis[0] : null;
  const dataMaxDisponivel = datasDisponiveis.length ? datasDisponiveis[datasDisponiveis.length - 1] : null;

  return (
    <div className={styles["pagina-container"]}>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles["container-gestao"]}>
        <div className={styles["header-gestao"]}>
          <h1 className={styles["titulo-gestao"]}>Histórico de Vendas</h1>
          <div className={styles["barra-acoes"]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <FiltroCalendario
                modoIntervalo
                dataInicio={filtroInicio || ""}
                dataFim={filtroFim || ""}
                onDataInicioChange={handleDataInicioChange}
                onDataFimChange={handleDataFimChange}
                mesSelecionado={calendarioMesBase}
                anoSelecionado={calendarioAnoBase}
                onMesChange={setCalendarioMesBase}
                onAnoChange={setCalendarioAnoBase}
                diasComVendas={datasDisponiveis}
                compact
                dataMin={dataMinDisponivel}
                dataMax={dataMaxDisponivel}
                dataMinFim={filtroInicio || dataMinDisponivel}
                dataMaxInicio={filtroFim || dataMaxDisponivel}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={filtrarPorData} disabled={!filtroInicio || !filtroFim || filtroInicio > filtroFim} className={styles["btn-pesquisar"]} style={{ fontWeight: 700 }}>Filtrar</button>
              <button onClick={limparFiltro} style={{ backgroundColor: '#6e7074', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700 }}>Limpar filtro</button>
            </div>
          </div>
        </div>

        <div className={styles["tabela-container"]}>
          <div className={styles["info-total"]}>
            <span>Total de vendas: {totalVendasCount != null ? totalVendasCount : clientes.length}</span>
          </div>

          <div className={styles["tabela-wrapper"]}>
            <Tabela
              itens={mapClientesParaTabela(clientesFiltrados)}
              columns={[
                { key: 'ID Venda', label: 'ID Venda' },
                { key: 'Data / Hora', label: 'Data / Hora' },
                { key: 'Valor Total', label: 'Valor Total' },
              ]}
              botaoEditar
              renderBotaoEditar={(item, cb) => (
                <button
                  onClick={cb}
                  style={{
                    backgroundColor: '#8b3b6a',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Editar
                </button>
              )}
              onEditar={(linha) => abrirModalEditarVenda(linha)}
            />
          </div>

          {totalPaginasVendas !== null && totalPaginasVendas > 0 && (
            <div className={styles["paginacao-container"]}>
              <div className={styles["botoes-paginacao"]}>
                <button
                      onClick={() => setVendasPage((p) => Math.max(p - 1, 0))}
                      disabled={vendasPage <= 0}
                      className={styles["btn-paginacao"]}
                      style={{ fontWeight: 700 }}
                    >
                      Anterior
                    </button>

                {Array.from({ length: Math.min(5, totalPaginasVendas) }, (_, i) => {
                  let pagina;
                  if (totalPaginasVendas <= 5) {
                    pagina = i;
                  } else {
                    const start = Math.max(0, Math.min(vendasPage - 2, totalPaginasVendas - 5));
                    pagina = start + i;
                  }

                  return (
                    <button
                      key={`page-${pagina}`}
                      onClick={() => setVendasPage(pagina)}
                      disabled={vendasPage === pagina}
                      className={`${styles["btn-paginacao"]} ${
                        vendasPage === pagina ? styles["btn-paginacao-ativa"] : ""
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      {pagina + 1}
                    </button>
                  );
                })}

                <button
                      onClick={() =>
                        setVendasPage((p) =>
                          Math.min(p + 1, Math.max((totalPaginasVendas || 1) - 1, 0))
                        )
                      }
                      disabled={vendasPage + 1 >= (totalPaginasVendas || 1)}
                      className={styles["btn-paginacao"]}
                      style={{ fontWeight: 700 }}
                    >
                      Próxima
                    </button>
              </div>

              <div className={styles["pagina-info"]}>
                Página {vendasPage + 1}
                {totalPaginasVendas ? ` de ${totalPaginasVendas}` : ""}
              </div>
            </div>
          )}
          {/* Modal de itens da venda (edição local) */}
          {mostrarModalVenda && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}>
              <div style={{ width: '92%', maxWidth: 800, background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', maxHeight: '80vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ margin: 0 }}>Itens da Venda {vendaSelecionada}</h2>
                </div>

                {vendaItens.length === 0 ? (
                  <p>Nenhum item nesta venda.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px' }}>Item ID</th>
                        <th style={{ padding: '8px' }}>Nome Item</th>
                        <th style={{ padding: '8px' }}>Qtd Vendida</th>
                        <th style={{ padding: '8px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendaItens.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: 8 }}>{it.itemId || '-'}</td>
                          <td style={{ padding: 8 }}>{it.nomeItem || '-'}</td>
                          <td style={{ padding: 8 }}>{it.qtdParaVender}</td>
                          <td style={{ padding: 8 }}>
                            <button onClick={() => removerItemLocal(idx, it)} style={{ color: 'white', backgroundColor: '#8b3b6a', border: 'none', padding: '6px 10px', borderRadius: 4, fontWeight: 700 }}>Remover</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={fecharModalEditar} style={{ padding: '8px 12px', fontWeight: 700 }}>Fechar</button>
                </div>
              </div>
            </div>
          )}
          {/* Confirmação de remoção do item */}
          {removerConfirm && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
              <div style={{ width: 420, background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginTop: 0 }}>Confirmar remoção</h3>
                <p>Esta ação não poderá ser desfeita. Deseja remover este item da venda?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button onClick={cancelarRemocao} disabled={removerLoading} style={{ padding: '8px 12px', fontWeight: 700 }}>Cancelar</button>
                  <button onClick={confirmarRemocao} disabled={removerLoading} style={{ padding: '8px 12px', backgroundColor: '#8b3b6a', color: 'white', border: 'none', fontWeight: 700 }}>{removerLoading ? 'Removendo...' : 'Confirmar'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
