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
        // Expecting YYYY-MM-DD or ISO; fallback: take first 10 chars when present
        return raw.length >= 10 ? raw.substring(0, 10) : new Date(raw).toISOString().substring(0, 10);
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

const getItemId = (itemVenda) => itemVenda?.item?.id ?? itemVenda?.fkItem ?? itemVenda?.idItem ?? itemVenda?.item_id;
const getItemQtdVendida = (itemVenda) => toNumber(itemVenda?.qtdParaVender ?? itemVenda?.quantidade ?? itemVenda?.qtd ?? itemVenda?.qtd_vendida);

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
            API.get('/itens?size=1000'),
            API.get(`/vendas/filtrar-por-data?inicio=${seteDiasAtras.toISOString().split('T')[0]}&fim=${hoje.toISOString().split('T')[0]}`)
        ]);

    const todosItens = extractArray(itensResponse);
        const vendas = extractArray(vendasSemana);

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
        vendas.forEach(venda => {
            if (venda.itensVenda && Array.isArray(venda.itensVenda)) {
                venda.itensVenda.forEach(itemVenda => {
                    const itemId = getItemId(itemVenda);
                    if (itemId) {
                        vendasPorItem[itemId] = (vendasPorItem[itemId] || 0) + getItemQtdVendida(itemVenda);
                    }
                });
            }
        });

        console.log('[ESTOQUE X VENDAS] Vendas por item:', vendasPorItem);

        const itensComRazao = todosItens.map(item => {
            const vendas = vendasPorItem[item.id] || 0;
            const estoque = item.qtdEstoque || item.qtd_estoque || 0;
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

        return {
            labels: pageItens.map(i => i.codigo || (i.nome ? i.nome.substring(0, 15) : `#${i.id}`)),
            vendas: pageItens.map(i => i.vendas),
            estoque: pageItens.map(i => i.estoque),
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
            API.get('/itens?size=1000')
        ]);

    const todosItens = extractArray(itensResponse);

        console.log('[CATEGORIAS] Dados recebidos:', {
            vendasAtual: extractArray(vendasMesAtual).length,
            vendasAnterior: extractArray(vendasMesAnterior).length,
            itens: todosItens.length
        });

        const vendasAtualArr = extractArray(vendasMesAtual);
        if (vendasAtualArr.length > 0) {
            console.log('[CATEGORIAS] Estrutura venda[0]:', vendasAtualArr[0]);
            if (Array.isArray(vendasAtualArr[0]?.itensVenda)) {
                console.log('[CATEGORIAS] itensVenda[0]:', vendasAtualArr[0].itensVenda[0]);
            } else {
                console.warn('[CATEGORIAS] itensVenda ausente na venda; verifique backend (lazy/eager).');
            }
        }

        const itemCategoria = {};
        todosItens.forEach(item => {
            const cat = item.categoria || item.categoriaVestiario || item.categoriaVestuario || item.categoriaProduto || item.categoria_produto;
            if (cat) {
                itemCategoria[item.id] = {
                    id: cat.id,
                    nome: cat.nome
                };
            }
        });

        const vendasPorCategoriaAtual = {};
        extractArray(vendasMesAtual).forEach(venda => {
            if (venda.itensVenda && Array.isArray(venda.itensVenda)) {
                venda.itensVenda.forEach(itemVenda => {
                    const itemId = getItemId(itemVenda);
                    if (itemId) {
                        let info = itemCategoria[itemId];
                        // fallback: tentar pela venda.item.categoria
                        if (!info) {
                            const cat = itemVenda?.item?.categoria || itemVenda?.item?.categoriaVestiario || itemVenda?.item?.categoriaVestuario;
                            if (cat) {
                                info = { id: cat.id, nome: cat.nome };
                                itemCategoria[itemId] = info;
                            }
                        }
                        if (!info) return;
                        const catId = info.id;
                        const catNome = info.nome;
                        if (!vendasPorCategoriaAtual[catId]) {
                            vendasPorCategoriaAtual[catId] = { id: catId, nome: catNome, count: 0 };
                        }
                        vendasPorCategoriaAtual[catId].count++;
                    }
                });
            }
        });

        const vendasPorCategoriaAnterior = {};
        extractArray(vendasMesAnterior).forEach(venda => {
            if (venda.itensVenda && Array.isArray(venda.itensVenda)) {
                venda.itensVenda.forEach(itemVenda => {
                    const itemId = getItemId(itemVenda);
                    if (itemId) {
                        let info = itemCategoria[itemId];
                        if (!info) {
                            const cat = itemVenda?.item?.categoria || itemVenda?.item?.categoriaVestiario || itemVenda?.item?.categoriaVestuario;
                            if (cat) {
                                info = { id: cat.id, nome: cat.nome };
                                itemCategoria[itemId] = info;
                            }
                        }
                        if (!info) return;
                        const catId = info.id;
                        const catNome = info.nome;
                        if (!vendasPorCategoriaAnterior[catId]) {
                            vendasPorCategoriaAnterior[catId] = { id: catId, nome: catNome, count: 0 };
                        }
                        vendasPorCategoriaAnterior[catId].count++;
                    }
                });
            }
        });

        const todasCategorias = new Set([
            ...Object.keys(vendasPorCategoriaAtual),
            ...Object.keys(vendasPorCategoriaAnterior)
        ]);

        const categoriasComparacao = Array.from(todasCategorias).map(catId => {
            const atual = vendasPorCategoriaAtual[catId] || { id: catId, nome: '', count: 0 };
            const anterior = vendasPorCategoriaAnterior[catId] || { count: 0 };
            
            return {
                id: parseInt(catId),
                nome: atual.nome || anterior.nome || 'Desconhecida',
                vendasAtual: atual.count,
                vendasAnterior: anterior.count
            };
        });

        categoriasComparacao.sort((a, b) => b.vendasAtual - a.vendasAtual);
        const top5 = categoriasComparacao.slice(0, 5);

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
        const quantidadeMeses = 10;
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
        const dadosTendencia = [];

        for (let i = 0; i < quantidadeMeses; i++) {
            const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
            const mesAno = data.toISOString().substring(0, 7);
            const mesFormatado = `${mesesAbrev[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
            
            const vendas = vendasPorMes[mesAno] || [];
            const faturamento = vendas.reduce((sum, v) => sum + getVendaTotalWithFallback(v), 0);
            
            dadosTendencia.push({
                mes: mesFormatado,
                faturamento: faturamento
            });
        }

        return {
            labels: dadosTendencia.map(d => d.mes),
            valores: dadosTendencia.map(d => d.faturamento)
        };
    } catch (error) {
        console.error('Error fetching revenue trend:', error);
        return { labels: [], valores: [] };
    }
};

// ═══════════════════════════════════════════════════════════════
// GRÁFICO 5: TENDÊNCIA DE VENDAS
// ═══════════════════════════════════════════════════════════════
export const getSalesTrend = async () => {
    try {
        const quantidadeMeses = 10;
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
        const dadosTendencia = [];

        for (let i = 0; i < quantidadeMeses; i++) {
            const data = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, 1);
            const mesAno = data.toISOString().substring(0, 7);
            const mesFormatado = `${mesesAbrev[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
            
            const totalVendas = vendasPorMes[mesAno] || 0;
            
            dadosTendencia.push({
                mes: mesFormatado,
                totalVendas: totalVendas
            });
        }

        return {
            labels: dadosTendencia.map(d => d.mes),
            valores: dadosTendencia.map(d => d.totalVendas)
        };
    } catch (error) {
        console.error('Error fetching sales trend:', error);
        return { labels: [], valores: [] };
    }
};

// Default export
const DashboardService = {
    getAverageTicket,
    getSeasonalIndex,
    getCustomerRetention,
    getStockSalesRelation,
    getTopCategoriesByMonth,
    getMonthlySalesComparison,
    getRevenueTrend,
    getSalesTrend
};

export default DashboardService;
