import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/DashboardSimples.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { KpiCard } from '../Componentes/KpiCard';
import { ChartCard } from '../Componentes/ChartCard';
import DashboardService from '../Provider/DashboardService';

export default function DashboardSimples() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // KPIs State
    const [ticketMedio, setTicketMedio] = useState({ valor: 'R$ 0,00', variacao: 0 });
    const [indiceSazional, setIndiceSazional] = useState({ status: 'Calculando...', variacao: 0 });
    const [fidelizacao, setFidelizacao] = useState({ variacao: 0 });
    
    // Charts Data State
    const [estoqueVendasData, setEstoqueVendasData] = useState(null);
    const [estoqueMeta, setEstoqueMeta] = useState({ page: 1, totalPages: 1, pageSize: 10 });
    const [categoriasData, setCategoriasData] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Load only the estoque x vendas chart when page changes
    useEffect(() => {
        loadEstoqueChart(estoqueMeta.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estoqueMeta.page]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load KPIs
            const [ticketData, sazonalData, fidelizacaoData, estoqueVendas, categorias] = await Promise.all([
                DashboardService.getAverageTicket(),
                DashboardService.getSeasonalIndex(),
                DashboardService.getCustomerRetention(),
                DashboardService.getStockSalesRelation({ page: 1, pageSize: 10, order: 'desc' }),
                DashboardService.getTopCategoriesByMonth(1)
            ]);

            // Set KPI 1 - Average Ticket
            if (ticketData) {
                // valor já vem formatado do serviço (ex.: "R$ 425,44")
                setTicketMedio({
                    valor: ticketData.valor || 'R$ 0,00',
                    variacao: ticketData.variacao || 0
                });
            }

            // Set KPI 2 - Seasonal Index
            if (sazonalData) {
                setIndiceSazional({
                    status: sazonalData.status || 'Abaixo da Média',
                    variacao: sazonalData.variacao || 0
                });
            }

            // Set KPI 3 - Customer Retention
            if (fidelizacaoData) {
                setFidelizacao({
                    variacao: fidelizacaoData.variacao || 0
                });
            }

            // Set Chart 1 - Stock vs Sales Relation (Horizontal Bar)
            if (estoqueVendas && estoqueVendas.labels) {
                setEstoqueVendasData({
                    labels: estoqueVendas.labels,
                    datasets: [
                        {
                            label: 'Vendas',
                            data: estoqueVendas.vendas || [],
                            backgroundColor: '#864176',
                            borderRadius: 6,
                            barThickness: 20
                        },
                        {
                            label: 'Estoque',
                            data: estoqueVendas.estoque || [],
                            backgroundColor: '#B08AAA',
                            borderRadius: 6,
                            barThickness: 20
                        }
                    ]
                });
                if (estoqueVendas.meta) setEstoqueMeta(estoqueVendas.meta);
            }

            // Set Chart 2 - Top Categories
            if (categorias && categorias.labels) {
                setCategoriasData({
                    labels: categorias.labels,
                    datasets: [
                        {
                            label: 'Série: 1',
                            data: categorias.serie1 || [],
                            backgroundColor: '#B08AAA',
                            borderRadius: 4,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Série: 2',
                            data: categorias.serie2 || [],
                            backgroundColor: '#6B3563',
                            borderRadius: 4,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        }
                    ]
                });
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadEstoqueChart = async (page) => {
        try {
            const estoqueVendas = await DashboardService.getStockSalesRelation({ page: page || 1, pageSize: estoqueMeta.pageSize || 10, order: 'desc' });
            if (estoqueVendas && estoqueVendas.labels) {
                setEstoqueVendasData({
                    labels: estoqueVendas.labels,
                    datasets: [
                        { label: 'Vendas', data: estoqueVendas.vendas || [], backgroundColor: '#864176', borderRadius: 6, barThickness: 20 },
                        { label: 'Estoque', data: estoqueVendas.estoque || [], backgroundColor: '#B08AAA', borderRadius: 6, barThickness: 20 }
                    ]
                });
                if (estoqueVendas.meta) setEstoqueMeta(estoqueVendas.meta);
            }
        } catch (err) {
            console.error('Error loading stock vs sales chart:', err);
        }
    };

    const gotoPrevEstoquePage = () => {
        setEstoqueMeta(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    };
    const gotoNextEstoquePage = () => {
        setEstoqueMeta(prev => ({ ...prev, page: Math.min(prev.totalPages || 1, prev.page + 1) }));
    };

    const handleVoltar = () => {
        navigate('/menu-inicial');
    };

    const handleVerAnalisesCompletas = () => {
        navigate('/dashboard-completo');
    };

    if (loading) {
        return (
            <>
                <Navbar mostrarHamburguer={true} mostrarPerfil={true} />
                <FaixaVoltar aoClicar={handleVoltar} />
                <div className={styles.dashboardContainer}>
                    <div className={styles.loadingContainer}>
                        <p className={styles.loading}>Carregando dashboard...</p>
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
                        valor={`${fidelizacao.variacao >= 0 ? '+' : ''}${fidelizacao.variacao}%`}
                        variacao={fidelizacao.variacao}
                        explicacao="Percentual de clientes que voltaram a comprar nos últimos 6 meses. Este valor é atualizado diariamente, sempre considerando exatamente 6 meses antes do dia atual."
                    />
                </div>

                {/* Charts Section */}
                <div className={styles.chartsSection}>
                    {estoqueVendasData && (
                        <div>
                            <ChartCard
                                titulo="Relação entre disponibilidade de estoque e vendas (semana)"
                                tipo="bar"
                                dados={estoqueVendasData}
                                explicacao="Ranking dos itens com maior relação vendas/estoque nesta semana. Use a paginação abaixo para ver todos."
                                opcoes={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                            labels: {
                                                font: { family: "'Average Sans', sans-serif", size: 12 },
                                                boxWidth: 12,
                                                padding: 15
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            title: { display: true, text: 'Vendas (em relação ao estoque)', font: { family: "'Average Sans', sans-serif", size: 11 } },
                                            grid: { display: true }
                                        },
                                        y: { title: { display: false }, grid: { display: false } }
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                                <button onClick={gotoPrevEstoquePage} disabled={(estoqueMeta?.page || 1) <= 1} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #B08AAA', background: '#fff', color: '#6B3563' }}>Anterior</button>
                                <span style={{ fontFamily: 'Average Sans, sans-serif', fontSize: 12, color: '#333' }}>Página {estoqueMeta?.page || 1} de {estoqueMeta?.totalPages || 1}</span>
                                <button onClick={gotoNextEstoquePage} disabled={(estoqueMeta?.page || 1) >= (estoqueMeta?.totalPages || 1)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #B08AAA', background: '#fff', color: '#6B3563' }}>Próxima</button>
                            </div>
                        </div>
                    )}

                    {categoriasData && (
                        <ChartCard
                            titulo="Categorias mais vendidas no mês x período anterior"
                            tipo="bar"
                            dados={categoriasData}
                            explicacao="Compara as categorias mais vendidas do mês atual com o mês anterior. Série 1 representa o período anterior e Série 2 representa o período atual, ajudando a identificar mudanças nas preferências dos clientes."
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
                    )}
                </div>

                {/* Ver Análises Completas Button */}
                <button className={styles.verAnalisesBtn} onClick={handleVerAnalisesCompletas}>
                    VER ANÁLISES COMPLETAS
                </button>
            </div>
        </div>
        </>
    );
}
