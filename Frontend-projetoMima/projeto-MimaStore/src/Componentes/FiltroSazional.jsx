import React from 'react';
import styles from './Componentes - CSS/FiltroSazional.module.css';

const FiltroSazional = ({ 
    estacaoAtual,
    estacaoAtualCodigo,
    anoAtual,
    estacaoSelecionada1,
    anoSelecionado1,
    onEstacao1Change,
    onAno1Change,
    estacaoSelecionada2, 
    anoSelecionado2,
    onEstacao2Change,
    onAno2Change,
    opcoesEstacoes,
    opcoesAnos,
    estacoesComVendasAnoAtual = []
}) => {
    // Filtrar estações baseado no ano selecionado
    const getOpcoesEstacoesFiltradas = (anoSelecionado) => {
        // Se for ano atual, filtrar apenas estações com vendas
        if (anoSelecionado === anoAtual) {
            return opcoesEstacoes.filter(opcao => 
                estacoesComVendasAnoAtual.includes(opcao.valor)
            );
        }
        // Se for outro ano, mostrar todas
        return opcoesEstacoes;
    };

    const isEstacaoAtual = (estacaoCodigo, ano) => {
        return estacaoCodigo === estacaoAtualCodigo && ano === anoAtual;
    };

    return (
        <div className={styles.filtroSazionalContainer}>
            <div className={styles.comparacaoRow}>
                {/* Dropdown 1: Estação 1 */}
                <div className={styles.dropdownGrupo}>
                    <label className={styles.dropdownLabel}>Estação 1</label>
                    <select 
                        className={styles.dropdown}
                        value={estacaoSelecionada1}
                        onChange={(e) => onEstacao1Change(e.target.value)}
                    >
                        {getOpcoesEstacoesFiltradas(anoSelecionado1).map(opcao => {
                            const isAtual = isEstacaoAtual(opcao.valor, anoSelecionado1);
                            return (
                                <option 
                                    key={opcao.valor} 
                                    value={opcao.valor}
                                    className={isAtual ? styles.opcaoAtual : ''}
                                    style={isAtual ? { 
                                        backgroundColor: '#f9f5f8', 
                                        color: '#864176',
                                        fontWeight: 'bold'
                                    } : {}}
                                >
                                    {opcao.label}{isAtual ? ' (Atual)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Dropdown 2: Ano da Estação 1 */}
                <div className={styles.dropdownGrupo}>
                    <label className={styles.dropdownLabel}>Ano</label>
                    <select 
                        className={styles.dropdown}
                        value={anoSelecionado1}
                        onChange={(e) => onAno1Change(Number(e.target.value))}
                    >
                        {opcoesAnos.map(opcao => (
                            <option 
                                key={opcao.valor} 
                                value={opcao.valor}
                                style={opcao.valor === anoAtual ? { 
                                    backgroundColor: '#f9f5f8', 
                                    color: '#864176',
                                    fontWeight: 'bold'
                                } : {}}
                            >
                                {opcao.label}{opcao.valor === anoAtual ? ' (Atual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.vsText}>vs</div>

                {/* Dropdown 3: Estação 2 */}
                <div className={styles.dropdownGrupo}>
                    <label className={styles.dropdownLabel}>Estação 2</label>
                    <select 
                        className={styles.dropdown}
                        value={estacaoSelecionada2}
                        onChange={(e) => onEstacao2Change(e.target.value)}
                    >
                        {getOpcoesEstacoesFiltradas(anoSelecionado2).map(opcao => {
                            const isAtual = isEstacaoAtual(opcao.valor, anoSelecionado2);
                            return (
                                <option 
                                    key={opcao.valor} 
                                    value={opcao.valor}
                                    style={isAtual ? { 
                                        backgroundColor: '#f9f5f8', 
                                        color: '#864176',
                                        fontWeight: 'bold'
                                    } : {}}
                                >
                                    {opcao.label}{isAtual ? ' (Atual)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Dropdown 4: Ano da Estação 2 */}
                <div className={styles.dropdownGrupo}>
                    <label className={styles.dropdownLabel}>Ano</label>
                    <select 
                        className={styles.dropdown}
                        value={anoSelecionado2}
                        onChange={(e) => onAno2Change(Number(e.target.value))}
                    >
                        {opcoesAnos.map(opcao => (
                            <option 
                                key={opcao.valor} 
                                value={opcao.valor}
                                style={opcao.valor === anoAtual ? { 
                                    backgroundColor: '#f9f5f8', 
                                    color: '#864176',
                                    fontWeight: 'bold'
                                } : {}}
                            >
                                {opcao.label}{opcao.valor === anoAtual ? ' (Atual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FiltroSazional;
