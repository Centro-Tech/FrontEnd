import './Componentes - CSS/App.css';
<<<<<<< HEAD
import { AppRouter } from './router.jsx';

export function App() {
  return <AppRouter />;
=======
import { MenuInicial } from './MenuInicial.jsx';
import { RealizarVenda } from './RealizarVenda.jsx';
import Splashscreen from './splashscreen.jsx';
import Estoque from './VisualizarEstoque/Estoque.jsx';
import HistoricoVendas from './HistoricoVendas/HistoricoVendas.jsx';

export function App() {
  const [telaAtiva, setTelaAtiva] = useState('menu-inicial');

  const navegarPara = (tela) => {
    setTelaAtiva(tela);
  };

  const voltarAoMenu = () => {
    setTelaAtiva('menu-inicial');
  };

  const renderizarTela = () => {
    switch (telaAtiva) {
      case 'splash':
        return <Splashscreen />;
      case 'realizar-venda':
        return <RealizarVenda aoVoltar={voltarAoMenu} />;
      case 'estoque':
        return <Estoque aoVoltar={voltarAoMenu} />;
      case 'historico-vendas':
        return <HistoricoVendas aoVoltar={voltarAoMenu} />;
      case 'menu-inicial':
      default:
        return <MenuInicial aoNavegar={navegarPara} />;
    }
  };

  return renderizarTela();
>>>>>>> 78bd415c933aa11c6dc49a487f95aee510e9b2e0
}
