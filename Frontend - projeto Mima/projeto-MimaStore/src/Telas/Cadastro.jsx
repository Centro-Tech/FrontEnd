import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function CadastroFuncionario() {
    const navigate = useNavigate()
    const [nomeInserido, setNomeInserido] = useState('');
    const [emailInserido, setEmailInserido] = useState(''); 
    const [senhaInserida, setSenhaInserida] = useState('');
    const [cargoInserido, setCargoInserido] = useState('');
    const [Usuarios, setUsuarios] = useState([]);
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function cadastrarFuncionario(event) {
        event.preventDefault();
        const Usuario = {
            nome: nomeInserido,
            email: emailInserido,
            senha: senhaInserida,
            cargo: cargoInserido
        };

        setUsuarios([...Usuarios, Usuario]);
        console.log(JSON.stringify(Usuario));
        setMensagem('Cadastro concluído!');

        setTimeout(() => {
            setMensagem('');
            setNomeInserido('');
            setEmailInserido('');
            setSenhaInserida('');
            setCargoInserido('');
        }, 2000);
    }

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
                                <option value="" disabled>Seleciona uma opção</option>
                                <option value="Gerente">Gerente</option>
                                <option value="Funcionario">Funcionário</option>
                            </select>
                        </div>
                        
                        <button type='submit'>Cadastrar</button>
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
