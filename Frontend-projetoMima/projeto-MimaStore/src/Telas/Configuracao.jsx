import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/GestaoFornecedor.module.css';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';

export function Configuracao() {
    const navigate = useNavigate();
    const voltarAoMenu = () => navigate('/menu-inicial');

    // Opções de exemplo — seguem a estrutura visual da imagem enviada
    const opcoes = [
        { key: 'info', titulo: 'Suas informações', descricao: 'Foto do perfil' },
        { key: 'entrada', titulo: 'Opções de entrada', descricao: 'Windows Hello, senha, bloqueio dinâmico' },
        { key: 'dispositivos', titulo: 'Dispositivos vinculados', descricao: 'Gerencie dispositivos conectados' },
        { key: 'email', titulo: 'Email & accounts', descricao: 'Contas usadas por e-mail, calendário e contatos' },
        { key: 'familia', titulo: 'Família', descricao: 'Gerencie o grupo da família' },
        { key: 'backup', titulo: 'Backup do Windows', descricao: 'Backup de arquivos, aplicativos e preferências' },
        { key: 'outros', titulo: 'Outros usuários', descricao: 'Acesso a dispositivos e contas de convidado' },
        { key: 'trabalho', titulo: 'Acessar o trabalho ou a escola', descricao: 'Recursos da organização' },
        { key: 'chaves', titulo: 'Chaves de acesso', descricao: 'Use rosto, impressão digital ou PIN' }
    ];

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />

            <div className={styles['container-gestao']}>
                <div className={styles['header-gestao']}>
                    <h1 className={styles['titulo-gestao']}>Configurações</h1>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
                    {/* Coluna lateral (perfil + atalhos) */}
                    <aside style={{ width: 320 }}>
                        <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e6e6e6' }} aria-hidden />
                                <div>
                                    <div style={{ fontWeight: 700 }}>Seu nome</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>seu.email@exemplo.com</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 14 }}>
                                <button className={styles['btn-novo']} style={{ width: '100%' }}>Editar perfil</button>
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div className={styles['tabela-container'] || ''} style={{ padding: 8 }}>
                                {opcoes.slice(0, 4).map(o => (
                                    <div key={o.key} style={{ padding: '10px 6px', borderBottom: '1px solid #f1f1f1' }}>
                                        <div style={{ fontWeight: 600 }}>{o.titulo}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>{o.descricao}</div>
                                    </div>
                                ))}
                                <div style={{ padding: '10px 6px', color: '#0a66c2', cursor: 'pointer' }}>Mais configurações</div>
                            </div>
                        </div>
                    </aside>

                    {/* Área principal — cartões/esqueleto de conteúdo */}
                    <main style={{ flex: 1 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, minHeight: 420, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                            <h2 style={{ marginTop: 0 }}>Painel de configurações</h2>
                            <p style={{ color: '#666' }}>Selecione uma opção na coluna à esquerda para visualizar ou editar seus ajustes.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 18 }}>
                                {opcoes.map(o => (
                                    <div key={o.key} style={{ background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #f0f0f0' }}>
                                        <div style={{ fontWeight: 600 }}>{o.titulo}</div>
                                        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>{o.descricao}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Configuracao;
