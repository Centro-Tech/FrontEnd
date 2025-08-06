import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuInicial } from './MenuInicial.jsx';
import { RealizarVenda } from './RealizarVenda.jsx';
import Splashscreen from "./Splashscreen.jsx";
import Estoque from './VisualizarEstoque/Estoque.jsx';
import HistoricoVendas from './HistoricoVendas/HistoricoVendas.jsx';

export function AppRouter() {
  return (
    <Routes>
      {/* Rota raiz redireciona para splash */}
      <Route path="/" element={<Navigate to="/splash" replace />} />
      
      {/* Rota da tela inicial/splash */}
      <Route path="/splash" element={<Splashscreen />} />
      
      {/* Rota do menu principal */}
      <Route path="/menu-inicial" element={<MenuInicial />} />
      
      {/* Rota para realizar venda */}
      <Route path="/realizar-venda" element={<RealizarVenda />} />
      
      {/* Rota para visualizar estoque */}
      <Route path="/estoque" element={<Estoque />} />
      
      {/* Rota para histórico de vendas */}
      <Route path="/historico-vendas" element={<HistoricoVendas />} />
      
      {/* Rota catch-all para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
