import { useNavigate } from 'react-router-dom';
import { BotaoEscuro } from './BotaoEscuro';
import { BotaoClaro } from './BotaoClaro';
import styles from './Componentes - CSS/MenuPrincipal.module.css';

export function MenuPrincipal() {
    const navigate = useNavigate();
    
    const handleRealizarVenda = () => {
        navigate('/realizar-venda');
    };

    const handleVisualizarEstoque = () => {
        navigate('/estoque');
    };

    const handleHistoricoVendas = () => {
        navigate('/historico-vendas');
    };

    return (
        <div className={styles.menuPrincipal}>
            <div className={styles.container}>
                <h1 className={styles.titulo}>Menu Principal</h1>
                
                <div className={styles.secoes}>
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Estoque" />
                        <BotaoClaro texto="Visualizar Estoque" onClick={handleVisualizarEstoque} />
                        <BotaoClaro texto="Repor Estoque" />
                        <BotaoClaro texto="Cadastrar Novas Peças" />
                        <BotaoClaro texto="Cadastrar Atributos" />
                    </div>
                    
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Vendas" />
                        <BotaoClaro texto="Realizar Venda" onClick={handleRealizarVenda} />
                        <BotaoClaro texto="Histórico de vendas" onClick={handleHistoricoVendas} />
                        <BotaoClaro texto="Dashboard" />
                    </div>
                    
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Pessoas" />
                        <BotaoClaro texto="Cadastrar Funcionário" />
                        <BotaoClaro texto="Cadastrar Fornecedor" />
                    </div>
                </div>
            </div>
        </div>
    );
}
