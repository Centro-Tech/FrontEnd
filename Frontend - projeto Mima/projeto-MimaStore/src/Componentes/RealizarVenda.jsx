import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Componentes - CSS/RealizarVenda.module.css';
import { Navbar } from './Navbar.jsx';
import { FaixaVoltar } from './FaixaVoltar.jsx';

export function RealizarVenda() {
    const navigate = useNavigate();
    const [codigoPeca, setCodigoPeca] = useState('');
    const [quantidadeProduto, setQuantidadeProduto] = useState(1);
    const [produtosPesquisa, setProdutosPesquisa] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [valorTotal, setValorTotal] = useState(0);

    const voltarAoMenu = () => {
        navigate('/menu-inicial');
    };

    // Função para pesquisar produto por código
    const pesquisarProduto = async () => {
        if (!codigoPeca.trim()) return;
        
        try {
            // Aqui será integrado com o backend
            // Por enquanto, simulo um produto
            const produtoEncontrado = {
                codigo: codigoPeca,
                nome: 'Produto Exemplo',
                tamanho: 'M',
                disponivel: 10,
                valor: 50.00
            };
            
            setProdutosPesquisa([produtoEncontrado]);
        } catch (error) {
            console.error('Erro ao pesquisar produto:', error);
            setProdutosPesquisa([]);
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
            // Aqui será integrado com o backend para processar a venda
            console.log('Finalizando venda:', { carrinho, valorTotal });
            alert(`Venda finalizada! Total: R$ ${valorTotal.toFixed(2)}`);
            
            // Limpa o carrinho após finalizar
            setCarrinho([]);
            setValorTotal(0);
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            alert('Erro ao finalizar venda');
        }
    };

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
                                    ADICIONAR NO CARRINHO
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
                                                    REMOVER
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
                                FINALIZAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
