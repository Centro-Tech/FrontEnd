import React, { useState } from 'react';
import styles from './Componentes - CSS/Tooltip.module.css';

export function Tooltip({ texto, children }) {
    const [mostrar, setMostrar] = useState(false);

    return (
        <div className={styles.tooltipContainer}>
            <div
                className={styles.trigger}
                onMouseEnter={() => setMostrar(true)}
                onMouseLeave={() => setMostrar(false)}
            >
                {children}
            </div>
            {mostrar && (
                <div className={styles.tooltipBox}>
                    <div className={styles.tooltipConteudo}>
                        {texto}
                    </div>
                    <div className={styles.tooltipSeta}></div>
                </div>
            )}
        </div>
    );
}
