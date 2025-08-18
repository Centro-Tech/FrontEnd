import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';

export function CadastroFuncionario() {
    const navigate = useNavigate();
    const [nomeInserido, setNomeInserido] = useState('');
    const [emailInserido, setEmailInserido] = useState(''); 
    const [senhaInserida, setSenhaInserida] = useState('');
    const [cargoInserido, setCargoInserido] = useState('');
    const [enderecoInserido, setEnderecoInserido] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    const cadastrarFuncionario = async (event) => {
        event.preventDefault();
        setErro('');
        setMensagem('');

        if (!nomeInserido || !emailInserido || !senhaInserida || !cargoInserido || !enderecoInserido) {
            setErro('Preencha todos os campos.');
            return;
        }

        const novoUsuario = {
            nome: nomeInserido,
            email: emailInserido,
            senha: senhaInserida,
            cargo: cargoInserido,
            endereco: enderecoInserido
        };

        try {
            const response = await API.post('/usuarios', novoUsuario);
            setMensagem('Cadastro concluído com sucesso!');
            
            setTimeout(() => {
                setMensagem('');
                setNomeInserido('');
                setEmailInserido('');
                setSenhaInserida('');
                setCargoInserido('');
                setEnderecoInserido('');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            if (error.response) {
                setErro(error.response.data?.message || 'Erro ao cadastrar funcionário.');
            } else {
                setErro('Erro de conexão com o servidor.');
            }
        }
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Cadastrar Funcionário</h2>
                    <form onSubmit={cadastrarFuncionario}>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="nome">Nome</label>
                            <input type="text" id="nome" value={nomeInserido} onChange={e => setNomeInserido(e.target.value)} required />
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={emailInserido} onChange={e => setEmailInserido(e.target.value)} required />
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="senha">Senha</label>
                            <input type="password" id="senha" value={senhaInserida} onChange={e => setSenhaInserida(e.target.value)} required />
                        </div>
                        
                        <div className={styles['form-group']}>
                            <label htmlFor="cargo">Cargo</label>
                            <select id="cargo" required value={cargoInserido} onChange={e => setCargoInserido(e.target.value)}>
                                <option value="" disabled>Selecione uma opção</option>
                                <option value="Gerente">Gerente</option>
                                <option value="Funcionario">Funcionário</option>
                            </select>
                        </div>

                        <div className={styles['form-group']}>
                            <label htmlFor="endereco">Endereço</label>
                            <input type="text" id="endereco" value={enderecoInserido} onChange={e => setEnderecoInserido(e.target.value)} required />
                        </div>
                        
                        <button type='submit'>Cadastrar</button>
                    </form>
                    {mensagem && <h2 style={{ color: 'green' }}>{mensagem}</h2>}
                    {erro && <h2 style={{ color: 'red' }}>{erro}</h2>}
                </div>
            </div>
        </div>
    );
}
