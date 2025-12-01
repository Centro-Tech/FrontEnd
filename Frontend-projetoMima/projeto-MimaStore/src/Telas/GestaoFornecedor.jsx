import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/GestaoFornecedor.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import { Tabela } from '../Componentes/Tabela';

export function GestaoFornecedor() {
    const navigate = useNavigate();
    const [fornecedores, setFornecedores] = useState([]);
    const [totalFornecedores, setTotalFornecedores] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [mostrarLoading, setMostrarLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [busca, setBusca] = useState('');
    const [fornecedorEditando, setFornecedorEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState(null);
    const [novoFornecedor, setNovoFornecedor] = useState({
        nome: '',
        email: '',
        telefone: '',
        cnpj: '',
        endereco: ''
    });

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Carregar fornecedores na inicialização
    useEffect(() => {
        carregarFornecedores(paginaAtual);
    }, [paginaAtual]);

    const carregarFornecedores = async (page = 0) => {
        setCarregando(true);
        setMostrarLoading(page === 0);
        setErro('');
        
        const tamanho = 10;
        const response = await API.get('/fornecedores', { params: { page, size: tamanho } });
        
        const fornecedoresData = response.data.content.map(fornecedor => ({
            id: fornecedor.id,
            nome: fornecedor.nome,
            email: fornecedor.email,
            telefone: fornecedor.telefone
        }));
        
        setFornecedores(fornecedoresData);
        setTotalFornecedores(response.data.totalElements);
        setTotalPaginas(response.data.totalPages);
        setPaginaAtual(Number(page));
        setCarregando(false);
        setMostrarLoading(false);
    };

    const irParaPagina = (p) => {
        if (p < 0) p = 0;
        if (totalPaginas && p >= totalPaginas) p = totalPaginas - 1;
        setPaginaAtual(p);
    };

    const paginaAnterior = () => irParaPagina(paginaAtual - 1);
    const proximaPagina = () => irParaPagina(paginaAtual + 1);

    // Filtrar fornecedores pela busca
    const fornecedoresFiltrados = fornecedores.filter(forn => 
        forn.nome.toLowerCase().includes(busca.toLowerCase()) ||
        forn.email.toLowerCase().includes(busca.toLowerCase())
    );

    // Função para abrir confirmação de exclusão
    const abrirConfirmacaoExclusao = (fornecedor) => {
        setFornecedorParaExcluir(fornecedor);
        setMostrarModalConfirmacao(true);
    };

    // Função para deletar fornecedor
    const confirmarExclusao = async () => {
        if (!fornecedorParaExcluir) return;

        setCarregando(true);
        await API.delete(`/fornecedores/${fornecedorParaExcluir.id}`);
        setFornecedores(prev => prev.filter(f => f.id !== fornecedorParaExcluir.id));
        setMensagem(`Fornecedor "${fornecedorParaExcluir.nome}" excluído com sucesso!`);
        setTimeout(() => setMensagem(''), 3000);
        setMostrarModalConfirmacao(false);
        setFornecedorParaExcluir(null);
        setCarregando(false);
    };

    // Função para abrir modal de edição
    const abrirEdicao = (fornecedor) => {
        setFornecedorEditando({...fornecedor});
        setMostrarModal(true);
    };

    // Preparar dados para a tabela
    const dadosTabela = fornecedoresFiltrados.map(fornecedor => ({
        id: fornecedor.id,
        nome: fornecedor.nome,
        email: fornecedor.email,
        telefone: fornecedor.telefone
    }));

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!fornecedorEditando.nome || !fornecedorEditando.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        // Validar tamanho do telefone (8 a 11 caracteres)
        if (fornecedorEditando.telefone && (fornecedorEditando.telefone.length < 8 || fornecedorEditando.telefone.length > 11)) {
            setErro('Telefone deve ter entre 8 e 11 dígitos.');
            return;
        }

        setCarregando(true);
        
        const payload = {
            nome: fornecedorEditando.nome,
            email: fornecedorEditando.email,
            telefone: fornecedorEditando.telefone
        };

        const response = await API.put(`/fornecedores/${fornecedorEditando.id}`, payload);
        
        const fornecedorAtualizado = {
            id: response.data.id,
            nome: response.data.nome,
            email: response.data.email,
            telefone: response.data.telefone
        };
        
        setFornecedores(prev => prev.map(f => (f.id === fornecedorEditando.id ? fornecedorAtualizado : f)));
        setMensagem('Fornecedor atualizado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setMostrarModal(false);
        setFornecedorEditando(null);
        setCarregando(false);
    };

    // Função para cadastrar novo fornecedor
    const cadastrarFornecedor = async () => {
        if (!novoFornecedor.nome || !novoFornecedor.email || !novoFornecedor.telefone) {
            setErro('Nome, email e telefone são obrigatórios.');
            return;
        }

        // Validar tamanho do telefone (8 a 11 caracteres)
        if (novoFornecedor.telefone.length < 8 || novoFornecedor.telefone.length > 11) {
            setErro('Telefone deve ter entre 8 e 11 dígitos.');
            return;
        }

        setCarregando(true);
        
        const payload = {
            nome: novoFornecedor.nome,
            telefone: novoFornecedor.telefone,
            email: novoFornecedor.email
        };
        
        const response = await API.post('/fornecedores', payload);
        
        const novoFornecedorData = {
            id: response.data.id,
            nome: response.data.nome,
            email: response.data.email,
            telefone: response.data.telefone
        };
        
        setFornecedores(prev => [...prev, novoFornecedorData]);
        setMostrarModalCadastro(false);
        setNovoFornecedor({ nome: '', email: '', telefone: '', cnpj: '', endereco: '' });
        setMensagem('Fornecedor cadastrado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setCarregando(false);
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles['container-gestao']}>
                <div className={styles['header-gestao']}>
                    <h1 className={styles['titulo-gestao']}>Gestão de Fornecedores</h1>
                    
                    <div className={styles['barra-acoes']}>
                        <div className={styles['busca-container']}>
                            <input 
                                type="text"
                                placeholder="Buscar por nome"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className={styles['input-busca']}
                            />
                        </div>
                        
                        <button 
                            onClick={() => setMostrarModalCadastro(true)}
                            className={styles['btn-novo']}
                            style={{ background: 'linear-gradient(135deg, #875C6A, #864176)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700 }}
                        >
                            + Novo Fornecedor
                        </button>
                        
                    </div>
                </div>

                {mostrarLoading && (
                    <div className={styles['loading']}>
                        <p>Carregando...</p>
                    </div>
                )}

                {mensagem && (
                    <div className={styles['mensagem-sucesso']}>
                        {mensagem}
                    </div>
                )}

               

                <div className={styles['tabela-container']}>
                    <div className={styles['info-total']}>
                        <span>Total: {fornecedoresFiltrados.length} fornecedores</span>
                    </div>
                    
                    <div className={styles['tabela-wrapper']}>
                        <Tabela 
                            itens={dadosTabela}
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'nome', label: 'Nome' },
                                { key: 'telefone', label: 'Telefone' },
                                { key: 'email', label: 'Email' },
                            ]}
                            botaoEditar={true}
                                renderBotaoEditar={(item, cb) => (
                                    <button
                                        onClick={cb}
                                        style={{
                                            background: 'linear-gradient(135deg, #875C6A, #864176)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 10px',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Editar
                                    </button>
                                )}
                                onEditar={(item) => {
                                    const fornecedor = fornecedoresFiltrados.find(f => f.id === item.id);
                                    abrirEdicao(fornecedor);
                                }}
                            botaoRemover={true}
                                renderBotaoRemover={(item, cb) => (
                                    <button
                                        onClick={cb}
                                        style={{
                                            background: '#6e7074',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 10px',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Remover
                                    </button>
                                )}
                                onRemover={(item) => {
                                    const fornecedor = fornecedoresFiltrados.find(f => f.id === item.id);
                                    abrirConfirmacaoExclusao(fornecedor);
                                }}
                        />
                    </div>
                    {/* Paginação (igual ao Estoque) - aparece quando NÃO está em modo de busca */}
                    {totalPaginas !== null && totalPaginas > 0 && (
                        <div className={styles['paginacao-container']} style={{ marginTop: '12px' }}>
                            <div className={styles['paginacao-numeros']}>
                                <button
                                    onClick={paginaAnterior}
                                    disabled={paginaAtual <= 0 || carregando}
                                    className={styles['btn-paginacao']}
                                >
                                    Anterior
                                </button>

                                {totalPaginas && totalPaginas > 0 && Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                    let pagina;
                                    if (totalPaginas <= 5) {
                                        pagina = i;
                                    } else {
                                        const start = Math.max(0, Math.min(paginaAtual - 2, totalPaginas - 5));
                                        pagina = start + i;
                                    }

                                    return (
                                        <button
                                            key={`page-${pagina}`}
                                            onClick={() => setPaginaAtual(pagina)}
                                            disabled={carregando || paginaAtual === pagina}
                                            className={`${styles['btn-paginacao']} ${paginaAtual === pagina ? styles['btn-paginacao-ativa'] : ''}`}
                                            style={{ minWidth: '40px' }}
                                        >
                                            {pagina + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={proximaPagina}
                                    disabled={carregando || (totalPaginas !== null && paginaAtual >= totalPaginas - 1)}
                                    className={styles['btn-paginacao']}
                                >
                                    Próxima
                                </button>
                            </div>

                            <div style={{ fontSize: '0.95rem', marginLeft: '16px' }}>
                                Página {paginaAtual + 1}{totalPaginas ? ` de ${totalPaginas}` : ''}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edição */}
            {mostrarModal && fornecedorEditando && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Editar Fornecedor</h3>
                            <button 
                                onClick={() => setMostrarModal(false)}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            <div className={styles['form-group']}>
                                <label>Nome *</label>
                                <input 
                                    type="text"
                                    value={fornecedorEditando.nome}
                                    onChange={(e) => setFornecedorEditando({...fornecedorEditando, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={fornecedorEditando.email}
                                    onChange={(e) => setFornecedorEditando({...fornecedorEditando, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone</label>
                                <input 
                                    type="text"
                                    value={fornecedorEditando.telefone || ''}
                                    onChange={(e) => setFornecedorEditando({...fornecedorEditando, telefone: e.target.value})}
                                    placeholder="Digite de 8 a 11 dígitos"
                                />
                                {fornecedorEditando.telefone && (fornecedorEditando.telefone.length < 8 || fornecedorEditando.telefone.length > 11) && (
                                    <small style={{color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
                                        Telefone deve ter entre 8 e 11 dígitos
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button 
                                onClick={() => setMostrarModal(false)}
                                className={styles['btn-cancelar']}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={salvarEdicao}
                                className={styles['btn-salvar']}
                                disabled={carregando}
                            >
                                {carregando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro */}
            {mostrarModalCadastro && (
                <div className={styles['modal-overlay']}>
                    
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Novo Fornecedor</h3>
                            <button 
                                onClick={() => setMostrarModalCadastro(false)}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            <div className={styles['form-group']}>
                                <label>Nome *</label>
                                <input 
                                    type="text"
                                    value={novoFornecedor.nome}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={novoFornecedor.email}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone *</label>
                                <input 
                                    type="text"
                                    value={novoFornecedor.telefone}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, telefone: e.target.value})}
                                    placeholder="Digite de 8 a 11 dígitos"
                                />
                                {novoFornecedor.telefone && (novoFornecedor.telefone.length < 8 || novoFornecedor.telefone.length > 11) && (
                                    <small style={{color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
                                        Telefone deve ter entre 8 e 11 dígitos
                                    </small>
                                )}
                                <MensagemErro mensagem={erro} />
                             
                            </div>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button 
                                onClick={() => setMostrarModalCadastro(false)}
                                className={styles['btn-cancelar']}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={cadastrarFornecedor}
                                className={styles['btn-salvar']}
                                disabled={carregando}
                            >
                                {carregando ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {mostrarModalConfirmacao && fornecedorParaExcluir && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Confirmar Exclusão</h3>
                            <button 
                                onClick={() => {
                                    setMostrarModalConfirmacao(false);
                                    setFornecedorParaExcluir(null);
                                }}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            <p style={{marginBottom: '20px', fontSize: '1.1rem'}}>
                                Tem certeza que deseja excluir o fornecedor?
                            </p>
                            <div style={{
                                background: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <p><strong>Nome:</strong> {fornecedorParaExcluir.nome}</p>
                                <p><strong>Email:</strong> {fornecedorParaExcluir.email}</p>
                                {fornecedorParaExcluir.telefone && (
                                    <p><strong>Telefone:</strong> {fornecedorParaExcluir.telefone}</p>
                                )}
                            </div>
                            <p style={{
                                marginTop: '20px',
                                color: '#dc3545',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                ⚠️ Esta ação não pode ser desfeita!
                            </p>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button 
                                onClick={() => {
                                    setMostrarModalConfirmacao(false);
                                    setFornecedorParaExcluir(null);
                                }}
                                className={styles['btn-cancelar']}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarExclusao}
                                className={styles['btn-excluir']}
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