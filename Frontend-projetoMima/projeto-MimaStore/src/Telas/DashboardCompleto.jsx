import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/DashboardCompleto.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { KpiCard } from '../Componentes/KpiCard';
import { ChartCard } from '../Componentes/ChartCard';
import DashboardService from '../Provider/DashboardService';

export default function DashboardCompleto() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // KPIs State
    const [ticketMedio, setTicketMedio] = useState({ valor: 'R$ 0,00', variacao: 0 });
    const [indiceSazional, setIndiceSazional] = useState({ status: 'Calculando...', variacao: 0 });
    const [fidelizacao, setFidelizacao] = useState({ variacao: 0 });
    
    // Charts Data State
    const [comparacaoMensalData, setComparacaoMensalData] = useState(null);
    const [tendenciaFaturamentoData, setTendenciaFaturamentoData] = useState(null);
    const [tendenciaVendasData, setTendenciaVendasData] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [ticketMedioData, sazionalData, fidelizacaoData, comparacaoMensal, tendenciaFaturamento, tendenciaVendas] = await Promise.all([
                DashboardService.getAverageTicket(),
                DashboardService.getSeasonalIndex(),
                DashboardService.getCustomerRetention(),
                DashboardService.getMonthlySalesComparison(),
                DashboardService.getRevenueTrend(),
                DashboardService.getSalesTrend()
            ]);

            // Set KPIs
            if (ticketMedioData) {
                setTicketMedio({
                    valor: ticketMedioData.valor || 'R$ 0,00',
                    variacao: ticketMedioData.variacao || 0
                });
            }

            if (sazionalData) {
                setIndiceSazional({
                    status: sazionalData.status || 'Média',
                    variacao: sazionalData.variacao || 0
                });
            }

            if (fidelizacaoData) {
                setFidelizacao({
                    variacao: fidelizacaoData.variacao || 0
                });
            }

            // Chart 1 - Monthly Sales Comparison (3 items showing)
            if (comparacaoMensal && comparacaoMensal.labels) {
                setComparacaoMensalData({
                    labels: comparacaoMensal.labels,
                    datasets: [
                        {
                            label: 'Série: 1',
                            data: comparacaoMensal.serie1 || [],
                            backgroundColor: '#B08AAA',
                            borderRadius: 4,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Série: 2',
                            data: comparacaoMensal.serie2 || [],
                            backgroundColor: '#6B3563',
                            borderRadius: 4,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        }
                    ]
                });
            }

            // Chart 2 - Revenue Billing Trend (Line chart) com previsão
            if (tendenciaFaturamento && tendenciaFaturamento.labels) {
                setTendenciaFaturamentoData({
                    labels: tendenciaFaturamento.labels,
                    datasets: [
                        {
                            label: 'Observado',
                            data: tendenciaFaturamento.historico || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 2,
                            borderWidth: 2
                        },
                        {
                            label: 'Previsão (próx. 3 meses)',
                            data: tendenciaFaturamento.previsao || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            borderDash: [6, 4],
                            tension: 0.4,
                            fill: false,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 1.5,
                            borderWidth: 2
                        }
                    ]
                });
            }

            // Chart 3 - Sales Trend (Line chart) com previsão
            if (tendenciaVendas && tendenciaVendas.labels) {
                setTendenciaVendasData({
                    labels: tendenciaVendas.labels,
                    datasets: [
                        {
                            label: 'Observado',
                            data: tendenciaVendas.historico || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 2,
                            borderWidth: 2
                        },
                        {
                            label: 'Previsão (próx. 3 meses)',
                            data: tendenciaVendas.previsao || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            borderDash: [6, 4],
                            tension: 0.4,
                            fill: false,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 1.5,
                            borderWidth: 2
                        }
                    ]
                });
            }

        } catch (error) {
            console.error('Error loading complete dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoltar = () => {
        navigate('/dashboard-simples');
    };

    if (loading) {
        return (
            <>
                <Navbar mostrarHamburguer={true} mostrarPerfil={true} />
                <FaixaVoltar aoClicar={handleVoltar} />
                <div className={styles.dashboardContainer}>
                    <div className={styles.loadingContainer}>
                        <p className={styles.loading}>Carregando análises completas...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar mostrarHamburguer={true} mostrarPerfil={true} />
            <FaixaVoltar aoClicar={handleVoltar} />
            <div className={styles.dashboardContainer}>
                {/* Main Content */}
                <div className={styles.content}>
                    {/* KPIs Row */}
                    <div className={styles.kpisRow}>
                        <KpiCard
                            titulo="Variação do Ticket Médio"
                            valor={ticketMedio.valor}
                            variacao={ticketMedio.variacao}
                            explicacao="Quanto seus clientes gastam, em média, por compra. A variação mostra se esse valor aumentou ou diminuiu em relação ao mês passado (considerando os mesmos dias corridos)."
                        />
                        <KpiCard
                            titulo="Índice Sazional de Vendas"
                            valor={indiceSazional.status}
                            variacao={indiceSazional.variacao}
                            explicacao="Indica se suas vendas estão acima, na média ou abaixo do esperado para a estação atual. Compara com a estação anterior no mesmo período."
                        />
                        <KpiCard
                            titulo="Variação de Fidelização de Clientes"
                            valor=""
                            variacao={fidelizacao.variacao}
                            explicacao="Percentual de clientes que voltaram a comprar nos últimos 6 meses. Quanto maior, mais fiel é sua base de clientes."
                        />
                    </div>

                    {/* Charts Grid - 3 columns layout */}
                    <div className={styles.chartsGrid}>
                        {comparacaoMensalData && (
                            <div className={styles.chartCard}>
                                <ChartCard
                                    titulo="Comparação Mensal de Vendas"
                                    tipo="bar"
                                    dados={comparacaoMensalData}
                                    explicacao="Compara o desempenho de vendas do mês atual com o mês anterior, mostrando crescimento ou queda nos últimos 3 meses."
                                    opcoes={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    font: {
                                                        family: "'Average Sans', sans-serif",
                                                        size: 11
                                                    },
                                                    boxWidth: 12,
                                                    padding: 10
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    display: true
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {tendenciaFaturamentoData && (
                            <div className={styles.chartCard}>
                                <ChartCard
                                    titulo="Tendência de Faturamento"
                                    tipo="line"
                                    dados={tendenciaFaturamentoData}
                                    explicacao="Evolução do faturamento nos últimos 10 meses com projeção para os próximos 3 meses (linha tracejada)."
                                    opcoes={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    font: {
                                                        family: "'Average Sans', sans-serif",
                                                        size: 11
                                                    },
                                                    boxWidth: 12,
                                                    padding: 10
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                grid: {
                                                    display: true
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {tendenciaVendasData && (
                            <div className={styles.chartCard}>
                                <ChartCard
                                    titulo="Tendência de Vendas"
                                    tipo="line"
                                    dados={tendenciaVendasData}
                                    explicacao="Evolução do volume de vendas nos últimos 10 meses com projeção para os próximos 3 meses (linha tracejada)."
                                    opcoes={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    font: {
                                                        family: "'Average Sans', sans-serif",
                                                        size: 11
                                                    },
                                                    boxWidth: 12,
                                                    padding: 10
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                grid: {
                                                    display: true
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
