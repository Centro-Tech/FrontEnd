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

     const handleReporVestuario = () => {
        navigate('/cadastrar-vestuario-existente');
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


    return (
        <div className={styles.menuPrincipal}>
            <div className={styles.container}>
                <h1 className={styles.titulo}>Menu Principal</h1>
                
                <div className={styles.secoes}>
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Estoque" />
                        <BotaoClaro texto="Visualizar Estoque" onClick={handleVisualizarEstoque} />
                        <BotaoClaro texto="Repor Estoque" onClick={handleReporVestuario}/>
                        <BotaoClaro texto="Cadastrar Novas Peças" onClick={handleCadastrarNovoVestuario}/>
                        <BotaoClaro texto="Cadastrar Atributos" onClick={handleCadastrarAtributos}/>
                    </div>
                    
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Vendas" />
                        <BotaoClaro texto="Realizar Venda" onClick={handleRealizarVenda} />
                        <BotaoClaro texto="Histórico de vendas" onClick={handleHistoricoVendas} />
                        <BotaoClaro texto="Dashboard" />
                    </div>
               
                    <div className={styles.coluna}>
                        <BotaoEscuro texto="Pessoas" />
                        <BotaoClaro texto="Cadastrar Funcionário" onClick={handleCadastrarFuncionarios}/>
                        <BotaoClaro texto="Cadastrar Fornecedor" onClick={handleCadastrarFornecedor}/>
                        <BotaoClaro texto="Deletar Funcionário" onClick={handleDeletarFuncionario}/>
                        <BotaoClaro texto="Deletar Fornecedor" onClick={handleDeletarFornecedor}/>
                        <BotaoClaro texto="Deletar Cliente" onClick={handleDeletarCliente}/>
                       
                    </div>
                </div>
            </div>
        </div>
    );
}
