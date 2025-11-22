import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Componentes - CSS/HistoricoVendas.module.css";
import { Navbar } from "./Navbar";
import { FaixaVoltar } from "./FaixaVoltar";
import API from "../Provider/API";
import { Tabela } from "./Tabela";

export default function HistoricoVendasFixed() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [buscaClientes, setBuscaClientes] = useState("");
  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFim, setFiltroFim] = useState("");
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

  const voltarAoMenu = () => navigate("/menu-inicial");

  useEffect(() => {
    const vendasSize = 10;
    setCarregando(true);
    // Se existe um filtro ativo por datas, não sobrescrever a lista filtrada
    if (filtroInicio && filtroFim) {
      setCarregando(false);
      return;
    }

    // backend espera paginação por page/size (Spring Pageable)
    API.get(`/vendas`, { params: { page: vendasPage, size: vendasSize } })
      .then((res) => {
        const body = res.data ?? {};

        // conteúdo esperado: Page<VendaResponseDto> -> body.content
        const content = Array.isArray(body.content) ? body.content : [];

        const clientesComId = content.map((c, idx) => ({
          vendaId: c.vendaId ?? c.id ?? c.idVenda ?? c.codigo ?? idx,
          cliente: (c.cliente && (typeof c.cliente === 'string' ? c.cliente : c.cliente.nome)) ?? c.nomeCliente ?? c.clienteNome ?? c.nome ?? "",
          valor_total: c.valor_total ?? c.valorTotal ?? c.total ?? 0,
          quantidade: c.quantidade ?? c.qtd ?? 0,
          data: c.data ?? c.dataVenda ?? c.dataHora ?? c.createdAt ?? null,
          id: c.vendaId ?? c.id ?? c.idVenda ?? idx,
          // tentar encontrar itens da venda dentro do objeto retornado
          itens: c.itens ?? c.itensVenda ?? c.items ?? c.itensVendaList ?? c.produtos ?? [],
          __raw: c,
        }));

        setClientes(clientesComId);
        setClientesFiltrados(clientesComId);

        // extrair datas únicas das vendas para popular os dropdowns (YYYY-MM-DD)
        const datas = clientesComId
          .map((v) => {
            try {
              const d = new Date(v.data);
              if (isNaN(d)) return null;
              return d.toISOString().split('T')[0];
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
        const unicas = Array.from(new Set(datas)).sort((a, b) => (a < b ? -1 : 1));
        setDatasDisponiveis(unicas);

        // extrair total e totalPages diretamente do Page retornado pelo backend
        const totalCount = body.totalElements ?? body.total ?? null;
        const totalPages = body.totalPages ?? body.total_pages ?? null;
        setTotalVendasCount(totalCount != null ? Number(totalCount) : null);
        setTotalPaginasVendas(totalPages != null ? Number(totalPages) : null);
      })
      .catch(() => {
        setClientes([]);
        setClientesFiltrados([]);
        setTotalPaginasVendas(null);
      })
      .finally(() => setCarregando(false));
  }, [vendasPage, filtroInicio, filtroFim]);

  // Filtrar por intervalo de datas via endpoint específico
  const filtrarPorData = async () => {
    if (!filtroInicio || !filtroFim) return;
    try {
      setCarregando(true);
      const res = await API.get('/vendas/filtrar-por-data', { params: { inicio: filtroInicio, fim: filtroFim } });
      // o backend retorna List<VendaResponseDto> ou 204
      const body = res.data ?? [];
      const content = Array.isArray(body) ? body : [];

      const clientesComId = content.map((c, idx) => ({
        vendaId: c.vendaId ?? c.id ?? c.idVenda ?? c.codigo ?? idx,
        cliente: (c.cliente && (typeof c.cliente === 'string' ? c.cliente : c.cliente.nome)) ?? c.nomeCliente ?? c.clienteNome ?? c.nome ?? "",
        valor_total: c.valor_total ?? c.valorTotal ?? c.total ?? 0,
        quantidade: c.quantidade ?? c.qtd ?? 0,
        data: c.data ?? c.dataVenda ?? c.dataHora ?? c.createdAt ?? null,
        id: c.vendaId ?? c.id ?? c.idVenda ?? idx,
        itens: c.itens ?? c.itensVenda ?? c.items ?? c.itensVendaList ?? c.produtos ?? [],
        __raw: c,
      }));

      setClientes(clientesComId);
      setClientesFiltrados(clientesComId);
      // sem paginação aqui (lista simples). mostrar total diretamente
      setTotalVendasCount(clientesComId.length);
      setTotalPaginasVendas(null);
    } catch (err) {
      if (err.response && err.response.status === 204) {
        setClientes([]);
        setClientesFiltrados([]);
        setTotalVendasCount(0);
        setTotalPaginasVendas(null);
      } else {
        console.error('Erro ao filtrar por data:', err);
        alert('Erro ao filtrar por data. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

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
      "ID Venda": c.vendaId,
      "Data / Hora": formatarData(c.data),
      "Valor Total": Number(c.valor_total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      __raw: c,
    }));
  }

  const abrirModalEditarVenda = (row) => {
    // row may include __raw (from mapClientesParaTabela) or be the original object
    const raw = row?.__raw ?? row;
    const vendaId = raw?.vendaId ?? raw?.id ?? raw?.idVenda ?? null;
    const itens = raw?.itens ?? raw?.itensVenda ?? raw?.items ?? raw?.produtos ?? [];
    setVendaSelecionada(vendaId);
    setVendaItens(Array.isArray(itens) ? itens.slice() : []);
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
    // determine id of the venda-item (idItemVenda) - prefer explicit item id fields
    const idItemVenda = item?.id ?? item?.idItemVenda ?? item?.itemVendaId ?? item?.idItem ?? item?.itemId ?? null;
    if (!vendaSelecionada || !idItemVenda) {
      alert('Não foi possível identificar a venda ou o item para remoção.');
      setRemoverConfirm(null);
      return;
    }

    try {
      setRemoverLoading(true);
      // call backend delete endpoint
      await API.delete(`/vendas/${vendaSelecionada}/itens/${idItemVenda}`);

      // on success, remove locally as well
      setVendaItens((prev) => {
        const novo = prev.slice();
        novo.splice(index, 1);
        return novo;
      });

      // also update clientes and clientesFiltrados
      setClientes((antes) =>
        antes.map((c) => (c.vendaId === vendaSelecionada ? { ...c, itens: (c.itens || []).filter((_, i) => i !== index), valor_total: calcularValorTotal((c.itens || []).filter((_, i) => i !== index)) } : c))
      );
      setClientesFiltrados((antes) =>
        antes.map((c) => (c.vendaId === vendaSelecionada ? { ...c, itens: (c.itens || []).filter((_, i) => i !== index), valor_total: calcularValorTotal((c.itens || []).filter((_, i) => i !== index)) } : c))
      );

      setRemoverConfirm(null);
    } catch (error) {
      console.error('Erro ao remover item da venda:', error);
      const msg = error?.response?.data?.message || error?.message || 'Erro ao remover item. Tente novamente.';
      alert(msg);
    } finally {
      setRemoverLoading(false);
    }
  };

  function calcularValorTotal(itensArray) {
    if (!Array.isArray(itensArray)) return 0;
    return itensArray.reduce((acc, it) => {
      const qtd = Number(it.qtdParaVender ?? it.quantidade ?? it.qtd ?? it.amount ?? 0) || 0;
      let valor = it.valor ?? it.preco ?? it.price ?? it.valorUnitario ?? it.valorUnitarioVenda ?? 0;
      if (typeof valor === 'string') valor = Number(String(valor).replace(',', '.')) || 0;
      valor = Number(valor) || 0;
      return acc + qtd * valor;
    }, 0);
  }

  return (
    <div className={styles["pagina-container"]}>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles["container-gestao"]}>
        <div className={styles["header-gestao"]}>
          <h1 className={styles["titulo-gestao"]}>Histórico de Vendas</h1>
          <div className={styles["barra-acoes"]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div className={styles["busca-container"]} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Início:
                  <input type="date" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} style={{ padding: 6 }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Fim:
                  <input type="date" value={filtroFim} onChange={(e) => setFiltroFim(e.target.value)} style={{ padding: 6 }} />
                </label>
              </div>
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
                          <td style={{ padding: 8 }}>{it.itemId ?? it.id ?? it.productId ?? it.codigo ?? '-'}</td>
                          <td style={{ padding: 8 }}>{it.nomeItem ?? it.nome ?? it.descricao ?? it.name ?? '-'}</td>
                          <td style={{ padding: 8 }}>{it.qtdParaVender ?? it.quantidade ?? it.qtd ?? it.amount ?? 0}</td>
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
