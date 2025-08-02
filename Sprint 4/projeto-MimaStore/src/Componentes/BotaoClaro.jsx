import styles from './Componentes - CSS/BotaoClaro.module.css';

export function BotaoClaro({ texto, onClick }) {
    return (
        <button className={styles.botaoClaro} onClick={onClick}>
            {texto}
        </button>
    );
}
