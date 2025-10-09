import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';

export function DeletarFornecedor() {
    const navigate = useNavigate();
    const [buscarPor, setBuscarPor] = useState('nome');
    const [valorBusca, setValorBusca] = useState('');
    const [fornecedorEncontrado, setFornecedorEncontrado] = useState(null);
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState([]);
    const [todosFornecedores, setTodosFornecedores] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [fornecedoresParaDeletar, setFornecedoresParaDeletar] = useState([]);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Carregar todos os fornecedores na inicialização
    React.useEffect(() => {
        carregarTodosFornecedores();
    }, []);

    // Busca em tempo real
    React.useEffect(() => {
        filtrarFornecedores();
    }, [valorBusca, buscarPor, todosFornecedores]);

    const carregarTodosFornecedores = async () => {
        setCarregando(true);
        try {
            const response = await API.get('/fornecedores');
            if (response.status === 200 && response.data) {
                setTodosFornecedores(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            if (error.response?.status !== 404) {
                setErro('Erro ao carregar fornecedores.');
            }
        } finally {
            setCarregando(false);
        }
    };

    const filtrarFornecedores = () => {
        if (!valorBusca.trim()) {
            setFornecedores([]);
            setFornecedorEncontrado(null);
            setErro('');
            return;
        }

        const fornecedoresFiltrados = todosFornecedores.filter(forn => {
            const valorLower = valorBusca.toLowerCase();
            if (buscarPor === 'nome') {
                return forn.nome && forn.nome.toLowerCase().includes(valorLower);
            } else if (buscarPor === 'email') {
                return forn.email && forn.email.toLowerCase().includes(valorLower);
            } else if (buscarPor === 'telefone') {
                return forn.telefone && forn.telefone.includes(valorBusca);
            }
            return false;
        });

        setFornecedores(fornecedoresFiltrados);
        setFornecedorEncontrado(null);
        
        if (valorBusca.trim() && fornecedoresFiltrados.length === 0) {
            setErro(`Nenhum fornecedor encontrado com ${buscarPor}: "${valorBusca}".`);
        } else {
            setErro('');
        }
    };

    const abrirConfirmacao = (fornecedor = null) => {
        if (fornecedor) {
            setFornecedoresParaDeletar([fornecedor]);
        } else if (fornecedoresSelecionados.length > 0) {
            setFornecedoresParaDeletar(fornecedoresSelecionados);
        } else if (fornecedorEncontrado) {
            setFornecedoresParaDeletar([fornecedorEncontrado]);
        }
        setMostrarConfirmacao(true);
    };

    const fecharConfirmacao = () => {
        setMostrarConfirmacao(false);
        setFornecedoresParaDeletar([]);
    };

    const selecionarFornecedor = (fornecedor) => {
        setFornecedorEncontrado(fornecedor);
    };

    const toggleSelecionarFornecedor = (fornecedor) => {
        setFornecedoresSelecionados(prev => {
            const jaEstaeSelecionado = prev.find(f => f.id === fornecedor.id);
            if (jaEstaeSelecionado) {
                return prev.filter(f => f.id !== fornecedor.id);
            } else {
                return [...prev, fornecedor];
            }
        });
    };

    const selecionarTodos = () => {
        if (fornecedoresSelecionados.length === fornecedores.length) {
            setFornecedoresSelecionados([]);
        } else {
            setFornecedoresSelecionados([...fornecedores]);
        }
    };

    const limparSelecoes = () => {
        setFornecedoresSelecionados([]);
        setFornecedorEncontrado(null);
    };

    const confirmarDelecao = async () => {
        if (!fornecedoresParaDeletar || fornecedoresParaDeletar.length === 0) return;

        setCarregando(true);
        setErro('');
        fecharConfirmacao();
        
        const deletados = [];
        const erros = [];
        
        for (const fornecedor of fornecedoresParaDeletar) {
            try {
                const response = await API.delete(`/fornecedores/${fornecedor.id}`);
                
                if (response.status === 204) {
                    deletados.push(fornecedor);
                }
            } catch (error) {
                console.error(`Erro ao deletar fornecedor ${fornecedor.nome}:`, error);
                erros.push({
                    fornecedor,
                    erro: error.response?.status
                });
            }
        }
        
        // Atualizar listas removendo fornecedores deletados
        if (deletados.length > 0) {
            const idsDeletedos = deletados.map(f => f.id);
            setTodosFornecedores(prev => prev.filter(f => !idsDeletedos.includes(f.id)));
            setFornecedores(prev => prev.filter(f => !idsDeletedos.includes(f.id)));
            setFornecedoresSelecionados(prev => prev.filter(f => !idsDeletedos.includes(f.id)));
            
            if (fornecedorEncontrado && idsDeletedos.includes(fornecedorEncontrado.id)) {
                setFornecedorEncontrado(null);
            }
            
            const mensagemSucesso = deletados.length === 1 
                ? `Fornecedor "${deletados[0].nome}" deletado com sucesso!`
                : `${deletados.length} fornecedores deletados com sucesso!`;
            
            setMensagem(mensagemSucesso);
        }
        
        // Mostrar erros se houver
        if (erros.length > 0) {
            let mensagemErro = '';
            if (erros.length === 1) {
                const erro = erros[0];
                if (erro.erro === 404) {
                    mensagemErro = `Fornecedor "${erro.fornecedor.nome}" não encontrado.`;
                } else if (erro.erro === 409) {
                    mensagemErro = `Fornecedor "${erro.fornecedor.nome}" possui itens associados.`;
                } else {
                    mensagemErro = `Erro ao deletar "${erro.fornecedor.nome}".`;
                }
            } else {
                mensagemErro = `Erro ao deletar ${erros.length} fornecedores.`;
            }
            setErro(mensagemErro);
        }
        
        setTimeout(() => {
            setMensagem('');
        }, 4000);
        
        setCarregando(false);
    };

    // Componente Modal de Confirmação
    const ModalConfirmacao = () => {
        if (!mostrarConfirmacao || !fornecedoresParaDeletar || fornecedoresParaDeletar.length === 0) return null;

        const isMultiplo = fornecedoresParaDeletar.length > 1;

        return (
            <div className={styles['modal-overlay']}>
                <div className={styles['modal-content']}>
                    <div className={styles['modal-header']}>
                        <h3>Confirmar Exclusão</h3>
                    </div>
                    <div className={styles['modal-body']}>
                        <p>
                            {isMultiplo 
                                ? `Tem certeza que deseja deletar ${fornecedoresParaDeletar.length} fornecedores:`
                                : 'Tem certeza que deseja deletar o fornecedor:'
                            }
                        </p>
                        <div className={styles['fornecedores-lista']}>
                            {fornecedoresParaDeletar.map((fornecedor, index) => (
                                <div key={fornecedor.id} className={styles['fornecedor-info']}>
                                    <p><strong>{fornecedor.nome}</strong></p>
                                    <p>Email: {fornecedor.email || 'Não informado'}</p>
                                    <p>Telefone: {fornecedor.telefone || 'Não informado'}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles['aviso-modal']}>
                            <p>⚠️ Esta ação não pode ser desfeita!</p>
                        </div>
                    </div>
                    <div className={styles['modal-buttons']}>
                        <button 
                            className={styles['btn-cancelar']} 
                            onClick={fecharConfirmacao}
                            disabled={carregando}
                        >
                            Cancelar
                        </button>
                        <button 
                            className={styles['btn-confirmar']} 
                            onClick={confirmarDelecao}
                            disabled={carregando}
                        >
                            {carregando 
                                ? `Deletando ${fornecedoresParaDeletar.length} fornecedor${isMultiplo ? 'es' : ''}...` 
                                : `Confirmar Exclusão ${isMultiplo ? `(${fornecedoresParaDeletar.length})` : ''}`
                            }
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Deletar Fornecedor</h2>
                    
                    <div className={styles['busca-container']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="buscarPor">Buscar por:</label>
                            <select 
                                id="buscarPor" 
                                value={buscarPor} 
                                onChange={e => setBuscarPor(e.target.value)}
                            >
                                <option value="nome">Nome</option>
                                <option value="email">Email</option>
                                <option value="telefone">Telefone</option>
                            </select>
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="valorBusca">Digite para buscar:</label>
                            <input 
                                type="text" 
                                id="valorBusca"
                                value={valorBusca} 
                                onChange={e => setValorBusca(e.target.value)}
                                placeholder={`Digite o ${buscarPor} do fornecedor...`}
                                className={styles['input-busca']}
                            />
                        </div>
                        
                        {carregando && (
                            <div className={styles['loading-indicator']}>
                                <p>Carregando fornecedores...</p>
                            </div>
                        )}
                    </div>

                    {fornecedores.length > 0 && (
                        <div className={styles['resultados-busca']}>
                            <div className={styles['cabecalho-resultados']}>
                                <h3>Fornecedores encontrados ({fornecedores.length}):</h3>
                                <button 
                                    onClick={selecionarTodos}
                                    className={styles['btn-selecionar-todos']}
                                >
                                    {fornecedoresSelecionados.length === fornecedores.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                                </button>
                            </div>
                            
                            {fornecedoresSelecionados.length > 0 && (
                                <div className={styles['barra-acoes-selecao']}>
                                    <span className={styles['contador-selecao']}>
                                        {fornecedoresSelecionados.length} fornecedor{fornecedoresSelecionados.length > 1 ? 'es' : ''} selecionado{fornecedoresSelecionados.length > 1 ? 's' : ''}
                                    </span>
                                    <div className={styles['botoes-acoes']}>
                                        <button 
                                            onClick={selecionarTodos}
                                            className={styles['btn-desmarcar-todos']}
                                        >
                                            Desmarcar Todos
                                        </button>
                                        {/* <button 
                                            onClick={() => abrirConfirmacao()}
                                            className={styles['btn-deletar-selecionados']}
                                        >
                                            Deletar Selecionados
                                        </button> */}
                                    </div>
                                </div>
                            )}
                            {fornecedores.map(forn => {
                                const estaSelecionado = fornecedoresSelecionados.find(f => f.id === forn.id);
                                return (
                                    <div key={forn.id} className={`${styles['item-resultado']} ${estaSelecionado ? styles['item-selecionado'] : ''}`}>
                                        <div className={styles['item-checkbox']}>
                                            <input
                                                type="checkbox"
                                                checked={!!estaSelecionado}
                                                onChange={() => toggleSelecionarFornecedor(forn)}
                                                className={styles['checkbox-fornecedor']}
                                            />
                                        </div>
                                        <div className={styles['item-info']}>
                                            <p><strong>ID:</strong> {forn.id}</p>
                                            <p><strong>Nome:</strong> {forn.nome || 'Não informado'}</p>
                                            <p><strong>Email:</strong> {forn.email || 'Não informado'}</p>
                                            <p><strong>Telefone:</strong> {forn.telefone || 'Não informado'}</p>
                                            {forn.cnpj && <p><strong>CNPJ:</strong> {forn.cnpj}</p>}
                                        </div>
                                        <div className={styles['item-actions']}>
                                            <button 
                                                onClick={() => selecionarFornecedor(forn)}
                                                className={styles['btn-selecionar']}
                                            >
                                                Ver Detalhes
                                            </button>
                                            {/* <button 
                                                onClick={() => abrirConfirmacao(forn)}
                                                className={styles['btn-deletar-direto']}
                                            >
                                                Deletar
                                            </button> */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {fornecedorEncontrado && (
                        <div className={styles['fornecedor-selecionado']}>
                            <h3>Detalhes do fornecedor:</h3>
                            <div className={styles['dados-fornecedor']}>
                                <p><strong>ID:</strong> {fornecedorEncontrado.id}</p>
                                <p><strong>Nome:</strong> {fornecedorEncontrado.nome || 'Não informado'}</p>
                                <p><strong>Email:</strong> {fornecedorEncontrado.email || 'Não informado'}</p>
                                <p><strong>Telefone:</strong> {fornecedorEncontrado.telefone || 'Não informado'}</p>
                                {fornecedorEncontrado.cnpj && (
                                    <p><strong>CNPJ:</strong> {fornecedorEncontrado.cnpj}</p>
                                )}
                                {fornecedorEncontrado.endereco && (
                                    <p><strong>Endereço:</strong> {fornecedorEncontrado.endereco}</p>
                                )}
                            </div>
                            <div className={styles['acoes-fornecedor']}>
                                <button 
                                    onClick={() => setFornecedorEncontrado(null)}
                                    className={styles['btn-cancelar-selecao']}
                                >
                                    Fechar Detalhes
                                </button>
                                {/* <button 
                                    onClick={() => abrirConfirmacao(fornecedorEncontrado)}
                                    className={styles['botao-deletar']}
                                >
                                    Deletar Este Fornecedor
                                </button> */}
                            </div>
                        </div>
                    )}

                    {fornecedoresSelecionados.length > 0 && (
                        <div className={styles['resumo-selecao']}>
                            <h3>Fornecedores selecionados ({fornecedoresSelecionados.length}):</h3>
                            <div className={styles['lista-selecionados']}>
                                {fornecedoresSelecionados.map(forn => (
                                    <div key={forn.id} className={styles['item-selecionado-resumo']}>
                                        <span>{forn.nome}</span>
                                        <button 
                                            onClick={() => toggleSelecionarFornecedor(forn)}
                                            className={styles['btn-remover-selecao']}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles['acoes-selecao']}>
                                <button 
                                    onClick={limparSelecoes}
                                    className={styles['btn-limpar-selecoes']}
                                >
                                    Limpar
                                </button>
                                <button 
                                    onClick={() => abrirConfirmacao()}
                                    className={styles['botao-deletar']}
                                >
                                    Deletar
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {mensagem && (
                        <div className={styles['mensagem-sucesso']}>
                            <p>✅ {mensagem}</p>
                        </div>
                    )}
                    <MensagemErro mensagem={erro} />
                </div>
            </div>
            
            <ModalConfirmacao />
        </div>
    );
}
