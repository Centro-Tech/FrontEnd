import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/RealizarVenda.module.css';
import { Navbar } from '../Componentes/Navbar.jsx';
import { FaixaVoltar } from '../Componentes/FaixaVoltar.jsx';
import API from '../Provider/API';

export function RealizarVenda() {
    const navigate = useNavigate();
    const [codigoPeca, setCodigoPeca] = useState('');
    const [quantidadeProduto, setQuantidadeProduto] = useState(1);
    const [produtosPesquisa, setProdutosPesquisa] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [valorTotal, setValorTotal] = useState(0);
    const [adicionando, setAdicionando] = useState(false);
    const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [carregandoClientes, setCarregandoClientes] = useState(false);
    const [buscaCliente, setBuscaCliente] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [finalizando, setFinalizando] = useState(false);
    const [vendaFinalizada, setVendaFinalizada] = useState(null);
    const [vendaId, setVendaId] = useState(null);
    const [enviandoComprovante, setEnviandoComprovante] = useState(false);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    useEffect(() => {
        // mostrar modal de cliente assim que a tela abrir
        setMostrarModalCliente(true);
        carregarClientes();
        // tentar carregar cliente previamente selecionado
        try {
            const existing = sessionStorage.getItem('clienteId');
            if (existing) setClienteSelecionado(Number(existing));
        } catch (e) {}
    }, []);

    const normalizeProduto = (data) => ({
        id: data.id,
        codigo: data.codigo,
        nome: data.nome,
        tamanho: data.tamanho?.nome || '-',
        disponivel: data.qtdEstoque,
        valor: data.preco
    });

    const carregarClientes = async () => {
        setCarregandoClientes(true);
        
        const res = await API.get('/clientes');
        const clientesData = res.data.content.map(cliente => ({
            id: cliente.idCliente,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone
        }));
        
        setClientes(clientesData);
        setClientesFiltrados(clientesData);
        setCarregandoClientes(false);
    };

    const pesquisarClientes = () => {
        if (!buscaCliente.trim()) {
            setClientesFiltrados(clientes);
            return;
        }
        const q = buscaCliente.toLowerCase();
        const filtrados = clientes.filter(c => 
            c.nome.toLowerCase().includes(q) || 
            c.email.toLowerCase().includes(q)
        );
        setClientesFiltrados(filtrados);
    };

    const limparFiltro = () => {
        setBuscaCliente('');
        setClientesFiltrados(clientes);
    };

    const limparCarrinho = () => {
        setCarrinho([]);
        setValorTotal(0);
        setMostrarModalConfirmacao(false);
        setVendaFinalizada(null);
        setVendaId(null);
    };

    
    const pesquisarProduto = async () => {
        if (!codigoPeca.trim()) return;

        const response = await API.get(`/itens/codigo/${codigoPeca}`);
        const data = response.data;

        if (Array.isArray(data)) {
            setProdutosPesquisa(data.map(normalizeProduto));
            return;
        }

        // Caso venha um único objeto
        const produtoEncontrado = normalizeProduto(data);
        setProdutosPesquisa([produtoEncontrado]);
    };


    // Função para adicionar produto ao carrinho
    const adicionarAoCarrinho = async (produto) => {
        if (quantidadeProduto <= 0 || quantidadeProduto > produto.disponivel) {
            alert('Quantidade inválida');
            return;
        }

        const itemCarrinho = {
            ...produto,
            quantidade: quantidadeProduto,
            valorTotal: produto.valor * quantidadeProduto
        };

        const payload = {
            qtdParaVender: quantidadeProduto,
            funcionarioId: null,
            clienteId: null,
            itemId: produto.id
        };

        // buscar ids de cliente/funcionário do sessionStorage
        try {
            const funcId = sessionStorage.getItem('funcionarioId');
            const cliId = sessionStorage.getItem('clienteId');
            if (funcId) payload.funcionarioId = Number(funcId);
            if (cliId) payload.clienteId = Number(cliId);
        } catch (e) {}

        setAdicionando(true);
        await API.post('/item-venda/carrinho', payload);

        // Atualizar carrinho local
        const produtoExistente = carrinho.find(item => item.codigo === produto.codigo);
        if (produtoExistente) {
            setCarrinho(prev => prev.map(item => 
                item.codigo === produto.codigo 
                    ? { ...item, quantidade: item.quantidade + quantidadeProduto, valorTotal: (item.quantidade + quantidadeProduto) * item.valor }
                    : item
            ));
        } else {
            setCarrinho(prev => [...prev, itemCarrinho]);
        }

        setValorTotal(prev => prev + itemCarrinho.valorTotal);
        setCodigoPeca('');
        setProdutosPesquisa([]);
        setQuantidadeProduto(1);
        setAdicionando(false);
    };

    // Função para remover produto do carrinho
    const removerDoCarrinho = (codigo) => {
        const produto = carrinho.find(item => item.codigo === codigo);
        if (produto) {
            setValorTotal(valorTotal - produto.valorTotal);
            setCarrinho(carrinho.filter(item => item.codigo !== codigo));
        }
    };

    // Função para finalizar venda
         // Step 1: finalizar o carrinho (cria/fecha venda no backend)
         const finalizarCarrinho = async () => {
        if (carrinho.length === 0) {
            alert('Carrinho vazio');
            return;
        }

        setFinalizando(true);
        const vendaPayload = {
            itens: carrinho.map(item => ({
                quantidade: item.quantidade,
                valorUnitario: item.valor,
                valorTotal: item.valorTotal
            })),
            valorTotal
        };

        // Obter funcionarioId do sessionStorage
        let funcionarioId = null;
        try {
            const funcId = sessionStorage.getItem('funcionarioId');
            if (funcId) funcionarioId = Number(funcId);
        } catch (e) {}

        // Chamar endpoint de finalizar carrinho
        let response;
        if (clienteSelecionado && funcionarioId) {
            response = await API.post(`/item-venda/carrinho/finalizar/${clienteSelecionado}/${funcionarioId}`, vendaPayload);
        } else if (clienteSelecionado) {
            response = await API.post(`/item-venda/carrinho/finalizar/${clienteSelecionado}`, vendaPayload);
        } else {
            response = await API.post('/item-venda/carrinho/finalizar', vendaPayload);
        }

        setVendaFinalizada(response.data);
        const vendaId = response.data.id;
        setVendaId(vendaId);
        setMostrarModalConfirmacao(true);
        setFinalizando(false);
    };

        // Step 2: enviar comprovante
        const enviarComprovante = async () => {
        const idToUse = vendaId || vendaFinalizada?.id;
        
        setEnviandoComprovante(true);
        await API.post(`/vendas/finalizar/${idToUse}`);
        alert('Comprovante enviado com sucesso.');
        limparCarrinho();
        setEnviandoComprovante(false);
        };

    // Cliente selecionado (objeto completo) — usado para exibir no UI
    const clienteSelecionadoObj = clientes.find(c => c.id === clienteSelecionado) ?? null;


    return (
        <div className={styles.container}>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles.conteudo}>
                <h1 className={styles.titulo}>Realizar Venda</h1>
                
                

                <div className={styles.paineis}>
                    {/* Painel de Pesquisa */}
                    <div className={styles.painelEsquerdo}>
                        <div className={styles.campoPesquisa}>
                            <label className={styles.label}>Código da peça :</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={codigoPeca}
                                    onChange={(e) => setCodigoPeca(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && pesquisarProduto()}
                                    placeholder="Digite o código da peça"
                                    className={styles.inputPesquisa}
                                />
                                <button
                                    type="button"
                                    className={styles.botaoPesquisar}
                                    onClick={pesquisarProduto}
                                    disabled={!codigoPeca.trim()}
                                    title="Pesquisar código"
                                >
                                    🔍
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Produtos Encontrados */}
                        <div className={styles.tabelaProdutos}>
                            <table className={styles.tabela}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nome</th>
                                        <th>Tamanho</th>
                                        <th>Disponível</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosPesquisa.map((produto, index) => (
                                        <tr key={index}>
                                            <td>{produto.codigo}</td>
                                            <td>{produto.nome}</td>
                                            <td>{produto.tamanho}</td>
                                            <td>{produto.disponivel}</td>
                                            <td>R$ {Number(produto.valor || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Controles de Quantidade */}
                        {produtosPesquisa.length > 0 && (
                            <div className={styles.controlesQuantidade}>
                                <div className={styles.campoQuantidade}>
                                    <label>Quantidade:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantidadeProduto}
                                        onChange={(e) => setQuantidadeProduto(parseInt(e.target.value) || 1)}
                                        className={styles.inputQuantidade}
                                    />
                                </div>
                                <button 
                                    className={styles.botaoAdicionar}
                                    onClick={() => adicionarAoCarrinho(produtosPesquisa[0])}
                                    disabled={adicionando}
                                >
                                    {adicionando ? 'Adicionando...' : 'Adicionar no carrinho'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Painel do Carrinho */}
                    <div className={styles.painelDireito}>
                        <h2 className={styles.tituloCarrinho}>Carrinho</h2>

                        {/* Exibir cliente selecionado */}
                        <div style={{ marginBottom: 12 }}>
                            {clienteSelecionadoObj ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div>Cliente selecionado: <strong>{clienteSelecionadoObj.nome}</strong></div>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalCliente(true)}
                                        className={styles.botaoSelecionar}
                                    >
                                        Alterar
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div>Nenhum cliente selecionado</div>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalCliente(true)}
                                        className={styles.botaoSelecionar}
                                    >
                                        Selecionar cliente
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.tabelaCarrinho}>
                            <table className={styles.tabela}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nome</th>
                                        <th>Tamanho</th>
                                        <th>Quantidade</th>
                                        <th>Valor</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carrinho.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.codigo}</td>
                                            <td>{item.nome}</td>
                                            <td>{item.tamanho}</td>
                                            <td>{item.quantidade}</td>
                                            <td>R$ {Number(item.valorTotal || (item.valor * item.quantidade) || 0).toFixed(2)}</td>
                                            <td>
                                                <button 
                                                    className={styles.botaoCinza}
                                                    onClick={() => removerDoCarrinho(item.codigo)}
                                                >
                                                    Remover
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total e Finalizar */}
                        <div className={styles.resumoVenda}>
                            <div className={styles.valorTotal}>
                                <h3>VALOR A PAGAR</h3>
                                <h2>R$ {Number(valorTotal || 0).toFixed(2)}</h2>
                            </div>
                            <button 
                                className={styles.botaoFinalizar}
                                onClick={finalizarCarrinho}
                                disabled={carrinho.length === 0 || finalizando}
                            >
                                {finalizando ? 'Finalizando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de seleção de cliente (aparece ao abrir a tela) */}
            {mostrarModalCliente && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                    <div style={{ width: '90%', maxWidth: 900, background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h2 style={{ margin: 0 }}>Selecionar Cliente</h2>
                        </div>

                        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input 
                                placeholder="Buscar cliente por nome ou email" 
                                value={buscaCliente} 
                                onChange={(e) => setBuscaCliente(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && pesquisarClientes()}
                                style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} 
                            />
                            <button className={styles.botaoSelecionar} onClick={pesquisarClientes}>
                                Pesquisar
                            </button>
                            <button className={styles.botaoCinza} onClick={limparFiltro}>
                                Limpar
                            </button>
                        </div>

                        <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
                            {carregandoClientes ? (
                                <p>Carregando clientes...</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                            <th style={{ padding: '8px' }}>Nome</th>
                                            <th style={{ padding: '8px' }}>Email</th>
                                            <th style={{ padding: '8px' }}>Telefone</th>
                                            <th style={{ padding: '8px' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientesFiltrados.map((c, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: 8 }}>{c.nome}</td>
                                                <td style={{ padding: 8 }}>{c.email}</td>
                                                <td style={{ padding: 8 }}>{c.telefone}</td>
                                                <td style={{ padding: 8 }}>
                                                    <button className={styles.botaoSelecionar} onClick={() => {
                                                        const id = c.id;
                                                        try { sessionStorage.setItem('clienteId', String(id)); } catch(e){}
                                                        setClienteSelecionado(id);
                                                        setMostrarModalCliente(false);
                                                    }}>Selecionar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de confirmação de finalização de venda */}
            {mostrarModalConfirmacao && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
                    <div style={{ width: '90%', maxWidth: 420, background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                        {vendaFinalizada ? (
                            <>
                                <h3 style={{ marginTop: 0 }}>Venda finalizada</h3>
                                <p>Venda concluída no valor de <strong>R$ {Number(valorTotal || 0).toFixed(2)}</strong>.</p>
                                {vendaId && (
                                    <p>Número da venda: <strong>{vendaId}</strong></p>
                                )}
                                {/* debug details removed */}
                                <p style={{ marginTop: 8 }}>Deseja enviar o comprovante agora?</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                                    <button 
                                        onClick={limparCarrinho} 
                                        disabled={enviandoComprovante} 
                                        className={styles.botaoCinza}
                                    >
                                        Fechar
                                    </button>
                                    <button 
                                        onClick={enviarComprovante} 
                                        disabled={enviandoComprovante} 
                                        className={styles.botaoSelecionar}
                                    >
                                        {enviandoComprovante ? 'Enviando...' : 'Enviar comprovante'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 style={{ marginTop: 0 }}>Processando finalização</h3>
                                <p>Aguarde, estamos finalizando a venda...</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                                    <button 
                                        onClick={() => setMostrarModalConfirmacao(false)} 
                                        disabled={finalizando} 
                                        className={styles.botaoCinza}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
