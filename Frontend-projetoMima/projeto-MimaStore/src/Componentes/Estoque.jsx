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
  }, [currentPage]);

  const buscarEstoque = async (page = 0) => {
    setCarregando(true);
    setErro('');
    
    const res = await API.get('/itens', {
      params: { page, size: 10 }
    });

    setItens(res.data.content);
    setTotalItems(res.data.totalElements);
    setTotalPages(res.data.totalPages);
    setCarregando(false);
  };

  const buscarPorNome = async () => {
    if (!busca.trim()) {
      setErro('Digite um termo para pesquisar.');
      return;
    }

    setCarregando(true);
    setErro('');
    
    const res = await API.get('/itens/nome', {
      params: { nome: busca.trim() }
    });

    setItens(res.data);
    setTotalItems(res.data.length);
    setTotalPages(null);
    
    if (res.data.length === 0) {
      setErro('Nenhum item encontrado com esse nome.');
    }
    
    setCarregando(false);
  };

  const limparBusca = () => {
    setBusca('');
    setCurrentPage(0);
    buscarEstoque(0);
  };

  const goToPrev = () => { if (currentPage > 0) setCurrentPage(p => p - 1); };
  const goToNext = () => { if (totalPages === null || currentPage < totalPages - 1) setCurrentPage(p => p + 1); };



  const abrirCardAdicionar = (item) => {
    setItemParaAdicionar(item.__original || item);
    setQuantidadeAdicionar(1);
    setModalErroAdicionar('');
    setMostrarCardAdicionar(true);
  };

  const fecharCardAdicionar = () => {
    setMostrarCardAdicionar(false);
    setItemParaAdicionar(null);
    setQuantidadeAdicionar(1);
    setModalErroAdicionar('');
  };

  const confirmarAdicao = async () => {
    if (quantidadeAdicionar <= 0) {
      setModalErroAdicionar('A quantidade deve ser maior que zero.');
      return;
    }

    setCarregando(true);
    setModalErroAdicionar('');
    
    const res = await API.patch(`/itens/${itemParaAdicionar.codigo}/adicionar-estoque`, null, {
      params: { quantidade: quantidadeAdicionar }
    });

    setItens(prev => prev.map(it => 
      it.codigo === itemParaAdicionar.codigo ? res.data : it
    ));

    setMensagem(`${quantidadeAdicionar} unidade(s) adicionada(s) ao estoque de "${itemParaAdicionar.nome}"!`);
    setTimeout(() => setMensagem(''), 3000);
    fecharCardAdicionar();
    setCarregando(false);
  };

  const abrirConfirmacaoExclusao = (item) => {
    setMostrarModalConfirmacao(true);
    setItemParaExcluir(item.__original || item);
  };

  const confirmarExclusao = async () => {
    setCarregando(true);
    setErro('');
    
    await API.delete(`/itens/codigo/${encodeURIComponent(itemParaExcluir.codigo)}`);
    setItens(prev => prev.filter(it => it.codigo !== itemParaExcluir.codigo));

    setMensagem(`Item "${itemParaExcluir.nome}" excluído com sucesso!`);
    setTimeout(() => setMensagem(''), 3000);
    setMostrarModalConfirmacao(false);
    setItemParaExcluir(null);
    setCarregando(false);
  };

  const dadosTabela = itens.map((item) => ({
    id: item.codigo,
    nome: item.nome,
    categoria: item.categoria,
    tamanho: item.tamanho,
    cor: item.cor,
    qtd_estoque: item.qtdEstoque,
    preco: item.preco.toFixed(2),
    codigo: item.codigo,
    __original: item
  }));

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
                <p><strong>Código:</strong> {itemParaAdicionar.codigo}</p>
                <p><strong>Estoque Atual:</strong> {itemParaAdicionar.qtdEstoque} unidade(s)</p>
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
                  <strong>Novo Estoque:</strong> {itemParaAdicionar.qtdEstoque + quantidadeAdicionar} unidade(s)
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
                <p><strong>Código:</strong> {itemParaExcluir.codigo}</p>
                <p><strong>Preço:</strong> R$ {itemParaExcluir.preco.toFixed(2)}</p>
                <p><strong>Quantidade:</strong> {itemParaExcluir.qtdEstoque}</p>
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
