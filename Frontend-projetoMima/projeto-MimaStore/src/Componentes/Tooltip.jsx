import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Componentes - CSS/Tooltip.module.css';

export function Tooltip({ texto, children }) {
    const [mostrar, setMostrar] = useState(false);
    const [posicao, setPosicao] = useState({ top: 0, left: 0 });
    const [pronto, setPronto] = useState(false);
    const triggerRef = useRef(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosicao({
                top: rect.top + window.scrollY - 12,
                left: rect.left + window.scrollX + rect.width / 2
            });
            setPronto(true);
            requestAnimationFrame(() => {
                setMostrar(true);
            });
        }
    };

    const handleMouseLeave = () => {
        setMostrar(false);
        setPronto(false);
    };

    return (
        <div className={styles.tooltipContainer}>
            <div
                ref={triggerRef}
                className={styles.trigger}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {pronto && createPortal(
                <div 
                    className={styles.tooltipBox}
                    style={{
                        top: `${posicao.top}px`,
                        left: `${posicao.left}px`,
                        opacity: mostrar ? 1 : 0,
                        visibility: mostrar ? 'visible' : 'hidden'
                    }}
                >
                    <div className={styles.tooltipConteudo}>
                        {texto}
                    </div>
                    <div className={styles.tooltipSeta}></div>
                </div>,
                document.body
            )}
        </div>
    );
}
