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

            // Chart 2 - Revenue Billing Trend (Line chart)
            if (tendenciaFaturamento && tendenciaFaturamento.labels) {
                setTendenciaFaturamentoData({
                    labels: tendenciaFaturamento.labels,
                    datasets: [
                        {
                            label: 'Série: 1',
                            data: tendenciaFaturamento.valores || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 2,
                            borderWidth: 2
                        }
                    ]
                });
            }

            // Chart 3 - Sales Trend (Line chart)
            if (tendenciaVendas && tendenciaVendas.labels) {
                setTendenciaVendasData({
                    labels: tendenciaVendas.labels,
                    datasets: [
                        {
                            label: 'Série: 1',
                            data: tendenciaVendas.valores || [],
                            borderColor: '#864176',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#864176',
                            pointBorderColor: '#864176',
                            pointBorderWidth: 2,
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
                            titulo="Variação do Ticket Médio (mês)"
                            valor={ticketMedio.valor}
                            variacao={ticketMedio.variacao}
                            explicacao="Mostra o valor médio gasto por cliente em cada compra. A variação compara os mesmos dias do mês atual com o mês anterior. Por exemplo: se estamos no dia 15, comparamos com os primeiros 15 dias do mês passado."
                        />
                        <KpiCard
                            titulo="Índice Sazional de Vendas"
                            valor={indiceSazional.status}
                            variacao={indiceSazional.variacao}
                            explicacao="Compara as vendas da estação atual com a estação anterior, considerando o mesmo período. Se estamos no dia 15 do primeiro mês desta estação, comparamos com o dia 15 do primeiro mês da última estação."
                        />
                        <KpiCard
                            titulo="Variação de Fidelização de Clientes"
                            valor=""
                            variacao={fidelizacao.variacao}
                            explicacao="Percentual de clientes que voltaram a comprar nos últimos 6 meses. Este valor é atualizado diariamente, sempre considerando exatamente 6 meses antes do dia atual."
                        />
                    </div>

                    {/* Charts Grid - 3 columns layout */}
                    <div className={styles.chartsGrid}>
                        {comparacaoMensalData && (
                            <div className={styles.chartCard}>
                                <ChartCard
                                    titulo="Aumento ou redução das vendas do mês vigente em relação ao mês anterior"
                                    tipo="bar"
                                    dados={comparacaoMensalData}
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
                                    titulo="Tendência de faturamento ao longo dos meses"
                                    tipo="line"
                                    dados={tendenciaFaturamentoData}
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
                                    titulo="Tendência de vendas ao longo dos meses"
                                    tipo="line"
                                    dados={tendenciaVendasData}
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
