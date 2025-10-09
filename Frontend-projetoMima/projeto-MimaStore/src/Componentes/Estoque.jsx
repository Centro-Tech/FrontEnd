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
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [mostrarModalRepor, setMostrarModalRepor] = useState(false);
  const [itemParaRepor, setItemParaRepor] = useState(null);
  const [quantidadeRepor, setQuantidadeRepor] = useState('');
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);

  const voltarAoMenu = () => navigate('/menu-inicial');

  useEffect(() => { buscarEstoque(); }, []);

  const buscarEstoque = async () => {
    setCarregando(true);
    setErro('');
    try {
      const res = await API.get('/itens/estoque');
      if (res.status === 204) { setItens([]); return; }
      let itensCarregados = [];
      if (Array.isArray(res.data)) itensCarregados = res.data;
      else if (res.data && Array.isArray(res.data.itens)) itensCarregados = res.data.itens;
      else if (res.data && Array.isArray(res.data.data)) itensCarregados = res.data.data;
      else if (res.data && res.data.content && Array.isArray(res.data.content)) itensCarregados = res.data.content;
      else { setItens([]); setErro('Formato de resposta da API não reconhecido.'); return; }
      setItens(itensCarregados);
      if (itensCarregados.length === 0) setErro('Nenhum item encontrado no estoque.');
    } catch (err) {
      if (err.response) {
        if (err.response?.status === 404) { setItens([]); setErro('Endpoint não encontrado.'); }
        else if (err.response?.status === 204) { setItens([]); setErro(''); }
        else if (err.response?.status === 500) setErro('Erro interno do servidor ao carregar estoque.');
        else setErro(`Erro ao carregar estoque (${err.response.status})`);
      } else if (err.request) setErro('Erro de conexão com o servidor.');
      else setErro(`Erro inesperado: ${err.message}`);
    } finally { setCarregando(false); }
  };

  const abrirConfirmacaoExclusao = async (item) => {
    if (!item) { setErro('Erro: Item inválido para exclusão.'); console.error('item inválido', item); return; }
    let target = item;
    if (!target.id && !target.codigo) {
      const encontrado = itens.find((it) => (it.codigo && item.codigo && String(it.codigo) === String(item.codigo)) || (it.nome && item.nome && String(it.nome) === String(item.nome)));
      if (encontrado) target = encontrado;
    }
    if (!target.id && !target.codigo) { setErro('Erro: Item não encontrado para exclusão.'); console.error('sem correspondência', item); return; }
    setMostrarModalConfirmacao(true); setItemParaExcluir(target);
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) { setErro('Erro: Item não encontrado para exclusão.'); return; }
    if (!itemParaExcluir.codigo || itemParaExcluir.codigo === 'N/A') { setErro('Erro: Este item não possui um código válido para exclusão.'); return; }
    setCarregando(true); setErro('');
    try {
      let response;
      try { response = await API.delete(`/itens/item/${encodeURIComponent(itemParaExcluir.codigo)}`); }
      catch (codigoError) {
        if (codigoError.response?.status === 404 && itemParaExcluir.id) { response = await API.delete(`/itens/${itemParaExcluir.id}`); }
        else throw codigoError;
      }
      setMensagem(`Item "${itemParaExcluir.nome}" excluído com sucesso!`);
      setTimeout(() => setMensagem(''), 3000);
      await buscarEstoque(); setMostrarModalConfirmacao(false); setItemParaExcluir(null);
    } catch (error) { console.error('Erro excluir', error); setErro('Erro ao excluir item. Veja console.'); } finally { setCarregando(false); }
  };

  const abrirRepor = (item) => { const original = itens.find(x => x.id === item.id) || item; setItemParaRepor(original); setQuantidadeRepor(''); setMostrarModalRepor(true); };

  const confirmarRepor = async () => {
    setErro('');
    if (!itemParaRepor || quantidadeRepor === '' || Number(quantidadeRepor) <= 0) { setErro('Informe uma quantidade válida para repor.'); return; }
    setCarregando(true);
    try {
      await API.post('/estoque/repor', { id: itemParaRepor.id, quantidade: Number(quantidadeRepor) });
      setItens(prev => prev.map(it => it.id === itemParaRepor.id ? { ...it, qtdEstoque: (Number(it.qtdEstoque || 0) + Number(quantidadeRepor)) } : it));
      setMensagem(`Reposto ${quantidadeRepor} unidade(s) de "${itemParaRepor.nome}" com sucesso!`);
      setTimeout(() => setMensagem(''), 3000);
      setMostrarModalRepor(false); setItemParaRepor(null); setQuantidadeRepor('');
    } catch (e) { console.error('Erro ao repor:', e.response || e); setErro('Erro ao repor item. Verifique o console.'); } finally { setCarregando(false); }
  };

  const itensFiltrados = itens.filter(it => (it.nome || '').toLowerCase().includes((busca || '').toLowerCase()) || String(it.id || '').includes(busca));
  const dadosTabela = itensFiltrados.map(i => ({ id: i.id, nome: i.nome, qtdEstoque: i.qtdEstoque ?? (i.qtdEstoque === 0 ? 0 : '-'), preco: i.preco ? Number(i.preco).toFixed(2) : '-', }));

  return (
    <div>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles['container-gestao']}>
        <div className={styles['header-gestao']}>
          <h1 className={styles['titulo-gestao']}>Visualizar Estoque</h1>
          <div className={styles['barra-acoes']}>
            <div className={styles['busca-container']}>
              <input type="text" placeholder="Buscar por nome ou id..." value={busca} onChange={(e) => setBusca(e.target.value)} className={styles['input-busca']} />
            </div>
          </div>
        </div>

        {carregando && (<div className={styles['loading']}><p>Carregando...</p></div>)}

        {mensagem && (<div className={styles['mensagem-sucesso']}>✅ {mensagem}</div>)}

        <MensagemErro mensagem={erro} />

        <div className={styles['tabela-container']}>
          <div className={styles['info-total']}><span>Total: {itensFiltrados.length} itens</span></div>
          <div className={styles['tabela-wrapper']}>
            <Tabela itens={dadosTabela} botaoEditar={true} onEditar={(item) => abrirRepor(item)} botaoRemover={true} onRemover={(item) => abrirConfirmacaoExclusao(item)} />
          </div>
        </div>
      </div>

      {mostrarModalRepor && itemParaRepor && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3>Repor: {itemParaRepor.nome}</h3>
              <button onClick={() => setMostrarModalRepor(false)} className={styles['btn-fechar']}>✖</button>
            </div>
            <div className={styles['modal-body']}>
              <div className={styles['form-group']}>
                <label>Quantidade atual</label>
                <input type="number" value={itemParaRepor.qtdEstoque ?? 0} disabled />
              </div>
              <div className={styles['form-group']}>
                <label>Quantidade para repor</label>
                <input type="number" value={quantidadeRepor} onChange={e => setQuantidadeRepor(e.target.value)} />
              </div>
              <MensagemErro mensagem={erro} />
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={() => setMostrarModalRepor(false)} className={styles['btn-cancelar']}>Cancelar</button>
              <button onClick={confirmarRepor} className={styles['btn-salvar']} disabled={carregando}>{carregando ? 'Repondo...' : 'Repor'}</button>
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
