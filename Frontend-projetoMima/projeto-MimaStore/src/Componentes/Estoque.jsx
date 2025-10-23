import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Componentes - CSS/GestaoFornecedor.module.css';
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

  const voltarAoMenu = () => navigate('/menu-inicial');

  useEffect(() => { 
    buscarEstoque(currentPage); 
  }, [currentPage]);

  const buscarEstoque = async (page = 0) => {
    setCarregando(true);
    setErro('');
    try {
      const res = await API.get('/itens', { 
        params: { 
          page: page, 
          size: 10 
        } 
      });
      
      if (res.status === 204 || !res.data) { 
        setItens([]); 
        setTotalItems(0);
        setTotalPages(0);
        return; 
      }

      // Spring Boot Page response
      if (res.data.content && Array.isArray(res.data.content)) {
        setItens(res.data.content);
        setTotalItems(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setItens([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
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

      // Espera um array direto
      const resultados = Array.isArray(res.data) ? res.data : [];
      setItens(resultados);
      setTotalItems(resultados.length);
      setTotalPages(null); // Desabilita paginação para resultados de busca
      
      if (resultados.length === 0) {
        setErro('Nenhum item encontrado com esse nome.');
      }
    } catch (err) {
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

  const abrirConfirmacaoExclusao = async (item) => {
    if (!item) { 
      setErro('Erro: Item inválido para exclusão.'); 
      return; 
    }
    
    // Tentar encontrar o item completo na lista (caso venha apenas com id da tabela)
    const itemCompleto = itens.find(it => it.id === item.id) || item;
    
    if (!itemCompleto.codigo) { 
      setErro('Erro: Item não possui código válido para exclusão.'); 
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
    if (!itemParaExcluir.codigo) { 
      setErro('Erro: Este item não possui um código válido para exclusão.'); 
      return; 
    }
    
    setCarregando(true); 
    setErro('');
    try {
      await API.delete(`/itens/codigo/${encodeURIComponent(itemParaExcluir.codigo)}`);
      setMensagem(`Item "${itemParaExcluir.nome}" excluído com sucesso!`);
      setTimeout(() => setMensagem(''), 3000);
      await buscarEstoque(currentPage); 
      setMostrarModalConfirmacao(false); 
      setItemParaExcluir(null);
    } catch (error) { 
      console.error('Erro ao excluir:', error); 
      setErro('Erro ao excluir item. Verifique o console.'); 
    } finally { 
      setCarregando(false); 
    }
  };

  const dadosTabela = itens.map(i => ({ 
    id: i.id, 
    nome: i.nome, 
    qtdEstoque: i.qtdEstoque ?? (i.qtdEstoque === 0 ? 0 : '-'), 
    preco: i.preco ? Number(i.preco).toFixed(2) : '-',
    codigo: i.codigo
  }));

  return (
    <div>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles['container-gestao']}>
        <div className={styles['header-gestao']}>
          <h1 className={styles['titulo-gestao']}>Visualizar Estoque</h1>
          <div className={styles['barra-acoes']}>
            <div className={styles['busca-container']} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              {totalPages === null && itens.length > 0 && (
                <button 
                  onClick={limparBusca}
                  className={styles['btn-limpar']}
                >
                  Limpar
                </button>
              )}
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
            <Tabela itens={dadosTabela} botaoRemover={true} onRemover={(item) => abrirConfirmacaoExclusao(item)} />
          </div>

          {/* Paginação só aparece quando NÃO está em modo de busca */}
          {totalPages !== null && totalPages > 0 && (
            <div className={styles['paginacao-container']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={goToPrev} 
                  disabled={currentPage <= 0 || carregando} 
                  className={styles['btn-paginacao']}
                >
                  Anterior
                </button>
              
                {totalPages && totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calcular qual página mostrar baseado na posição atual
                let pagina;
                if (totalPages <= 5) {
                  // Se tem 5 ou menos páginas, mostrar todas
                  pagina = i;
                } else {
                  // Se tem mais de 5, centralizar na página atual
                  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                  pagina = start + i;
                }
                
                return (
                  <button
                    key={`page-${pagina}`}
                    onClick={() => setCurrentPage(pagina)}
                    disabled={carregando || currentPage === pagina}
                    className={`${styles['btn-paginacao']} ${currentPage === pagina ? styles['btn-paginacao-ativa'] : ''}`}
                    style={{ 
                      minWidth: '40px',
                      backgroundColor: currentPage === pagina ? '#007bff' : undefined,
                      color: currentPage === pagina ? 'white' : undefined
                    }}
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
            <div style={{ fontSize: '0.95rem', marginLeft: '16px' }}>
              Página {currentPage + 1}{totalPages ? ` de ${totalPages}` : ''}
            </div>
            </div>
          )}
        </div>
      </div>

      {mostrarModalConfirmacao && itemParaExcluir && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3>Confirmar Exclusão</h3>
              <button onClick={() => { setMostrarModalConfirmacao(false); setItemParaExcluir(null); }} className={styles['btn-fechar']}>✖</button>
            </div>
            <div className={styles['modal-body']}>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Tem certeza que deseja excluir o item?</p>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <p><strong>Nome:</strong> {itemParaExcluir.nome}</p>
                {itemParaExcluir.codigo && (<p><strong>Código:</strong> {itemParaExcluir.codigo}</p>)}
                {itemParaExcluir.preco !== undefined && (<p><strong>Preço:</strong> {Number(itemParaExcluir.preco).toFixed(2)}</p>)}
                {itemParaExcluir.qtdEstoque !== undefined && (<p><strong>Quantidade:</strong> {itemParaExcluir.qtdEstoque}</p>)}
              </div>
              <p style={{ marginTop: '20px', color: '#dc3545', fontWeight: '600', fontSize: '0.9rem' }}>⚠️ Esta ação não pode ser desfeita!</p>
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={() => { setMostrarModalConfirmacao(false); setItemParaExcluir(null); }} className={styles['btn-cancelar']}>Cancelar</button>
              <button onClick={confirmarExclusao} className={styles['btn-excluir']} disabled={carregando}>{carregando ? 'Excluindo...' : 'Confirmar Exclusão'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
