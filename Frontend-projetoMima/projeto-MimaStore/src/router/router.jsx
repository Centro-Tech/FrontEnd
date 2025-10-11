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
import MudarSenha from '../Telas/MudarSenha.jsx';
import { GestaoFornecedor } from '../Telas/GestaoFornecedor.jsx';
import { GestaoFuncionarios } from '../Telas/GestaoFuncionarios.jsx';
import { GestaoClientes } from '../Telas/GestaoClientes.jsx';
// import { Configuracao } from '../Telas/Configuracao.jsx';

export function AppRouter() {
  return (
    <Routes>
      {/* Rota raiz redireciona para splash */}
      <Route path="/" element={<Navigate to="/splash" replace />} />
      
      {/* Rotas de Autenticação */}
      <Route path="/splash" element={<Splashscreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      <Route path="/mudar-senha" element={<MudarSenha />} />
      
      {/* Rota do menu principal */}
      <Route path="/menu-inicial" element={<MenuInicial />} />
      
      {/* Rotas de Vendas */}
      <Route path="/realizar-venda" element={<RealizarVenda />} />
      <Route path="/historico-vendas" element={<HistoricoVendas />} />
      
      {/* Rotas de Estoque */}
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/cadastrar-vestuario" element={<CadastroNovoVestuario />} />
      <Route path="/cadastrar-vestuario-existente" element={<ReporVestuario />} />
      <Route path="/cadastrar-atributos" element={<CadastrarAtributo />} />

      {/* Rotas de Pessoas - Cadastro */}
      <Route path="/cadastrar-funcionarios" element={<CadastroFuncionario />} />
      <Route path="/cadastrar-fornecedor" element={<CadastrarFornecedor />} />
      


      {/* Rotas de Gestão */}
      <Route path="/gestao-fornecedores" element={<GestaoFornecedor />} />
      <Route path="/gestao-funcionarios" element={<GestaoFuncionarios />} />
      <Route path="/gestao-clientes" element={<GestaoClientes />} />

      {/* Rota catch-all para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
