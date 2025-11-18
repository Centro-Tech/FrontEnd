import React, { useState } from 'react';
// import axios from 'axios'; // not used (we use API wrapper)
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import { MensagemErro } from "../Componentes/MensagemErro";
import API from '../Provider/API';

export function CadastrarAtributo() {
    const [erro, setErro] = useState('');
    const navigate = useNavigate();
    const [tipoAtributo, setTipoAtributo] = useState('');
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

 async function cadastrar(event) {
    event.preventDefault();
    setErro('');
    if (tipoAtributo === '' || nome === '') {
        setErro('Preencha todos os campos.');
        return;
    }

    try {
        let endpoint = '';
        let payload = {};

        if (tipoAtributo === 'cor') {
            endpoint = '/cores';
            payload = { tipoAtributo, nome };
        } else if (tipoAtributo === 'tamanho') {
            endpoint = '/tamanhos';
            payload = { tipoAtributo, nome };
        } else if (tipoAtributo === 'material') {
            endpoint = '/materiais';
            payload = { tipoAtributo, nome };
        } else if (tipoAtributo === 'categoria') {
            endpoint = '/categorias';
            // backend expects a Categoria object, send only the nome
            payload = { nome };
        }

        await API.post(endpoint, payload);
        setMensagem('Cadastrado com sucesso!');
        setTipoAtributo('');
        setNome('');
        setTimeout(() => setMensagem(''), 2000);
    } catch (error) {
        // try to show backend message if available
        const backendMsg = error?.response?.data?.message;
        setErro(backendMsg || 'Erro ao cadastrar atributo.');
    }
}

    // try {
    //   // envia email e senha no formato que o backend espera
    //   const response = await API.post(
    //     "/usuarios/login", // endpoint exato
    //     { email: form.email, senha: form.senha }, 
    //     { headers: { "Content-Type": "application/json" } }
    //   );

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Cadastrar Atributo de Item</h2>
                    <form onSubmit={cadastrar}>
                        <div className={styles['form-group']}>
                            <label htmlFor="tipo">O que deseja cadastrar?</label>
                                <select
                                    id="tipo"
                                    value={tipoAtributo}
                                    onChange={e => setTipoAtributo(e.target.value)}
                                >
                                    <option value="">Selecione uma opção</option>
                                    {[
                                        { value: 'categoria', label: 'Categoria' },
                                        { value: 'cor', label: 'Cor' },
                                        { value: 'material', label: 'Material' },
                                        { value: 'tamanho', label: 'Tamanho' }
                                    ]
                                        .slice() // copy to avoid mutating original
                                        .sort((a, b) => a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }))
                                        .map(item => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                </select>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="nome">Nome</label>
                            <input 
                                type="text" 
                                id="nome" 
                                value={nome} 
                                onChange={e => setNome(e.target.value)} 
                            />
                        </div>
                        <MensagemErro mensagem={erro} />
                        <button type="submit" className={styles['btn-salvar']}>Cadastrar</button>
                    </form>
                    {mensagem && (
                        <div className={styles['mensagem-sucesso']}>
                            ✅ {mensagem}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}