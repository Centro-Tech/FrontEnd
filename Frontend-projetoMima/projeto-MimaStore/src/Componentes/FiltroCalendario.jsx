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
    diasComVendas = [] // Array de strings no formato 'YYYY-MM-DD'
}) => {
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false);
    const [calendarioFimAberto, setCalendarioFimAberto] = useState(false);
    
    // Estados locais para mês/ano de cada calendário
    const [mesVizualizadoInicio, setMesVizualizadoInicio] = useState(mesSelecionado);
    const [anoVizualizadoInicio, setAnoVizualizadoInicio] = useState(anoSelecionado);
    const [mesVizualizadoFim, setMesVizualizadoFim] = useState(mesSelecionado);
    const [anoVizualizadoFim, setAnoVizualizadoFim] = useState(anoSelecionado);
    
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
    const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

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
        
        return (
            <div className={styles.calendarioPopup}>
                <div className={styles.calendarioHeader}>
                    <div className={styles.navegacaoMesAno}>
                        <select 
                            className={styles.selectCompacto}
                            value={mesViz}
                            onChange={(e) => setMesViz(Number(e.target.value))}
                        >
                            {todosMeses.map(mes => (
                                <option key={mes.valor} value={mes.valor}>
                                    {mes.label}
                                </option>
                            ))}
                        </select>
                        <select 
                            className={styles.selectCompacto}
                            value={anoViz}
                            onChange={(e) => setAnoViz(Number(e.target.value))}
                        >
                            {anos.map(ano => (
                                <option key={ano} value={ano}>
                                    {ano}
                                </option>
                            ))}
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

                        let classes = [styles.dia];
                        if (selecionado) classes.push(styles.diaSelecionado);
                        if (comVendas) classes.push(styles.diaComVendas);
                        if (feriado) classes.push(styles.diaFeriado);
                        if (ehHoje) classes.push(styles.diaHoje);

                        return (
                            <div 
                                key={dia}
                                className={classes.join(' ')}
                                onClick={() => onDiaClick(dia)}
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
        );
    };

    const diasDoMes = !modoIntervalo ? getDiasDoMes() : [];

    return (
        <div className={styles.filtroCalendarioContainer}>
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
