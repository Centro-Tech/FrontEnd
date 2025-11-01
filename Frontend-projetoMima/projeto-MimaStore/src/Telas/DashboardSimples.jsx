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
                console.log('[DASHBOARD UI] ✅ RECEBIDO estoqueVendas DO SERVICE:', {
                    labelsCount: estoqueVendas.labels?.length,
                    labels: estoqueVendas.labels?.slice(0, 3),
                    vendas: estoqueVendas.vendas?.slice(0, 3),
                    estoque: estoqueVendas.estoque?.slice(0, 3),
                    timestamp: new Date().toISOString()
                });
                const chartData = {
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
                };
                console.log('[DASHBOARD UI] Setando estoqueVendasData:', chartData);
                setEstoqueVendasData(chartData);
                if (estoqueVendas.meta) setEstoqueMeta(estoqueVendas.meta);
            } else {
                console.warn('[DASHBOARD UI] estoqueVendas sem labels:', estoqueVendas);
            }

            // Set Chart 2 - Top Categories
            if (categorias && categorias.labels) {
                let catData = categorias;
                // Fallback: se não houver dados para mês anterior, tenta mês atual
                if ((categorias.labels?.length || 0) === 0) {
                    try {
                        const categoriasAtual = await DashboardService.getTopCategoriesByMonth(0);
                        if (categoriasAtual?.labels) catData = categoriasAtual;
                    } catch {}
                }

                setCategoriasData({
                    labels: catData.labels || [],
                    datasets: [
                        {
                            label: 'Série: 1',
                            data: catData.serie1 || [],
                            backgroundColor: '#B08AAA',
                            borderRadius: 4,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Série: 2',
                            data: catData.serie2 || [],
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

                {/* Charts Section */}
                <div className={styles.chartsSection}>
                    {estoqueVendasData && (
                        <div>
                            {console.log('[DASHBOARD UI] Renderizando ChartCard com estoqueVendasData:', {
                                labelsCount: estoqueVendasData?.labels?.length,
                                hasDatasets: !!estoqueVendasData?.datasets
                            })}
                            <ChartCard
                                titulo="Produtos com Alta Demanda"
                                tipo="bar"
                                dados={estoqueVendasData}
                                explicacao="Identifica produtos com alta demanda em relação ao estoque atual. Produtos no topo vendem rápido e precisam de reposição urgente para evitar ruptura."
                                opcoes={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'nearest', intersect: false },
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                            labels: {
                                                font: { family: "'Average Sans', sans-serif", size: 12 },
                                                boxWidth: 12,
                                                padding: 15
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(ctx) {
                                                    const dsLabel = ctx.dataset?.label || '';
                                                    const vendas = ctx.chart?.data?.datasets?.[0]?.data?.[ctx.dataIndex] ?? 0;
                                                    const estoque = ctx.chart?.data?.datasets?.[1]?.data?.[ctx.dataIndex] ?? 0;
                                                    const ratio = estoque > 0 ? (vendas / estoque) : 0;
                                                    const ratioFmt = isFinite(ratio) ? (ratio).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '0';
                                                    if (dsLabel.toLowerCase().includes('vendas')) {
                                                        return `Vendas: ${vendas} (razão ${ratioFmt})`;
                                                    }
                                                    if (dsLabel.toLowerCase().includes('estoque')) {
                                                        return `Estoque: ${estoque}`;
                                                    }
                                                    return `${dsLabel}: ${ctx.formattedValue}`;
                                                }
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
                                rodape={
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                        <button onClick={gotoPrevEstoquePage} disabled={(estoqueMeta?.page || 1) <= 1} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #B08AAA', background: '#fff', color: '#6B3563' }}>Anterior</button>
                                        <span style={{ fontFamily: 'Average Sans, sans-serif', fontSize: 13, color: '#333' }}>Página {estoqueMeta?.page || 1} de {estoqueMeta?.totalPages || 1}</span>
                                        <button onClick={gotoNextEstoquePage} disabled={(estoqueMeta?.page || 1) >= (estoqueMeta?.totalPages || 1)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #B08AAA', background: '#fff', color: '#6B3563' }}>Próxima</button>
                                    </div>
                                }
                            />
                        </div>
                    )}

                    {categoriasData && (
                        <ChartCard
                            titulo="Categorias Mais Vendidas"
                            tipo="bar"
                            dados={categoriasData}
                            explicacao="Compara as categorias de produtos mais vendidas este mês com o mês passado. Ajuda a identificar mudanças nas preferências dos clientes."
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
