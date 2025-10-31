import React from 'react';
import styles from './Componentes - CSS/KpiCard.module.css';
import { Tooltip } from './Tooltip';

export function KpiCard({ titulo, valor, variacao, subtitulo, explicacao }) {
    const isPositive = variacao >= 0;
    const variacaoFormatada = `${isPositive ? '+' : ''}${variacao}%`;

    return (
        <div className={styles.kpiCard}>
            <div className={styles.tituloContainer}>
                <h3 className={styles.titulo}>{titulo}</h3>
                {explicacao && (
                    <Tooltip texto={explicacao}>
                        <div className={styles.iconInfo}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7" stroke="#864176" strokeWidth="1.5" fill="none"/>
                                <text x="8" y="11" fontSize="10" fontWeight="bold" fill="#864176" textAnchor="middle" fontFamily="Arial">!</text>
                            </svg>
                        </div>
                    </Tooltip>
                )}
            </div>
            <div className={styles.valor}>{valor}</div>
            <div className={`${styles.variacao} ${isPositive ? styles.positivo : styles.negativo}`}>
                {variacaoFormatada}
            </div>
            {subtitulo && <div className={styles.subtitulo}>{subtitulo}</div>}
        </div>
    );
}
