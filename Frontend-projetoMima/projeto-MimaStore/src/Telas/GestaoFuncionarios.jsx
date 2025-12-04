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
    const [mostrarModalSenhaProvisoria, setMostrarModalSenhaProvisoria] = useState(false);
    const [senhaProvisoria, setSenhaProvisoria] = useState('');

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

            // Tolerância a diferentes formatos de resposta:
            // - { data: { content: [...] } }
            // - { data: [...] }
            const data = response?.data;
            let lista = [];

            if (Array.isArray(data)) {
                lista = data;
            } else if (Array.isArray(data?.content)) {
                lista = data.content;
            } else if (Array.isArray(data?.usuarios)) {
                lista = data.usuarios;
            } else {
                lista = [];
            }

            const funcionariosData = lista.map(funcionario => ({
                id: funcionario.id,
                nome: funcionario.nome,
                cargo: funcionario.cargo,
                imagem: funcionario.imagem,
                email: funcionario.email,
                telefone: funcionario.telefone,
                endereco: funcionario.endereco
            }));

            setFuncionarios(funcionariosData);
        } catch (err) {
            console.error('Erro carregando funcionários:', err);
            setErro('Não foi possível carregar os funcionários.');
            setFuncionarios([]);
        } finally {
            setCarregando(false);
        }
    };

    // Filtrar funcionários pela busca
    const funcionariosFiltrados = funcionarios.filter(func => 
        func.nome.toLowerCase().includes(busca.toLowerCase()) ||
        func.email.toLowerCase().includes(busca.toLowerCase())
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
        const id = funcionarioParaExcluir.id;
        await API.delete(`/usuarios/${id}`);
        setFuncionarios(prev => prev.filter(f => f.id !== id));
        setMensagem(`Funcionário "${funcionarioParaExcluir.nome}" excluído com sucesso!`);
        setTimeout(() => setMensagem(''), 3000);
        setMostrarModalConfirmacao(false);
        setFuncionarioParaExcluir(null);
        setCarregando(false);
    };

    // Função para abrir modal de edição
    const abrirEdicao = (funcionario) => {
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
    const dadosTabela = funcionariosFiltrados.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        cargo: usuario.cargo,
        email: usuario.email,
        telefone: usuario.telefone,
        endereco: usuario.endereco
    }));

    // Função para salvar edição
    const salvarEdicao = async () => {
        if (!funcionarioEditando.nome || !funcionarioEditando.email || !funcionarioEditando.cargo) {
            setErro('Nome, email e cargo são obrigatórios.');
            return;
        }

        setCarregando(true);
        const formData = new FormData();
        formData.append('nome', funcionarioEditando.nome);
        formData.append('email', funcionarioEditando.email);
        formData.append('telefone', funcionarioEditando.telefone);
        formData.append('cargo', funcionarioEditando.cargo);
        formData.append('endereco', funcionarioEditando.endereco);
        if (funcionarioEditando.imagemFile) {
            formData.append('imagem', funcionarioEditando.imagemFile);
        }

        await API.put(`/usuarios/${funcionarioEditando.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        await carregarFuncionarios();
        setMostrarModal(false);
        setFuncionarioEditando(null);
        setMensagem('Funcionário atualizado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setCarregando(false);
    };

    // Função para cadastrar novo funcionário
    const cadastrarFuncionario = async () => {
        if (!novoFuncionario.nome || !novoFuncionario.email || !novoFuncionario.telefone || 
            !novoFuncionario.cargo || !novoFuncionario.endereco) {
            setErro('Todos os campos são obrigatórios.');
            return;
        }

        setCarregando(true);
        
        if (novoFuncionario.imagemFile) {
            const fd = new FormData();
            fd.append('nome', novoFuncionario.nome);
            fd.append('email', novoFuncionario.email);
            fd.append('telefone', novoFuncionario.telefone);
            fd.append('cargo', novoFuncionario.cargo);
            fd.append('endereco', novoFuncionario.endereco);
            fd.append('imagem', novoFuncionario.imagemFile);
            if (novoFuncionario.senha) fd.append('senha', novoFuncionario.senha);

            const response = await API.post('/usuarios/funcionarios/com-imagem', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const senhaTemp = response?.data?.senha || '';
            setSenhaProvisoria(senhaTemp);
            setMostrarModalSenhaProvisoria(true);
        } else {
            const payload = {
                nome: novoFuncionario.nome,
                email: novoFuncionario.email,
                telefone: novoFuncionario.telefone,
                cargo: novoFuncionario.cargo,
                endereco: novoFuncionario.endereco,
                imagem: null,
                senha: novoFuncionario.senha || null
            };

            const response = await API.post('/usuarios/funcionarios', payload);
            
            const senhaTemp = response?.data?.senha || '';
            setSenhaProvisoria(senhaTemp);
            setMostrarModalSenhaProvisoria(true);
        }

        await carregarFuncionarios();
        setMostrarModalCadastro(false);
        setNovoFuncionario({ nome: '', email: '', telefone: '', endereco: '', cargo: '', senha: '', imagemFile: null });
        setMensagem('Funcionário cadastrado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setCarregando(false);
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
                            style={{ background: 'linear-gradient(135deg, #875C6A, #864176)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700 }}
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
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'nome', label: 'Nome' },
                                { key: 'cargo', label: 'Cargo' },
                                { key: 'email', label: 'Email' },
                                { key: 'telefone', label: 'Telefone' },
                                { key: 'endereco', label: 'Endereço' },
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
                                const funcionario = funcionariosFiltrados.find(f => f.id === item.id);
                                abrirEdicao(funcionario);
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

            {/* Modal de Senha Provisória (aparece se backend retornar a senha) */}
            {mostrarModalSenhaProvisoria && (
                <div className={styles['modal-senha-overlay']}>
                    <div className={styles['modal-senha-content']}>
                        <div className={styles['modal-header']}>
                            <h3>Senha provisória</h3>
                            <button 
                                onClick={() => { setMostrarModalSenhaProvisoria(false); setSenhaProvisoria(''); }}
                                className={styles['btn-fechar']}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles['modal-senha-body']}>
                            {senhaProvisoria ? (
                                <>
                                    <p>Usuário criado com sucesso. A senha provisória é:</p>
                                    <div className={styles['senha-box']}>{senhaProvisoria}</div>
                                </>
                            ) : (
                                <>
                                    <p>Usuário criado com sucesso.</p>
                                    <p style={{ marginTop: 8 }}><em>O backend não retornou a senha provisória no corpo da resposta.</em></p>                                </>
                            )}
                        </div>
                        <div className={styles['modal-senha-footer']}>
                            <button 
                                onClick={() => { navigator.clipboard?.writeText(senhaProvisoria); }}
                                className={styles['btn-copy']}
                                disabled={!senhaProvisoria}
                            >
                                Copiar senha
                            </button>
                            <button 
                                onClick={() => { setMostrarModalSenhaProvisoria(false); setSenhaProvisoria(''); }}
                                className={styles['btn-cancelar']}
                            >
                                Fechar
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
                            </div>
                            <div className={styles['form-group']}>
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