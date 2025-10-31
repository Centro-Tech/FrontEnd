import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './Componentes - CSS/ChartCard.module.css';
import { Tooltip } from './Tooltip';

export function ChartCard({ titulo, tipo, dados, opcoes, explicacao }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !dados) return;

        // Destroy previous chart instance
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        chartRef.current = new Chart(ctx, {
            type: tipo || 'bar',
            data: dados,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: opcoes?.legend !== false,
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Average Sans', sans-serif",
                                size: 12
                            },
                            color: '#333'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(134, 65, 118, 0.9)',
                        titleFont: {
                            family: "'Average', serif",
                            size: 14
                        },
                        bodyFont: {
                            family: "'Average Sans', sans-serif",
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: opcoes?.scales || {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: "'Average Sans', sans-serif"
                            },
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: "'Average Sans', sans-serif"
                            },
                            color: '#666'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                ...opcoes
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [dados, tipo, opcoes]);

    return (
        <div className={styles.chartCard}>
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
            <div className={styles.chartContainer}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
