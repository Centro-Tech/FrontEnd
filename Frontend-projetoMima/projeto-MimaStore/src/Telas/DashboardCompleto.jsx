import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/DashboardCompleto.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { KpiCard } from '../Componentes/KpiCard';
import { ChartCard } from '../Componentes/ChartCard';
import FiltroSazional from '../Componentes/FiltroSazional';
import FiltroAvancado from '../Componentes/FiltroAvancado';
import FiltroCalendario from '../Componentes/FiltroCalendario';
import DashboardService from '../Provider/DashboardService';

export default function DashboardCompleto() {
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
    const [clientesEvolucaoData, setClientesEvolucaoData] = useState(null);
    const [clientesEvolucaoMeta, setClientesEvolucaoMeta] = useState(null);
    const [tendenciaFaturamentoData, setTendenciaFaturamentoData] = useState(null);
    const [tendenciaVendasData, setTendenciaVendasData] = useState(null);
    
    // Filtros Avançados (sempre ativos no Dashboard Completo)
    const mesAtualInicial = new Date().getMonth(); // 0-11, mês anterior ao atual
    const hoje = new Date();
    const primeiroDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    
    const [ticketMesAvancado, setTicketMesAvancado] = useState(mesAtualInicial === 0 ? 12 : mesAtualInicial);
    const [ticketAnoAvancado, setTicketAnoAvancado] = useState(mesAtualInicial === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());
    const [ticketDataInicio, setTicketDataInicio] = useState(primeiroDiaMesAnterior.toISOString().split('T')[0]);
    const [ticketDataFim, setTicketDataFim] = useState(hoje.toISOString().split('T')[0]);
    
    const [fidelizacaoMesAvancado, setFidelizacaoMesAvancado] = useState(mesAtualInicial === 0 ? 12 : mesAtualInicial);
    const [fidelizacaoAnoAvancado, setFidelizacaoAnoAvancado] = useState(mesAtualInicial === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());
    const [fidelizacaoDataInicio, setFidelizacaoDataInicio] = useState(primeiroDiaMesAnterior.toISOString().split('T')[0]);
    const [fidelizacaoDataFim, setFidelizacaoDataFim] = useState(hoje.toISOString().split('T')[0]);
    
    // Dias com vendas para o calendário
    const [diasComVendasTicket, setDiasComVendasTicket] = useState([]);
    const [diasComVendasFidelizacao, setDiasComVendasFidelizacao] = useState([]);
    
    // Filtros Sazionais
    const [filtroEstacao1, setFiltroEstacao1] = useState(null);
    const [filtroAno1, setFiltroAno1] = useState(null);
    const [filtroEstacao2, setFiltroEstacao2] = useState(null);
    const [filtroAno2, setFiltroAno2] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, [
        ticketMesAvancado, ticketAnoAvancado, ticketDataInicio, ticketDataFim,
        fidelizacaoMesAvancado, fidelizacaoAnoAvancado, fidelizacaoDataInicio, fidelizacaoDataFim,
        filtroEstacao1, filtroAno1, filtroEstacao2, filtroAno2
    ]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Dashboard Completo sempre usa filtros avançados com intervalo
            const ticketParam = { 
                mes: ticketMesAvancado, 
                ano: ticketAnoAvancado,
                dataInicio: ticketDataInicio,
                dataFim: ticketDataFim
            };
            const fidelizacaoParam = { 
                mes: fidelizacaoMesAvancado, 
                ano: fidelizacaoAnoAvancado,
                dataInicio: fidelizacaoDataInicio,
                dataFim: fidelizacaoDataFim
            };

            const [ticketMedioData, sazionalData, fidelizacaoData, clientesEvolucao, tendenciaFaturamento, tendenciaVendas] = await Promise.all([
                DashboardService.getAverageTicket(ticketParam),
                DashboardService.getSeasonalIndex(filtroEstacao1, filtroAno1, filtroEstacao2, filtroAno2),
                DashboardService.getLoyalCustomersStats(fidelizacaoParam),
                DashboardService.getCustomersEvolution(),
                DashboardService.getRevenueTrend(),
                DashboardService.getSalesTrend()
            ]);

            // Set KPIs
            if (ticketMedioData) {
                setTicketMedio({
                    valor: ticketMedioData.valor || 'R$ 0,00',
                    variacao: ticketMedioData.variacao || 0,
                    mesesComVendasAnoAtual: ticketMedioData.mesesComVendasAnoAtual || []
                });
                if (ticketMedioData.diasComVendas) {
                    setDiasComVendasTicket(ticketMedioData.diasComVendas);
                }
            }

            if (sazionalData) {
                setIndiceSazional({
                    status: sazionalData.status || 'Média',
                    variacao: sazionalData.variacao || 0,
                    estacaoAtual: sazionalData.estacaoAtual || '-',
                    estacaoAtualCodigo: sazionalData.estacaoAtualCodigo || '',
                    anoAtual: sazionalData.anoAtual || new Date().getFullYear(),
                    estacaoAnteriorPadrao: sazionalData.estacaoAnteriorPadrao || '',
                    anoAnteriorPadrao: sazionalData.anoAnteriorPadrao || (new Date().getFullYear() - 1),
                    estacoesComVendasAnoAtual: sazionalData.estacoesComVendasAnoAtual || []
                });
                
                // Atualizar filtros com os valores padrão se ainda não foram definidos
                if (filtroEstacao1 === null) setFiltroEstacao1(sazionalData.estacao1Selecionada);
                if (filtroAno1 === null) setFiltroAno1(sazionalData.ano1Selecionado);
                if (filtroEstacao2 === null) setFiltroEstacao2(sazionalData.estacao2Selecionada);
                if (filtroAno2 === null) setFiltroAno2(sazionalData.ano2Selecionado);
            }

            if (fidelizacaoData) {
                // Dashboard Completo sempre usa modo avançado
                // Mostrar quantidade do período selecionado, variação comparada com hoje
                let valorDisplay, variacaoDisplay;
                
                const valorPeriodoSelecionado = Number(fidelizacaoData.startOfMonthCount || 0);
                const valorAtual = Number(fidelizacaoData.currentCount || 0);
                
                valorDisplay = String(valorPeriodoSelecionado);
                
                // Variação: quanto mudou do período selecionado até hoje
                if (valorPeriodoSelecionado > 0) {
                    const variacao = ((valorAtual - valorPeriodoSelecionado) / valorPeriodoSelecionado) * 100;
                    variacaoDisplay = Math.round(variacao);
                } else {
                    variacaoDisplay = `+${valorAtual} clientes`;
                }
                
                setFidelizacao({ 
                    valor: valorDisplay, 
                    variacao: variacaoDisplay,
                    mesesComVendasAnoAtual: fidelizacaoData.mesesComVendasAnoAtual || []
                });
                if (fidelizacaoData.diasComVendas) {
                    setDiasComVendasFidelizacao(fidelizacaoData.diasComVendas);
                }
            }

            // Chart 1 - Clientes únicos por mês + previsão
            if (clientesEvolucao && clientesEvolucao.labels) {
                const labels = clientesEvolucao.labels;
                const hist = clientesEvolucao.historico || [];
                const prev = clientesEvolucao.previsao || [];
                const datasets = [
                    {
                        type: 'bar',
                        label: 'Clientes únicos',
                        data: hist,
                        backgroundColor: '#6B3563',
                        borderRadius: 4,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8,
                        order: 1
                    }
                ];
                if ((prev?.length || 0) > 0) {
                    // Barras para previsão (somente nos 3 meses futuros)
                    datasets.push({
                        type: 'bar',
                        label: 'Clientes previstos',
                        data: prev,
                        backgroundColor: 'rgba(242, 201, 224, 0.7)',
                        borderRadius: 4,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8,
                        order: 1
                    });
                }
                setClientesEvolucaoData({ labels, datasets });
                setClientesEvolucaoMeta(clientesEvolucao.meta || null);
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
                            explicacao="Quanto seus clientes gastam, em média, por compra. A variação mostra se esse valor aumentou ou diminuiu comparando o período selecionado com o período anterior de mesma duração."
                            filtroTemporal={
                                <FiltroCalendario
                                    modoIntervalo={true}
                                    dataInicio={ticketDataInicio}
                                    dataFim={ticketDataFim}
                                    onDataInicioChange={setTicketDataInicio}
                                    onDataFimChange={setTicketDataFim}
                                    mesSelecionado={ticketMesAvancado}
                                    anoSelecionado={ticketAnoAvancado}
                                    onMesChange={setTicketMesAvancado}
                                    onAnoChange={setTicketAnoAvancado}
                                    diasComVendas={diasComVendasTicket}
                                />
                            }
                        />
                        <KpiCard
                            titulo="Índice Sazional de Vendas"
                            valor={indiceSazional.status}
                            variacao={indiceSazional.variacao}
                            explicacao="Compara vendas entre duas estações usando os mesmos dias corridos para análise justa."
                            filtroTemporal={
                                filtroEstacao1 && filtroEstacao2 && (
                                    <FiltroSazional
                                        estacaoAtual={indiceSazional.estacaoAtual}
                                        estacaoAtualCodigo={indiceSazional.estacaoAtualCodigo}
                                        anoAtual={indiceSazional.anoAtual}
                                        estacaoSelecionada1={filtroEstacao1}
                                        anoSelecionado1={filtroAno1}
                                        onEstacao1Change={setFiltroEstacao1}
                                        onAno1Change={setFiltroAno1}
                                        estacaoSelecionada2={filtroEstacao2}
                                        anoSelecionado2={filtroAno2}
                                        onEstacao2Change={setFiltroEstacao2}
                                        onAno2Change={setFiltroAno2}
                                        estacoesComVendasAnoAtual={indiceSazional.estacoesComVendasAnoAtual}
                                        opcoesEstacoes={[
                                            { valor: 'verao', label: 'Verão' },
                                            { valor: 'outono', label: 'Outono' },
                                            { valor: 'inverno', label: 'Inverno' },
                                            { valor: 'primavera', label: 'Primavera' }
                                        ]}
                                        opcoesAnos={[
                                            { valor: new Date().getFullYear(), label: String(new Date().getFullYear()) },
                                            { valor: new Date().getFullYear() - 1, label: String(new Date().getFullYear() - 1) },
                                            { valor: new Date().getFullYear() - 2, label: String(new Date().getFullYear() - 2) },
                                            { valor: new Date().getFullYear() - 3, label: String(new Date().getFullYear() - 3) }
                                        ]}
                                    />
                                )
                            }
                        />
                        <KpiCard
                            titulo="Clientes fidelizados"
                            valor={fidelizacao.valor}
                            variacao={fidelizacao.variacao}
                            explicacao="Total de clientes fidelizados no período selecionado (últimos 12 meses até a data final). A variação compara com o período anterior de mesma duração."
                            filtroTemporal={
                                <FiltroCalendario
                                    modoIntervalo={true}
                                    dataInicio={fidelizacaoDataInicio}
                                    dataFim={fidelizacaoDataFim}
                                    onDataInicioChange={setFidelizacaoDataInicio}
                                    onDataFimChange={setFidelizacaoDataFim}
                                    mesSelecionado={fidelizacaoMesAvancado}
                                    anoSelecionado={fidelizacaoAnoAvancado}
                                    onMesChange={setFidelizacaoMesAvancado}
                                    onAnoChange={setFidelizacaoAnoAvancado}
                                    diasComVendas={diasComVendasFidelizacao}
                                />
                            }
                        />
                    </div>

                    {/* Charts Grid - 3 columns layout */}
                    <div className={styles.chartsGrid}>
                        {clientesEvolucaoData && (
                            <div className={styles.chartCard}>
                                <ChartCard
                                    titulo="Volume de Clientes"
                                    tipo="bar"
                                    dados={clientesEvolucaoData}
                                    explicacao="Número de clientes únicos por mês (últimos 10 meses) e previsão para os próximos 3. Se a série for curta/ruidosa, a projeção é omitida."
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
                                    rodape={clientesEvolucaoMeta?.warn ? (
                                        <div style={{ fontFamily: 'Average Sans, sans-serif', fontSize: 12, color: '#864176' }}>
                                            Série curta/ruidosa (R² {clientesEvolucaoMeta?.r2}). Previsões não exibidas para evitar extrapolação incerta.
                                        </div>
                                    ) : null}
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
