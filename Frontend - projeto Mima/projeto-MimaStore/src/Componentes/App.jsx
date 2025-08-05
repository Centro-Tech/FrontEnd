import { useState } from 'react';
import './Componentes - CSS/App.css';
import { MenuInicial } from './MenuInicial.jsx';
import { RealizarVenda } from './RealizarVenda.jsx';
import Splashscreen from "./splashscreen.jsx";

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
      case 'splash':
        return <Splashscreen />;
      case 'realizar-venda':
        return <RealizarVenda aoVoltar={voltarAoMenu} />;
      case 'menu-inicial':
      default:
        return <MenuInicial aoNavegar={navegarPara} />;
    }
  };

  return renderizarTela();
}


//  Só p ver minha tela de splashscreen funcionando

  // const renderizarTela = () => {
  //   switch(telaAtiva) {
  //     case 'realizar-venda':
  //       return <RealizarVenda aoVoltar={voltarAoMenu} />;
  //     case 'menu-inicial':
  //     default:
  //       return <MenuInicial aoNavegar={navegarPara} />;
  //   }
  // };



  // export function App() {
//   const [telaAtiva, setTelaAtiva] = useState('splash'); // Altere para 'splash'

//   const navegarPara = (tela) => {
//     setTelaAtiva(tela);
//   };

//   const voltarAoMenu = () => {
//     setTelaAtiva('menu-inicial');
//   };
