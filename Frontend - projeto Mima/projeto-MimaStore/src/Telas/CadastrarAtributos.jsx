import React, { useState } from 'react';
import styles from '../Componentes/Componentes - CSS/Cadastro.module.css';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function CadastrarAtributo() {
    const navigate = useNavigate();
    const [tipoAtributo, setTipoAtributo] = useState('');
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function cadastrar(event) {
        event.preventDefault();

        const atributo = { tipoAtributo, nome };
        console.log(JSON.stringify(atributo));
        setMensagem('Atributo cadastrado com sucesso!');

        setTimeout(() => {
            setMensagem('');
            setTipoAtributo('');
            setNome('');
        }, 2000);
    }

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
                                required
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
                                required 
                            />
                        </div>

                        <button type="submit">Cadastrar</button>
                    </form>

                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
