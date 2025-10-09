import React, { useState } from 'react';
import axios from 'axios'; // Adicione este import
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

    const atributo = { tipoAtributo, nome };

   try {
    let endpoint = '';
    if (tipoAtributo === 'cor') endpoint = '/cores';
    else if (tipoAtributo === 'tamanho') endpoint = '/tamanhos';
    else if (tipoAtributo === 'material') endpoint = '/materiais';

    await API.post(endpoint, atributo);
    setMensagem('Atributo cadastrado com sucesso!');
    setTipoAtributo('');
    setNome('');
    setTimeout(() => setMensagem(''), 2000);
} catch (error) {
    setErro('Erro ao cadastrar atributo.');
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
                                <option value="cor">Cor</option>
                                <option value="tamanho">Tamanho</option>
                                <option value="material">Material</option>
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
                        <MensagemErro mensagem={erro} className={styles.erro} />
                        <button type="submit">Cadastrar</button>
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}