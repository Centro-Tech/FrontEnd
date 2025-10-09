import styles from './Componentes - CSS/FaixaVoltar.module.css';

export function FaixaVoltar({ aoClicar }) {
    return (
        <div className={styles.faixaVoltar}>
            <div className={styles.container}>
                <button className={styles.botaoVoltar} onClick={aoClicar}>
                    Voltar
                </button>
            </div>
        </div>
    );
}
