import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/DashboardSimples.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { KpiCard } from '../Componentes/KpiCard';
import { ChartCard } from '../Componentes/ChartCard';
import { FiltroTemporal } from '../Componentes/FiltroTemporal';
import FiltroSazional from '../Componentes/FiltroSazional';
import DashboardService from '../Provider/DashboardService';

export default function DashboardSimples() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // KPIs State
    const [ticketMedio, setTicketMedio] = useState({ valor: 'R$ 0,00', variacao: 0 });
    const [indiceSazional, setIndiceSazional] = useState({ 
        status: 'Calculando...', 
        variacao: 0,
        estacaoAtual: '-',
        estacaoAtualCodigo: '',
        anoAtual: new Date().getFullYear(),
        estacaoAnteriorPadrao: '',
        anoAnteriorPadrao: new Date().getFullYear() - 1,
        estacoesComVendasAnoAtual: []
    });
    const [fidelizacao, setFidelizacao] = useState({ valor: '0', variacao: 0 });
    
    // Charts Data State
    const [estoqueVendasData, setEstoqueVendasData] = useState(null);
    const [estoqueMeta, setEstoqueMeta] = useState({ page: 1, totalPages: 1, pageSize: 4 });
    const [categoriasData, setCategoriasData] = useState(null);
    const [categoriasMeta, setCategoriasMeta] = useState([]);

    // Dashboard Simples: Sempre modo BÁSICO
    // Filtros Básicos
    const [filtroTicket, setFiltroTicket] = useState(30); // dias: 7, 30, 90
    const [filtroFidelizacao, setFiltroFidelizacao] = useState(24); // meses: 24, 36, 48
    const [filtroCategorias, setFiltroCategorias] = useState(3); // meses: 1, 3, 6
    
    // Filtros Sazionais (4 dropdowns: estação1, ano1, estação2, ano2)
    const [filtroEstacao1, setFiltroEstacao1] = useState(null); // null = auto (estação atual)
    const [filtroAno1, setFiltroAno1] = useState(null); // null = auto (ano atual)
    const [filtroEstacao2, setFiltroEstacao2] = useState(null); // null = auto (estação anterior)
    const [filtroSazionalBasico, setFiltroSazionalBasico] = useState(1); // 1, 2 ou 3 estações atrás
    const [filtroAno2, setFiltroAno2] = useState(null); // null = auto (ano da estação anterior)

    useEffect(() => {
        loadDashboardData();
    }, [
        filtroTicket,
        filtroFidelizacao,
        filtroCategorias, 
        filtroEstacao1, filtroAno1, filtroEstacao2, filtroAno2
    ]);

    // Load only the estoque x vendas chart when page changes
    useEffect(() => {
        loadEstoqueChart(estoqueMeta.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estoqueMeta.page]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Dashboard Simples: Sempre usar filtros básicos
            console.log('[DASHBOARD SIMPLES] Parâmetros básicos:', { 
                ticket: filtroTicket, 
                fidelizacao: filtroFidelizacao 
            });

            const [ticketData, sazonalData, fidelizacaoData, estoqueVendas, categoriasTop3] = await Promise.all([
                DashboardService.getAverageTicket(filtroTicket),
                DashboardService.getSeasonalIndex(filtroEstacao1, filtroAno1, filtroEstacao2, filtroAno2),
                DashboardService.getLoyalCustomersStats(filtroFidelizacao),
                DashboardService.getStockSalesRelation({ page: 1, pageSize: estoqueMeta.pageSize || 4, order: 'desc' }),
                DashboardService.getCategoriesTopPerLast3Months(filtroCategorias)
            ]);

            console.log('[DASHBOARD] ticketData recebido:', ticketData);
            console.log('[DASHBOARD] fidelizacaoData recebido:', fidelizacaoData);

            if (ticketData) {
                setTicketMedio({ 
                    valor: ticketData.valor || 'R$ 0,00', 
                    variacao: ticketData.variacao || 0,
                    mesesComVendasAnoAtual: ticketData.mesesComVendasAnoAtual || []
                });
            }

            if (sazonalData) {
                setIndiceSazional({ 
                    status: sazonalData.status || 'Abaixo da Média', 
                    variacao: sazonalData.variacao || 0,
                    estacaoAtual: sazonalData.estacaoAtual || '-',
                    estacaoAtualCodigo: sazonalData.estacaoAtualCodigo || '',
                    anoAtual: sazonalData.anoAtual || new Date().getFullYear(),
                    estacaoAnteriorPadrao: sazonalData.estacaoAnteriorPadrao || '',
                    anoAnteriorPadrao: sazonalData.anoAnteriorPadrao || (new Date().getFullYear() - 1),
                    estacoesComVendasAnoAtual: sazonalData.estacoesComVendasAnoAtual || []
                });
                
                // Atualizar filtros com os valores padrão se ainda não foram definidos
                if (filtroEstacao1 === null) setFiltroEstacao1(sazonalData.estacao1Selecionada);
                if (filtroAno1 === null) setFiltroAno1(sazonalData.ano1Selecionado);
                if (filtroEstacao2 === null) setFiltroEstacao2(sazonalData.estacao2Selecionada);
                if (filtroAno2 === null) setFiltroAno2(sazonalData.ano2Selecionado);
            }

            if (fidelizacaoData) {
                // Dashboard Simples: Modo básico com janela móvel
                // currentCount = fidelizados no período atual (últimos X meses)
                // startOfMonthCount = fidelizados no período anterior (mesma duração, deslocado)
                const valorAtual = Number(fidelizacaoData.currentCount || 0);
                const valorAnterior = Number(fidelizacaoData.startOfMonthCount || 0);
                
                console.log('[DASHBOARD SIMPLES] Fidelização recebida:', {
                    currentCount: fidelizacaoData.currentCount,
                    startOfMonthCount: fidelizacaoData.startOfMonthCount,
                    valorAtual,
                    valorAnterior,
                    filtroFidelizacao
                });
                
                // Variação: comparar período atual com período anterior
                let variacaoDisplay;
                if (valorAnterior > 0) {
                    const variacaoPct = ((valorAtual - valorAnterior) / valorAnterior) * 100;
                    variacaoDisplay = Math.round(variacaoPct);
                } else {
                    variacaoDisplay = valorAtual > 0 ? `+${valorAtual} clientes` : 0;
                }
                
                setFidelizacao({ 
                    valor: String(valorAtual), 
                    variacao: variacaoDisplay,
                    mesesComVendasAnoAtual: fidelizacaoData.mesesComVendasAnoAtual || []
                });
            }

            if (estoqueVendas && estoqueVendas.labels) {
                const chartData = {
                    labels: estoqueVendas.labels,
                    datasets: [
                        { label: 'Vendas', data: estoqueVendas.vendas || [], backgroundColor: '#864176', borderRadius: 6, barPercentage: 0.78, categoryPercentage: 0.25, barThickness: 14, maxBarThickness: 18 },
                        { label: 'Estoque', data: estoqueVendas.estoque || [], backgroundColor: '#B08AAA', borderRadius: 6, barPercentage: 0.78, categoryPercentage: 0.25, barThickness: 14, maxBarThickness: 18 }
                    ]
                };
                setEstoqueVendasData(chartData);
                if (estoqueVendas.meta) setEstoqueMeta(estoqueVendas.meta);
            } else {
                console.warn('[DASHBOARD UI] estoqueVendas sem labels:', estoqueVendas);
            }

            if (categoriasTop3 && categoriasTop3.labels) {
                setCategoriasData({
                    labels: categoriasTop3.labels,
                    datasets: [
                        { label: 'Categoria campeã por mês', data: categoriasTop3.values || [], backgroundColor: categoriasTop3.colors || [], borderRadius: 6, barPercentage: 0.7, categoryPercentage: 0.8 }
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
            const estoqueVendas = await DashboardService.getStockSalesRelation({ page: page || 1, pageSize: estoqueMeta.pageSize || 4, order: 'desc' });
            if (estoqueVendas && estoqueVendas.labels) {
                setEstoqueVendasData({
                    labels: estoqueVendas.labels,
                    datasets: [
                        { label: 'Vendas', data: estoqueVendas.vendas || [], backgroundColor: '#864176', borderRadius: 6, barPercentage: 0.78, categoryPercentage: 0.25, barThickness: 14, maxBarThickness: 18 },
                        { label: 'Estoque', data: estoqueVendas.estoque || [], backgroundColor: '#B08AAA', borderRadius: 6, barPercentage: 0.78, categoryPercentage: 0.25, barThickness: 14, maxBarThickness: 18 }
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
                        explicacao="Quanto seus clientes gastam, em média, por compra. A variação mostra se esse valor aumentou ou diminuiu em relação ao período anterior."
                        filtroTemporal={
                            <FiltroTemporal
                                opcoes={[
                                    { valor: 7, label: '7d', descricao: 'Últimos 7 dias' },
                                    { valor: 30, label: '30d', descricao: 'Últimos 30 dias' },
                                    { valor: 90, label: '90d', descricao: 'Últimos 90 dias' }
                                ]}
                                valorSelecionado={filtroTicket}
                                onChange={setFiltroTicket}
                                tamanho="pequeno"
                            />
                        }
                    />
                    <KpiCard
                        titulo="Índice Sazional de Vendas"
                        valor={indiceSazional.status}
                        variacao={indiceSazional.variacao}
                        explicacao="Compara vendas entre duas estações usando os mesmos dias corridos para análise justa."
                        filtroTemporal={
                            indiceSazional.estacaoAnteriorPadrao && (
                                <div>
                                    <FiltroTemporal
                                        opcoes={(() => {
                                            const estacaoAtualOrdem = ['verao', 'outono', 'inverno', 'primavera'].indexOf(indiceSazional.estacaoAtualCodigo);
                                            const estacoes = ['Verão', 'Outono', 'Inverno', 'Primavera'];
                                            
                                            return [1, 2, 3].map(valor => {
                                                const ordemAnterior = (estacaoAtualOrdem - valor + 4) % 4;
                                                const nomeEstacao = estacoes[ordemAnterior];
                                                return {
                                                    valor,
                                                    label: nomeEstacao,
                                                    descricao: `${valor} estação atrás`
                                                };
                                            });
                                        })()}
                                        valorSelecionado={filtroSazionalBasico}
                                        onChange={(valor) => {
                                            setFiltroSazionalBasico(valor);
                                            // Calcular qual estação é baseado no valor
                                            const estacaoAtualOrdem = ['verao', 'outono', 'inverno', 'primavera'].indexOf(indiceSazional.estacaoAtualCodigo);
                                            const ordemAnterior = (estacaoAtualOrdem - valor + 4) % 4;
                                            const estacaoCodigo = ['verao', 'outono', 'inverno', 'primavera'][ordemAnterior];
                                            
                                            setFiltroEstacao1(indiceSazional.estacaoAtualCodigo);
                                            setFiltroAno1(indiceSazional.anoAtual);
                                            setFiltroEstacao2(estacaoCodigo);
                                            // Calcular ano da estação anterior
                                            let anoAnterior = indiceSazional.anoAtual;
                                            if (valor >= estacaoAtualOrdem + 1) {
                                                anoAnterior = indiceSazional.anoAtual - 1;
                                            }
                                            setFiltroAno2(anoAnterior);
                                        }}
                                        tamanho="pequeno"
                                    />
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                                        {(() => {
                                            const estacaoAtualOrdem = ['verao', 'outono', 'inverno', 'primavera'].indexOf(indiceSazional.estacaoAtualCodigo);
                                            const ordemAnterior = (estacaoAtualOrdem - filtroSazionalBasico + 4) % 4;
                                            const estacoes = ['Verão', 'Outono', 'Inverno', 'Primavera'];
                                            return `Comparando ${indiceSazional.estacaoAtual} com ${estacoes[ordemAnterior]}`;
                                        })()}
                                    </div>
                                </div>
                            )
                        }
                    />
                    <KpiCard
                        titulo="Clientes fidelizados"
                        valor={fidelizacao.valor}
                        variacao={fidelizacao.variacao}
                        explicacao="Mostra quantos clientes fidelizados temos HOJE (últimos 12 meses). A variação compara com quantos tínhamos há X meses atrás (também considerando 12 meses naquele período)."
                        filtroTemporal={
                            <FiltroTemporal
                                opcoes={[
                                    { valor: 24, label: '24m', descricao: 'Comparar com há 24 meses' },
                                    { valor: 36, label: '36m', descricao: 'Comparar com há 36 meses' },
                                    { valor: 48, label: '48m', descricao: 'Comparar com há 48 meses' }
                                ]}
                                valorSelecionado={filtroFidelizacao}
                                onChange={setFiltroFidelizacao}
                                tamanho="pequeno"
                            />
                        }
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
                                titulo="Produtos em Risco de Ruptura (Risco = Vendas médias / Estoque atual)"
                                tipo="bar"
                                dados={estoqueVendasData}
                                explicacao="Identifica produtos com alta demanda em relação ao estoque atual. Produtos no topo vendem rápido e precisam de reposição urgente para evitar ruptura."
                                opcoes={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'nearest', intersect: false },
                                    datasets: {
                                        bar: {
                                            barPercentage: 0.78,
                                            categoryPercentage: 0.25,
                                            barThickness: 14,
                                            maxBarThickness: 18
                                        }
                                    },
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
                            filtroTemporal={
                                <FiltroTemporal
                                    opcoes={[
                                        { valor: 1, label: '1m', descricao: 'Último mês' },
                                        { valor: 3, label: '3m', descricao: 'Últimos 3 meses' },
                                        { valor: 6, label: '6m', descricao: 'Últimos 6 meses' }
                                    ]}
                                    valorSelecionado={filtroCategorias}
                                    onChange={setFiltroCategorias}
                                    tamanho="pequeno"
                                />
                            }
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
