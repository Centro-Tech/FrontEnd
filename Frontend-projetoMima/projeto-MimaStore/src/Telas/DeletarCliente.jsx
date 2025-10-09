import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';

export function DeletarCliente() {
    const navigate = useNavigate();
    const [buscarPor, setBuscarPor] = useState('nome');
    const [valorBusca, setValorBusca] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    const buscarCliente = async (event) => {
        event.preventDefault();
        setErro('');
        setMensagem('');
        setClientes([]);
        setClienteEncontrado(null);

        if (!valorBusca) {
            setErro('Digite um valor para buscar.');
            return;
        }

        setCarregando(true);
        try {
            const response = await API.get('/clientes');
            const todosClientes = response.data;
            
            const clientesFiltrados = todosClientes.filter(cliente => {
                if (buscarPor === 'nome') {
                    return cliente.nome.toLowerCase().includes(valorBusca.toLowerCase());
                } else if (buscarPor === 'email') {
                    return cliente.email.toLowerCase().includes(valorBusca.toLowerCase());
                } else if (buscarPor === 'telefone') {
                    return cliente.telefone.includes(valorBusca);
                } else if (buscarPor === 'cpf') {
                    return cliente.cpf.includes(valorBusca);
                }
                return false;
            });

            if (clientesFiltrados.length === 0) {
                setErro('Nenhum cliente encontrado com este critério.');
            } else if (clientesFiltrados.length === 1) {
                setClienteEncontrado(clientesFiltrados[0]);
            } else {
                setClientes(clientesFiltrados);
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setErro('Erro ao buscar clientes.');
        } finally {
            setCarregando(false);
        }
    };

    const selecionarCliente = (cliente) => {
        setClienteEncontrado(cliente);
        setClientes([]);
    };

    const deletarCliente = async () => {
        if (!clienteEncontrado) return;

        if (!window.confirm(`Tem certeza que deseja deletar o cliente ${clienteEncontrado.nome}?`)) {
            return;
        }

        setCarregando(true);
        try {
            await API.delete(`/clientes/${clienteEncontrado.id}`);
            setMensagem('Cliente deletado com sucesso!');
            setClienteEncontrado(null);
            setValorBusca('');
            
            setTimeout(() => {
                setMensagem('');
            }, 3000);
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            setErro('Erro ao deletar cliente.');
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
                    <h2 className={styles['box-container-titulo']}>Deletar Cliente</h2>
                    
                    <form onSubmit={buscarCliente}>
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
                                <option value="cpf">CPF</option>
                            </select>
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="valorBusca">Valor:</label>
                            <input 
                                type="text" 
                                id="valorBusca"
                                value={valorBusca} 
                                onChange={e => setValorBusca(e.target.value)}
                                placeholder={`Digite o ${buscarPor} do cliente`}
                            />
                        </div>
                        
                        <button type="submit" disabled={carregando}>
                            {carregando ? 'Buscando...' : 'Buscar Cliente'}
                        </button>
                    </form>

                    {clientes.length > 0 && (
                        <div className={styles['resultados-busca']}>
                            <h3>Clientes encontrados:</h3>
                            {clientes.map(cliente => (
                                <div key={cliente.id} className={styles['item-resultado']}>
                                    <p><strong>Nome:</strong> {cliente.nome}</p>
                                    <p><strong>Email:</strong> {cliente.email}</p>
                                    <p><strong>Telefone:</strong> {cliente.telefone}</p>
                                    <p><strong>CPF:</strong> {cliente.cpf}</p>
                                    <button onClick={() => selecionarCliente(cliente)}>Selecionar</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {clienteEncontrado && (
                        <div className={styles['cliente-selecionado']}>
                            <h3>Cliente selecionado:</h3>
                            <p><strong>Nome:</strong> {clienteEncontrado.nome}</p>
                            <p><strong>Email:</strong> {clienteEncontrado.email}</p>
                            <p><strong>Telefone:</strong> {clienteEncontrado.telefone}</p>
                            <p><strong>CPF:</strong> {clienteEncontrado.cpf}</p>
                            {clienteEncontrado.endereco && <p><strong>Endereço:</strong> {clienteEncontrado.endereco}</p>}
                            <button 
                                onClick={deletarCliente} 
                                disabled={carregando}
                                className={styles['botao-deletar']}
                            >
                                {carregando ? 'Deletando...' : 'Deletar Cliente'}
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
