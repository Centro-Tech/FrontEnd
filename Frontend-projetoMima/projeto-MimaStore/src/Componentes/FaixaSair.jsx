import styles from './Componentes - CSS/FaixaSair.module.css';
import { useContext } from 'react';
import { AuthContext } from '../Provider/AuthProvider';

export function FaixaSair({ aoClicar }) {
    const auth = useContext(AuthContext);

    const handleClick = () => {
        try { auth.logout(); } catch(e) { /* ignore */ }
        if (typeof aoClicar === 'function') aoClicar();
    };

    return (
        <div className={styles.faixaSair}>
            <div className={styles.container}>
                <button className={styles.botaoSair} onClick={handleClick}>
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}
