import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/Dashboard.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
// import Chart from 'chart.js/auto';

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalVendidoHoje, setTotalVendidoHoje] = useState(0);
  const [quantidadeVendasHoje, setQuantidadeVendasHoje] = useState(0);
  const [clientesQueCompraram, setClientesQueCompraram] = useState(0);
  const [loading, setLoading] = useState(false);
  const vendasTrendCanvas = useRef(null);
  const vendasChartRef = useRef(null);

  const voltarAoMenu = () => navigate('/menu-inicial');

  // Função que aciona o dashboardRouter (backend)
  const acionarDashboardRouter = async () => {
    setLoading(true);
    try {
      // Total vendido hoje (conforme seu controller Java)
      const resTotal = await API.get('/api/vendas/total-hoje');
      const total = resTotal?.data?.totalVendidoHoje ?? resTotal?.data?.total ?? 0;
      setTotalVendidoHoje(total);

      // Outros KPIs: se existirem endpoints, podemos chamá-los aqui. Por ora usamos placeholders
      // Ex.: API.get('/api/vendas/quantidade-hoje') etc.
      // Tentativa silenciosa para outros endpoints (fallback para 0)
      // Tentativa tolerante para buscar quantidade de vendas hoje
      try {
        const r2 = await API.get('/api/vendas/quantidade-hoje');
        // Aceita várias chaves de resposta comuns para ser compatível com diferentes backends
        const qtd = r2?.data?.quantidade ?? r2?.data?.quantidadeVendasHoje ?? r2?.data?.total ?? 0;
        setQuantidadeVendasHoje(Number(qtd) || 0);
      } catch (e) {
        setQuantidadeVendasHoje(0);
      }

      // Clientes que compraram (novo KPI): tenta vários endpoints comuns e aceita chaves como 'clientesUltimoMes'
      try {
        // tenta o endpoint que você mostrou: /clientes-ultimo-mes (possivelmente montado sob /api/vendas)
        let r3;
        const tryList = ['/api/vendas/clientes-ultimo-mes', '/clientes-ultimo-mes', '/api/vendas/clientes-que-compraram'];
        for (const ep of tryList) {
          try {
            r3 = await API.get(ep);
            if (r3 && r3.data) break;
          } catch (e) {
            r3 = null;
          }
        }

        const clientesQtd = r3?.data?.clientesUltimoMes ?? r3?.data?.quantidadeClientes ?? r3?.data?.clientesQueCompraram ?? r3?.data?.total ?? r3?.data?.count ?? 0;
        setClientesQueCompraram(Number(clientesQtd) || 0);
      } catch (e) {
        // fallback para 0 caso o endpoint não exista ainda
        setClientesQueCompraram(0);
      }
    } catch (err) {
      // falha silenciosa: mantém KPIs em 0 quando o backend não responde
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    acionarDashboardRouter();

    // Função para buscar dados de vendas dos últimos 12 meses e renderizar Chart.js
    const fetchVendas12Meses = async () => {
      try {
        const res = await API.get('/api/vendas/vendas-ultimos-12-meses');
        const payload = res?.data;

        // Possíveis formatos: { labels: [...], data: [...] } ou array [{month: '2025-01', total: 123}, ...]
        let labels = [];
        let data = [];

        if (payload) {
          if (Array.isArray(payload)) {
            // array of objects
            payload.forEach((item) => {
              // aceita várias chaves possíveis do backend (ex.: 'mes' / 'month' e 'totalVendas' / 'total')
              const label = item.month ?? item.mes ?? item.label ?? item.name ?? item.monthName;
              const value =
                item.totalVendas ??
                item.total_vendas ??
                item.total ??
                item.value ??
                item.vendas ??
                item.totalVendasCount ??
                0;
              labels.push(label);
              data.push(Number(value) || 0);
            });
          } else if (payload.labels && payload.data) {
            labels = payload.labels;
            data = payload.data.map((v) => Number(v) || 0);
          } else {
            // try to extract object with months keys
            const possible = payload;
            // if payload has month->value map
            if (typeof possible === 'object') {
              const keys = Object.keys(possible);
              // filter out metadata keys
              if (keys.length > 0) {
                keys.forEach((k) => {
                  labels.push(k);
                  data.push(Number(possible[k]) || 0);
                });
              }
            }
          }
        }

        // Destroy previous chart if exists
        if (vendasChartRef.current) {
          vendasChartRef.current.destroy();
          vendasChartRef.current = null;
        }

        const ctx = vendasTrendCanvas.current?.getContext('2d');
        if (!ctx) return;

        // try to register datalabels plugin dynamically (optional)
        try {
          // const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;
          Chart.register(ChartDataLabels);
        } catch (e) {
          // plugin not installed; proceed without data labels
        }

        vendasChartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Vendas (últimos 12 meses)',
                data,
                borderColor: '#875C6A',
                backgroundColor: 'rgba(135,92,106,0.35)',
                pointBackgroundColor: '#875C6A',
                pointBorderColor: '#ffffff',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  // show filled color box
                  usePointStyle: false,
                },
              },
              datalabels: {
                display: true,
                align: 'top',
                anchor: 'end',
                formatter: (value) => value,
                color: '#3b3b3b',
                font: { size: 10 },
              },
            },
            scales: {
              x: { display: true },
              y: { display: true, beginAtZero: true },
            },
          },
        });
      } catch (e) {
        // silently ignore; chart will not render
      }
    };

    fetchVendas12Meses();

    return () => {
      if (vendasChartRef.current) {
        vendasChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      <Navbar />
      <FaixaVoltar aoClicar={voltarAoMenu} />

      <div className={styles['dashboard-container']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '90%', justifyContent: 'space-between' }}>
          <h1 className={styles['titulo']}>Dashboard</h1>
        </div>

        <div className={styles['kpis-row']}>
          <div className={styles['kpi-card']}>
            <div className={styles['kpi-label']}>Valor Total vendido Hoje</div>
            <div className={styles['kpi-value']}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(totalVendidoHoje) || 0)}</div>
          </div>

          <div className={styles['kpi-card']}>
            <div className={styles['kpi-label']}>Quantidade de vendas feitas hoje</div>
            <div className={styles['kpi-value']}>{quantidadeVendasHoje}</div>
          </div>

          <div className={styles['kpi-card']}>
            <div className={styles['kpi-label']}>Quantidade de clientes que compraram no último mês</div>
            <div className={styles['kpi-value']}>{clientesQueCompraram}</div>
          </div>
        </div>

        <div className={styles['cards-row']}>
          <div className={styles['placeholder-card']}>
            <div className={styles['placeholder-title']}>Itens mais vendidos do mês</div>
            <div className={styles['placeholder-box']}>[Gráfico aqui]</div>
          </div>

          <div className={styles['placeholder-card']}>
            <div className={styles['placeholder-title']}>Tendência de faturamento ao longo dos meses</div>
            <div className={styles['placeholder-box']}>[Gráfico aqui]</div>
          </div>

          <div className={styles['placeholder-card']}>
            <div className={styles['placeholder-title']}>Histórico de vendas ao longo dos meses</div>
            <div className={styles['placeholder-box']} style={{ height: '260px' }}>
              <canvas ref={vendasTrendCanvas} />
            </div>
          </div>
        </div>

        {loading && <div className={styles['loading-inline']}>Carregando dados do dashboard...</div>}
      </div>
    </div>
  );
}
