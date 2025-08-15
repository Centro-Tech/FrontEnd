import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function CadastrarFornecedor() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function cadastrar(event) {
        event.preventDefault();
        const fornecedor = { nome, telefone, email };
        console.log(JSON.stringify(fornecedor));
        setMensagem('Fornecedor cadastrado com sucesso!');

        setTimeout(() => {
            setMensagem('');
            setNome('');
            setTelefone('');
            setEmail('');
        }, 2000);
    }

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Cadastrar Novo Fornecedor</h2>
                    <form onSubmit={cadastrar}>
                        <div className={styles['form-group']}>
                            <label>Nome</label>
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Telefone</label>
                            <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit">Cadastrar</button>
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
