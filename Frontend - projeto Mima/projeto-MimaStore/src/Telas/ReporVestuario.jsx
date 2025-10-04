import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import {MensagemErro} from "../Componentes/MensagemErro";
import API from '../Provider/API';

export function ReporVestuario() {
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [mensagem, setMensagem] = useState('');
     const [erro, setErro] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function repor(event) {
        event.preventDefault();
         setErro('');
        if (codigo === '' || quantidade === '') {
            setErro('Preencha todos os campos.');
            console.log(erro);
            return;
        }

        const reposicao = { codigo, quantidade };
       async function repor(event) {
    event.preventDefault();
    setErro('');
    if (codigo === '' || quantidade === '') {
        setErro('Preencha todos os campos.');
        return;
    }

    const reposicao = { codigo, quantidade };

    try {
        await API.post('/estoque/repor', reposicao); // ajuste o endpoint conforme seu backend
        setMensagem('Reposto com sucesso!');
        setCodigo('');
        setQuantidade('');
        setTimeout(() => setMensagem(''), 2000);
    } catch (error) {
        setErro('Erro ao repor estoque.');
    }
}
        setTimeout(() => {
            setMensagem('');
            setCodigo('');
            setQuantidade('');
        }, 2000);
    }

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Repor Estoque</h2>
                    <form onSubmit={repor}>
                        <div className={styles['form-group']}>
                            <label>Código</label>
                            <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)}/>
                        </div>
                        <div className={styles['form-group']}>
                            <label>Quantidade para repor</label>
                            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)}/>
                        </div>
                        <button type="submit">Repor</button>
                          <MensagemErro mensagem={erro} />
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}