import { BotaoEscuro } from './BotaoEscuro';
import { BotaoClaro } from './BotaoClaro';
import styles from './Componentes - CSS/MenuPrincipal.module.css';

export function MenuPrincipal() {
    return (
        <div className={styles.menuPrincipal}>
            <div className={styles.container}>
                <h1 className={styles.titulo}>Menu Principal</h1>
                
                <div className={styles.secoes}>
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Estoque" />
                        <BotaoClaro texto="Visualizar Estoque" />
                        <BotaoClaro texto="Repor Estoque" />
                        <BotaoClaro texto="Cadastrar Novas Peças" />
                        <BotaoClaro texto="Cadastrar Atributos" />
                    </div>
                    
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Vendas" />
                        <BotaoClaro texto="Realizar Venda" />
                        <BotaoClaro texto="Histórico de vendas" />
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
