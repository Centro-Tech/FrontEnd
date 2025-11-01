import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import styles from './Componentes - CSS/ChartCard.module.css';
import { Tooltip } from './Tooltip';

export function ChartCard({ titulo, tipo, dados, opcoes, explicacao, rodape }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    // Tooltip HTML externo para evitar clipping e manter consistência
    const externalTooltipHandler = (context) => {
        const { chart, tooltip } = context;

        // Cria um único elemento global por gráfico
        let tooltipEl = document.querySelector(`#ext-tooltip-${chart.id}`);
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = `ext-tooltip-${chart.id}`;
            tooltipEl.className = 'chartjs-ext-tooltip';
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.background = 'rgba(134, 65, 118, 0.95)';
            tooltipEl.style.color = '#fff';
            tooltipEl.style.borderRadius = '8px';
            tooltipEl.style.padding = '10px 12px';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.transform = 'translate(-50%, -100%)'; // acima do ponto
            tooltipEl.style.whiteSpace = 'nowrap';
            tooltipEl.style.zIndex = '2147483647';
            tooltipEl.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
            tooltipEl.style.fontFamily = "'Average Sans', sans-serif";
            tooltipEl.style.fontSize = '12px';
            document.body.appendChild(tooltipEl);
        }

        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
        }

        // Monta conteúdo
        if (tooltip.body) {
            const title = (tooltip.title || []).join(' \u2013 ');
            const bodyLines = tooltip.dataPoints?.map(dp => {
                // Tenta formatar número em pt-BR
                const raw = dp.raw;
                let value = dp.formattedValue ?? String(raw);
                const n = Number(raw);
                if (!isNaN(n)) {
                    // Se parecer moeda (dataset label inclui 'R$' ou 'fatur'), formata como BRL
                    const isCurrency = /R\$|fatur|receita|valor/i.test(dp.dataset?.label || '') || /R\$/.test(value);
                    value = isCurrency ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n) : new Intl.NumberFormat('pt-BR').format(n);
                }
                return `${dp.dataset?.label ? dp.dataset.label + ': ' : ''}${value}`;
            }) || [];

            const innerHtml = `
                <div style="font-weight:700; margin-bottom:6px; font-family:'Average', serif; font-size:13px">${title}</div>
                ${bodyLines.map(l => `<div style="margin:2px 0">${l}</div>`).join('')}
            `;
            tooltipEl.innerHTML = innerHtml;
        }

        // Posiciona próximo ao caret, com clamps ao viewport
        const canvasRect = chart.canvas.getBoundingClientRect();
        const pageX = canvasRect.left + window.scrollX + tooltip.caretX;
        const pageY = canvasRect.top + window.scrollY + tooltip.caretY;

        // Primeiro tornamos visível para medir
        tooltipEl.style.opacity = '1';
        const ttW = tooltipEl.offsetWidth;
        const ttH = tooltipEl.offsetHeight;

        // Preferir acima do ponto; se não couber, coloca abaixo
        let top = pageY - 12;
        let left = pageX;
        const margin = 12;
        if (top - ttH < window.scrollY) {
            // não cabe acima, coloca abaixo
            tooltipEl.style.transform = 'translate(-50%, 0)';
            top = pageY + margin;
        } else {
            tooltipEl.style.transform = 'translate(-50%, -100%)';
        }

        // Clamps horizontais
        const minLeft = window.scrollX + margin + ttW / 2;
        const maxLeft = window.scrollX + window.innerWidth - margin - ttW / 2;
        if (left < minLeft) left = minLeft;
        if (left > maxLeft) left = maxLeft;

        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${top}px`;
    };

    useEffect(() => {
        console.log('[ChartCard] useEffect chamado:', { 
            titulo, 
            tipo, 
            temCanvas: !!canvasRef.current, 
            temDados: !!dados,
            labelsCount: dados?.labels?.length,
            labels: dados?.labels?.slice(0, 3)
        });
        if (!canvasRef.current || !dados) return;

        // Destroy previous chart instance
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        console.log('[ChartCard] ✅ Criando Chart.js para:', titulo, {
            tipo,
            labelsCount: dados?.labels?.length,
            datasetsCount: dados?.datasets?.length,
            temOpcoes: !!opcoes,
            indexAxis: opcoes?.indexAxis
        });
        
        // Configurações padrão
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: { top: 16, right: 8, bottom: 8, left: 8 }
            },
            plugins: {
                legend: {
                    display: true,
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
                    enabled: false, // desativa interno
                    external: externalTooltipHandler,
                    padding: 12,
                    cornerRadius: 8,
                    caretPadding: 6
                }
            },
            scales: {
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
                    beginAtZero: true,
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
            }
        };

        // Merge correto das opcoes customizadas (deep merge)
        const finalOptions = opcoes ? {
            ...defaultOptions,
            ...opcoes,
            plugins: {
                ...defaultOptions.plugins,
                ...(opcoes.plugins || {}),
                legend: {
                    ...defaultOptions.plugins.legend,
                    ...(opcoes.plugins?.legend || {})
                },
                tooltip: {
                    ...defaultOptions.plugins.tooltip,
                    ...(opcoes.plugins?.tooltip || {})
                }
            },
            scales: {
                ...defaultOptions.scales,
                ...(opcoes.scales || {}),
                x: {
                    ...defaultOptions.scales.x,
                    ...(opcoes.scales?.x || {})
                },
                y: {
                    ...defaultOptions.scales.y,
                    ...(opcoes.scales?.y || {})
                }
            }
        } : defaultOptions;
        
        try {
            chartRef.current = new Chart(ctx, {
                type: tipo || 'bar',
                data: dados,
                options: finalOptions
            });
            console.log('[ChartCard] ✅ Chart.js criado com sucesso para:', titulo);
        } catch (error) {
            console.error('[ChartCard] ❌ ERRO ao criar Chart.js:', titulo, error);
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            // Remove tooltip externo se existir
            try {
                if (chartRef.current?.id) {
                    const el = document.querySelector(`#ext-tooltip-${chartRef.current.id}`);
                    if (el && el.parentNode) el.parentNode.removeChild(el);
                } else {
                    // fallback: remove todos tooltips desse componente
                    document.querySelectorAll('[id^="ext-tooltip-"]').forEach(n => n.parentNode?.removeChild(n));
                }
            } catch {}
        };
    }, [dados, tipo, opcoes]);

    const labels = dados?.labels || [];
    const chartKey = useMemo(() => {
        const ds = (dados?.datasets || []).map(d => d?.label || '').join('|');
        return `${tipo || 'bar'}-${titulo}-${labels.join('|')}-${ds}`;
    }, [dados, labels, tipo, titulo]);
    const isEmpty = !labels.length;

    console.log('[ChartCard] Render:', { titulo, isEmpty, labelsCount: labels.length, labels: labels.slice(0, 3) });

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
                {isEmpty ? (
                    <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#666', fontFamily: "'Average Sans', sans-serif", fontSize: 14, textAlign: 'center', padding: 16
                    }}>
                        Sem dados para o período selecionado.
                    </div>
                ) : (
                    <canvas key={chartKey} ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
                )}
            </div>
            <div className={styles.cardFooter}>
                {rodape || null}
            </div>
        </div>
    );
}
