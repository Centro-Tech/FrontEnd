import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuInicial } from '../Telas/MenuInicial.jsx';
import { RealizarVenda } from '../Telas/RealizarVenda.jsx';
import Splashscreen from "../Telas/Splashscreen.jsx";
import Estoque from '../Componentes/Estoque.jsx';
import HistoricoVendas from '../Componentes/HistoricoVendas.jsx';

import { CadastroFuncionario } from '../Telas/Cadastro.jsx';
import { CadastrarAtributo } from '../Telas/CadastrarAtributos.jsx';
import { CadastrarFornecedor } from '../Telas/CadastrarFornecedor.jsx';
import { CadastroNovoVestuario } from '../Telas/CadastrarNovoVestuario.jsx';
import { ReporVestuario } from '../Telas/ReporVestuario.jsx';
import PrimeiroAcesso from '../Telas/PrimeiroAcesso.jsx';
import  Login  from '../Telas/Login.jsx';


export function AppRouter() {
  return (
     <Routes>
      {/* Rota raiz redireciona para splash */}
      <Route path="/" element={<Navigate to="/splash" replace />} />
      
      <Route path="/PrimeiroAcesso" element={<PrimeiroAcesso />} />
      <Route path="/login" element={<Login />} />
      
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
