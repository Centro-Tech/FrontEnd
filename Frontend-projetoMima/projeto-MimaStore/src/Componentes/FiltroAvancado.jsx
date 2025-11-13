import React from 'react';
import styles from './Componentes - CSS/FiltroAvancado.module.css';

const FiltroAvancado = ({ 
    tipo = 'mes-ano', // 'mes-ano' ou 'periodo-customizado'
    mesSelecionado,
    anoSelecionado,
    onMesChange,
    onAnoChange,
    dataInicio,
    dataFim,
    onDataInicioChange,
    onDataFimChange,
    mesesComVendasAnoAtual = [] // Array de números dos meses com vendas no ano atual
}) => {
    const todosMeses = [
        { valor: 1, label: 'Janeiro' },
        { valor: 2, label: 'Fevereiro' },
        { valor: 3, label: 'Março' },
        { valor: 4, label: 'Abril' },
        { valor: 5, label: 'Maio' },
        { valor: 6, label: 'Junho' },
        { valor: 7, label: 'Julho' },
        { valor: 8, label: 'Agosto' },
        { valor: 9, label: 'Setembro' },
        { valor: 10, label: 'Outubro' },
        { valor: 11, label: 'Novembro' },
        { valor: 12, label: 'Dezembro' }
    ];

    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

    // Filtrar meses baseado no ano selecionado
    const getMesesFiltrados = () => {
        if (anoSelecionado === anoAtual) {
            // Para ano atual: mostrar apenas meses com vendas (excluindo mês atual)
            const mesesFiltrados = todosMeses.filter(mes => 
                mes.valor < mesAtual && 
                mesesComVendasAnoAtual.includes(mes.valor)
            );
            console.log('[FiltroAvancado] Ano atual - Meses com vendas:', mesesComVendasAnoAtual);
            console.log('[FiltroAvancado] Meses filtrados:', mesesFiltrados.map(m => m.label));
            return mesesFiltrados;
        } else {
            // Para anos anteriores: mostrar todos
            return todosMeses;
        }
    };

    const meses = getMesesFiltrados();

    if (tipo === 'mes-ano') {
        return (
            <div className={styles.filtroAvancadoContainer}>
                <div className={styles.dropdownGrupo}>
                    <label className={styles.label}>Mês</label>
                    <select 
                        className={styles.select}
                        value={mesSelecionado}
                        onChange={(e) => onMesChange(Number(e.target.value))}
                    >
                        {meses.map(mes => (
                            <option key={mes.valor} value={mes.valor}>
                                {mes.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.dropdownGrupo}>
                    <label className={styles.label}>Ano</label>
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
            </div>
        );
    }

    if (tipo === 'periodo-customizado') {
        return (
            <div className={styles.filtroAvancadoContainer}>
                <div className={styles.dropdownGrupo}>
                    <label className={styles.label}>Data Início</label>
                    <input 
                        type="date"
                        className={styles.inputData}
                        value={dataInicio}
                        onChange={(e) => onDataInicioChange(e.target.value)}
                    />
                </div>
                <div className={styles.dropdownGrupo}>
                    <label className={styles.label}>Data Fim</label>
                    <input 
                        type="date"
                        className={styles.inputData}
                        value={dataFim}
                        onChange={(e) => onDataFimChange(e.target.value)}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default FiltroAvancado;
