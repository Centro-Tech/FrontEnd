import React, { useState, useEffect } from 'react';
import styles from './Componentes - CSS/FiltroCalendario.module.css';

const FiltroCalendario = ({ 
    dataSelecionada, // formato: 'YYYY-MM-DD'
    onDataChange,
    dataInicio, // Para modo intervalo
    dataFim, // Para modo intervalo
    onDataInicioChange,
    onDataFimChange,
    modoIntervalo = false, // true = seleciona 2 datas, false = seleciona 1 data
    mesSelecionado, // 1-12
    anoSelecionado,
    onMesChange,
    onAnoChange,
    diasComVendas = [], // Array de strings no formato 'YYYY-MM-DD'
    compact = false,
    dataMin = null, // Data mínima permitida (formato 'YYYY-MM-DD') - modo simples
    dataMax = null,  // Data máxima permitida (formato 'YYYY-MM-DD') - modo simples
    // Props separadas para modo intervalo (permitem restrições diferentes para início e fim)
    dataMinInicio = null, // Data mínima para calendário de início
    dataMaxInicio = null, // Data máxima para calendário de início
    dataMinFim = null, // Data mínima para calendário de fim
    dataMaxFim = null  // Data máxima para calendário de fim
}) => {
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false);
    const [calendarioFimAberto, setCalendarioFimAberto] = useState(false);
    
    // Extrair mês/ano das datas de início e fim para inicialização
    const getAnoMesFromData = (dataStr) => {
        if (!dataStr) return { ano: new Date().getFullYear(), mes: new Date().getMonth() + 1 };
        const [ano, mes] = dataStr.split('-');
        return { ano: Number(ano), mes: Number(mes) };
    };
    
    const inicioInfo = getAnoMesFromData(dataInicio);
    const fimInfo = getAnoMesFromData(dataFim);
    
    // Estados locais para mês/ano de cada calendário (inicializados com base nas datas)
    const [mesVizualizadoInicio, setMesVizualizadoInicio] = useState(modoIntervalo ? inicioInfo.mes : mesSelecionado);
    const [anoVizualizadoInicio, setAnoVizualizadoInicio] = useState(modoIntervalo ? inicioInfo.ano : anoSelecionado);
    const [mesVizualizadoFim, setMesVizualizadoFim] = useState(modoIntervalo ? fimInfo.mes : mesSelecionado);
    const [anoVizualizadoFim, setAnoVizualizadoFim] = useState(modoIntervalo ? fimInfo.ano : anoSelecionado);
    
    // Sincronizar calendários ao abrir
    useEffect(() => {
        if (calendarioInicioAberto && dataInicio) {
            const [ano, mes] = dataInicio.split('-');
            setAnoVizualizadoInicio(Number(ano));
            setMesVizualizadoInicio(Number(mes));
        }
    }, [calendarioInicioAberto]);
    
    useEffect(() => {
        if (calendarioFimAberto && dataFim) {
            const [ano, mes] = dataFim.split('-');
            setAnoVizualizadoFim(Number(ano));
            setMesVizualizadoFim(Number(mes));
        }
    }, [calendarioFimAberto]);
    
    // Função para verificar se uma data está dentro do intervalo permitido
    // paraInicio: true para calendário de início, false para calendário de fim
    const isDataDentroDoIntervalo = (dataStr, paraInicio = null) => {
        let minDate = dataMin;
        let maxDate = dataMax;
        
        // Em modo intervalo, usar props específicas se disponíveis
        if (modoIntervalo && paraInicio !== null) {
            if (paraInicio) {
                minDate = dataMinInicio || dataMin;
                maxDate = dataMaxInicio || dataMax;
            } else {
                minDate = dataMinFim || dataMin;
                maxDate = dataMaxFim || dataMax;
            }
        }
        
        if (!minDate && !maxDate) return true;
        
        // Comparar apenas as strings YYYY-MM-DD para evitar problemas de timezone
        if (minDate && dataStr < minDate) return false;
        if (maxDate && dataStr > maxDate) return false;
        return true;
    };
    
    // Função para verificar se um mês tem dias dentro do intervalo
    const mesPossuiDiasValidos = (mes, ano, paraInicio = null) => {
        let minDate = dataMin;
        let maxDate = dataMax;
        
        // Em modo intervalo, usar props específicas se disponíveis
        if (modoIntervalo && paraInicio !== null) {
            if (paraInicio) {
                minDate = dataMinInicio || dataMin;
                maxDate = dataMaxInicio || dataMax;
            } else {
                minDate = dataMinFim || dataMin;
                maxDate = dataMaxFim || dataMax;
            }
        }
        
        if (!minDate && !maxDate) return true;
        
        // Criar strings YYYY-MM-DD para o primeiro e último dia do mês
        const mesStr = String(mes).padStart(2, '0');
        const ultimoDiaMes = new Date(ano, mes, 0).getDate();
        const primeiroDiaMesStr = `${ano}-${mesStr}-01`;
        const ultimoDiaMesStr = `${ano}-${mesStr}-${String(ultimoDiaMes).padStart(2, '0')}`;
        
        // Verificar se há sobreposição entre o mês e o intervalo permitido
        if (minDate && ultimoDiaMesStr < minDate) return false;
        if (maxDate && primeiroDiaMesStr > maxDate) return false;
        return true;
    };
    
    // Função para verificar se um ano tem meses dentro do intervalo
    const anoPossuiMesesValidos = (ano, paraInicio = null) => {
        let minDate = dataMin;
        let maxDate = dataMax;
        
        // Em modo intervalo, usar props específicas se disponíveis
        if (modoIntervalo && paraInicio !== null) {
            if (paraInicio) {
                minDate = dataMinInicio || dataMin;
                maxDate = dataMaxInicio || dataMax;
            } else {
                minDate = dataMinFim || dataMin;
                maxDate = dataMaxFim || dataMax;
            }
        }
        
        if (!minDate && !maxDate) return true;
        
        for (let mes = 1; mes <= 12; mes++) {
            if (mesPossuiDiasValidos(mes, ano, paraInicio)) return true;
        }
        return false;
    };
    
    const todosMeses = [
        { valor: 1, label: 'Jan' },
        { valor: 2, label: 'Fev' },
        { valor: 3, label: 'Mar' },
        { valor: 4, label: 'Abr' },
        { valor: 5, label: 'Mai' },
        { valor: 6, label: 'Jun' },
        { valor: 7, label: 'Jul' },
        { valor: 8, label: 'Ago' },
        { valor: 9, label: 'Set' },
        { valor: 10, label: 'Out' },
        { valor: 11, label: 'Nov' },
        { valor: 12, label: 'Dez' }
    ];

    const anoAtual = new Date().getFullYear();
    // Incluir anos passados (5 anos) e futuros (2 anos) para cobrir previsões
    const anos = [
        ...Array.from({ length: 2 }, (_, i) => anoAtual + 2 - i), // 2027, 2026
        ...Array.from({ length: 5 }, (_, i) => anoAtual - i) // 2025, 2024, 2023, 2022, 2021
    ];

    // Feriados fixos do Brasil
    const feriadosFixos = {
        '01-01': 'Ano Novo',
        '04-21': 'Tiradentes',
        '05-01': 'Dia do Trabalho',
        '09-07': 'Independência do Brasil',
        '10-12': 'Nossa Senhora Aparecida',
        '11-02': 'Finados',
        '11-15': 'Proclamação da República',
        '11-20': 'Dia da Consciência Negra',
        '12-25': 'Natal'
    };

    const verificarFeriado = (dia, mes, ano) => {
        const mesFormatado = String(mes).padStart(2, '0');
        const diaFormatado = String(dia).padStart(2, '0');
        const chave = `${mesFormatado}-${diaFormatado}`;
        return feriadosFixos[chave] || null;
    };

    const getDiasDoMes = (paraInicio = false) => {
        let mesAtual, anoAtual;
        
        if (modoIntervalo) {
            mesAtual = paraInicio ? mesVizualizadoInicio : mesVizualizadoFim;
            anoAtual = paraInicio ? anoVizualizadoInicio : anoVizualizadoFim;
        } else {
            mesAtual = mesSelecionado;
            anoAtual = anoSelecionado;
        }
        
        const primeiroDia = new Date(anoAtual, mesAtual - 1, 1);
        const ultimoDia = new Date(anoAtual, mesAtual, 0);
        const diasNoMes = ultimoDia.getDate();
        const diaDaSemanaPrimeiroDia = primeiroDia.getDay();

        const dias = [];
        
        // Preencher dias vazios antes do primeiro dia
        for (let i = 0; i < diaDaSemanaPrimeiroDia; i++) {
            dias.push(null);
        }

        // Preencher dias do mês
        for (let dia = 1; dia <= diasNoMes; dia++) {
            dias.push(dia);
        }

        return dias;
    };

    const formatarData = (dia, paraInicio = false) => {
        if (!dia) return '';
        let mesAtual, anoAtual;
        
        if (modoIntervalo) {
            mesAtual = paraInicio ? mesVizualizadoInicio : mesVizualizadoFim;
            anoAtual = paraInicio ? anoVizualizadoInicio : anoVizualizadoFim;
        } else {
            mesAtual = mesSelecionado;
            anoAtual = anoSelecionado;
        }
        
        const mesFormatado = String(mesAtual).padStart(2, '0');
        const diaFormatado = String(dia).padStart(2, '0');
        return `${anoAtual}-${mesFormatado}-${diaFormatado}`;
    };

    const temVendas = (dia) => {
        if (!dia) return false;
        const dataFormatada = formatarData(dia);
        return diasComVendas.includes(dataFormatada);
    };

    const handleDiaClickInicio = (dia) => {
        if (!dia) return;
        const dataFormatada = formatarData(dia, true);
        onDataInicioChange(dataFormatada);
        setCalendarioInicioAberto(false);
    };
    
    const handleDiaClickFim = (dia) => {
        if (!dia) return;
        const dataFormatada = formatarData(dia, false);
        onDataFimChange(dataFormatada);
        setCalendarioFimAberto(false);
    };

    const handleDiaClick = (dia) => {
        if (!dia) return;
        const dataFormatada = formatarData(dia);
        onDataChange(dataFormatada);
        setCalendarioAberto(false);
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return 'Selecione um dia';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };
    
    const formatarIntervaloExibicao = () => {
        if (!dataInicio && !dataFim) return 'Selecione o período';
        if (dataInicio && !dataFim) return `${formatarDataExibicao(dataInicio)} - ...`;
        if (dataInicio && dataFim) return `${formatarDataExibicao(dataInicio)} - ${formatarDataExibicao(dataFim)}`;
        return 'Selecione o período';
    };
    
    const renderCalendarioPopup = (paraInicio, aberto, setAberto, mesViz, setMesViz, anoViz, setAnoViz, onDiaClick) => {
        if (!aberto) return null;
        
        const diasDoMes = getDiasDoMes(paraInicio);
        const titulo = paraInicio ? 'Selecione a Data de Início' : 'Selecione a Data de Fim';
        
        // Filtrar meses e anos válidos baseado em dataMin e dataMax
        const mesesFiltrados = todosMeses.filter(mes => mesPossuiDiasValidos(mes.valor, anoViz, paraInicio));
        const anosFiltrados = anos.filter(ano => anoPossuiMesesValidos(ano, paraInicio));
        
        return (
            <div className={styles.calendarioPopup}>
                <div className={styles.calendarioHeader}>
                    <div className={styles.navegacaoMesAno}>
                        <select 
                            className={styles.selectCompacto}
                            value={mesViz}
                            onChange={(e) => setMesViz(Number(e.target.value))}
                        >
                            {todosMeses.map(mes => {
                                const valido = mesPossuiDiasValidos(mes.valor, anoViz, paraInicio);
                                return (
                                    <option 
                                        key={mes.valor} 
                                        value={mes.valor}
                                        disabled={!valido}
                                        style={{ color: valido ? 'inherit' : '#ccc' }}
                                    >
                                        {mes.label}
                                    </option>
                                );
                            })}
                        </select>
                        <select 
                            className={styles.selectCompacto}
                            value={anoViz}
                            onChange={(e) => setAnoViz(Number(e.target.value))}
                        >
                            {anos.map(ano => {
                                const valido = anoPossuiMesesValidos(ano, paraInicio);
                                return (
                                    <option 
                                        key={ano} 
                                        value={ano}
                                        disabled={!valido}
                                        style={{ color: valido ? 'inherit' : '#ccc' }}
                                    >
                                        {ano}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <span className={styles.subtitulo}>{titulo}</span>
                    <button 
                        className={styles.botaoFechar}
                        onClick={() => setAberto(false)}
                    >
                        ✕
                    </button>
                </div>
                
                {/* Dias da semana */}
                <div className={styles.diasSemana}>
                    <div className={styles.diaSemanaHeader}>Dom</div>
                    <div className={styles.diaSemanaHeader}>Seg</div>
                    <div className={styles.diaSemanaHeader}>Ter</div>
                    <div className={styles.diaSemanaHeader}>Qua</div>
                    <div className={styles.diaSemanaHeader}>Qui</div>
                    <div className={styles.diaSemanaHeader}>Sex</div>
                    <div className={styles.diaSemanaHeader}>Sáb</div>
                </div>

                {/* Grid de dias */}
                <div className={styles.diasGrid}>
                    {diasDoMes.map((dia, index) => {
                        if (!dia) {
                            return <div key={`vazio-${index}`} className={styles.diaVazio} />;
                        }

                        const dataFormatada = formatarData(dia, paraInicio);
                        const selecionado = dataFormatada === (paraInicio ? dataInicio : dataFim);
                        const comVendas = temVendas(dia);
                        const feriado = verificarFeriado(dia, mesViz, anoViz);
                        const hoje = new Date();
                        const ehHoje = dia === hoje.getDate() && 
                                      mesViz === (hoje.getMonth() + 1) && 
                                      anoViz === hoje.getFullYear();
                        
                        // Verificar se a data está dentro do intervalo permitido
                        const dentroDoIntervalo = isDataDentroDoIntervalo(dataFormatada, paraInicio);

                        let classes = [styles.dia];
                        if (selecionado) classes.push(styles.diaSelecionado);
                        if (comVendas) classes.push(styles.diaComVendas);
                        if (feriado) classes.push(styles.diaFeriado);
                        if (ehHoje) classes.push(styles.diaHoje);
                        if (!dentroDoIntervalo) classes.push(styles.diaDesabilitado);

                        return (
                            <div 
                                key={dia}
                                className={classes.join(' ')}
                                onClick={() => dentroDoIntervalo && onDiaClick(dia)}
                                title={!dentroDoIntervalo ? 'Data fora do intervalo permitido' : (feriado ? feriado : (comVendas ? 'Dia com vendas' : ''))}
                                style={!dentroDoIntervalo ? { color: '#ccc', cursor: 'not-allowed', backgroundColor: '#f5f5f5' } : {}}
                            >
                                {dia}
                            </div>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className={styles.legenda}>
                    <div className={styles.legendaItem}>
                        <div className={`${styles.legendaCor} ${styles.legendaFeriado}`} />
                        <span>Feriado</span>
                    </div>
                    <div className={styles.legendaItem}>
                        <div className={`${styles.legendaCor} ${styles.legendaComVendas}`} />
                        <span>Com vendas</span>
                    </div>
                </div>
            </div>
        );
    };

    const diasDoMes = !modoIntervalo ? getDiasDoMes() : [];

    return (
        <div className={`${styles.filtroCalendarioContainer} ${compact ? styles.compact : ''}`}>
            {/* Controles de Mês/Ano */}
            {!modoIntervalo ? (
                <div className={styles.controles}>
                    <div className={styles.seletorGrupo}>
                        <select 
                            className={styles.select}
                            value={mesSelecionado}
                            onChange={(e) => onMesChange(Number(e.target.value))}
                        >
                            {todosMeses.map(mes => (
                                <option key={mes.valor} value={mes.valor}>
                                    {mes.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.seletorGrupo}>
                        <select 
                            className={styles.select}
                            value={anoSelecionado}
                            onChange={(e) => onAnoChange(Number(e.target.value))}
                        >
                            {anos.map(ano => (
                                <option key={ano} value={ano}>
                                    {ano}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className={styles.botaoCalendario}
                        onClick={() => setCalendarioAberto(!calendarioAberto)}
                        title="Abrir calendário"
                    >
                        📅
                    </button>
                </div>
            ) : null}

            {/* Data Selecionada - Modo Intervalo */}
            {modoIntervalo ? (
                <div className={styles.intervaloSelecionadoContainer}>
                    <div className={styles.intervaloSelecionado}>
                        <div 
                            className={`${styles.dataItem} ${styles.dataItemClicavel}`}
                            onClick={() => {
                                setCalendarioInicioAberto(!calendarioInicioAberto);
                                setCalendarioFimAberto(false);
                            }}
                        >
                            <span className={styles.dataLabel}>Início:</span>
                            <span className={styles.dataValor}>{dataInicio ? formatarDataExibicao(dataInicio) : 'Clique aqui'}</span>
                        </div>
                        <div className={styles.dataSeparador}>→</div>
                        <div 
                            className={`${styles.dataItem} ${styles.dataItemClicavel}`}
                            onClick={() => {
                                setCalendarioFimAberto(!calendarioFimAberto);
                                setCalendarioInicioAberto(false);
                            }}
                        >
                            <span className={styles.dataLabel}>Fim:</span>
                            <span className={styles.dataValor}>{dataFim ? formatarDataExibicao(dataFim) : 'Clique aqui'}</span>
                        </div>
                    </div>
                    
                    {/* Calendário Início */}
                    {renderCalendarioPopup(
                        true, 
                        calendarioInicioAberto, 
                        setCalendarioInicioAberto,
                        mesVizualizadoInicio,
                        setMesVizualizadoInicio,
                        anoVizualizadoInicio,
                        setAnoVizualizadoInicio,
                        handleDiaClickInicio
                    )}
                    
                    {/* Calendário Fim */}
                    {renderCalendarioPopup(
                        false, 
                        calendarioFimAberto, 
                        setCalendarioFimAberto,
                        mesVizualizadoFim,
                        setMesVizualizadoFim,
                        anoVizualizadoFim,
                        setAnoVizualizadoFim,
                        handleDiaClickFim
                    )}
                </div>
            ) : (
                <div className={styles.dataSelecionada}>
                    {formatarDataExibicao(dataSelecionada)}
                </div>
            )}

            {/* Calendário - Modo Simples */}
            {!modoIntervalo && calendarioAberto && (
                <div className={styles.calendarioPopup}>
                    <div className={styles.calendarioHeader}>
                        <div className={styles.navegacaoMesAno}>
                            <select 
                                className={styles.selectCompacto}
                                value={mesSelecionado}
                                onChange={(e) => onMesChange(Number(e.target.value))}
                            >
                                {todosMeses.map(mes => (
                                    <option key={mes.valor} value={mes.valor}>
                                        {mes.label}
                                    </option>
                                ))}
                            </select>
                            <select 
                                className={styles.selectCompacto}
                                value={anoSelecionado}
                                onChange={(e) => onAnoChange(Number(e.target.value))}
                            >
                                {anos.map(ano => (
                                    <option key={ano} value={ano}>
                                        {ano}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            className={styles.botaoFechar}
                            onClick={() => setCalendarioAberto(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Dias da semana */}
                    <div className={styles.diasSemana}>
                        <div className={styles.diaSemanaHeader}>Dom</div>
                        <div className={styles.diaSemanaHeader}>Seg</div>
                        <div className={styles.diaSemanaHeader}>Ter</div>
                        <div className={styles.diaSemanaHeader}>Qua</div>
                        <div className={styles.diaSemanaHeader}>Qui</div>
                        <div className={styles.diaSemanaHeader}>Sex</div>
                        <div className={styles.diaSemanaHeader}>Sáb</div>
                    </div>

                    {/* Grid de dias */}
                    <div className={styles.diasGrid}>
                        {diasDoMes.map((dia, index) => {
                            if (!dia) {
                                return <div key={`vazio-${index}`} className={styles.diaVazio} />;
                            }

                            const dataFormatada = formatarData(dia);
                            const selecionado = dataFormatada === dataSelecionada;
                            const comVendas = temVendas(dia);
                            const feriado = verificarFeriado(dia, mesSelecionado, anoSelecionado);
                            const hoje = new Date();
                            const ehHoje = dia === hoje.getDate() && 
                                          mesSelecionado === (hoje.getMonth() + 1) && 
                                          anoSelecionado === hoje.getFullYear();

                            let classes = [styles.dia];
                            if (selecionado) classes.push(styles.diaSelecionado);
                            if (comVendas) classes.push(styles.diaComVendas);
                            if (feriado) classes.push(styles.diaFeriado);
                            if (ehHoje) classes.push(styles.diaHoje);

                            return (
                                <div 
                                    key={dia}
                                    className={classes.join(' ')}
                                    onClick={() => handleDiaClick(dia)}
                                    title={feriado ? feriado : (comVendas ? 'Dia com vendas' : '')}
                                >
                                    {dia}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legenda */}
                    <div className={styles.legenda}>
                        <div className={styles.legendaItem}>
                            <div className={`${styles.legendaCor} ${styles.legendaFeriado}`} />
                            <span>Feriado</span>
                        </div>
                        <div className={styles.legendaItem}>
                            <div className={`${styles.legendaCor} ${styles.legendaComVendas}`} />
                            <span>Com vendas</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltroCalendario;
