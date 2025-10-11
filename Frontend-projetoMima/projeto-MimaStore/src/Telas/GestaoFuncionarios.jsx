import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/GestaoFuncionarios.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import { Tabela } from '../Componentes/Tabela';

export function GestaoFuncionarios() {
    const navigate = useNavigate();
    const [funcionarios, setFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [busca, setBusca] = useState('');
    const [funcionarioEditando, setFuncionarioEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
    const [novoFuncionario, setNovoFuncionario] = useState({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        cargo: '',
        senha: '',
        imagemFile: null
    });

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };



    // Carregar funcionários na inicialização
    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const carregarFuncionarios = async () => {
        setCarregando(true);
        setErro('');
        try {
            const response = await API.get('/usuarios');
            console.log('Resposta da API /usuarios:', response);
            console.log('Dados retornados:', response.data);
            
            if (response.status === 200 && response.data) {
                // Filtrar apenas funcionários se houver um campo que os identifique
                const todosFuncionarios = Array.isArray(response.data) ? response.data : [];
                console.log('Funcionários encontrados:', todosFuncionarios);
                setFuncionarios(todosFuncionarios);
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            // Mostrar erro detalhado para ajudar diagnóstico (401, 403, CORS, etc.)
            setFuncionarios([]);
            const status = error.response?.status;
            const data = error.response?.data;
            if (status === 404) {
                setErro('Nenhum funcionário encontrado.');
            } else if (status) {
                const detail = typeof data === 'string' ? data : JSON.stringify(data);
                setErro(`Erro ${status}: ${detail}`);
            } else {
                setErro(error.message || 'Erro ao carregar funcionários.');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Filtrar funcionários pela busca
    const funcionariosFiltrados = funcionarios.filter(func => 
        func.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        func.email?.toLowerCase().includes(busca.toLowerCase()) ||
        func.cpf?.includes(busca)
    );

    // Função para abrir confirmação de exclusão
    const abrirConfirmacaoExclusao = (funcionario) => {
        setFuncionarioParaExcluir(funcionario);
        setMostrarModalConfirmacao(true);
    };

    // Função para deletar funcionário
    const confirmarExclusao = async () => {
        if (!funcionarioParaExcluir) return;

        setCarregando(true);
        try {
            await API.delete(`/usuarios/${funcionarioParaExcluir.id}`);
            setFuncionarios(prev => prev.filter(f => f.id !== funcionarioParaExcluir.id));
            setMensagem(`Funcionário "${funcionarioParaExcluir.nome}" excluído com sucesso!`);
            setTimeout(() => setMensagem(''), 3000);
            setMostrarModalConfirmacao(false);
            setFuncionarioParaExcluir(null);
        } catch (error) {
            console.error('Erro ao deletar funcionário:', error);
            if (error.response?.status === 404) {
                setErro('Funcionário não encontrado.');
            } else {
                setErro('Erro ao excluir funcionário.');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Função para abrir modal de edição
    const abrirEdicao = (funcionario) => {
        setErro('');
        // incluir campo imagemFile para possível upload
        setFuncionarioEditando({...funcionario, imagemFile: null});
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
    const dadosTabela = funcionariosFiltrados.map(usuario => {
        console.log('Usuário individual completo:', usuario);
        console.log('Campos disponíveis:', Object.keys(usuario));
        
        const dadosUsuario = {
            id: usuario.id,
            nome: usuario.nome || '',
            email: usuario.email || '',
            cargo: usuario.cargo || ''
        };
        
        console.log('Dados processados para este usuário:', dadosUsuario);
        return dadosUsuario;
    });
    
    console.log('Dados finais preparados para tabela:', dadosTabela);

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!funcionarioEditando.nome || !funcionarioEditando.email || !funcionarioEditando.cargo) {
            setErro('Nome, email e cargo são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            // Atualização: o endpoint PUT /usuarios/{id} espera multipart/form-data
            const formData = new FormData();
            formData.append('nome', funcionarioEditando.nome);
            formData.append('email', funcionarioEditando.email);
            formData.append('telefone', funcionarioEditando.telefone || '');
            formData.append('cargo', funcionarioEditando.cargo);
            formData.append('endereco', funcionarioEditando.endereco || '');
            if (funcionarioEditando.imagemFile) {
                formData.append('imagem', funcionarioEditando.imagemFile);
            }

            const response = await API.put(`/usuarios/${funcionarioEditando.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Recarregar lista a partir do servidor para garantir consistência
            await carregarFuncionarios();

            setMostrarModal(false);
            setFuncionarioEditando(null);
            setMensagem('Funcionário atualizado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            setErro('Erro ao atualizar funcionário.');
        } finally {
            setCarregando(false);
        }
    };

    // Função para cadastrar novo funcionário
    const cadastrarFuncionario = async () => {
        if (!novoFuncionario.nome || !novoFuncionario.email || !novoFuncionario.telefone || 
            !novoFuncionario.cargo || !novoFuncionario.endereco || !novoFuncionario.senha) {
            setErro('Todos os campos são obrigatórios.');
            return;
        }

        setCarregando(true);
        try {
            // Se existe imagemFile, enviar como multipart para o endpoint /funcionarios/com-imagem
            if (novoFuncionario.imagemFile) {
                const fd = new FormData();
                fd.append('nome', novoFuncionario.nome);
                fd.append('email', novoFuncionario.email);
                fd.append('telefone', novoFuncionario.telefone);
                fd.append('cargo', novoFuncionario.cargo);
                fd.append('endereco', novoFuncionario.endereco);
                fd.append('imagem', novoFuncionario.imagemFile);

                const response = await API.post('/usuarios/funcionarios/com-imagem', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Recarregar lista
                await carregarFuncionarios();
            } else {
                const payload = {
                    nome: novoFuncionario.nome,
                    email: novoFuncionario.email,
                    telefone: novoFuncionario.telefone,
                    cargo: novoFuncionario.cargo,
                    endereco: novoFuncionario.endereco,
                    imagem: null
                };
                await API.post('/usuarios/funcionarios', payload);
                await carregarFuncionarios();
            }

            setMostrarModalCadastro(false);
            setNovoFuncionario({ nome: '', email: '', telefone: '', endereco: '', cargo: '', senha: '', imagemFile: null });
            setMensagem('Funcionário cadastrado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            if (error.response?.status === 400) {
                setErro('Dados inválidos ou email já cadastrado.');
            } else {
                setErro('Erro ao cadastrar funcionário.');
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
                    <h1 className={styles['titulo-gestao']}>Gestão de Funcionários</h1>
                    
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
                            + Novo Funcionário
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
                        <span>Total: {funcionariosFiltrados.length} funcionários</span>
                    </div>
                    
                    <div className={styles['tabela-wrapper']}>
                        <Tabela 
                            itens={dadosTabela}
                            botaoEditar={true}
                            onEditar={(item) => {
                                const funcionario = funcionariosFiltrados.find(f => f.id === item.id);
                                abrirEdicao(funcionario);
                            }}
                            botaoRemover={true}
                            onRemover={(item) => {
                                const funcionario = funcionariosFiltrados.find(f => f.id === item.id);
                                abrirConfirmacaoExclusao(funcionario);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de Edição */}
            {mostrarModal && funcionarioEditando && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Editar Funcionário</h3>
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
                                    value={funcionarioEditando.nome}
                                    onChange={(e) => setFuncionarioEditando({...funcionarioEditando, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={funcionarioEditando.email}
                                    onChange={(e) => setFuncionarioEditando({...funcionarioEditando, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone</label>
                                <input 
                                    type="text"
                                    value={funcionarioEditando.telefone || ''}
                                    onChange={(e) => setFuncionarioEditando({...funcionarioEditando, telefone: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço</label>
                                <input 
                                    type="text"
                                    value={funcionarioEditando.endereco || ''}
                                    onChange={(e) => setFuncionarioEditando({...funcionarioEditando, endereco: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Cargo *</label>
                                <input 
                                    type="text"
                                    value={funcionarioEditando.cargo || ''}
                                    onChange={(e) => setFuncionarioEditando({...funcionarioEditando, cargo: e.target.value})}
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
                            <h3>Novo Funcionário</h3>
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
                                    value={novoFuncionario.nome}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    value={novoFuncionario.email}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, email: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Telefone *</label>
                                <input 
                                    type="text"
                                    value={novoFuncionario.telefone}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, telefone: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Imagem (opcional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, imagemFile: e.target.files?.[0] || null})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Endereço *</label>
                                <input 
                                    type="text"
                                    value={novoFuncionario.endereco}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, endereco: e.target.value})}
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Cargo *</label>
                                <input 
                                    type="text"
                                    value={novoFuncionario.cargo}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                                />
                                <div className={styles['form-group']}>
                                    <label>Imagem (opcional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFuncionarioEditando({...funcionarioEditando, imagemFile: e.target.files?.[0] || null})}
                                    />
                                </div>
                            </div>
                            <div className={styles['form-group']}>
                                <label>Senha *</label>
                                <input 
                                    type="password"
                                    value={novoFuncionario.senha}
                                    onChange={(e) => setNovoFuncionario({...novoFuncionario, senha: e.target.value})}
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
                                onClick={cadastrarFuncionario}
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
            {mostrarModalConfirmacao && funcionarioParaExcluir && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Confirmar Exclusão</h3>
                            <button 
                                onClick={() => {
                                    setMostrarModalConfirmacao(false);
                                    setFuncionarioParaExcluir(null);
                                }}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-body']}>
                            <p style={{marginBottom: '20px', fontSize: '1.1rem'}}>
                                Tem certeza que deseja excluir o funcionário?
                            </p>
                            <div style={{
                                background: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <p><strong>Nome:</strong> {funcionarioParaExcluir.nome}</p>
                                <p><strong>Email:</strong> {funcionarioParaExcluir.email}</p>
                                {funcionarioParaExcluir.telefone && (
                                    <p><strong>Telefone:</strong> {funcionarioParaExcluir.telefone}</p>
                                )}
                                {funcionarioParaExcluir.cargo && (
                                    <p><strong>Cargo:</strong> {funcionarioParaExcluir.cargo}</p>
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
                                    setFuncionarioParaExcluir(null);
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