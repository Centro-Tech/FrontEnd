import styles from '../Componentes/Componentes - CSS/CadastroVestiario.module.css';
import React, { useState, useEffect } from 'react';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { useNavigate } from 'react-router-dom';
import API from '../Provider/API';
import {MensagemErro} from "../Componentes/MensagemErro";

export function CadastroNovoVestuario() {
    const navigate = useNavigate();
    
    const [erro, setErro]= useState('');
    const [nome, setNome] = useState('');
    const [fornecedor, setFornecedor] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cor, setCor] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [material, setMaterial] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [cores, setCores] = useState([]);
    const [tamanhos, setTamanhos] = useState([]);
    const [materiais, setMateriais] = useState([]);

    useEffect(() => {
        async function buscarListas() {
            try {
                const endpoints = [
                    { url: '/categorias', setState: setCategorias, keyId: 'id', keyNome: 'nome' },
                    { url: '/fornecedores', setState: setFornecedores, keyId: 'id', keyNome: 'nome' },
                    { url: '/cores', setState: setCores, keyId: 'id', keyNome: 'nome' },
                    { url: '/tamanhos', setState: setTamanhos, keyId: 'id', keyNome: 'nome' },
                    { url: '/materiais', setState: setMateriais, keyId: 'id', keyNome: 'nome' },
                ];

                for (let ep of endpoints) {
                    const res = await API.get(ep.url);
                    // debug rápido para inspecionar a resposta do backend
                    console.log('debug buscarListas', ep.url, res.data);

                    // normaliza vários formatos comuns de retorno do backend
                    let items = [];
                    if (Array.isArray(res.data)) {
                        items = res.data;
                    } else if (Array.isArray(res.data?.data)) {
                        items = res.data.data;
                    } else {
                        // tenta encontrar a primeira propriedade que seja um array (caso o backend use envelope)
                        const values = Object.values(res.data || {});
                        const found = values.find(v => Array.isArray(v));
                        items = found || [];
                    }

                    const listaNormalizada = items.map(item => ({
                        id: item[ep.keyId],
                        nome: item[ep.keyNome]
                    }));
                    listaNormalizada.sort((a, b) => a.nome?.localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));
                    ep.setState(listaNormalizada);
                }
            } catch (error) {
                console.error('Erro ao carregar listas do backend:', error.response || error);
                setMensagem('Erro ao carregar listas do banco. Verifique o console.');
            }
        }
        buscarListas();
    }, []);

    const voltarAoMenu = () => navigate('/menu-inicial');

    async function cadastrar(event) {
        event.preventDefault();
       
       setErro('');
if (
    !nome ||
    !fornecedor ||
    !preco ||
    !quantidade ||
    !categoria ||
    !cor ||
    !tamanho ||
    !material
) {
    setErro('Preencha todos os campos.');
    return;
}

        const vestuario = {
            nome: nome.trim(),
            qtdEstoque: Number(quantidade),
            preco: Number(preco),
            idFornecedor: Number(fornecedor),
            idCor: Number(cor),
            idTamanho: Number(tamanho),
            idMaterial: Number(material),
            idCategoria: Number(categoria)
        };

        // validação rápida
        for (let key in vestuario) {
            if (vestuario[key] === '' || vestuario[key] === null || (typeof vestuario[key] === 'number' && isNaN(vestuario[key]))) {
                setMensagem(`Preencha corretamente o campo ${key}`);
                return;
            }
        }

        try {
            await API.post('/itens', vestuario);
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
        } catch (error) {
            console.error("Erro ao cadastrar vestuário:", error.response || error);
            setMensagem('Erro ao cadastrar vestuário. Verifique os dados e tente novamente.');
        }
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
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)}  />
                        </div>

                        {/* Categoria */}
                        <div className={styles['form-group']}>
                            <label>Categoria</label>
                            <select value={categoria} onChange={e => setCategoria(e.target.value)} >
                                <option value="">Selecione uma opção</option>
                                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                            </select>
                        </div>

                        {/* Fornecedor */}
                        <div className={styles['form-group']}>
                            <label>Fornecedor</label>
                            <select value={fornecedor} onChange={e => setFornecedor(e.target.value)} >
                                <option value="">Selecione uma opção</option>
                                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                            </select>
                        </div>

                        {/* Cor */}
                        <div className={styles['form-group']}>
                            <label>Cor</label>
                            <select value={cor} onChange={e => setCor(e.target.value)} >
                                <option value="">Selecione uma opção</option>
                                {cores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>

                        {/* Preço */}
                        <div className={styles['form-group']}>
                            <label>Preço unitário</label>
                            <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)}  />
                        </div>

                        {/* Tamanho */}
                        <div className={styles['form-group']}>
                            <label>Tamanho</label>
                            <select value={tamanho} onChange={e => setTamanho(e.target.value)} >
                                <option value="">Selecione uma opção</option>
                                {tamanhos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>

                        {/* Quantidade */}
                        <div className={styles['form-group']}>
                            <label>Quantidade adquirida</label>
                            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)}  />
                        </div>

                        {/* Material */}
                        <div className={styles['form-group']}>
                            <label>Material</label>
                            <select value={material} onChange={e => setMaterial(e.target.value)} >
                                <option value="">Selecione uma opção</option>
                                {materiais.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                            </select>
                        </div>

                        <div className={styles['form-button']}>
                            <button type="submit">Cadastrar</button>
                        </div>
                        <MensagemErro mensagem={erro} />
                    </form>

                    {mensagem && <h1>{mensagem}</h1>}
                </div>
            </div>
        </div>
    );
}
