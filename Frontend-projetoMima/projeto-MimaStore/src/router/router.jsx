import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Provider/AuthProvider';
import { MenuInicial } from '../Telas/MenuInicial.jsx';
import { RealizarVenda } from '../Telas/RealizarVenda.jsx';
import Splashscreen from "../Telas/Splashscreen.jsx";
import Estoque from '../Componentes/Estoque.jsx';
import HistoricoVendas from '../Componentes/HistoricoVendasFixed.jsx';

import { CadastroFuncionario } from '../Telas/Cadastro.jsx';
import { CadastrarAtributo } from '../Telas/CadastrarAtributos.jsx';
import { CadastrarFornecedor } from '../Telas/CadastrarFornecedor.jsx';
import { CadastroNovoVestuario } from '../Telas/CadastrarNovoVestuario.jsx';
import PrimeiroAcesso from '../Telas/PrimeiroAcesso.jsx';
import  Login  from '../Telas/Login.jsx';
import MudarSenha from '../Telas/MudarSenha.jsx';
import { GestaoFornecedor } from '../Telas/GestaoFornecedor.jsx';
import Dashboard from '../Telas/Dashboard.jsx';
import DashboardSimples from '../Telas/DashboardSimples.jsx';
import DashboardCompleto from '../Telas/DashboardCompleto.jsx';
import { GestaoFuncionarios } from '../Telas/GestaoFuncionarios.jsx';
import { GestaoClientes } from '../Telas/GestaoClientes.jsx';
import Configuracao from '../Telas/Configuracao.jsx';

export function AppRouter() {
  // Componente simples para proteger rotas que exigem autenticação
  const RequireAuth = ({ children }) => {
    const { token } = useContext(AuthContext);
    const location = useLocation();
    if (!token) {
      // salva onde o usuário queria ir para redirecionar após login
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Rota raiz redireciona para splash */}
      <Route path="/" element={<Navigate to="/splash" replace />} />
      
      {/* Rotas de Autenticação */}
      <Route path="/splash" element={<Splashscreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      <Route path="/mudar-senha" element={<MudarSenha />} />
      
      {/* Rotas protegidas (exigem login) */}
      <Route path="/menu-inicial" element={<RequireAuth><MenuInicial /></RequireAuth>} />

      {/* Rotas de Vendas */}
      <Route path="/realizar-venda" element={<RequireAuth><RealizarVenda /></RequireAuth>} />
      <Route path="/historico-vendas" element={<RequireAuth><HistoricoVendas /></RequireAuth>} />

      {/* Rotas de Estoque */}
      <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
      <Route path="/cadastrar-vestuario" element={<RequireAuth><CadastroNovoVestuario /></RequireAuth>} />
      <Route path="/cadastrar-atributos" element={<RequireAuth><CadastrarAtributo /></RequireAuth>} />

      {/* Rotas de Pessoas - Cadastro */}
      <Route path="/cadastrar-funcionarios" element={<RequireAuth><CadastroFuncionario /></RequireAuth>} />
      <Route path="/cadastrar-fornecedor" element={<RequireAuth><CadastrarFornecedor /></RequireAuth>} />
      


      {/* Rotas de Gestão */}
  <Route path="/gestao-fornecedores" element={<RequireAuth><GestaoFornecedor /></RequireAuth>} />
  <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
  <Route path="/dashboard-simples" element={<RequireAuth><DashboardSimples /></RequireAuth>} />
  <Route path="/dashboard-completo" element={<RequireAuth><DashboardCompleto /></RequireAuth>} />
    <Route path="/configuracao" element={<RequireAuth><Configuracao /></RequireAuth>} />
      <Route path="/gestao-funcionarios" element={<RequireAuth><GestaoFuncionarios /></RequireAuth>} />
      <Route path="/gestao-clientes" element={<RequireAuth><GestaoClientes /></RequireAuth>} />

      {/* Rota catch-all para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
