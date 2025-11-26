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

    const normalizeCliente = (c) => {
        const id = c.idCliente ?? c.id ?? c.id_cliente ?? c.codigo ?? c.uuid ?? null;
        const nome = c.nome ?? c.nomeCompleto ?? c.nomeCliente ?? c.nome_cliente ?? '';
        const email = c.emailCliente ?? c.email ?? c.email_cliente ?? '';
        const cpf = c.cpf ?? c.cpfCliente ?? c.cpf_cliente ?? '';
        return { ...c, id, nome, email, cpf };
    };

    const normalizeProduto = (data, fallbackCodigo = '') => {
        const id = data.id ?? data.itemId ?? data.produtoId ?? null;
        const codigo = data.codigo ?? data.cod ?? fallbackCodigo ?? '';
        const nome = data.nome ?? data.descricao ?? '';
        const tamanho = data.tamanho?.nome || data.tamanho || '-';
        // tentar extrair quantidade/estoque
        const disponivel = Number(data.qtdEstoque ?? data.disponivel ?? data.estoque ?? 0) || 0;
        // garantir que valor seja numérico
        let valor = data.preco ?? data.valor ?? data.price ?? 0;
        // algumas APIs retornam valor como string com vírgula
        if (typeof valor === 'string') {
            valor = Number(String(valor).replace(',', '.')) || 0;
        } else {
            valor = Number(valor) || 0;
        }

        // nunca retornar valor negativo — clamp para 0
        valor = Math.max(0, valor);

        return { ...data, id, codigo, nome, tamanho, disponivel, valor };
    };

    const carregarClientes = async () => {
        setCarregandoClientes(true);
        try {
            const res = await API.get('/clientes');
            const body = res.data;
            let todos = [];
            if (body && body.content && Array.isArray(body.content)) {
                todos = body.content;
            } else if (Array.isArray(body)) {
                todos = body;
            }
            const normalizados = (todos || []).map(normalizeCliente);
            setClientes(normalizados);
            setClientesFiltrados(normalizados);
        } catch (err) {
            console.error('Erro ao carregar clientes:', err);
            setClientes([]);
            setClientesFiltrados([]);
        } finally {
            setCarregandoClientes(false);
        }
    };

    const pesquisarClientes = () => {
        if (!buscaCliente.trim()) {
            setClientesFiltrados(clientes);
            return;
        }
        const q = buscaCliente.toLowerCase();
        const filtrados = clientes.filter(c => 
            (c.nome || '').toLowerCase().includes(q) || 
            (c.email || '').toLowerCase().includes(q) || 
            (c.cpf || '').includes(q)
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

    

    // Função para pesquisar produto por código (usa endpoint: /itens/codigo/{codigo})
    const pesquisarProduto = async () => {
        if (!codigoPeca.trim()) return;

        try {
            const response = await API.get(`/itens/codigo/${codigoPeca}`);
            const data = response.data;

            if (!data) {
                setProdutosPesquisa([]);
                alert('Produto não encontrado.');
                return;
            }

            // Caso o backend retorne uma lista
            if (Array.isArray(data)) {
                setProdutosPesquisa(data.map(d => normalizeProduto(d, codigoPeca)));
                return;
            }

            // Caso venha paginado (content)
            if (data.content && Array.isArray(data.content)) {
                setProdutosPesquisa(data.content.map(d => normalizeProduto(d, codigoPeca)));
                return;
            }

            // Caso venha um único objeto, normalizar campos esperados pela UI
            const produtoEncontrado = normalizeProduto(data, codigoPeca);
            setProdutosPesquisa([produtoEncontrado]);
        } catch (error) {
            console.error('Erro ao pesquisar produto:', error);
            setProdutosPesquisa([]);
            if (error.response?.status === 404) {
                alert('Produto não encontrado.');
            } else {
                alert('Erro na pesquisa. Tente novamente.');
            }
        }
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
            valorTotal: (produto.valor || 0) * quantidadeProduto
        };

        // Preparar payload para o backend - preferir itemId quando disponível
        const payload = {
            codigoProduto: produto.codigo ?? null,
            qtdParaVender: quantidadeProduto,
            funcionarioId: null,
            clienteId: null
        };

        // só anexar itemId se existir
        if (produto.id) {
            payload.itemId = produto.id;
        }

        // buscar ids de cliente/funcionário do sessionStorage (se foram armazenados em alguma tela)
        try {
            const funcId = sessionStorage.getItem('funcionarioId');
            const cliId = sessionStorage.getItem('clienteId');
            if (funcId) payload.funcionarioId = Number(funcId);
            if (cliId) payload.clienteId = Number(cliId);
            // se não existir, mantemos explicitamente null para o backend saber que o campo existe
        } catch (e) {
            // se sessionStorage não estiver disponível, ignorar silenciosamente
        }

        try {
            setAdicionando(true);
            await API.post('/item-venda/carrinho', payload);

            // Atualizar carrinho local para refletir na UI
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

            // Atualiza valor total de forma segura
            setValorTotal(prev => prev + itemCarrinho.valorTotal);

            // Limpa a pesquisa
            setCodigoPeca('');
            setProdutosPesquisa([]);
            setQuantidadeProduto(1);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            alert('Erro ao adicionar item ao carrinho. Tente novamente.');
        } finally {
            setAdicionando(false);
        }
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

        try {
            setFinalizando(true);
            const vendaPayload = {
                itens: carrinho.map(item => ({
                    codigoProduto: item.codigo,
                    quantidade: item.quantidade,
                    valorUnitario: item.valor,
                    valorTotal: item.valorTotal
                })),
                valorTotal
            };

                let response;
                // Obter funcionarioId do sessionStorage (armazenado no login)
                let funcionarioId = null;
                try {
                    const funcId = sessionStorage.getItem('funcionarioId');
                    if (funcId) funcionarioId = Number(funcId);
                } catch (e) {}

                // Chamar endpoint de finalizar carrinho — inclui clienteId e funcionarioId no path
                if (clienteSelecionado && funcionarioId) {
                    response = await API.post(`/item-venda/carrinho/finalizar/${clienteSelecionado}/${funcionarioId}`, vendaPayload);
                } else if (clienteSelecionado) {
                    response = await API.post(`/item-venda/carrinho/finalizar/${clienteSelecionado}`, vendaPayload);
                } else if (funcionarioId) {
                    response = await API.post(`/item-venda/carrinho/finalizar/null/${funcionarioId}`, vendaPayload);
                } else {
                    // tentar endpoint sem cliente nem funcionário
                    response = await API.post('/item-venda/carrinho/finalizar', vendaPayload);
                }

                    // armazenar a resposta (espera-se que retorne dados da venda com algum id)
                    // log para debug: mostrar body e headers retornados pelo backend
                    try {
                        console.log('finalizarCarrinho response.data:', response?.data);
                        console.log('finalizarCarrinho response.headers:', response?.headers);
                    } catch (e) {
                        // ignorar se console não estiver disponível
                    }
                    setVendaFinalizada(response?.data ?? null);
                // tentar extrair id da venda de várias fontes: body ou header Location
                const body = response?.data ?? {};
                let id = body.id ?? body.vendaId ?? body.idVenda ?? body.codigoVenda ?? null;
                // se ainda não encontrou, tentar extrair do header Location (ex: Location: /vendas/123)
                const locationHeader = response?.headers?.location || response?.headers?.Location || null;
                if (!id && locationHeader) {
                    try {
                        const parts = String(locationHeader).split('/').filter(Boolean);
                        id = parts[parts.length - 1] || null;
                    } catch (e) {
                        console.warn('Não foi possível extrair id da Location header:', locationHeader);
                    }
                }
                if (id) setVendaId(id);
                // abrir modal perguntando se deseja enviar comprovante
                setMostrarModalConfirmacao(true);
        } catch (error) {
            console.error('Erro ao finalizar carrinho:', error);
            const msg = error?.response?.data?.message || error?.message || 'Erro ao finalizar venda. Verifique os dados ou tente novamente.';
            alert(msg);
        } finally {
            setFinalizando(false);
        }
    };

        // Step 2: enviar comprovante (assumo endpoint: POST /vendas/enviar-comprovante/{vendaId})
        const enviarComprovante = async () => {
        // preferir vendaId extraído dos headers/body; fallback para vendaFinalizada
        const idToUse = vendaId ?? vendaFinalizada?.id ?? vendaFinalizada?.vendaId ?? vendaFinalizada?.idVenda ?? vendaFinalizada?.codigoVenda ?? null;
        if (!idToUse) {
            alert('ID da venda não retornado pelo servidor. Não é possível enviar comprovante automaticamente.');
            return;
        }

        try {
            setEnviandoComprovante(true);
            await API.post(`/vendas/finalizar/${idToUse}`);
            alert('Comprovante enviado com sucesso.');
            // limpar estado
            limparCarrinho();
        } catch (error) {
            console.error('Erro ao enviar comprovante:', error);
            const msg = error?.response?.data?.message || error?.message || 'Erro ao enviar comprovante. Tente novamente.';
            alert(msg);
        } finally {
            setEnviandoComprovante(false);
        }
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
                                placeholder="Buscar cliente por nome, email ou CPF" 
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
                                            <th style={{ padding: '8px' }}>CPF</th>
                                            <th style={{ padding: '8px' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientesFiltrados.map((c, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: 8 }}>{c.nome}</td>
                                                <td style={{ padding: 8 }}>{c.email}</td>
                                                <td style={{ padding: 8 }}>{c.cpf}</td>
                                                <td style={{ padding: 8 }}>
                                                    <button className={styles.botaoSelecionar} onClick={() => {
                                                        const id = c.id ?? null;
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
