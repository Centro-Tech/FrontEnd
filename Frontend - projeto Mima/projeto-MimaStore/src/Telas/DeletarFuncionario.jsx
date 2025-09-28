import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';

export function DeletarFuncionario() {
    const navigate = useNavigate();
    const [buscarPor, setBuscarPor] = useState('nome');
    const [valorBusca, setValorBusca] = useState('');
    const [funcionarioEncontrado, setFuncionarioEncontrado] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    const buscarFuncionario = async (event) => {
        event.preventDefault();
        setErro('');
        setMensagem('');
        setFuncionarios([]);
        setFuncionarioEncontrado(null);

        if (!valorBusca) {
            setErro('Digite um valor para buscar.');
            return;
        }

        setCarregando(true);
        try {
            const response = await API.get('/usuarios');
            const todosFuncionarios = response.data;
            
            const funcionariosFiltrados = todosFuncionarios.filter(func => {
                if (buscarPor === 'nome') {
                    return func.nome.toLowerCase().includes(valorBusca.toLowerCase());
                } else if (buscarPor === 'email') {
                    return func.email.toLowerCase().includes(valorBusca.toLowerCase());
                } else if (buscarPor === 'cargo') {
                    return func.cargo.toLowerCase().includes(valorBusca.toLowerCase());
                }
                return false;
            });

            if (funcionariosFiltrados.length === 0) {
                setErro('Nenhum funcionário encontrado com este critério.');
            } else if (funcionariosFiltrados.length === 1) {
                setFuncionarioEncontrado(funcionariosFiltrados[0]);
            } else {
                setFuncionarios(funcionariosFiltrados);
            }
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            setErro('Erro ao buscar funcionários.');
        } finally {
            setCarregando(false);
        }
    };

    const selecionarFuncionario = (funcionario) => {
        setFuncionarioEncontrado(funcionario);
        setFuncionarios([]);
    };

    const deletarFuncionario = async () => {
        if (!funcionarioEncontrado) return;

        if (!window.confirm(`Tem certeza que deseja deletar o funcionário ${funcionarioEncontrado.nome}?`)) {
            return;
        }

        setCarregando(true);
        try {
            await API.delete(`/usuarios/${funcionarioEncontrado.id}`);
            setMensagem('Funcionário deletado com sucesso!');
            setFuncionarioEncontrado(null);
            setValorBusca('');
            
            setTimeout(() => {
                setMensagem('');
            }, 3000);
        } catch (error) {
            console.error('Erro ao deletar funcionário:', error);
            setErro('Erro ao deletar funcionário.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Deletar Funcionário</h2>
                    
                    <form onSubmit={buscarFuncionario}>
                        <div className={styles['form-group']}>
                            <label htmlFor="buscarPor">Buscar por:</label>
                            <select 
                                id="buscarPor" 
                                value={buscarPor} 
                                onChange={e => setBuscarPor(e.target.value)}
                            >
                                <option value="nome">Nome</option>
                                <option value="email">Email</option>
                                <option value="cargo">Cargo</option>
                            </select>
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="valorBusca">Valor:</label>
                            <input 
                                type="text" 
                                id="valorBusca"
                                value={valorBusca} 
                                onChange={e => setValorBusca(e.target.value)}
                                placeholder={`Digite o ${buscarPor} do funcionário`}
                            />
                        </div>
                        
                        <button type="submit" disabled={carregando}>
                            {carregando ? 'Buscando...' : 'Buscar Funcionário'}
                        </button>
                    </form>

                    {funcionarios.length > 0 && (
                        <div className={styles['resultados-busca']}>
                            <h3>Funcionários encontrados:</h3>
                            {funcionarios.map(func => (
                                <div key={func.id} className={styles['item-resultado']}>
                                    <p><strong>Nome:</strong> {func.nome}</p>
                                    <p><strong>Email:</strong> {func.email}</p>
                                    <p><strong>Cargo:</strong> {func.cargo}</p>
                                    <button onClick={() => selecionarFuncionario(func)}>Selecionar</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {funcionarioEncontrado && (
                        <div className={styles['funcionario-selecionado']}>
                            <h3>Funcionário selecionado:</h3>
                            <p><strong>Nome:</strong> {funcionarioEncontrado.nome}</p>
                            <p><strong>Email:</strong> {funcionarioEncontrado.email}</p>
                            <p><strong>Cargo:</strong> {funcionarioEncontrado.cargo}</p>
                            <p><strong>Endereço:</strong> {funcionarioEncontrado.endereco}</p>
                            <button 
                                onClick={deletarFuncionario} 
                                disabled={carregando}
                                className={styles['botao-deletar']}
                            >
                                {carregando ? 'Deletando...' : 'Deletar Funcionário'}
                            </button>
                        </div>
                    )}
                    
                    {mensagem && <h2 style={{ color: 'green' }}>{mensagem}</h2>}
                    <MensagemErro mensagem={erro} />
                </div>
            </div>
        </div>
    );
}
