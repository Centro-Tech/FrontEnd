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
    const [fidelizacao, setFidelizacao] = useState({ valor: '0', variacao: 0 });
    
    // Charts Data State
    const [estoqueVendasData, setEstoqueVendasData] = useState(null);
    const [estoqueMeta, setEstoqueMeta] = useState({ page: 1, totalPages: 1, pageSize: 10 });
    const [categoriasData, setCategoriasData] = useState(null);
    const [categoriasMeta, setCategoriasMeta] = useState([]);

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
            const [ticketData, sazonalData, fidelizacaoData, estoqueVendas, categoriasTop3] = await Promise.all([
                DashboardService.getAverageTicket(),
                DashboardService.getSeasonalIndex(),
                DashboardService.getLoyalCustomersStats(),
                DashboardService.getStockSalesRelation({ page: 1, pageSize: 10, order: 'desc' }),
                DashboardService.getCategoriesTopPerLast3Months()
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
                const abs = Number(fidelizacaoData.currentCount || 0);
                const base = Number(fidelizacaoData.startOfMonthCount || 0);
                const varPct = fidelizacaoData.variationPercent;
                // Caso especial baseline zero: mostrar "+X clientes"
                const variacaoDisplay = (varPct === null)
                    ? `+${Math.max(0, abs - base)} clientes`
                    : Math.round(varPct);
                setFidelizacao({ valor: String(abs), variacao: variacaoDisplay });
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
                            barPercentage: 0.7,
                            categoryPercentage: 0.5
                        },
                        {
                            label: 'Estoque',
                            data: estoqueVendas.estoque || [],
                            backgroundColor: '#B08AAA',
                            borderRadius: 6,
                            barPercentage: 0.7,
                            categoryPercentage: 0.5
                        }
                    ]
                };
                console.log('[DASHBOARD UI] Setando estoqueVendasData:', chartData);
                setEstoqueVendasData(chartData);
                if (estoqueVendas.meta) setEstoqueMeta(estoqueVendas.meta);
            } else {
                console.warn('[DASHBOARD UI] estoqueVendas sem labels:', estoqueVendas);
            }

            // Set Chart 2 - Top category per month (últimos 3)
            if (categoriasTop3 && categoriasTop3.labels) {
                setCategoriasData({
                    labels: categoriasTop3.labels,
                    datasets: [
                        {
                            label: 'Categoria campeã por mês',
                            data: categoriasTop3.values || [],
                            backgroundColor: categoriasTop3.colors || [],
                            borderRadius: 6,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        }
                    ]
                });
                setCategoriasMeta(categoriasTop3.meta || []);
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
                        { label: 'Vendas', data: estoqueVendas.vendas || [], backgroundColor: '#864176', borderRadius: 6, barPercentage: 0.7, categoryPercentage: 0.5 },
                        { label: 'Estoque', data: estoqueVendas.estoque || [], backgroundColor: '#B08AAA', borderRadius: 6, barPercentage: 0.7, categoryPercentage: 0.5 }
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
                        titulo="Clientes fidelizados"
                        valor={fidelizacao.valor}
                        variacao={fidelizacao.variacao}
                        explicacao="Total de clientes fidelizados (últimos 12 meses). Abaixo, a variação em relação ao início do mês; se não houver base no início do mês, mostramos o ganho absoluto."
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
                                titulo="Produtos em Risco de Ruptura"
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
                            explicacao="Para cada mês, mostramos a categoria campeã em vendas e sua quantidade. A cor da barra indica a categoria vencedora."
                            opcoes={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: false,
                                        external: (context) => {
                                            const { chart, tooltip } = context;
                                            if (!tooltip || tooltip.opacity === 0) return;
                                            const dp = tooltip.dataPoints?.[0];
                                            if (!dp) return;
                                            const idx = dp.dataIndex;
                                            const meta = (Array.isArray(categoriasMeta) ? categoriasMeta : []);
                                            const info = meta[idx];
                                            const catNome = info?.categoryName || dp.dataset?.label || 'Categoria';
                                            const qtd = Number(dp.raw || 0);
                                            // Cria/atualiza elemento do tooltip
                                            let el = document.querySelector(`#ext-tooltip-${chart.id}`);
                                            if (!el) {
                                                el = document.createElement('div');
                                                el.id = `ext-tooltip-${chart.id}`;
                                                el.className = 'chartjs-ext-tooltip';
                                                el.style.position = 'fixed';
                                                el.style.background = 'rgba(134, 65, 118, 0.95)';
                                                el.style.color = '#fff';
                                                el.style.borderRadius = '8px';
                                                el.style.padding = '10px 12px';
                                                el.style.pointerEvents = 'none';
                                                el.style.transform = 'translate(-50%, -100%)';
                                                el.style.whiteSpace = 'nowrap';
                                                el.style.zIndex = '2147483647';
                                                el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
                                                el.style.fontFamily = "'Average Sans', sans-serif";
                                                el.style.fontSize = '12px';
                                                document.body.appendChild(el);
                                            }
                                            el.innerHTML = `<div style="font-weight:700; margin-bottom:6px; font-family:'Average', serif; font-size:13px">${categoriasData.labels[idx]}</div>` +
                                                `<div>Categoria campeã do mês: ${catNome} — ${qtd} vendas</div>`;
                                            const rect = chart.canvas.getBoundingClientRect();
                                            const x = rect.left + window.scrollX + tooltip.caretX;
                                            const y = rect.top + window.scrollY + tooltip.caretY;
                                            el.style.opacity = '1';
                                            const margin = 12;
                                            const ttW = el.offsetWidth;
                                            const ttH = el.offsetHeight;
                                            let left = x;
                                            let top = y - 12;
                                            if (top - ttH < window.scrollY) {
                                                el.style.transform = 'translate(-50%, 0)';
                                                top = y + margin;
                                            } else {
                                                el.style.transform = 'translate(-50%, -100%)';
                                            }
                                            const minLeft = window.scrollX + margin + ttW / 2;
                                            const maxLeft = window.scrollX + window.innerWidth - margin - ttW / 2;
                                            if (left < minLeft) left = minLeft;
                                            if (left > maxLeft) left = maxLeft;
                                            el.style.left = `${left}px`;
                                            el.style.top = `${top}px`;
                                        }
                                    }
                                },
                                scales: {
                                    y: { beginAtZero: true, grid: { display: true } },
                                    x: { grid: { display: false } }
                                }
                            }}
                            rodape={
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                                        {categoriasMeta.map((m, i) => (
                                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Average Sans, sans-serif', fontSize: 12 }}>
                                                <span style={{ width: 10, height: 10, background: m.color, borderRadius: 2, display: 'inline-block' }}></span>
                                                <span style={{ color: '#333' }}>{m.categoryName}</span>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                        {categoriasMeta.map((m, i) => (
                                            <span key={`b-${i}`} style={{ background: '#f5f0f4', color: '#6B3563', border: '1px solid #B08AAA', borderRadius: 12, padding: '2px 8px', fontFamily: 'Average Sans, sans-serif', fontSize: 12 }}>
                                                {m.monthLabel}: {m.categoryName} ({m.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            }
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
