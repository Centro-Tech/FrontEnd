import React from 'react';
import styles from './Componentes - CSS/FiltroTemporal.module.css';

export function FiltroTemporal({ opcoes, valorSelecionado, onChange, tamanho = 'pequeno' }) {
    return (
        <div className={`${styles.filtroContainer} ${styles[tamanho]}`}>
            {opcoes.map((opcao) => (
                <button
                    key={opcao.valor}
                    className={`${styles.filtroBtn} ${valorSelecionado === opcao.valor ? styles.ativo : ''}`}
                    onClick={() => onChange(opcao.valor)}
                    title={opcao.descricao || opcao.label}
                >
                    {opcao.label}
                </button>
            ))}
        </div>
    );
}
