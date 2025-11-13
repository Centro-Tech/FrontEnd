import React from 'react';
import styles from './Componentes - CSS/KpiCard.module.css';
import { Tooltip } from './Tooltip';

export function KpiCard({ 
    titulo, 
    valor, 
    variacao, 
    subtitulo, 
    explicacao, 
    filtroTemporal,
    toggleModo,
    filtroBasico,
    filtroAvancado,
    modoAvancado
}) {
    const isNumber = typeof variacao === 'number' && isFinite(variacao);
    const isString = typeof variacao === 'string';
    const isPositive = isNumber ? (variacao >= 0) : (isString ? !String(variacao).trim().startsWith('-') : true);
    const variacaoFormatada = isNumber
        ? `${variacao >= 0 ? '+' : ''}${Math.round(variacao)}%`
        : (isString ? String(variacao) : '');
    const isValorVazio = !valor || String(valor).trim().length === 0;

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
            
            {/* Toggle Básico/Avançado */}
            {toggleModo && (
                <div className={styles.toggleContainer}>
                    {toggleModo}
                </div>
            )}

            {/* Filtros */}
            {(filtroTemporal || filtroBasico || filtroAvancado) && (
                <div className={styles.filtroContainer}>
                    {filtroTemporal}
                    {!modoAvancado && filtroBasico}
                    {modoAvancado && filtroAvancado}
                </div>
            )}
            <div className={styles.valorArea}>
                <div className={styles.valor}>{valor}</div>
            </div>
            <div className={styles.variacaoArea}>
                {(isNumber || isString) && (
                    <div className={`${styles.variacao} ${isValorVazio ? styles.variacaoSolo : ''} ${isPositive ? styles.positivo : styles.negativo}`}>
                        {variacaoFormatada}
                    </div>
                )}
            </div>
            {subtitulo && <div className={styles.subtitulo}>{subtitulo}</div>}
        </div>
    );
}
