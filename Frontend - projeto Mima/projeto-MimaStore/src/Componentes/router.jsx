import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuInicial } from './MenuInicial.jsx';
import { RealizarVenda } from './RealizarVenda.jsx';
import Splashscreen from "./Splashscreen.jsx";
import Estoque from './VisualizarEstoque/Estoque.jsx';
import HistoricoVendas from './HistoricoVendas/HistoricoVendas.jsx';

import { CadastroFuncionario } from './Cadastro.jsx';
import { CadastrarAtributo } from './CadastrarAtributos.jsx';
import { CadastrarFornecedor } from './CadastrarFornecedor.jsx';
import { CadastroNovoVestuario } from './CadastrarNovoVestuario.jsx';
import { ReporVestuario } from './ReporVestuario.jsx';


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

      {/* Novas rotas adicionadas */}
      <Route path="/cadastrar-fornecedor" element={<CadastrarFornecedor />} />
      <Route path="/cadastrar-funcionarios" element={<CadastroFuncionario />} />
      <Route path="/cadastrar-atributos" element={<CadastrarAtributo />} />
      <Route path="/cadastrar-vestuario" element={<CadastroNovoVestuario />} />
      <Route path="/cadastrar-vestuario-existente" element={<ReporVestuario />} />

      {/* Rota catch-all para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
  
    </Routes>
  );
}
