import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/Dashboard.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalVendidoHoje, setTotalVendidoHoje] = useState(0);
  const [quantidadeVendasHoje, setQuantidadeVendasHoje] = useState(0);
  const [clientesQueCompraram, setClientesQueCompraram] = useState(0);
  const [loading, setLoading] = useState(false);

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
            <div className={styles['placeholder-title']}>Aumento ou redução das vendas do mês</div>
            <div className={styles['placeholder-box']}>[Gráfico aqui]</div>
          </div>

          <div className={styles['placeholder-card']}>
            <div className={styles['placeholder-title']}>Tendência de faturamento ao longo dos meses</div>
            <div className={styles['placeholder-box']}>[Gráfico aqui]</div>
          </div>

          <div className={styles['placeholder-card']}>
            <div className={styles['placeholder-title']}>Tendência de vendas ao longo dos meses</div>
            <div className={styles['placeholder-box']}>[Gráfico aqui]</div>
          </div>
        </div>

        {loading && <div className={styles['loading-inline']}>Carregando dados do dashboard...</div>}
      </div>
    </div>
  );
}
