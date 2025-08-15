import styles from '../Componentes/Componentes - CSS/CadastroVestiario.module.css';
import React, { useState } from 'react';

import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';

export function CadastroNovoVestuario() {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [fornecedor, setFornecedor] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cor, setCor] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [material, setMaterial] = useState('');
    const [mensagem, setMensagem] = useState('');

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    function cadastrar(event) {
        event.preventDefault();
        const vestuario = { nome, fornecedor, preco, quantidade, categoria, cor, tamanho, material };
        console.log(JSON.stringify(vestuario));
        setMensagem('Vestuário cadastrado com sucesso!');

        setTimeout(() => {
            setMensagem('');
            setNome('');
            setFornecedor('');
            setPreco('');
            setQuantidade('');
            setCategoria('');
            setCor('');
            setTamanho('');
            setMaterial('');
        }, 2000);
    }

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['cadastro-vestuario-container']}>
                <div className={styles['box-cadastro']}>
                    <h2 className={styles['box-container-titulo']}>Cadastrar Item no Estoque</h2>
                    
                    <form onSubmit={cadastrar} className={styles['form-grid']}>
                        
                        {/* Nome */}
                        <div className={styles['form-group']}>
                            <label>Nome</label>
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                        </div>

                        {/* Categoria */}
                        <div className={styles['form-group']}>
                            <label>Categoria</label>
                            <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
                                <option value="">Selecione uma opção</option>
                                <option value="camiseta">Camiseta</option>
                                <option value="calça">Calça</option>
                            </select>
                            <small>Não encontrou a opção que queria? <a href="/cadastrar-categoria">Cadastre-a aqui!</a></small>
                        </div>

                        {/* Fornecedor */}
                        <div className={styles['form-group']}>
                            <label>Fornecedor</label>
                            <select value={fornecedor} onChange={e => setFornecedor(e.target.value)} required>
                                <option value="">Selecione uma opção</option>
                                <option value="fornecedor1">Fornecedor 1</option>
                                <option value="fornecedor2">Fornecedor 2</option>
                            </select>
                            <small>Não encontrou a opção que queria? <a href="/cadastrar-fornecedor">Cadastre-a aqui!</a></small>
                        </div>

                        {/* Cor */}
                        <div className={styles['form-group']}>
                            <label>Cor</label>
                            <select value={cor} onChange={e => setCor(e.target.value)} required>
                                <option value="">Selecione uma opção</option>
                                <option value="vermelho">Vermelho</option>
                                <option value="azul">Azul</option>
                            </select>
                            <small>Não encontrou a opção que queria? <a href="/cadastrar-cor">Cadastre-a aqui!</a></small>
                        </div>

                        {/* Preço Unitário */}
                        <div className={styles['form-group']}>
                            <label>Preço unitário</label>
                            <input type="number" value={preco} onChange={e => setPreco(e.target.value)} required />
                        </div>

                        {/* Tamanho */}
                        <div className={styles['form-group']}>
                            <label>Tamanho</label>
                            <select value={tamanho} onChange={e => setTamanho(e.target.value)} required>
                                <option value="">Selecione uma opção</option>
                                <option value="P">P</option>
                                <option value="M">M</option>
                                <option value="G">G</option>
                            </select>
                            <small>Não encontrou a opção que queria? <a href="/cadastrar-tamanho">Cadastre-a aqui!</a></small>
                        </div>

                        {/* Quantidade adquirida */}
                        <div className={styles['form-group']}>
                            <label>Quantidade adquirida</label>
                            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
                        </div>

                        {/* Material */}
                        <div className={styles['form-group']}>
                            <label>Material</label>
                            <select value={material} onChange={e => setMaterial(e.target.value)} required>
                                <option value="">Selecione uma opção</option>
                                <option value="algodão">Algodão</option>
                                <option value="poliéster">Poliéster</option>
                            </select>
                            <small>Não encontrou a opção que queria? <a href="/cadastrar-material">Cadastre-a aqui!</a></small>
                        </div>

                        {/* Botão ocupando 2 colunas */}
                        <div className={styles['form-button']}>
                            <button type="submit">Cadastrar</button>
                        </div>
                    </form>

                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
