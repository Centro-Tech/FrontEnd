import styles from './Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';

import { Navbar } from './Navbar';
import { FaixaVoltar } from './FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function ReporVestuario() {
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function repor(event) {
        event.preventDefault();
        const reposicao = { codigo, quantidade };
        console.log(JSON.stringify(reposicao));
        setMensagem('Reposto com sucesso!');

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
                            <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Quantidade para repor</label>
                            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
                        </div>
                        <button type="submit">Repor</button>
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
