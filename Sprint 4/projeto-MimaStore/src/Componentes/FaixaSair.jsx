import styles from './Componentes - CSS/FaixaSair.module.css';

export function FaixaSair() {
    return (
        <div className={styles.faixaSair}>
            <div className={styles.container}>
                <button className={styles.botaoSair}>
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}
