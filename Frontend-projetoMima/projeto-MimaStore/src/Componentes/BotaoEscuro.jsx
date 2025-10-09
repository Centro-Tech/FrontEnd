import styles from './Componentes - CSS/BotaoEscuro.module.css';

export function BotaoEscuro({ texto, onClick }) {
    return (
        <button className={styles.botaoEscuro} onClick={onClick}>
            {texto}
        </button>
    );
}
