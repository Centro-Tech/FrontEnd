import { useState } from 'react';
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
    const [mostrarModalItens, setMostrarModalItens] = useState(false);
    const [todosItens, setTodosItens] = useState([]);
    const [carregandoItens, setCarregandoItens] = useState(false);
    const [mostrarCardQuantidade, setMostrarCardQuantidade] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState(null);
    const [quantidadeModal, setQuantidadeModal] = useState(1);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Função para buscar todos os itens
    const buscarTodosItens = async () => {
        setCarregandoItens(true);
        try {
            const response = await API.get('/itens');
            // Se retornar Page do Spring Boot
            if (response.data.content && Array.isArray(response.data.content)) {
                setTodosItens(response.data.content);
            } else if (Array.isArray(response.data)) {
                setTodosItens(response.data);
            } else {
                setTodosItens([]);
            }
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            alert('Erro ao carregar lista de itens.');
            setTodosItens([]);
        } finally {
            setCarregandoItens(false);
        }
    };

    // Função para abrir modal
    const abrirModalItens = () => {
        setMostrarModalItens(true);
        buscarTodosItens();
    };

    // Função para abrir o card de quantidade
    const abrirCardQuantidade = (item) => {
        setItemSelecionado(item);
        setQuantidadeModal(1);
        setMostrarCardQuantidade(true);
    };

    // Função para fechar o card de quantidade
    const fecharCardQuantidade = () => {
        setMostrarCardQuantidade(false);
        setItemSelecionado(null);
        setQuantidadeModal(1);
    };

    // Função para adicionar item do modal ao carrinho
    // Agora: resolve itemId no front-end (usando cache `todosItens` quando necessário)
    // e chama o endpoint POST /carrinho com o formato esperado pelo backend.
    const adicionarItemDoModal = async (item, quantidade) => {
        try {
            // Tentar pegar id direto do objeto
            let itemId = item.id;

            // Se não tiver id, tentar resolver pelo cache (ou carregá-lo)
            if (!itemId && item.codigo) {
                if (!todosItens || todosItens.length === 0) {
                    await buscarTodosItens();
                }

                const encontrado = (todosItens || []).find(it => String(it.codigo) === String(item.codigo));
                if (encontrado) itemId = encontrado.id;
            }

            if (!itemId) {
                alert('Não foi possível resolver o ID do item.');
                return;
            }

            const payload = {
                itemId: itemId,
                clienteId: null,
                funcionarioId: null,
                qtdParaVender: quantidade || 1
            };

            await API.post('/carrinho', payload);

            // Atualizar carrinho local para refletir na UI
            const produto = {
                codigo: item.codigo,
                nome: item.nome,
                tamanho: item.tamanho?.nome || item.tamanho || '-',
                disponivel: item.qtdEstoque,
                valor: item.preco,
                quantidade: quantidade || 1,
                valorTotal: (item.preco || 0) * (quantidade || 1)
            };

            const produtoExistente = carrinho.find(i => i.codigo === produto.codigo);
            if (produtoExistente) {
                setCarrinho(carrinho.map(i => 
                    i.codigo === produto.codigo 
                        ? { ...i, quantidade: i.quantidade + produto.quantidade, valorTotal: (i.quantidade + produto.quantidade) * i.valor }
                        : i
                ));
            } else {
                setCarrinho([...carrinho, produto]);
            }

            setValorTotal(prev => prev + produto.valorTotal);
            setMostrarModalItens(false);
        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error);
            alert('Erro ao adicionar item ao carrinho.');
        }
    };

    // Função para pesquisar produto por código
   const pesquisarProduto = async () => {
  if (!codigoPeca.trim()) return;

  try {
    const response = await API.get(`/itens/${codigoPeca}`);
    const produtoEncontrado = response.data;

    setProdutosPesquisa([produtoEncontrado]);
  } catch (error) {
    console.error('Erro ao pesquisar produto:', error);
    setProdutosPesquisa([]);
    alert('Produto não encontrado ou erro na pesquisa.');
  }
};


    // Função para adicionar produto ao carrinho
    const adicionarAoCarrinho = (produto) => {
        if (quantidadeProduto <= 0 || quantidadeProduto > produto.disponivel) {
            alert('Quantidade inválida');
            return;
        }

        const itemCarrinho = {
            ...produto,
            quantidade: quantidadeProduto,
            valorTotal: produto.valor * quantidadeProduto
        };

        // Verifica se o produto já existe no carrinho
        const produtoExistente = carrinho.find(item => item.codigo === produto.codigo);
        
        if (produtoExistente) {
            // Atualiza a quantidade se o produto já existe
            setCarrinho(carrinho.map(item => 
                item.codigo === produto.codigo 
                    ? { ...item, quantidade: item.quantidade + quantidadeProduto, valorTotal: (item.quantidade + quantidadeProduto) * item.valor }
                    : item
            ));
        } else {
            // Adiciona novo produto ao carrinho
            setCarrinho([...carrinho, itemCarrinho]);
        }

        // Atualiza valor total
        setValorTotal(valorTotal + itemCarrinho.valorTotal);
        
        // Limpa a pesquisa
        setCodigoPeca('');
        setProdutosPesquisa([]);
        setQuantidadeProduto(1);
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
   const finalizarVenda = async () => {
  if (carrinho.length === 0) {
    alert('Carrinho vazio');
    return;
  }

  try {
    const vendaPayload = {
      itens: carrinho.map(item => ({
        codigoProduto: item.codigo,
        quantidade: item.quantidade,
        valorUnitario: item.valor,
        valorTotal: item.valorTotal
      })),
      valorTotal
    };

    await API.post('/vendas/vender', vendaPayload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });

    alert(`Venda finalizada com sucesso! Total: R$ ${valorTotal.toFixed(2)}`);
    setCarrinho([]);
    setValorTotal(0);
  } catch (error) {
    console.error('Erro ao finalizar venda:', error);
    alert('Erro ao finalizar venda. Verifique os dados ou tente novamente.');
  }
};


    return (
        <div className={styles.container}>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            
            <div className={styles.conteudo}>
                <h1 className={styles.titulo}>Realizar Venda</h1>
                
                <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                    <button 
                        className={styles.botaoListarItens}
                        onClick={abrirModalItens}
                    >
                        📋 Ver Todos os Itens
                    </button>
                </div>

                <div className={styles.paineis}>
                    {/* Painel de Pesquisa */}
                    <div className={styles.painelEsquerdo}>
                        <div className={styles.campoPesquisa}>
                            <label className={styles.label}>Código da peça :</label>
                            <input
                                type="text"
                                value={codigoPeca}
                                onChange={(e) => setCodigoPeca(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && pesquisarProduto()}
                                placeholder="Digite o código da peça"
                                className={styles.inputPesquisa}
                            />
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
                                            <td>R$ {produto.valor.toFixed(2)}</td>
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
                                >
                                    Adicionar no carrinho
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Painel do Carrinho */}
                    <div className={styles.painelDireito}>
                        <h2 className={styles.tituloCarrinho}>Carrinho</h2>
                        
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
                                            <td>R$ {item.valorTotal.toFixed(2)}</td>
                                            <td>
                                                <button 
                                                    className={styles.botaoRemover}
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
                                <h2>R$ {valorTotal.toFixed(2)}</h2>
                            </div>
                            <button 
                                className={styles.botaoFinalizar}
                                onClick={finalizarVenda}
                                disabled={carrinho.length === 0}
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Todos os Itens */}
            {mostrarModalItens && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Todos os Itens Cadastrados</h2>
                            <button 
                                className={styles.btnFechar}
                                onClick={() => setMostrarModalItens(false)}
                            >
                                ✖
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            {carregandoItens ? (
                                <p>Carregando itens...</p>
                            ) : todosItens.length === 0 ? (
                                <p>Nenhum item cadastrado.</p>
                            ) : (
                                <table className={styles.tabelaModal}>
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nome</th>
                                            <th>Tamanho</th>
                                            <th>Estoque</th>
                                            <th>Preço</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todosItens.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.codigo}</td>
                                                <td>{item.nome}</td>
                                                <td>{item.tamanho?.nome || item.tamanho || '-'}</td>
                                                <td>{item.qtdEstoque}</td>
                                                <td>R$ {Number(item.preco).toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className={styles.btnAdicionarModal}
                                                        onClick={() => adicionarItemDoModal(item)}
                                                        disabled={item.qtdEstoque <= 0}
                                                    >
                                                        Adicionar
                                                    </button>
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
        </div>
    );
}
