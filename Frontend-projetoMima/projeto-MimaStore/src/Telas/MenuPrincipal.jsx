import { useNavigate } from 'react-router-dom';
import { BotaoEscuro } from '../Componentes/BotaoEscuro';
import { BotaoClaro } from '../Componentes/BotaoClaro';
import styles from '../Componentes/Componentes - CSS/MenuPrincipal.module.css';

export function MenuPrincipal() {
    const navigate = useNavigate();
    
    const handleRealizarVenda = () => {
        navigate('/realizar-venda');
    };

    const handleVisualizarEstoque = () => {
        navigate('/estoque');
    };

    const handleHistoricoVendas = () => {
        navigate('/historico-vendas');
    };

    const handleCadastrarFornecedor = () => {
        navigate('/cadastrar-fornecedor');
    };

    const handleCadastrarFuncionarios = () => {
        navigate('/cadastrar-funcionarios');
    };

     const handleCadastrarAtributos = () => {
        navigate('/cadastrar-atributos');
    };

     const handleCadastrarNovoVestuario = () => {
        navigate('/cadastrar-vestuario');
    };

    const handleDeletarFuncionario = () => {
        navigate('/deletar-funcionario');
    };

    const handleDeletarFornecedor = () => {
        navigate('/deletar-fornecedor');
    };

    const handleDeletarCliente = () => {
        navigate('/deletar-cliente');
    };

    const handleGestaoFornecedores = () => {
        navigate('/gestao-fornecedores');
    };

    const handleDashboard = () => {
        navigate('/dashboard-simples');
    };

    const handleGestaoFuncionarios = () => {
        navigate('/gestao-funcionarios');
    };

    const handleGestaoClientes = () => {
        navigate('/gestao-clientes');
    };


    return (
        <div className={styles.menuPrincipal}>
            <div className={styles.container}>
                <h1 className={styles.titulo}>Menu Principal</h1>
                
                <div className={styles.secoes}>
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Estoque" />                      <BotaoClaro texto="Visualizar Estoque" onClick={handleVisualizarEstoque} />
                        <BotaoClaro texto="Cadastrar Novas Peças" onClick={handleCadastrarNovoVestuario}/>
                        <BotaoClaro texto="Cadastrar Atributos" onClick={handleCadastrarAtributos}/>
                    </div>
                    
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Vendas" />
                        <BotaoClaro texto="Realizar Venda" onClick={handleRealizarVenda} />
                        <BotaoClaro texto="Histórico de vendas" onClick={handleHistoricoVendas} />
                        <BotaoClaro texto="Dashboard" onClick={handleDashboard} />
                    </div>
               
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Pessoas" />
                        <BotaoClaro texto="Gestão de Fornecedores" onClick={handleGestaoFornecedores}/>
                        <BotaoClaro texto="Gestão de Funcionários" onClick={handleGestaoFuncionarios}/>
                        <BotaoClaro texto="Gestão de Clientes" onClick={handleGestaoClientes}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
