import { useState } from 'react';
import './Componentes - CSS/App.css';
import { MenuInicial } from './MenuInicial.jsx';
import { RealizarVenda } from './RealizarVenda.jsx';

export function App() {
  const [telaAtiva, setTelaAtiva] = useState('menu-inicial');

  const navegarPara = (tela) => {
    setTelaAtiva(tela);
  };

  const voltarAoMenu = () => {
    setTelaAtiva('menu-inicial');
  };

  const renderizarTela = () => {
    switch(telaAtiva) {
      case 'realizar-venda':
        return <RealizarVenda aoVoltar={voltarAoMenu} />;
      case 'menu-inicial':
      default:
        return <MenuInicial aoNavegar={navegarPara} />;
    }
  };

  return renderizarTela();
}