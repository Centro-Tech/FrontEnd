import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Componentes - CSS/Estoque.module.css';
import { Navbar } from './Navbar';
import { FaixaVoltar } from './FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from './MensagemErro';
import { Tabela } from './Tabela';

export default function Estoque() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [totalItems, setTotalItems] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [mostrarCardAdicionar, setMostrarCardAdicionar] = useState(false);
  const [itemParaAdicionar, setItemParaAdicionar] = useState(null);
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState(1);
  const [modalErroAdicionar, setModalErroAdicionar] = useState('');

  const voltarAoMenu = () => navigate('/menu-inicial');

  useEffect(() => {
    buscarEstoque(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const buscarEstoque = async (page = 0) => {
    setCarregando(true);
    setErro('');
    try {
      const res = await API.get('/itens', {
        params: {
          page,
          size: 10
        }
      });

      // Se a API retornar 204 sem corpo:
      if (res.status === 204 || !res.data) {
        setItens([]);
        setTotalItems(0);
        setTotalPages(0);
        return;
      }

      // Caso padrão: resposta paginada (Spring Page)
      if (res.data.content && Array.isArray(res.data.content)) {
        setItens(res.data.content);
        setTotalItems(res.data.totalElements ?? res.data.content.length ?? 0);
        setTotalPages(res.data.totalPages ?? 0);
        return;
      }

      // Caso a API retorne um array direto (ex.: /itens/estoque)
      if (Array.isArray(res.data)) {
        setItens(res.data);
        setTotalItems(res.data.length);
        // quando receber lista completa, desabilita paginação (null)
        setTotalPages(null);
        return;
      }

      // fallback defensivo
      setItens([]);
      setTotalItems(0);
      setTotalPages(0);
    } catch (err) {
      console.error('Erro buscarEstoque:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setItens([]);
          setErro('Endpoint não encontrado.');
        } else if (err.response.status === 204) {
          setItens([]);
          setErro('');
        } else {
          setErro(`Erro ao carregar estoque (${err.response.status})`);
        }
      } else if (err.request) {
        setErro('Erro de conexão com o servidor.');
      } else {
        setErro(`Erro inesperado: ${err.message}`);
      }
    } finally {
      setCarregando(false);
    }
  };

  const buscarPorNome = async () => {
    if (!busca.trim()) {
      setErro('Digite um termo para pesquisar.');
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const res = await API.get('/itens/nome', {
        params: { nome: busca.trim() }
      });

      if (res.status === 204 || !res.data) {
        setItens([]);
        setTotalItems(0);
        setTotalPages(null);
        setErro('Nenhum item encontrado.');
        return;
      }

      const resultados = Array.isArray(res.data) ? res.data : [];
      setItens(resultados);
      setTotalItems(resultados.length);
      setTotalPages(null); // desabilita paginação para busca

      if (resultados.length === 0) {
        setErro('Nenhum item encontrado com esse nome.');
      }
    } catch (err) {
      console.error('Erro buscarPorNome:', err);
      if (err.response?.status === 404 || err.response?.status === 204) {
        setItens([]);
        setTotalItems(0);
        setTotalPages(null);
        setErro('Nenhum item encontrado.');
      } else {
        setErro('Erro ao buscar itens por nome.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const limparBusca = () => {
    setBusca('');
    setCurrentPage(0);
    buscarEstoque(0);
  };

  const goToPrev = () => { if (currentPage > 0) setCurrentPage(p => p - 1); };
  const goToNext = () => { if (totalPages === null || currentPage < totalPages - 1) setCurrentPage(p => p + 1); };

  // função utilitária: tenta localizar item por id (num/str) ou por codigo
  const localizarItemCompleto = (identificador) => {
    if (!identificador) return null;

    // se `identificador` for o objeto inteiro
    if (typeof identificador === 'object') {
      const obj = identificador;
      // se já for completo com propriedades essenciais, retorna
      if (obj.id || obj.codigo) return obj;
      // tenta achar pelo nome/codigo
      return itens.find(it => (it.id && String(it.id) === String(obj.id)) || (it.codigo && it.codigo === obj.codigo)) || obj;
    }

    // se `identificador` for um id (number ou string) ou codigo string
    const idStr = String(identificador);
    let encontrado = itens.find(it => it.id !== undefined && it.id !== null && String(it.id) === idStr);
    if (encontrado) return encontrado;
    encontrado = itens.find(it => it.codigo !== undefined && it.codigo !== null && String(it.codigo) === idStr);
    return encontrado || null;
  };

  // utilitário para ler quantidade de forma compatível com diferentes formatos da API
  const getQtd = (obj) => (obj?.qtd_estoque ?? obj?.qtdEstoque ?? 0);

  const abrirCardAdicionar = async (item) => {
    console.debug('abrirCardAdicionar - recebido:', item);
    // localiza item completo na lista (pode ser que Tabela passe só id ou só codigo)
    const itemCompletoEncontrado = localizarItemCompleto(item) || item;

    // se não temos nem id nem codigo, ainda assim vamos tentar usar o objeto recebido
    const id = itemCompletoEncontrado?.id;

    try {
      setCarregando(true);
      let itemCompleto = itemCompletoEncontrado;

      if (id !== undefined && id !== null) {
        try {
          const res = await API.get(`/itens/${id}`);
          if (res.data) itemCompleto = res.data;
        } catch (err) {
          console.warn('Não foi possível buscar item por id ao abrir modal, usando item local.', err);
        }
      }

      setItemParaAdicionar(itemCompleto);
    } catch (err) {
      console.error('Erro ao buscar item por id ao abrir modal:', err);
      setItemParaAdicionar(itemCompletoEncontrado);
    } finally {
      setCarregando(false);
      setQuantidadeAdicionar(1);
      setModalErroAdicionar('');
      setMostrarCardAdicionar(true);
    }
  };

  const fecharCardAdicionar = () => {
    setMostrarCardAdicionar(false);
    setItemParaAdicionar(null);
    setQuantidadeAdicionar(1);
    setModalErroAdicionar('');
  };

  const confirmarAdicao = async () => {
    // permite identificar item por id ou codigo
    const item = itemParaAdicionar;
    if (!item) {
      setModalErroAdicionar('Erro: Item inválido para adicionar estoque.');
      return;
    }

    // tenta obter id, se não tiver tenta achar pelo codigo
    const id = item.id ?? null;
    if (!id && !item.codigo) {
      setModalErroAdicionar('Erro: Item não possui identificador (id ou código).');
      return;
    }

    if (quantidadeAdicionar <= 0) {
      setModalErroAdicionar('A quantidade deve ser maior que zero.');
      return;
    }

    setCarregando(true);
    setModalErroAdicionar('');
    try {
      // se tivermos id, usamos endpoint patch por id
      let res;
      if (id) {
        res = await API.patch(`/itens/${id}/adicionar-estoque`, null, {
          params: { quantidade: quantidadeAdicionar }
        });
      } else {
        // caso extremo: tentar localizar itemByCodigo -> buscar item por código para pegar id, então patch
        const buscarPorCodigoRes = await API.get(`/itens/codigo/${encodeURIComponent(item.codigo)}`);
        const itemComId = buscarPorCodigoRes?.data;
        if (itemComId?.id) {
          res = await API.patch(`/itens/${itemComId.id}/adicionar-estoque`, null, {
            params: { quantidade: quantidadeAdicionar }
          });
        } else {
          throw new Error('Não foi possível identificar item para adicionar estoque.');
        }
      }

      const itemAtualizado = res?.data;
      if (itemAtualizado && (itemAtualizado.id || itemAtualizado.codigo)) {
        // substitui por id ou por codigo
        setItens(prev => prev.map(it => {
          if ((itemAtualizado.id && it.id === itemAtualizado.id) || (itemAtualizado.codigo && it.codigo === itemAtualizado.codigo)) {
            return itemAtualizado;
          }
          return it;
        }));
      } else {
        // se não veio o item atualizado, recarrega a página atual
        await buscarEstoque(currentPage);
      }

      setMensagem(`${quantidadeAdicionar} unidade(s) adicionada(s) ao estoque de "${item.nome}"!`);
      setTimeout(() => setMensagem(''), 3000);
      fecharCardAdicionar();
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      const mensagem = error?.response?.data?.message || error?.message || 'Erro ao adicionar itens ao estoque. Verifique o console.';
      setModalErroAdicionar(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const abrirConfirmacaoExclusao = async (item) => {
    console.debug('abrirConfirmacaoExclusao - recebido:', item);
    const itemCompleto = localizarItemCompleto(item) || item;

    if (!itemCompleto) {
      setErro('Erro: Item inválido para exclusão.');
      return;
    }

    if (!itemCompleto.codigo && (itemCompleto.id === undefined || itemCompleto.id === null)) {
      setErro('Erro: Item não possui código ou id válido para exclusão.');
      return;
    }

    setMostrarModalConfirmacao(true);
    setItemParaExcluir(itemCompleto);
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) {
      setErro('Erro: Item não encontrado para exclusão.');
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      // prefira deletar por código (controller: DELETE /itens/codigo/{codigo})
      if (itemParaExcluir.codigo) {
        await API.delete(`/itens/codigo/${encodeURIComponent(itemParaExcluir.codigo)}`);
        // atualiza estado local removendo pelo codigo
        setItens(prev => prev.filter(it => it.codigo !== itemParaExcluir.codigo));
      } else if (itemParaExcluir.id) {
        await API.delete(`/itens/${itemParaExcluir.id}`);
        setItens(prev => prev.filter(it => it.id !== itemParaExcluir.id));
      } else {
        throw new Error('Item sem identificador válido.');
      }

      setMensagem(`Item "${itemParaExcluir.nome}" excluído com sucesso!`);
      setTimeout(() => setMensagem(''), 3000);
      // opcional: recarregar página atual para garantir consistência
      if (totalPages !== null) await buscarEstoque(currentPage);
      setMostrarModalConfirmacao(false);
      setItemParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setErro('Erro ao excluir item. Verifique o console.');
    } finally {
      setCarregando(false);
    }
  };

 const dadosTabela = itens.map((i, index) => {
  const safeId = i.id !== undefined && i.id !== null ? i.id : (i.codigo ?? `row-${index}`);
  const quantidade = getQtd(i);

  return {
    id: safeId,
    nome: i.nome,
    categoria: i.categoria?.nome || 'Sem categoria',
    tamanho: i.tamanho?.descricao || 'Sem tamanho',
    cor: i.cor?.nome || 'Sem cor',
    qtd_estoque: quantidade,
    preco: i.preco ? Number(i.preco).toFixed(2) : '-',
    codigo: i.codigo,
    __original: i
  };
});

  return (
    <div>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles['container-gestao']}>
        <div className={styles['header-gestao']}>
          <h1 className={styles['titulo-gestao']}>Visualizar Estoque</h1>
          <div className={styles['barra-acoes']}>
            <div className={`${styles['busca-container']} ${styles['busca-actions']}`}>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') buscarPorNome(); }}
                className={styles['input-busca']}
              />
              <button
                onClick={buscarPorNome}
                disabled={carregando || !busca.trim()}
                className={styles['btn-pesquisar']}
              >
                Pesquisar
              </button>
              <button
                onClick={limparBusca}
                disabled={carregando || (busca.trim() === '' && totalPages !== null)}
                className={styles['btn-limpar']}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {carregando && (<div className={styles['loading']}><p>Carregando...</p></div>)}

        {mensagem && (<div className={styles['mensagem-sucesso']}>✅ {mensagem}</div>)}

        <MensagemErro mensagem={erro} />

        <div className={styles['tabela-container']}>
          <div className={styles['info-total']}>
            <span>Total: {totalItems !== null ? `${totalItems} itens` : `${itens.length} itens no total`}</span>
          </div>
          <div className={styles['tabela-wrapper']}>
            <Tabela
              itens={dadosTabela}
              botaoEditar={true}
              onEditar={(row) => {
                // Tabela pode enviar row simplificado; preferimos usar o original se existir
                const payload = row?.__original ?? row;
                abrirCardAdicionar(payload);
              }}
              botaoRemover={true}
              onRemover={(row) => {
                const payload = row?.__original ?? row;
                abrirConfirmacaoExclusao(payload);
              }}
              renderBotaoEditar={(item, onClick) => (
                <button
                  onClick={onClick}
                  className={styles['btn-adicionar']}
                >
                  + Adicionar
                </button>
              )}
            />
          </div>

          {/* Paginação só aparece quando NÃO está em modo de busca */}
          {totalPages !== null && totalPages > 0 && (
            <div className={`${styles['paginacao-container']} ${styles['paginacao-alinhamento']}`}>
              <div className={styles['paginacao-numeros']}>
                <button
                  onClick={goToPrev}
                  disabled={currentPage <= 0 || carregando}
                  className={styles['btn-paginacao']}
                >
                  Anterior
                </button>

                {totalPages && totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pagina;
                  if (totalPages <= 5) {
                    pagina = i;
                  } else {
                    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                    pagina = start + i;
                  }

                  return (
                    <button
                      key={`page-${pagina}`}
                      onClick={() => setCurrentPage(pagina)}
                      disabled={carregando || currentPage === pagina}
                      className={`${styles['btn-paginacao']} ${currentPage === pagina ? styles['btn-paginacao-ativa'] : ''}`}
                    >
                      {pagina + 1}
                    </button>
                  );
                })}

                <button
                  onClick={goToNext}
                  disabled={carregando || (totalPages !== null && currentPage >= totalPages - 1)}
                  className={styles['btn-paginacao']}
                >
                  Próxima
                </button>
              </div>
              <div className={styles['pagina-info']}>
                Página {currentPage + 1}{totalPages ? ` de ${totalPages}` : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Adicionar Quantidade */}
      {mostrarCardAdicionar && itemParaAdicionar && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3>Adicionar ao Estoque</h3>
              <button onClick={fecharCardAdicionar} className={styles['btn-fechar']}>✖</button>
            </div>
            <div className={styles['modal-body']}>
              <div className={styles['modal-card']}>
                <p><strong>Item:</strong> {itemParaAdicionar.nome}</p>
                {itemParaAdicionar.codigo && (<p><strong>Código:</strong> {itemParaAdicionar.codigo}</p>)}
                <p><strong>Estoque Atual:</strong> {getQtd(itemParaAdicionar)} unidade(s)</p>
              </div>
              <MensagemErro mensagem={modalErroAdicionar} />

              <div className={styles['form-group']}>
                <label className={styles['modal-label']}>
                  Quantidade a adicionar:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidadeAdicionar}
                  onChange={(e) => setQuantidadeAdicionar(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={styles['modal-input']}
                  autoFocus
                />
              </div>

              <div className={styles['modal-result']}>
                <p>
                  <strong>Novo Estoque:</strong> {getQtd(itemParaAdicionar) + quantidadeAdicionar} unidade(s)
                </p>
              </div>
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={fecharCardAdicionar} className={styles['btn-cancelar-ghost']}>Cancelar</button>
              <button onClick={confirmarAdicao} disabled={carregando} className={styles['btn-confirmar-acao']}>{carregando ? 'Adicionando...' : 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalConfirmacao && itemParaExcluir && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3>Confirmar Exclusão</h3>
              <button onClick={() => { setMostrarModalConfirmacao(false); setItemParaExcluir(null); }} className={styles['btn-fechar']}>✖</button>
            </div>
            <div className={styles['modal-body']}>
              <p className={styles['modal-confirm-text']}>Tem certeza que deseja excluir o item?</p>
              <div className={styles['modal-card']}>
                <p><strong>Nome:</strong> {itemParaExcluir.nome}</p>
                {itemParaExcluir.codigo && (<p><strong>Código:</strong> {itemParaExcluir.codigo}</p>)}
                {itemParaExcluir.preco !== undefined && (<p><strong>Preço:</strong> {Number(itemParaExcluir.preco).toFixed(2)}</p>)}
                {(itemParaExcluir.qtd_estoque !== undefined || itemParaExcluir.qtdEstoque !== undefined) && (<p><strong>Quantidade:</strong> {getQtd(itemParaExcluir)}</p>)}
              </div>
              <p className={styles['modal-warning']}>⚠️ Esta ação não pode ser desfeita!</p>
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={() => { setMostrarModalConfirmacao(false); setItemParaExcluir(null); }} className={styles['btn-cancelar']}>Cancelar</button>
              <button
                onClick={confirmarExclusao}
                className={`${styles['btn-excluir']} ${styles['btn-excluir-override']}`}
                disabled={carregando}
              >
                {carregando ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
