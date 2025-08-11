import styles from './Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';

import { Navbar } from './Navbar';
import { FaixaVoltar } from './FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function CadastroNovoVestuario() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [material, setMaterial] = useState('');
    const [fornecedor, setFornecedor] = useState('');
    const [preco, setPreco] = useState('');
    const [cor, setCor] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function cadastrar(event) {
        event.preventDefault();
        const vestuario = { nome, material, fornecedor, preco, cor, quantidade, tamanho };
        console.log(JSON.stringify(vestuario));
        setMensagem('Vestuário cadastrado com sucesso!');

        setTimeout(() => {
            setMensagem('');
            setNome('');
            setMaterial('');
            setFornecedor('');
            setPreco('');
            setCor('');
            setQuantidade('');
            setTamanho('');
        }, 2000);
    }

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['container-cadastro']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Cadastrar Novo Vestuário</h2>
                    <form onSubmit={cadastrar}>
                        <div className={styles['form-group']}>
                            <label>Nome</label>
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Material</label>
                            <input type="text" value={material} onChange={e => setMaterial(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Fornecedor</label>
                            <input type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Preço</label>
                            <input type="number" value={preco} onChange={e => setPreco(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Cor</label>
                            <input type="text" value={cor} onChange={e => setCor(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Quantidade</label>
                            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Tamanho</label>
                            <input type="text" value={tamanho} onChange={e => setTamanho(e.target.value)} required />
                        </div>
                        <button type="submit">Cadastrar</button>
                    </form>
                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
