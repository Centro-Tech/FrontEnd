import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/GestaoClientes.module.css';
import fornecedorStyles from '../Componentes/Componentes - CSS/GestaoFornecedor.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import { Tabela } from '../Componentes/Tabela';

export function GestaoClientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [mostrarLoading, setMostrarLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [busca, setBusca] = useState('');
    const [clienteEditando, setClienteEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
    const [novoCliente, setNovoCliente] = useState({
        nome: '',
        email: '',
        telefone: '',
        CPF: '',
        endereco: ''
    });

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Carregar clientes na inicialização
    useEffect(() => {
        carregarClientes(paginaAtual);
    }, [paginaAtual]);

    const carregarClientes = async (page = 0) => {
        setCarregando(true);
        setMostrarLoading(page === 0);
        setErro('');
        
        const tamanho = 10;
        const response = await API.get('/clientes', { params: { page, size: tamanho } });
        
        const clientesData = response.data.content.map(cliente => ({
            id: cliente.idCliente,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone
        }));
        
        setClientes(clientesData);
        setTotalPaginas(response.data.totalPages);
        setTotalElementos(response.data.totalElements);
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

    // Filtrar clientes pela busca
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.email.toLowerCase().includes(busca.toLowerCase())
    );

    // Função para abrir confirmação de exclusão
    const abrirConfirmacaoExclusao = (cliente) => {
        setErro('');
        setClienteParaExcluir(cliente);
        setMostrarModalConfirmacao(true);
    };

    // Função para deletar cliente
    const confirmarExclusao = async () => {
        if (!clienteParaExcluir) return;

        setCarregando(true);
        try {
            const clienteId = clienteParaExcluir.id;
            await API.delete(`/clientes/${clienteId}`);
            setClientes(prev => prev.filter(c => c.id !== clienteId));
            setMensagem(`Cliente "${clienteParaExcluir.nome}" excluído com sucesso!`);
            setTimeout(() => setMensagem(''), 3000);
            setMostrarModalConfirmacao(false);
            setClienteParaExcluir(null);
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            if (error.response?.status === 404) {
                setErro('Cliente não encontrado.');
            } else {
                setErro('Erro ao excluir cliente.');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Função para abrir modal de edição
    const abrirEdicao = (cliente) => {
        setErro('');
        setClienteEditando({...cliente});
        setMostrarModal(true);
    };

    // Função para fechar modais limpando erro
    const fecharModalEdicao = () => {
        setErro('');
        setMostrarModal(false);
    };

    const fecharModalCadastro = () => {
        setErro('');
        setMostrarModalCadastro(false);
    };

    const abrirModalCadastro = () => {
        setErro('');
        setMostrarModalCadastro(true);
    };

    // Preparar dados para a tabela
    const dadosTabela = clientesFiltrados.map(cliente => ({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone
    }));

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!clienteEditando.nome || !clienteEditando.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        const clienteId = clienteEditando.id;
        const response = await API.put(`/clientes/${clienteId}`, {
            nome: clienteEditando.nome,
            email: clienteEditando.email,
            telefone: clienteEditando.telefone
        });

        const clienteAtualizado = {
            id: response.data.idCliente,
            nome: response.data.nome,
            email: response.data.email,
            telefone: response.data.telefone
        };
        
        setClientes(prev => prev.map(c => (c.id === clienteId ? clienteAtualizado : c)));
        setMostrarModal(false);
        setClienteEditando(null);
        setMensagem('Cliente atualizado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setCarregando(false);
    };

    // Função para cadastrar novo cliente
    const cadastrarCliente = async () => {
        if (!novoCliente.nome || !novoCliente.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        const response = await API.post('/clientes', novoCliente);
        
        const novoClienteData = {
            id: response.data.idCliente,
            nome: response.data.nome,
            email: response.data.email,
            telefone: response.data.telefone
        };
        
        setClientes(prev => [...prev, novoClienteData]);
        setMostrarModalCadastro(false);
        setNovoCliente({
            nome: '',
            email: '',
            telefone: '',
            CPF: '',
            endereco: ''
        });
        setMensagem('Cliente cadastrado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setCarregando(false);
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles['container-gestao']}>
                <div className={styles['header-gestao']}>
                    <h1 className={styles['titulo-gestao']}>Gestão de Clientes</h1>
                    
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
                            onClick={abrirModalCadastro}
                            className={styles['btn-novo']}
                            style={{ background: 'linear-gradient(135deg, #875C6A, #864176)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700 }}
                        >
                            + Novo Cliente
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
                        ✅ {mensagem}
                    </div>
                )}

                <div className={styles['tabela-container']}>
                    <div className={styles['info-total']}>
                        <span>Total: {totalElementos > 0 ? totalElementos : clientesFiltrados.length} clientes</span>
                    </div>
                    
                    <div className={styles['tabela-wrapper']}>
                        <Tabela 
                            itens={dadosTabela}
                            columns={[
                                { key: 'id', label: 'ID Cliente' },
                                { key: 'nome', label: 'Nome' },
                                { key: 'email', label: 'Email' },
                                { key: 'telefone', label: 'Telefone' },
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
                                onEditar={(item) => {
                                    const cliente = clientesFiltrados.find(c => c.id === item.id);
                                    abrirEdicao(cliente);
                                }}
                            botaoRemover={true}
                                onRemover={(item) => {
                                    const cliente = clientesFiltrados.find(c => c.id === item.id);
                                    abrirConfirmacaoExclusao(cliente);
                                }}
                        />
                    </div>
                    {/* Paginação (igual ao Estoque) - aparece quando NÃO está em modo de busca */}
                    {totalPaginas !== null && totalPaginas > 0 && (
                        <div className={fornecedorStyles['paginacao-container']} style={{ marginTop: '12px' }}>
                            <div className={fornecedorStyles['paginacao-numeros']}>
                                <button
                                    onClick={paginaAnterior}
                                    disabled={paginaAtual <= 0 || carregando}
                                    className={fornecedorStyles['btn-paginacao']}
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
                                            className={`${fornecedorStyles['btn-paginacao']} ${paginaAtual === pagina ? fornecedorStyles['btn-paginacao-ativa'] : ''}`}
                                            style={{ minWidth: '40px' }}
                                        >
                                            {pagina + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={proximaPagina}
                                    disabled={carregando || (totalPaginas !== null && paginaAtual >= totalPaginas - 1)}
                                    className={fornecedorStyles['btn-paginacao']}
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
            {mostrarModal && clienteEditando && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Editar Cliente</h3>
                            <button 
                                onClick={fecharModalEdicao}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            {erro && <MensagemErro mensagem={erro} />}
                            <div className={styles['form-group']}>
                                <label>Nome *</label>
                                <input 
                                    type="text"
                                    value={clienteEditando.nome}
                                    onChange={(e) => setClienteEditando({...clienteEditando, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={clienteEditando.email}
                                    onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone</label>
                                <input 
                                    type="text"
                                    value={clienteEditando.telefone || ''}
                                    onChange={(e) => setClienteEditando({...clienteEditando, telefone: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>CPF</label>
                                <input 
                                    type="text"
                                    value={clienteEditando.CPF || ''}
                                    onChange={(e) => setClienteEditando({...clienteEditando, CPF: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço</label>
                                <input 
                                    type="text"
                                    value={clienteEditando.endereco || ''}
                                    onChange={(e) => setClienteEditando({...clienteEditando, endereco: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button 
                                onClick={fecharModalEdicao}
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
                            <h3>Novo Cliente</h3>
                            <button 
                                onClick={fecharModalCadastro}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            {erro && <MensagemErro mensagem={erro} />}
                            <div className={styles['form-group']}>
                                <label>Nome *</label>
                                <input 
                                    type="text"
                                    value={novoCliente.nome}
                                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={novoCliente.email}
                                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone</label>
                                <input 
                                    type="text"
                                    value={novoCliente.telefone}
                                    onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>CPF</label>
                                <input 
                                    type="text"
                                    value={novoCliente.CPF}
                                    onChange={(e) => setNovoCliente({...novoCliente, CPF: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço</label>
                                <input 
                                    type="text"
                                    value={novoCliente.endereco}
                                    onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button 
                                onClick={fecharModalCadastro}
                                className={styles['btn-cancelar']}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={cadastrarCliente}
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
            {mostrarModalConfirmacao && clienteParaExcluir && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Confirmar Exclusão</h3>
                            <button 
                                onClick={() => {
                                    setMostrarModalConfirmacao(false);
                                    setClienteParaExcluir(null);
                                }}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            <p style={{marginBottom: '20px', fontSize: '1.1rem'}}>
                                Tem certeza que deseja excluir o cliente?
                            </p>
                            <div style={{
                                background: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <p><strong>Nome:</strong> {clienteParaExcluir.nome}</p>
                                <p><strong>Email:</strong> {clienteParaExcluir.email}</p>
                                {clienteParaExcluir.telefone && (
                                    <p><strong>Telefone:</strong> {clienteParaExcluir.telefone}</p>
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
                                    setClienteParaExcluir(null);
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