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
  const [vendasPage, setVendasPage] = useState(0);
  const [totalPaginasVendas, setTotalPaginasVendas] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const voltarAoMenu = () => navigate("/menu-inicial");

  useEffect(() => {
    const vendasSize = 10;
    setCarregando(true);
    API.get(`/vendas`, { params: { page: vendasPage, size: vendasSize } })
      .then((res) => {
        const pageBody = res.data || {};
        const content = Array.isArray(pageBody.content) ? pageBody.content : [];

        const clientesComId = content.map((c, idx) => ({
          vendaId: c.vendaId ?? c.id ?? c.idVenda ?? c.codigo ?? idx,
          cliente: c.cliente ?? c.nomeCliente ?? c.clienteNome ?? c.nome ?? "",
          valor_total: c.valor_total ?? c.valorTotal ?? c.total ?? 0,
          quantidade: c.quantidade ?? c.qtd ?? 0,
          data: c.data ?? c.dataVenda ?? c.dataHora ?? c.createdAt ?? null,
          id: c.vendaId ?? c.id ?? c.idVenda ?? idx,
        }));

        setClientes(clientesComId);
        setClientesFiltrados(clientesComId);
        setTotalPaginasVendas(pageBody.totalPages ?? pageBody.total_pages ?? null);
      })
      .catch(() => {
        setClientes([]);
        setClientesFiltrados([]);
        setTotalPaginasVendas(null);
      })
      .finally(() => setCarregando(false));
  }, [vendasPage]);

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
      Cliente: c.cliente,
      "Data / Hora": formatarData(c.data),
      Quantidade: c.quantidade ?? 0,
      "Valor Total": Number(c.valor_total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    }));
  }

  return (
    <div className={styles["pagina-container"]}>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles["container-gestao"]}>
        <div className={styles["header-gestao"]}>
          <h1 className={styles["titulo-gestao"]}>Histórico de Vendas</h1>
          <div className={styles["barra-acoes"]}>
            <div className={styles["busca-container"]}>
              <input
                type="text"
                placeholder="Pesquisar cliente, ID ou valor"
                value={buscaClientes}
                onChange={(e) => setBuscaClientes(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") setVendasPage(0);
                }}
                className={styles["input-busca"]}
              />
              <button
                onClick={() => setVendasPage(0)}
                disabled={!buscaClientes.trim()}
                className={styles["btn-pesquisar"]}
              >
                Pesquisar
              </button>
            </div>
          </div>
        </div>

        <div className={styles["tabela-container"]}>
          <div className={styles["info-total"]}>
            <span>Total de vendas: {clientes.length}</span>
          </div>

          <div className={styles["tabela-wrapper"]}>
            <Tabela
              itens={mapClientesParaTabela(clientesFiltrados)}
              botaoEditar
              onEditar={(linha) => console.log("Editar", linha)}
            />
          </div>

          {totalPaginasVendas !== null && totalPaginasVendas > 0 && (
            <div className={styles["paginacao-container"]}>
              <div className={styles["botoes-paginacao"]}>
                <button
                  onClick={() => setVendasPage((p) => Math.max(p - 1, 0))}
                  disabled={vendasPage <= 0}
                  className={styles["btn-paginacao"]}
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
        </div>
      </div>
    </div>
  );
}
