import styles from './Componentes - CSS/FaixaSair.module.css';

export function FaixaSair({ aoClicar }) {
    return (
        <div className={styles.faixaSair}>
            <div className={styles.container}>
                <button className={styles.botaoSair} onClick={aoClicar}>
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}
