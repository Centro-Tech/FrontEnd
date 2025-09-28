import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/TesteFornecedor.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import { Tabela } from '../Componentes/Tabela';

export function TesteFornecedor() {
    const navigate = useNavigate();
    const [fornecedores, setFornecedores] = useState([]);
    const [carregando, setCarregando] = useState(false);
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
        carregarFornecedores();
    }, []);

    const carregarFornecedores = async () => {
        setCarregando(true);
        setErro('');
        try {
            const response = await API.get('/fornecedores');
            if (response.status === 200 && response.data) {
                setFornecedores(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            if (error.response?.status === 404) {
                setFornecedores([]);
                setErro('Nenhum fornecedor encontrado.');
            } else {
                setErro('Erro ao carregar fornecedores.');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Filtrar fornecedores pela busca
    const fornecedoresFiltrados = fornecedores.filter(forn => 
        forn.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        forn.email?.toLowerCase().includes(busca.toLowerCase()) ||
        forn.cnpj?.includes(busca)
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
        try {
            await API.delete(`/fornecedores/${fornecedorParaExcluir.id}`);
            setFornecedores(prev => prev.filter(f => f.id !== fornecedorParaExcluir.id));
            setMensagem(`Fornecedor "${fornecedorParaExcluir.nome}" excluído com sucesso!`);
            setTimeout(() => setMensagem(''), 3000);
            setMostrarModalConfirmacao(false);
            setFornecedorParaExcluir(null);
        } catch (error) {
            console.error('Erro ao deletar fornecedor:', error);
            if (error.response?.status === 404) {
                setErro('Fornecedor não encontrado.');
            } else {
                setErro('Erro ao excluir fornecedor.');
            }
        } finally {
            setCarregando(false);
        }
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
        telefone: fornecedor.telefone || '-',
        // cnpj: fornecedor.cnpj || '-' - Se add cnpj: descomentar essa linha
    }));

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!fornecedorEditando.nome || !fornecedorEditando.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            const response = await API.put(`/fornecedores/${fornecedorEditando.id}`, {
                nome: fornecedorEditando.nome,
                email: fornecedorEditando.email,
                telefone: fornecedorEditando.telefone || '',
                cnpj: fornecedorEditando.cnpj || '',
                endereco: fornecedorEditando.endereco || ''
            });
            
            // Atualizar na lista
            setFornecedores(prev => prev.map(f => 
                f.id === fornecedorEditando.id ? response.data : f
            ));
            
            setMostrarModal(false);
            setFornecedorEditando(null);
            setMensagem('Fornecedor atualizado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
            setErro('Erro ao atualizar fornecedor.');
        } finally {
            setCarregando(false);
        }
    };

    // Função para cadastrar novo fornecedor
    const cadastrarFornecedor = async () => {
        if (!novoFornecedor.nome || !novoFornecedor.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            const response = await API.post('/fornecedores', novoFornecedor);
            setFornecedores(prev => [...prev, response.data]);
            setMostrarModalCadastro(false);
            setNovoFornecedor({
                nome: '',
                email: '',
                telefone: '',
                cnpj: '',
                endereco: ''
            });
            setMensagem('Fornecedor cadastrado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao cadastrar fornecedor:', error);
            if (error.response?.status === 409) {
                setErro('Fornecedor com este CNPJ já existe.');
            } else {
                setErro('Erro ao cadastrar fornecedor.');
            }
        } finally {
            setCarregando(false);
        }
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
                                placeholder="Buscar por nome, email ou CNPJ..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className={styles['input-busca']}
                            />
                        </div>
                        
                        <button 
                            onClick={() => setMostrarModalCadastro(true)}
                            className={styles['btn-novo']}
                        >
                            + Novo Fornecedor
                        </button>
                        
                        {/* <button 
                            onClick={carregarFornecedores}
                            className={styles['btn-atualizar']}
                            disabled={carregando}
                        >
                            🔄 Atualizar
                        </button> */}
                    </div>
                </div>

                {carregando && (
                    <div className={styles['loading']}>
                        <p>Carregando...</p>
                    </div>
                )}

                {mensagem && (
                    <div className={styles['mensagem-sucesso']}>
                        ✅ {mensagem}
                    </div>
                )}

                <MensagemErro mensagem={erro} />

                <div className={styles['tabela-container']}>
                    <div className={styles['info-total']}>
                        <span>Total: {fornecedoresFiltrados.length} fornecedores</span>
                    </div>
                    
                    <div className={styles['tabela-wrapper']}>
                        <Tabela 
                            itens={dadosTabela}
                            botaoEditar={true}
                            onEditar={(item) => {
                                const fornecedor = fornecedoresFiltrados.find(f => f.id === item.id);
                                abrirEdicao(fornecedor);
                            }}
                            botaoRemover={true}
                            onRemover={(item) => {
                                const fornecedor = fornecedoresFiltrados.find(f => f.id === item.id);
                                abrirConfirmacaoExclusao(fornecedor);
                            }}
                        />
                    </div>
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
                                />
                            </div>
                            {/* <div className={styles['form-group']}>
                                <label>CNPJ</label>
                                <input 
                                    type="text"
                                    value={fornecedorEditando.cnpj || ''}
                                    onChange={(e) => setFornecedorEditando({...fornecedorEditando, cnpj: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço</label>
                                <input 
                                    type="text"
                                    value={fornecedorEditando.endereco || ''}
                                    onChange={(e) => setFornecedorEditando({...fornecedorEditando, endereco: e.target.value})}
                                />
                            </div> */}
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
                                <label>Telefone</label>
                                <input 
                                    type="text"
                                    value={novoFornecedor.telefone}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, telefone: e.target.value})}
                                />
                            </div>
                            {/* <div className={styles['form-group']}>
                                <label>CNPJ</label>
                                <input 
                                    type="text"
                                    value={novoFornecedor.cnpj}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, cnpj: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço</label>
                                <input 
                                    type="text"
                                    value={novoFornecedor.endereco}
                                    onChange={(e) => setNovoFornecedor({...novoFornecedor, endereco: e.target.value})}
                                />
                            </div> */}
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