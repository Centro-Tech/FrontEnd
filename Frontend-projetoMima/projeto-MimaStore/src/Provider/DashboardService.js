import API from './API';

// Util helpers to normalize backend variations
const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
        const raw = val.trim();
        // Brazilian format like 1.234,56
        const brPattern = /^\d{1,3}(\.\d{3})+,\d{2}$/;
        if (brPattern.test(raw)) {
            const s = raw.replace(/\./g, '').replace(',', '.');
            const num = parseFloat(s);
            return isNaN(num) ? 0 : num;
        }
        // If only comma is present, treat comma as decimal separator
        if (raw.includes(',') && !raw.includes('.')) {
            const s = raw.replace(',', '.');
            const num = parseFloat(s);
            return isNaN(num) ? 0 : num;
        }
        // Default: parse as standard dot decimal, do not strip dots
        const num = parseFloat(raw);
        return isNaN(num) ? 0 : num;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
};

const getVendaTotal = (v) => toNumber(
    v?.valorTotal ?? v?.valor_total ?? v?.total ?? v?.totalVenda ?? v?.total_venda ?? v?.valor
);

const getVendaTotalWithFallback = (v) => {
    let total = getVendaTotal(v);
    if (total > 0) return total;
    const itens = Array.isArray(v?.itensVenda) ? v.itensVenda : [];
    if (itens.length > 0) {
        const sum = itens.reduce((acc, iv) => {
            const unit = toNumber(
                iv?.precoUnitario ?? iv?.preco ?? iv?.valorUnitario ?? iv?.valor ?? iv?.preco_venda ?? iv?.valor_unitario ?? iv?.precoVenda ?? iv?.preco_unitario
            );
            const qtd = getItemQtdVendida(iv) || 1;
            return acc + (unit > 0 ? unit * qtd : 0);
        }, 0);
        if (sum > 0) return sum;
        // Try using item-level price if present
        const sumItem = itens.reduce((acc, iv) => {
            const unit = toNumber(iv?.item?.preco ?? iv?.item?.precoVenda ?? iv?.item?.valor ?? iv?.item?.preco_venda);
            const qtd = getItemQtdVendida(iv) || 1;
            return acc + (unit > 0 ? unit * qtd : 0);
        }, 0);
        if (sumItem > 0) return sumItem;
    }
    return total || 0;
};

const getVendaDateISO = (v) => {
    const raw = v?.data ?? v?.dataVenda ?? v?.data_venda ?? v?.dataHora ?? v?.createdAt ?? v?.created_at;
    if (!raw) return null;
    if (typeof raw === 'string') {
        // Trata tanto YYYY-MM-DD quanto timestamps completos ou arrays MySQL [2024,11,10]
        const trimmed = raw.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            return trimmed.substring(0, 10);
        }
        try {
            return new Date(trimmed).toISOString().substring(0, 10);
        } catch {
            return null;
        }
    }
    if (Array.isArray(raw) && raw.length >= 3) {
        // Formato array do MySQL [year, month, day]
        const [y, m, d] = raw;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    try {
        return new Date(raw).toISOString().substring(0, 10);
    } catch {
        return null;
    }
};

const getClienteId = (venda) => {
    const c = venda?.cliente;
    if (typeof c === 'number') return c;
    const id = c?.idCliente ?? c?.id ?? venda?.fkCliente ?? venda?.clienteId ?? venda?.cliente_id;
    return id ?? null;
};

// Try to resolve the array of items in a venda across multiple possible keys
const getItensVenda = (venda) => {
    const keys = ['itensVenda', 'itens_venda', 'itensDaVenda', 'itens'];
    for (const k of keys) {
        const arr = venda?.[k];
        if (Array.isArray(arr)) return arr;
    }
    return [];
};

const getItemId = (itemVenda) =>
    itemVenda?.item?.id ??
    itemVenda?.produto?.id ??
    itemVenda?.vestuario?.id ??
    itemVenda?.fkItem ??
    itemVenda?.idItem ??
    itemVenda?.itemId ??
    itemVenda?.item_id ??
    itemVenda?.id;

const getItemQtdVendida = (itemVenda) => toNumber(
    itemVenda?.qtdParaVender ??
    itemVenda?.qtdVendida ??
    itemVenda?.qtd_venda ??
    itemVenda?.quantidadeVendida ??
    itemVenda?.quantidade_vendida ??
    itemVenda?.quantidade ??
    itemVenda?.qtd
);

// Some endpoints may return arrays directly, others wrap under { data: [...] } or { content: [...] }
const extractArray = (axiosResponse) => {
    const d = axiosResponse?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.content)) return d.content;
    if (Array.isArray(d?.data?.content)) return d.data.content;
    if (Array.isArray(d?.data?.data)) return d.data.data;
    return [];
};

/**
 * Dashboard Service - Handles all dashboard metrics and KPIs
 * Implementação baseada nos endpoints existentes do backend
 */

// ═══════════════════════════════════════════════════════════════
// KPI 1: TICKET MÉDIO
// ═══════════════════════════════════════════════════════════════
export const getAverageTicket = async () => {
    try {
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const diaAtual = hoje.getDate();

        const inicioAtual = primeiroDiaMesAtual.toISOString().split('T')[0];
        const fimAtual = hoje.toISOString().split('T')[0];

        const primeiroDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, diaAtual);
        const inicioAnterior = primeiroDiaMesAnterior.toISOString().split('T')[0];
        const fimAnterior = ultimoDiaMesAnterior.toISOString().split('T')[0];

        console.log('[TICKET MÉDIO] Buscando dados:', {
            periodoAtual: `${inicioAtual} - ${fimAtual}`,
            periodoAnterior: `${inicioAnterior} - ${fimAnterior}`
        });

        const [vendasAtuais, vendasAnteriores] = await Promise.all([
            API.get(`/vendas/filtrar-por-data?inicio=${inicioAtual}&fim=${fimAtual}`),
            API.get(`/vendas/filtrar-por-data?inicio=${inicioAnterior}&fim=${fimAnterior}`)
        ]);

        const vendasAtuaisData = extractArray(vendasAtuais);
        const vendasAnterioresData = extractArray(vendasAnteriores);

        console.log('[TICKET MÉDIO] Vendas encontradas:', {
            atual: vendasAtuaisData.length,
            anterior: vendasAnterioresData.length
        });

        // DEBUG: Ver estrutura da primeira venda
        if (vendasAtuaisData.length > 0) {
            console.log('[TICKET MÉDIO] Primeira venda (estrutura):', vendasAtuaisData[0]);
        }

        const totalVendasAtual = vendasAtuaisData.length;
    const faturamentoAtual = vendasAtuaisData.reduce((sum, v) => sum + getVendaTotalWithFallback(v), 0);
        const ticketMedioAtual = totalVendasAtual > 0 ? faturamentoAtual / totalVendasAtual : 0;

        const totalVendasAnterior = vendasAnterioresData.length;
    const faturamentoAnterior = vendasAnterioresData.reduce((sum, v) => sum + getVendaTotalWithFallback(v), 0);
        const ticketMedioAnterior = totalVendasAnterior > 0 ? faturamentoAnterior / totalVendasAnterior : 0;

        console.log('[TICKET MÉDIO] Cálculos:', {
            ticketAtual: ticketMedioAtual,
            ticketAnterior: ticketMedioAnterior
        });

        let variacaoPercentual = 0;
        if (ticketMedioAnterior > 0 && !isNaN(ticketMedioAtual) && !isNaN(ticketMedioAnterior)) {
            variacaoPercentual = ((ticketMedioAtual - ticketMedioAnterior) / ticketMedioAnterior) * 100;
        }

        const variacaoFinal = isNaN(variacaoPercentual) ? 0 : Math.round(variacaoPercentual);

        return {
            valor: `R$ ${ticketMedioAtual.toFixed(2).replace('.', ',')}`,
            variacao: variacaoFinal
        };
    } catch (error) {
        console.error('Error fetching average ticket:', error);
        return { valor: 'R$ 0,00', variacao: 0 };
    }
};

// ═══════════════════════════════════════════════════════════════
// KPI 2: ÍNDICE SAZIONAL
// ═══════════════════════════════════════════════════════════════
export const getSeasonalIndex = async () => {
    try {
        const obterEstacao = (data) => {
            const mes = data.getMonth() + 1;
            const dia = data.getDate();
            
            if ((mes === 12 && dia >= 21) || mes === 1 || mes === 2 || (mes === 3 && dia < 21)) {
                return { nome: 'Verão', inicioMes: 12, inicioDia: 21 };
            } else if ((mes === 3 && dia >= 21) || mes === 4 || mes === 5 || (mes === 6 && dia < 21)) {
                return { nome: 'Outono', inicioMes: 3, inicioDia: 21 };
            } else if ((mes === 6 && dia >= 21) || mes === 7 || mes === 8 || (mes === 9 && dia < 21)) {
                return { nome: 'Inverno', inicioMes: 6, inicioDia: 21 };
            } else {
                return { nome: 'Primavera', inicioMes: 9, inicioDia: 21 };
            }
        };

        const hoje = new Date();
        const estacaoAtual = obterEstacao(hoje);

        let inicioEstacaoAtual;
        if (estacaoAtual.inicioMes === 12 && hoje.getMonth() + 1 < 12) {
            inicioEstacaoAtual = new Date(hoje.getFullYear() - 1, estacaoAtual.inicioMes - 1, estacaoAtual.inicioDia);
        } else {
            inicioEstacaoAtual = new Date(hoje.getFullYear(), estacaoAtual.inicioMes - 1, estacaoAtual.inicioDia);
        }

        const diasDecorridos = Math.floor((hoje - inicioEstacaoAtual) / (1000 * 60 * 60 * 24));

        const inicioEstacaoAnterior = new Date(inicioEstacaoAtual);
        inicioEstacaoAnterior.setMonth(inicioEstacaoAnterior.getMonth() - 3);
        const fimEstacaoAnterior = new Date(inicioEstacaoAnterior);
        fimEstacaoAnterior.setDate(fimEstacaoAnterior.getDate() + diasDecorridos);

        const [vendasAtual, vendasAnterior] = await Promise.all([
            API.get(`/vendas/filtrar-por-data?inicio=${inicioEstacaoAtual.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`),
            API.get(`/vendas/filtrar-por-data?inicio=${inicioEstacaoAnterior.toISOString().split('T')[0]}&fim=${fimEstacaoAnterior.toISOString().split('T')[0]}`)
        ]);

        const vendasArrAtual = extractArray(vendasAtual);
        const vendasArrAnterior = extractArray(vendasAnterior);
        const totalVendasAtual = vendasArrAtual.length;
        const totalVendasAnterior = vendasArrAnterior.length;

        const indice = totalVendasAnterior > 0 
            ? (totalVendasAtual / totalVendasAnterior) * 100 
            : 0;

        const status = indice >= 100 ? "Acima da Média" : "Abaixo da Média";

        return {
            status: status,
            variacao: Math.round(indice - 100)
        };
    } catch (error) {
        console.error('Error fetching seasonal index:', error);
        return { status: 'Sem dados', variacao: 0 };
    }
};

// ═══════════════════════════════════════════════════════════════
// KPI 3: FIDELIZAÇÃO DE CLIENTES
// ═══════════════════════════════════════════════════════════════
export const getCustomerRetention = async () => {
    try {
        const hoje = new Date();
        const seisMesesAtras = new Date(hoje);
        seisMesesAtras.setDate(seisMesesAtras.getDate() - 180);

        const dozeMesesAtras = new Date(hoje);
        dozeMesesAtras.setDate(dozeMesesAtras.getDate() - 360);

        console.log('[FIDELIZAÇÃO] Buscando dados:', {
            periodoAtual: `${seisMesesAtras.toISOString().split('T')[0]} - ${hoje.toISOString().split('T')[0]}`,
            periodoAnterior: `${dozeMesesAtras.toISOString().split('T')[0]} - ${seisMesesAtras.toISOString().split('T')[0]}`
        });

        const [vendasPeriodoAtual, vendasPeriodoAnterior] = await Promise.all([
            API.get(`/vendas/filtrar-por-data?inicio=${seisMesesAtras.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`),
            API.get(`/vendas/filtrar-por-data?inicio=${dozeMesesAtras.toISOString().split('T')[0]}&fim=${seisMesesAtras.toISOString().split('T')[0]}`)
        ]);

        const vendasAtual = extractArray(vendasPeriodoAtual);
        const vendasAnterior = extractArray(vendasPeriodoAnterior);

        console.log('[FIDELIZAÇÃO] Vendas encontradas:', {
            atual: vendasAtual.length,
            anterior: vendasAnterior.length
        });

        // DEBUG: Ver estrutura da primeira venda
        if (vendasAtual.length > 0) {
            console.log('[FIDELIZAÇÃO] Primeira venda (estrutura):', vendasAtual[0]);
        }

        const comprasPorClienteAtual = {};
        vendasAtual.forEach(venda => {
            const clienteId = getClienteId(venda);
            if (clienteId) {
                comprasPorClienteAtual[clienteId] = (comprasPorClienteAtual[clienteId] || 0) + 1;
            }
        });

        const totalClientesAtual = Object.keys(comprasPorClienteAtual).length;
        const clientesFidelizadosAtual = Object.values(comprasPorClienteAtual).filter(count => count >= 2).length;
        const percentualAtual = totalClientesAtual > 0 ? (clientesFidelizadosAtual / totalClientesAtual) * 100 : 0;

        const comprasPorClienteAnterior = {};
        vendasAnterior.forEach(venda => {
            const clienteId = getClienteId(venda);
            if (clienteId) {
                comprasPorClienteAnterior[clienteId] = (comprasPorClienteAnterior[clienteId] || 0) + 1;
            }
        });

        const totalClientesAnterior = Object.keys(comprasPorClienteAnterior).length;
        const clientesFidelizadosAnterior = Object.values(comprasPorClienteAnterior).filter(count => count >= 2).length;
        const percentualAnterior = totalClientesAnterior > 0 ? (clientesFidelizadosAnterior / totalClientesAnterior) * 100 : 0;

        console.log('[FIDELIZAÇÃO] Cálculos:', {
            clientesAtual: totalClientesAtual,
            fidelizadosAtual: clientesFidelizadosAtual,
            percentualAtual: percentualAtual.toFixed(2),
            clientesAnterior: totalClientesAnterior,
            fidelizadosAnterior: clientesFidelizadosAnterior,
            percentualAnterior: percentualAnterior.toFixed(2)
        });

        const variacao = Math.round(percentualAtual - percentualAnterior);

        return { variacao: isNaN(variacao) ? 0 : variacao };
    } catch (error) {
        console.error('Error fetching customer retention:', error);
        return { variacao: 0 };
    }
};

// ═══════════════════════════════════════════════════════════════
// KPI 3 (Refinado): FIDELIZAÇÃO DE CLIENTES – janela 12m + variação
// ═══════════════════════════════════════════════════════════════
export const getLoyalCustomersStats = async () => {
    try {
        const hoje = new Date();
        const inicioHojeJanela = new Date(hoje);
        inicioHojeJanela.setMonth(inicioHojeJanela.getMonth() - 12);

        // Início do mês atual
        const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const inicioMesJanela = new Date(inicioMesAtual);
        inicioMesJanela.setMonth(inicioMesJanela.getMonth() - 12);

        const fmt = (d) => d.toISOString().split('T')[0];

        console.log('[FIDELIZAÇÃO REGRAS NOVAS] Janelas:', {
            referenciaHoje: { inicio: fmt(inicioHojeJanela), fim: fmt(hoje) },
            referenciaInicioMes: { inicio: fmt(inicioMesJanela), fim: fmt(inicioMesAtual) }
        });

        const [respHoje, respInicioMes] = await Promise.all([
            API.get(`/vendas/filtrar-por-data?inicio=${fmt(inicioHojeJanela)}&fim=${fmt(hoje)}`),
            API.get(`/vendas/filtrar-por-data?inicio=${fmt(inicioMesJanela)}&fim=${fmt(inicioMesAtual)}`)
        ]);

        const vendasHojeArr = extractArray(respHoje);
        const vendasInicioMesArr = extractArray(respInicioMes);

        const calcFidelizados = (vendasArr, referencia) => {
            // Mapa: clienteId -> Set de meses (YYYY-MM) e mapa mês -> data (menor data do mês)
            const mesesPorCliente = new Map();
            const menorDataPorMesCliente = new Map(); // key `${clienteId}|${mes}` -> date

            vendasArr.forEach((v, idx) => {
                const cid = getClienteId(v);
                const dataISO = getVendaDateISO(v);
                if (idx < 3 && referencia === 'hoje') {
                    console.log(`[FIDELIZAÇÃO DEBUG] Venda ${idx}:`, { cid, dataISO, vendaRaw: v });
                }
                if (!cid || !dataISO) return;
                const mes = dataISO.substring(0, 7);

                if (!mesesPorCliente.has(cid)) mesesPorCliente.set(cid, new Set());
                mesesPorCliente.get(cid).add(mes);

                const key = `${cid}|${mes}`;
                const d = new Date(dataISO);
                const prev = menorDataPorMesCliente.get(key);
                if (!prev || d < prev) menorDataPorMesCliente.set(key, d);
            });

            let fidelizados = 0;
            const debug = [];

            mesesPorCliente.forEach((mesesSet, cid) => {
                const meses = Array.from(mesesSet).sort(); // ordena YYYY-MM asc
                // Considera somente clientes com >=1 compra na janela (já garantido) e >=3 meses distintos
                if (meses.length < 3) {
                    debug.push({ clienteId: cid, meses, resultado: false, motivo: '<3 meses distintos' });
                    return;
                }

                // Constrói lista de datas representativas (menor data do mês)
                const datas = meses.map(m => menorDataPorMesCliente.get(`${cid}|${m}`)).filter(Boolean).sort((a, b) => a - b);

                // Calcula intervalos consecutivos em dias
                const intervalosDias = [];
                for (let i = 1; i < datas.length; i++) {
                    const diff = Math.round((datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24));
                    intervalosDias.push(diff);
                }

                const todosAte90 = intervalosDias.every(d => d <= 90);
                const fidel = todosAte90;

                if (fidel) fidelizados++;
                debug.push({
                    clienteId: cid,
                    meses,
                    datasUsadas: datas.map(d => d.toISOString().substring(0, 10)),
                    intervalosDias,
                    resultado: fidel
                });
            });

            console.log(`[FIDELIZAÇÃO REGRAS NOVAS] Referência ${referencia} — debug por cliente:`, debug);
            console.log(`[FIDELIZAÇÃO REGRAS NOVAS] Referência ${referencia} — Total fidelizados:`, fidelizados, 'de', mesesPorCliente.size, 'clientes');
            console.log(`[FIDELIZAÇÃO REGRAS NOVAS] Referência ${referencia} — Fidelizados:`, debug.filter(d => d.resultado).map(d => d.clienteId));
            console.log(`[FIDELIZAÇÃO REGRAS NOVAS] Referência ${referencia} — NÃO Fidelizados:`, debug.filter(d => !d.resultado).map(d => ({ id: d.clienteId, motivo: d.motivo || 'intervalo >90 dias' })));
            return fidelizados;
        };

        const currentCount = calcFidelizados(vendasHojeArr, 'hoje');
        const startOfMonthCount = calcFidelizados(vendasInicioMesArr, 'inicio-do-mes');
        
        console.log('[FIDELIZAÇÃO REGRAS NOVAS] Resultado final:', {
            currentCount,
            startOfMonthCount,
            delta: currentCount - startOfMonthCount
        });

        const delta = currentCount - startOfMonthCount;
        const variationPercent = startOfMonthCount > 0 ? ((delta) / startOfMonthCount) * 100 : null;

        return {
            currentCount,
            startOfMonthCount,
            variationPercent: variationPercent !== null ? Math.round(variationPercent) : null,
            addedSinceStart: delta
        };
    } catch (error) {
        console.error('Error computing loyal customers stats:', error);
        return { currentCount: 0, startOfMonthCount: 0, variationPercent: 0, addedSinceStart: 0 };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 1: ESTOQUE X VENDAS (Ranking Semanal)
// ═══════════════════════════════════════════════════════════════
export const getStockSalesRelation = async (options = {}) => {
    try {
        const page = Math.max(1, parseInt(options.page || 1, 10));
        const pageSize = Math.max(1, parseInt(options.pageSize || 10, 10));
        const order = (options.order || 'desc').toLowerCase();
        const hoje = new Date();
        const seteDiasAtras = new Date(hoje);
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

        console.log('[ESTOQUE X VENDAS] Período:', {
            inicio: seteDiasAtras.toISOString().split('T')[0],
            fim: hoje.toISOString().split('T')[0]
        });

        const [itensResponse, vendasSemana] = await Promise.all([
            API.get('/itens?size=10000').catch(e => e), // ✅ AUMENTADO para garantir todos os itens
            API.get(`/vendas/filtrar-por-data?inicio=${seteDiasAtras.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`)
        ]);

        // Fallback for items list if first attempt fails or returns empty
        let todosItens = extractArray(itensResponse);
        console.log('[ESTOQUE X VENDAS] ✅ Itens obtidos:', todosItens.length);
        // Se veio paginado ou com estoque zerado, tentar endpoint dedicado de estoque
        const estoqueSum = todosItens.reduce((acc, it) => acc + (Number(it.qtdEstoque ?? it.quantidadeEstoque ?? it.qtd_estoque ?? it.quantidade_estoque ?? it.estoque ?? 0) || 0), 0);
        if (todosItens.length && estoqueSum === 0) {
            try {
                const respEst = await API.get('/itens/estoque');
                const itensEstoque = extractArray(respEst);
                if (itensEstoque.length) {
                    // Merge por codigo quando disponível
                    const mapEstoquePorCodigo = new Map(itensEstoque.filter(x => x.codigo).map(x => [x.codigo, x]));
                    todosItens = todosItens.map(it => {
                        if (it.codigo && mapEstoquePorCodigo.has(it.codigo)) {
                            const src = mapEstoquePorCodigo.get(it.codigo);
                            return {
                                ...it,
                                qtdEstoque: src.qtdEstoque ?? it.qtdEstoque
                            };
                        }
                        return it;
                    });
                    console.log('[ESTOQUE X VENDAS] Estoque atualizado via /itens/estoque');
                }
            } catch (e) {
                console.warn('[ESTOQUE X VENDAS] Falha ao obter /itens/estoque:', e?.message);
            }
        }
        
        if (!todosItens.length) {
            const altEndpoints = ['/itens?size=10000', '/itens', '/item', '/produtos', '/vestuarios', '/estoque/itens'];
            for (const ep of altEndpoints) {
                try {
                    const resp = await API.get(ep);
                    todosItens = extractArray(resp);
                    if (todosItens.length) {
                        console.log('[ESTOQUE X VENDAS] Catálogo obtido por endpoint alternativo:', ep, 'qtd:', todosItens.length);
                        break;
                    }
                } catch {}
            }
        }

        const vendas = extractArray(vendasSemana);

        // Tentar obter um mapa de estoque atualizado via /itens/estoque
        let estoquePorCodigo = {};
        try {
            const respEst = await API.get('/itens/estoque');
            const itensEst = extractArray(respEst);
            if (Array.isArray(itensEst) && itensEst.length) {
                itensEst.forEach(it => {
                    const codigo = it?.codigo;
                    const est = it?.qtdEstoque ?? it?.quantidadeEstoque ?? it?.qtd_estoque ?? it?.quantidade_estoque ?? it?.estoque;
                    if (codigo != null && est != null) {
                        estoquePorCodigo[codigo] = toNumber(est);
                    }
                });
                console.log('[ESTOQUE X VENDAS] ✅ Estoque obtido via /itens/estoque:', Object.keys(estoquePorCodigo).length);
            }
        } catch (e) {
            console.warn('[ESTOQUE X VENDAS] Aviso: falha ao consultar /itens/estoque:', e?.message);
        }

        console.log('[ESTOQUE X VENDAS] Dados:', {
            totalItens: todosItens.length,
            totalVendas: vendas.length
        });

        if (vendas.length > 0) {
            console.log('[ESTOQUE X VENDAS] Estrutura venda[0]:', vendas[0]);
            if (Array.isArray(vendas[0]?.itensVenda)) {
                console.log('[ESTOQUE X VENDAS] itensVenda[0]:', vendas[0].itensVenda[0]);
            } else {
                console.warn('[ESTOQUE X VENDAS] itensVenda ausente na venda; verifique backend (lazy/eager).');
            }
        }

        const vendasPorItem = {};
        const vendasPorCodigo = {};
        vendas.forEach(venda => {
            const itens = getItensVenda(venda);
            if (itens && Array.isArray(itens)) {
                itens.forEach(itemVenda => {
                    const itemId = getItemId(itemVenda);
                    const codigo = itemVenda?.item?.codigo || itemVenda?.produto?.codigo || itemVenda?.vestuario?.codigo || itemVenda?.codigo;
                    if (itemId) {
                        vendasPorItem[itemId] = (vendasPorItem[itemId] || 0) + getItemQtdVendida(itemVenda);
                    }
                    if (codigo) {
                        vendasPorCodigo[codigo] = (vendasPorCodigo[codigo] || 0) + getItemQtdVendida(itemVenda);
                    }
                });
            }
        });

        console.log('[ESTOQUE X VENDAS] Vendas por item (por ID):', vendasPorItem);
        console.log('[ESTOQUE X VENDAS] Vendas por item (por CÓDIGO):', Object.entries(vendasPorCodigo).slice(0,5));
        if (todosItens.length > 0) {
            console.log('[ESTOQUE X VENDAS] Primeiro item do catálogo:', todosItens[0]);
        }

        const itensComRazao = todosItens.map(item => {
            const vendas = (item?.id != null ? vendasPorItem[item.id] : 0) || (item?.codigo ? vendasPorCodigo[item.codigo] : 0) || 0;
            const estoqueLookup = item?.codigo ? estoquePorCodigo[item.codigo] : undefined;
            const estoque = (estoqueLookup != null ? estoqueLookup : (item.qtdEstoque || item.quantidadeEstoque || item.qtd_estoque || item.quantidade_estoque || item.estoque)) || 0;
            const razao = estoque > 0 ? vendas / estoque : 0;
            
            return {
                id: item.id,
                codigo: item.codigo,
                nome: item.nome,
                estoque: estoque,
                vendas: vendas,
                razao: razao
            };
        });

        const matchEstoqueCodigo = itensComRazao.filter(i => i.codigo && (i.estoque ?? 0) > 0 && estoquePorCodigo[i.codigo] != null).length;
        console.log('[ESTOQUE X VENDAS] Itens com estoque preenchido via /itens/estoque:', { count: matchEstoqueCodigo });

        // Estatística de quantos itens usaram fallback por código
        const totalMatchCodigo = itensComRazao.filter(i => !i.id && i.codigo && (vendasPorCodigo[i.codigo] || 0) > 0).length;
        console.log('[ESTOQUE X VENDAS] Itens usando fallback por CÓDIGO:', { totalMatchCodigo });

        // Ordenar: maior razão primeiro (vendas/estoque)
        itensComRazao.sort((a, b) => order === 'asc' ? a.razao - b.razao : b.razao - a.razao);

        // Paginação
        const totalItems = itensComRazao.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * pageSize;
        const end = start + pageSize;
        const pageItens = itensComRazao.slice(start, end);

        console.log('[ESTOQUE X VENDAS] Página:', { page: safePage, pageSize, totalPages });
        console.log('[ESTOQUE X VENDAS] pageItens (primeiros 3):', pageItens.slice(0, 3).map(i => ({ 
            id: i.id, 
            codigo: i.codigo, 
            nome: i.nome?.substring(0, 20), 
            vendas: i.vendas, 
            estoque: i.estoque 
        })));

        const labels = pageItens.map(i => i.codigo || (i.nome ? i.nome.substring(0, 15) : `#${i.id}`));
        const vendasArr = pageItens.map(i => i.vendas);
        const estoqueArr = pageItens.map(i => i.estoque);

        console.log('[ESTOQUE X VENDAS] ✅ RETORNANDO DADOS:', { 
            labelsCount: labels.length,
            labels: labels.slice(0, 5), 
            vendas: vendasArr.slice(0, 5), 
            estoque: estoqueArr.slice(0, 5),
            timestamp: new Date().toISOString()
        });

        return {
            labels,
            vendas: vendasArr,
            estoque: estoqueArr,
            meta: { totalItems, totalPages, page: safePage, pageSize }
        };
    } catch (error) {
        console.error('Error fetching stock sales relation:', error);
        return { labels: [], vendas: [], estoque: [], meta: { totalItems: 0, totalPages: 1, page: 1, pageSize: options?.pageSize || 10 } };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 2: CATEGORIAS MAIS VENDIDAS
// ═══════════════════════════════════════════════════════════════
export const getTopCategoriesByMonth = async (monthsBack = 0) => {
    try {
        const hoje = new Date();
        const base = new Date(hoje.getFullYear(), hoje.getMonth() - monthsBack, 1);
        const anteriorBase = new Date(base.getFullYear(), base.getMonth() - 1, 1);

        const mesAtual = base.toISOString().substring(0, 7);
        const mesAnterior = anteriorBase.toISOString().substring(0, 7);

        const inicioMesAtual = `${mesAtual}-01`;
        const fimMesAtual = (base.getFullYear() === hoje.getFullYear() && base.getMonth() === hoje.getMonth())
            ? hoje.toISOString().split('T')[0]
            : new Date(base.getFullYear(), base.getMonth() + 1, 0).toISOString().split('T')[0];
        const inicioMesAnterior = `${mesAnterior}-01`;
        const fimMesAnterior = new Date(anteriorBase.getFullYear(), anteriorBase.getMonth() + 1, 0).toISOString().split('T')[0];

        console.log('[CATEGORIAS] Períodos:', {
            atual: `${inicioMesAtual} - ${fimMesAtual}`,
            anterior: `${inicioMesAnterior} - ${fimMesAnterior}`
        });

        const [vendasMesAtual, vendasMesAnterior, itensResponse] = await Promise.all([
            API.get(`/vendas/filtrar-por-data?inicio=${inicioMesAtual}&fim=${fimMesAtual}`),
            API.get(`/vendas/filtrar-por-data?inicio=${inicioMesAnterior}&fim=${fimMesAnterior}`),
            API.get('/itens?size=10000').catch(e => e) // ✅ AUMENTADO para garantir todos os itens
        ]);

        // Fallback for items
        let todosItens = extractArray(itensResponse);
        console.log('[CATEGORIAS] ✅ Itens obtidos:', todosItens.length);
        
        if (!todosItens.length) {
            const altEndpoints = ['/itens?size=10000', '/itens', '/item', '/produtos', '/vestuarios', '/estoque/itens'];
            for (const ep of altEndpoints) {
                try {
                    const resp = await API.get(ep);
                    todosItens = extractArray(resp);
                    if (todosItens.length) {
                        console.log('[CATEGORIAS] Catálogo obtido por endpoint alternativo:', ep, 'qtd:', todosItens.length);
                        break;
                    }
                } catch {}
            }
        }

        console.log('[CATEGORIAS] Dados recebidos:', {
            vendasAtual: extractArray(vendasMesAtual).length,
            vendasAnterior: extractArray(vendasMesAnterior).length,
            itens: todosItens.length
        });

        if (todosItens.length > 0) {
            console.log('[CATEGORIAS] Primeiro item do catálogo (COMPLETO):', todosItens[0]);
            console.log('[CATEGORIAS] Todas as chaves do item:', Object.keys(todosItens[0]));
            console.log('[CATEGORIAS] IDs de categoria encontrados:', {
                fkCategoria: todosItens[0].fkCategoria,
                idCategoria: todosItens[0].idCategoria,
                categoriaId: todosItens[0].categoriaId
            });
        }

        const vendasAtualArr = extractArray(vendasMesAtual);
        if (vendasAtualArr.length > 0) {
            console.log('[CATEGORIAS] Estrutura venda[0]:', vendasAtualArr[0]);
            if (Array.isArray(vendasAtualArr[0]?.itensVenda)) {
                console.log('[CATEGORIAS] itensVenda[0] (COMPLETO):', vendasAtualArr[0].itensVenda[0]);
            } else {
                console.warn('[CATEGORIAS] itensVenda ausente na venda; verifique backend (lazy/eager).');
            }
        }

        // Buscar categorias do backend
        let categorias = {};
        try {
            const respCat = await API.get('/categorias?size=1000');
            const catArray = extractArray(respCat);
            catArray.forEach(cat => {
                categorias[cat.id] = cat.nome;
            });
            console.log('[CATEGORIAS] Categorias obtidas do backend:', catArray.length);
        } catch (err) {
            console.warn('[CATEGORIAS] Erro ao buscar categorias, tentando alternativas:', err.message);
            // Tentar endpoints alternativos
            for (const ep of ['/categoria', '/category']) {
                try {
                    const resp = await API.get(ep);
                    const catArray = extractArray(resp);
                    catArray.forEach(cat => {
                        categorias[cat.id] = cat.nome;
                    });
                    if (Object.keys(categorias).length) break;
                } catch {}
            }
        }

        // Build Maps (follow backend guide)
        const catById = new Map();
        Object.entries(categorias).forEach(([id, nome]) => {
            catById.set(String(id), { id: Number(id), nome });
        });

        const itemById = new Map();
        todosItens.forEach(item => {
            itemById.set(String(item.id), item);
        });

        console.log('[CATEGORIAS] Maps criados:', {
            categorias: catById.size,
            itens: itemById.size
        });

        // Aggregate by category (follow backend guide)
        const countsAtual = new Map();
        extractArray(vendasMesAtual).forEach(venda => {
            const itens = getItensVenda(venda);
            if (Array.isArray(itens)) {
                itens.forEach(itemVenda => {
                    const itemObj = itemVenda.item || {};
                    const itemId = String(itemObj.id ?? getItemId(itemVenda) ?? '');
                    const knownItem = itemById.get(itemId);

                    const catIdRaw =
                        itemObj.fkCategoria ??
                        itemObj.idCategoria ??
                        itemObj.categoria?.id ??
                        knownItem?.fkCategoria ??
                        knownItem?.idCategoria ??
                        knownItem?.categoria?.id;

                    const catId = catIdRaw != null ? String(catIdRaw) : 'sem-categoria';
                    const qty = getItemQtdVendida(itemVenda) || 1;

                    countsAtual.set(catId, (countsAtual.get(catId) || 0) + qty);
                });
            }
        });
        console.log('[CATEGORIAS] countsAtual:', Object.fromEntries(countsAtual));

        const countsAnterior = new Map();
        extractArray(vendasMesAnterior).forEach(venda => {
            const itens = getItensVenda(venda);
            if (Array.isArray(itens)) {
                itens.forEach(itemVenda => {
                    const itemObj = itemVenda.item || {};
                    const itemId = String(itemObj.id ?? getItemId(itemVenda) ?? '');
                    const knownItem = itemById.get(itemId);

                    const catIdRaw =
                        itemObj.fkCategoria ??
                        itemObj.idCategoria ??
                        itemObj.categoria?.id ??
                        knownItem?.fkCategoria ??
                        knownItem?.idCategoria ??
                        knownItem?.categoria?.id;

                    const catId = catIdRaw != null ? String(catIdRaw) : 'sem-categoria';
                    const qty = getItemQtdVendida(itemVenda) || 1;

                    countsAnterior.set(catId, (countsAnterior.get(catId) || 0) + qty);
                });
            }
        });
        console.log('[CATEGORIAS] countsAnterior:', Object.fromEntries(countsAnterior));

        // Build sorted top 5 (follow backend guide)
        const todasCategorias = new Set([
            ...countsAtual.keys(),
            ...countsAnterior.keys()
        ]);

        const categoriasComparacao = Array.from(todasCategorias).map(catId => {
            const cat = catById.get(catId);
            return {
                id: catId === 'sem-categoria' ? null : Number(catId),
                nome: catId === 'sem-categoria' ? 'Sem categoria' : (cat?.nome ?? `Categoria ${catId}`),
                vendasAtual: countsAtual.get(catId) || 0,
                vendasAnterior: countsAnterior.get(catId) || 0
            };
        });

        categoriasComparacao.sort((a, b) => b.vendasAtual - a.vendasAtual);
        const top5 = categoriasComparacao.slice(0, 5);
        
        console.log('[CATEGORIAS] Top 5 final:', top5);

        return {
            labels: top5.map(c => c.nome),
            serie1: top5.map(c => c.vendasAnterior),
            serie2: top5.map(c => c.vendasAtual)
        };
    } catch (error) {
        console.error('Error fetching top categories:', error);
        return { labels: [], serie1: [], serie2: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 2 (Novo formato): Categoria campeã por mês (últimos 3)
// Uma barra por mês com a categoria mais vendida e cor por categoria
// ═══════════════════════════════════════════════════════════════
export const getCategoriesTopPerLast3Months = async () => {
    try {
        const hoje = new Date();
        const meses = [];
        for (let i = 2; i >= 0; i--) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mes = d.toISOString().substring(0, 7);
            const inicio = `${mes}-01`;
            const fim = (i === 0)
                ? hoje.toISOString().split('T')[0]
                : new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
            meses.push({ d, mes, inicio, fim });
        }

        // Catálogo de itens e categorias
        const [itensResp, categoriasResp] = await Promise.all([
            API.get('/itens?size=10000').catch(e => e),
            API.get('/categorias?size=1000').catch(e => e)
        ]);
        let itens = extractArray(itensResp);
        if (!itens.length) {
            for (const ep of ['/itens?size=10000', '/itens', '/item', '/produtos', '/vestuarios']) {
                try { const r = await API.get(ep); itens = extractArray(r); if (itens.length) break; } catch {}
            }
        }
        let categoriasArr = extractArray(categoriasResp);
        if (!categoriasArr.length) {
            for (const ep of ['/categoria', '/category']) {
                try { const r = await API.get(ep); categoriasArr = extractArray(r); if (categoriasArr.length) break; } catch {}
            }
        }

        const itemById = new Map();
        itens.forEach(it => itemById.set(String(it.id), it));
        const catById = new Map();
        categoriasArr.forEach(c => catById.set(String(c.id), { id: Number(c.id), nome: c.nome }));

        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labels = meses.map(m => `${mesesAbrev[m.d.getMonth()]}/${String(m.d.getFullYear()).slice(-2)}`);

        // Função helper cor por categoria (determinística)
        const palette = ['#6B3563', '#864176', '#B08AAA', '#F2C9E0', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C', '#8ECAE6'];
        const colorForCat = (catId) => {
            if (catId == null) return '#B0B0B0';
            const idx = Math.abs(Number(catId)) % palette.length;
            return palette[idx];
        };

        const topMeta = [];
        const valores = [];
        const cores = [];

        for (const m of meses) {
            const resp = await API.get(`/vendas/filtrar-por-data?inicio=${m.inicio}&fim=${m.fim}`);
            const vendas = extractArray(resp);

            const counts = new Map(); // catId -> qtd
            vendas.forEach(v => {
                const itensVenda = getItensVenda(v);
                if (!Array.isArray(itensVenda)) return;
                itensVenda.forEach(iv => {
                    const io = iv.item || {};
                    const itemId = String(io.id ?? getItemId(iv) ?? '');
                    const knownItem = itemById.get(itemId);
                    const catIdRaw = io.fkCategoria ?? io.idCategoria ?? io.categoria?.id ?? knownItem?.fkCategoria ?? knownItem?.idCategoria ?? knownItem?.categoria?.id;
                    const catId = catIdRaw != null ? String(catIdRaw) : 'sem-categoria';
                    const qtd = getItemQtdVendida(iv) || 1;
                    counts.set(catId, (counts.get(catId) || 0) + qtd);
                });
            });

            // Escolhe top: maior qtd, tie-break por id numérico asc
            const arr = Array.from(counts.entries()).map(([catId, qtd]) => ({
                catId,
                qtd,
                idNum: catId === 'sem-categoria' ? Number.MAX_SAFE_INTEGER : Number(catId)
            }));
            arr.sort((a, b) => b.qtd - a.qtd || a.idNum - b.idNum);
            const top = arr[0] || { catId: 'sem-categoria', qtd: 0, idNum: Number.MAX_SAFE_INTEGER };
            const catInfo = catById.get(top.catId) || { id: null, nome: top.catId === 'sem-categoria' ? 'Sem categoria' : `Categoria ${top.catId}` };
            const cor = colorForCat(catInfo.id);

            topMeta.push({
                monthLabel: `${mesesAbrev[m.d.getMonth()]}/${String(m.d.getFullYear()).slice(-2)}`,
                categoryId: catInfo.id,
                categoryName: catInfo.nome,
                count: top.qtd,
                color: cor
            });
            valores.push(top.qtd);
            cores.push(cor);
        }

        return {
            labels,
            values: valores,
            colors: cores,
            meta: topMeta
        };
    } catch (error) {
        console.error('Error fetching categories top per last 3 months:', error);
        return { labels: [], values: [], colors: [], meta: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 3: COMPARAÇÃO MENSAL
// ═══════════════════════════════════════════════════════════════
export const getMonthlySalesComparison = async () => {
    try {
        const quantidadeMeses = 3;
        const hoje = new Date();
        const meses = [];

        for (let i = quantidadeMeses - 1; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mesString = data.toISOString().substring(0, 7);
            
            meses.push({
                mes: mesString,
                inicio: `${mesString}-01`,
                fim: i === 0 ? hoje.toISOString().split('T')[0] : new Date(data.getFullYear(), data.getMonth() + 1, 0).toISOString().split('T')[0]
            });
        }

        const dadosMeses = await Promise.all(meses.map(async (mes) => {
            const response = await API.get(`/vendas/filtrar-por-data?inicio=${mes.inicio}&fim=${mes.fim}`);
            const vendas = extractArray(response);
            
            return {
                totalVendas: vendas.length,
                faturamento: vendas.reduce((sum, v) => sum + getVendaTotalWithFallback(v), 0)
            };
        }));

        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labels = meses.map(m => {
            const [ano, mes] = m.mes.split('-').map(Number);
            return `${mesesAbrev[(mes - 1 + 12) % 12]}/${String(ano).slice(-2)}`;
        });

        return {
            labels,
            serie1: dadosMeses.map(d => d.totalVendas),
            // Escala o faturamento para centenas para caber junto com contagem (ajuste visual)
            serie2: dadosMeses.map(d => Math.round(d.faturamento / 100))
        };
    } catch (error) {
        console.error('Error fetching monthly sales comparison:', error);
        return { labels: [], serie1: [], serie2: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 4: TENDÊNCIA DE FATURAMENTO
// ═══════════════════════════════════════════════════════════════
export const getRevenueTrend = async () => {
    try {
        const quantidadeMeses = 10; // meses históricos
        const previsaoMeses = 3;    // projeção
        const hoje = new Date();
        const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth() - quantidadeMeses + 1, 1);

        const response = await API.get(
            `/vendas/filtrar-por-data?inicio=${dataInicial.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`
        );
        const todasVendas = extractArray(response);

        const vendasPorMes = {};
        todasVendas.forEach(venda => {
            const dataISO = getVendaDateISO(venda);
            if (!dataISO) return;
            const mesAno = dataISO.substring(0, 7);
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = [];
            }
            vendasPorMes[mesAno].push(venda);
        });

        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labelsHistoricos = [];
        const faturamentosHistoricos = [];

        for (let i = 0; i < quantidadeMeses; i++) {
            const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
            const mesAno = data.toISOString().substring(0, 7);
            const mesFormatado = `${mesesAbrev[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;

            const vendas = vendasPorMes[mesAno] || [];
            const faturamento = vendas.reduce((sum, v) => sum + getVendaTotalWithFallback(v), 0);

            labelsHistoricos.push(mesFormatado);
            faturamentosHistoricos.push(faturamento);
        }

        // Regressão linear simples (OLS) y = a + b*x
        const computeOLS = (ys) => {
            const n = ys.length;
            const xs = Array.from({ length: n }, (_, i) => i);
            const mean = (arr) => (arr.reduce((s, v) => s + v, 0)) / (arr.length || 1);
            const xBar = mean(xs);
            const yBar = mean(ys);
            let num = 0;
            let den = 0;
            for (let i = 0; i < n; i++) {
                num += (xs[i] - xBar) * (ys[i] - yBar);
                den += (xs[i] - xBar) ** 2;
            }
            const b = den === 0 ? 0 : num / den; // inclinação
            const a = yBar - b * xBar; // intercepto
            return { a, b };
        };

        const { a, b } = computeOLS(faturamentosHistoricos);

        // Gera próximas labels e valores previstos
        const labelsPrevisao = [];
        const valoresPrevistosSomente = [];
        const baseDate = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + quantidadeMeses, 1);
        for (let j = 0; j < previsaoMeses; j++) {
            const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + j, 1);
            const label = `${mesesAbrev[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
            labelsPrevisao.push(label);
            const x = quantidadeMeses + j; // continuar a sequência de x
            const yPred = Math.max(0, a + b * x);
            valoresPrevistosSomente.push(yPred);
        }

        // Monta arrays alinhados para dois datasets: histórico e previsão
        const labelsCompletas = [...labelsHistoricos, ...labelsPrevisao];
        const historico = [...faturamentosHistoricos, ...Array(previsaoMeses).fill(null)];
        const previsao = [...Array(quantidadeMeses).fill(null), ...valoresPrevistosSomente];

        return {
            labels: labelsCompletas,
            historico,
            previsao
        };
    } catch (error) {
        console.error('Error fetching revenue trend:', error);
        return { labels: [], historico: [], previsao: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 5: TENDÊNCIA DE VENDAS
// ═══════════════════════════════════════════════════════════════
export const getSalesTrend = async () => {
    try {
        const quantidadeMeses = 10; // meses históricos
        const previsaoMeses = 3;    // projeção
        const hoje = new Date();
        const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth() - quantidadeMeses + 1, 1);

        const response = await API.get(
            `/vendas/filtrar-por-data?inicio=${dataInicial.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`
        );
        const todasVendas = extractArray(response);

        const vendasPorMes = {};
        todasVendas.forEach(venda => {
            const dataISO = getVendaDateISO(venda);
            if (!dataISO) return;
            const mesAno = dataISO.substring(0, 7);
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = 0;
            }
            vendasPorMes[mesAno]++;
        });

        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labelsHistoricos = [];
        const totaisHistoricos = [];

        for (let i = 0; i < quantidadeMeses; i++) {
            const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
            const mesAno = data.toISOString().substring(0, 7);
            const mesFormatado = `${mesesAbrev[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;

            const totalVendas = vendasPorMes[mesAno] || 0;
            labelsHistoricos.push(mesFormatado);
            totaisHistoricos.push(totalVendas);
        }

        // Regressão linear simples (OLS) y = a + b*x
        const computeOLS = (ys) => {
            const n = ys.length;
            const xs = Array.from({ length: n }, (_, i) => i);
            const mean = (arr) => (arr.reduce((s, v) => s + v, 0)) / (arr.length || 1);
            const xBar = mean(xs);
            const yBar = mean(ys);
            let num = 0;
            let den = 0;
            for (let i = 0; i < n; i++) {
                num += (xs[i] - xBar) * (ys[i] - yBar);
                den += (xs[i] - xBar) ** 2;
            }
            const b = den === 0 ? 0 : num / den; // inclinação
            const a = yBar - b * xBar; // intercepto
            return { a, b };
        };

        const { a, b } = computeOLS(totaisHistoricos);

        // Próximos meses previstos
        const labelsPrevisao = [];
        const valoresPrevistosSomente = [];
        const baseDate = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + quantidadeMeses, 1);
        for (let j = 0; j < previsaoMeses; j++) {
            const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + j, 1);
            const label = `${mesesAbrev[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
            labelsPrevisao.push(label);
            const x = quantidadeMeses + j;
            const yPred = Math.max(0, a + b * x);
            valoresPrevistosSomente.push(yPred);
        }

        const labelsCompletas = [...labelsHistoricos, ...labelsPrevisao];
        const historico = [...totaisHistoricos, ...Array(previsaoMeses).fill(null)];
        const previsao = [...Array(quantidadeMeses).fill(null), ...valoresPrevistosSomente];

        return {
            labels: labelsCompletas,
            historico,
            previsao
        };
    } catch (error) {
        console.error('Error fetching sales trend:', error);
        return { labels: [], historico: [], previsao: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// NOVO: Clientes únicos por mês + previsão (3 meses)
// ═══════════════════════════════════════════════════════════════
export const getCustomersEvolution = async (historicoMeses = 10, previsaoMeses = 3) => {
    try {
        const hoje = new Date();
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - historicoMeses + 1, 1);
        const fmt = (d) => d.toISOString().split('T')[0];

        const resp = await API.get(`/vendas/filtrar-por-data?inicio=${fmt(inicio)}&fim=${fmt(hoje)}`);
        const vendas = extractArray(resp);

        // clientes únicos por mês
        const clientesPorMes = new Map(); // key YYYY-MM -> Set(clienteId)
        vendas.forEach(v => {
            const dataISO = getVendaDateISO(v);
            const cid = getClienteId(v);
            if (!dataISO || !cid) return;
            const mes = dataISO.substring(0, 7);
            if (!clientesPorMes.has(mes)) clientesPorMes.set(mes, new Set());
            clientesPorMes.get(mes).add(cid);
        });

        const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labelsHistoricos = [];
        const countsHistoricos = [];
        for (let i = 0; i < historicoMeses; i++) {
            const d = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
            const key = d.toISOString().substring(0, 7);
            const label = `${mesesAbrev[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`;
            labelsHistoricos.push(label);
            countsHistoricos.push((clientesPorMes.get(key)?.size) || 0);
        }

        // OLS simples
        const n = countsHistoricos.length;
        const xs = Array.from({ length: n }, (_, i) => i);
        const mean = (arr) => arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
        const xBar = mean(xs);
        const yBar = mean(countsHistoricos);
        let num = 0, den = 0, sst = 0, sse = 0;
        for (let i = 0; i < n; i++) {
            num += (xs[i] - xBar) * (countsHistoricos[i] - yBar);
            den += (xs[i] - xBar) ** 2;
            sst += (countsHistoricos[i] - yBar) ** 2;
        }
        const b = den === 0 ? 0 : num / den;
        const a = yBar - b * xBar;
        for (let i = 0; i < n; i++) {
            const yhat = a + b * xs[i];
            sse += (countsHistoricos[i] - yhat) ** 2;
        }
        const r2 = sst === 0 ? 0 : Math.max(0, 1 - (sse / sst));
        
        console.log('[CUSTOMERS EVOLUTION] Debug:', {
            n,
            countsHistoricos,
            a: a.toFixed(2),
            b: b.toFixed(4),
            r2: r2.toFixed(3),
            sst: sst.toFixed(2),
            sse: sse.toFixed(2)
        });

        const labelsPrevisao = [];
        const previstosSomente = [];
        const base = new Date(inicio.getFullYear(), inicio.getMonth() + historicoMeses, 1);
        for (let j = 0; j < previsaoMeses; j++) {
            const d = new Date(base.getFullYear(), base.getMonth() + j, 1);
            labelsPrevisao.push(`${mesesAbrev[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`);
            const x = historicoMeses + j;
            const yPred = Math.max(0, Math.round(a + b * x));
            previstosSomente.push(yPred);
        }

        const labels = [...labelsHistoricos, ...labelsPrevisao];
        let historico = [...countsHistoricos, ...Array(previsaoMeses).fill(null)];
        let previsao = [...Array(historicoMeses).fill(null), ...previstosSomente];

        const todosZero = countsHistoricos.every(v => v === 0);
        const warn = (n < 4) || todosZero;
        if (warn) {
            // não extrapola se pouco confiável
            historico = [...countsHistoricos];
            previsao = [];
        }

        return {
            labels,
            historico,
            previsao,
            meta: { warn, r2: Number.isFinite(r2) ? Math.round(r2 * 100) / 100 : 0 }
        };
    } catch (error) {
        console.error('Error fetching customers evolution:', error);
        return { labels: [], historico: [], previsao: [], meta: { warn: true, r2: 0 } };
    }
};

// Default export
const DashboardService = {
    getAverageTicket,
    getSeasonalIndex,
    getCustomerRetention,
    getLoyalCustomersStats,
    getStockSalesRelation,
    getTopCategoriesByMonth,
    getCategoriesTopPerLast3Months,
    getMonthlySalesComparison,
    getCustomersEvolution,
    getRevenueTrend,
    getSalesTrend
};

export default DashboardService;
