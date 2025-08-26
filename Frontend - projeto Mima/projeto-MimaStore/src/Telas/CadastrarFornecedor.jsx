import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';// importa axios configurado
import {MensagemErro} from "../Componentes/MensagemErro";

export function CadastrarFornecedor() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    async function cadastrar(event) {
        event.preventDefault();
         setErro('');
        if (nome === '' || telefone === '' || email === '') {
            setErro('Preencha todos os campos.');
            console.log(erro);
            return;
        }

        const fornecedor = { nome, telefone, email };

        try {
            const response = await API.post("/fornecedores", fornecedor);
            console.log(response.data);

            setMensagem("Fornecedor cadastrado com sucesso!");
        } catch (error) {
            console.error("Erro ao cadastrar fornecedor:", error);

            if (error.response?.status === 409) {
                setMensagem("Fornecedor com este CNPJ já existe!");
            } else {
                setMensagem("Erro ao cadastrar fornecedor!");
            }
        }

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
                            <input 
                                type="text" 
                                value={nome} 
                                onChange={e => setNome(e.target.value)} 
                              
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Telefone</label>
                            <input 
                                type="tel" 
                                value={telefone} 
                                onChange={e => setTelefone(e.target.value)} 
                                
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                
                            />
                        </div>
                        <button type="submit">Cadastrar</button>
                          <MensagemErro mensagem={erro} />
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
