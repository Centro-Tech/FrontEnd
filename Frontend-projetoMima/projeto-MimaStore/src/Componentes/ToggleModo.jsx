import React from 'react';
import styles from './Componentes - CSS/ToggleModo.module.css';

const ToggleModo = ({ modoAvancado, onChange }) => {
    return (
        <div className={styles.toggleContainer}>
            <button 
                className={`${styles.toggleBtn} ${!modoAvancado ? styles.ativo : ''}`}
                onClick={() => onChange(false)}
            >
                Básico
            </button>
            <button 
                className={`${styles.toggleBtn} ${modoAvancado ? styles.ativo : ''}`}
                onClick={() => onChange(true)}
            >
                Avançado
            </button>
            <div className={`${styles.slider} ${modoAvancado ? styles.sliderAvancado : ''}`}></div>
        </div>
    );
};

export default ToggleModo;
