import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/GestaoClientes.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import { Tabela } from '../Componentes/Tabela';

export function GestaoClientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [carregando, setCarregando] = useState(false);
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
        cpf: '',
        endereco: ''
    });

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Carregar clientes na inicialização
    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        setCarregando(true);
        setErro('');
        try {
            const response = await API.get('/clientes');
            console.log('Resposta da API /clientes:', response);
            console.log('Dados retornados:', response.data);
            
            if (response.status === 200 && response.data) {
                const todosClientes = Array.isArray(response.data) ? response.data : [];
                console.log('Clientes encontrados:', todosClientes);
                setClientes(todosClientes);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            if (error.response?.status === 404) {
                setClientes([]);
                setErro('Nenhum cliente encontrado.');
            } else {
                setErro('Erro ao carregar clientes.');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Filtrar clientes pela busca
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.cpf?.includes(busca)
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
            const clienteId = clienteParaExcluir.idCliente || clienteParaExcluir.id;
            await API.delete(`/clientes/${clienteId}`);
            setClientes(prev => prev.filter(c => (c.idCliente || c.id) !== clienteId));
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
    const dadosTabela = clientesFiltrados.map(cliente => {
        console.log('Cliente individual completo:', cliente);
        console.log('Campos disponíveis:', Object.keys(cliente));
        
        const dadosCliente = {
            id: cliente.idCliente || cliente.id,
            nome: cliente.nome || '',
            email: cliente.email || '',
            telefone: cliente.telefone || ''
        };
        
        console.log('Dados processados para este cliente:', dadosCliente);
        return dadosCliente;
    });
    
    console.log('Dados finais preparados para tabela:', dadosTabela);

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!clienteEditando.nome || !clienteEditando.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            const clienteId = clienteEditando.idCliente || clienteEditando.id;
            const response = await API.put(`/clientes/${clienteId}`, {
                nome: clienteEditando.nome,
                email: clienteEditando.email,
                telefone: clienteEditando.telefone || '',
                cpf: clienteEditando.cpf || '',
                endereco: clienteEditando.endereco || ''
            });
            
            // Atualizar na lista
            setClientes(prev => prev.map(c => 
                (c.idCliente || c.id) === clienteId ? response.data : c
            ));
            
            setMostrarModal(false);
            setClienteEditando(null);
            setMensagem('Cliente atualizado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            setErro('Erro ao atualizar cliente.');
        } finally {
            setCarregando(false);
        }
    };

    // Função para cadastrar novo cliente
    const cadastrarCliente = async () => {
        if (!novoCliente.nome || !novoCliente.email) {
            setErro('Nome e email são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            console.log('Dados sendo enviados:', novoCliente);
            const response = await API.post('/clientes', novoCliente);
            console.log('Resposta do cadastro:', response);
            setClientes(prev => [...prev, response.data]);
            setMostrarModalCadastro(false);
            setNovoCliente({
                nome: '',
                email: '',
                telefone: '',
                cpf: '',
                endereco: ''
            });
            setMensagem('Cliente cadastrado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            if (error.response?.status === 409) {
                setErro('Cliente com este CPF já existe.');
            } else {
                setErro('Erro ao cadastrar cliente.');
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
                    <h1 className={styles['titulo-gestao']}>Gestão de Clientes</h1>
                    
                    <div className={styles['barra-acoes']}>
                        <div className={styles['busca-container']}>
                            <input 
                                type="text"
                                placeholder="Buscar por nome, email ou CPF..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className={styles['input-busca']}
                            />
                        </div>
                        
                        <button 
                            onClick={abrirModalCadastro}
                            className={styles['btn-novo']}
                        >
                            + Novo Cliente
                        </button>
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

                <div className={styles['tabela-container']}>
                    <div className={styles['info-total']}>
                        <span>Total: {clientesFiltrados.length} clientes</span>
                    </div>
                    
                    <div className={styles['tabela-wrapper']}>
                        <Tabela 
                            itens={dadosTabela}
                            botaoEditar={true}
                            onEditar={(item) => {
                                const cliente = clientesFiltrados.find(c => (c.idCliente || c.id) === item.id);
                                abrirEdicao(cliente);
                            }}
                            botaoRemover={true}
                            onRemover={(item) => {
                                const cliente = clientesFiltrados.find(c => (c.idCliente || c.id) === item.id);
                                abrirConfirmacaoExclusao(cliente);
                            }}
                        />
                    </div>
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
                                    value={clienteEditando.cpf || ''}
                                    onChange={(e) => setClienteEditando({...clienteEditando, cpf: e.target.value})}
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
                                    value={novoCliente.cpf}
                                    onChange={(e) => setNovoCliente({...novoCliente, cpf: e.target.value})}
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