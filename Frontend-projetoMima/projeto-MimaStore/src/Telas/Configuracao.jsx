import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/Configuracao.module.css';
import API from '../Provider/API';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';

export function Configuracao() {
    const navigate = useNavigate();
    const voltarAoMenu = () => navigate('/menu-inicial');

    const opcoes = [
        { key: 'Nome', titulo: 'Nome' },
        { key: 'E-mail', titulo: 'E-mail' },
        { key: 'Telefone', titulo: 'Telefone' },
        { key: 'Endereço', titulo: 'Endereço' },
        { key: 'Cargo', titulo: 'Cargo' },
        { key: 'Senha', titulo: 'Senha' },
    ];

    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [imagemErro, setImagemErro] = useState(false);
    // editMain controla edição no painel principal
    const [editMain, setEditMain] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        endereco: '',
        imagemFile: null
    });

    function getEmailFromToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const obj = JSON.parse(jsonPayload);
            return obj.sub || obj.user_name || obj.email || null;
        } catch (e) {
            console.error('Erro ao decodificar token:', e);
            return null;
        }
    }

    useEffect(() => {
        async function carregarUsuario() {
            setLoading(true);
            setErro('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const email = getEmailFromToken(token);
            try {
                const res = await API.get('/usuarios');
                const lista = res.data;
                const encontrado = lista.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
                if (encontrado) {
                    console.log('Usuário encontrado:', encontrado);
                    console.log('URL da imagem:', encontrado.imagem);
                    setUsuario(encontrado);
                    setImagemErro(false); // reset erro de imagem
                    setForm({
                        nome: encontrado.nome || '',
                        email: encontrado.email || '',
                        telefone: encontrado.telefone || '',
                        cargo: encontrado.cargo || '',
                        endereco: encontrado.endereco || '',
                        imagemFile: null
                    });
                } else {
                    setErro('Usuário autenticado não encontrado no servidor');
                }
            } catch (e) {
                console.error('Erro ao carregar usuário:', e);
                setErro('Erro ao carregar informações do usuário');
            } finally {
                setLoading(false);
            }
        }

        carregarUsuario();
    }, [navigate]);

    const handleSaveMain = async (e) => {
        e.preventDefault();
        if (!usuario) return;
        try {
            const fd = new FormData();
            fd.append('nome', form.nome);
            fd.append('email', form.email);
            fd.append('telefone', form.telefone);
            fd.append('cargo', form.cargo);
            fd.append('endereco', form.endereco);
            if (form.imagemFile) fd.append('imagem', form.imagemFile);

            // Não setar Content-Type manualmente para que o browser inclua o boundary
            const res = await API.put(`/usuarios/${usuario.id}`, fd);
            setUsuario(res.data);
            setEditMain(false);
        } catch (err) {
            console.error('Erro ao atualizar usuário', err);
            setErro('Erro ao salvar alterações');
        }
    };

    const handleCancelMain = () => {
        // reset form to current usuario
        if (usuario) {
            setForm({
                nome: usuario.nome ,
                email: usuario.email || '',
                telefone: usuario.telefone ,
                cargo: usuario.cargo || '',
                endereco: usuario.endereco || '',
                imagemFile: null
            });
        }
        setEditMain(false);
    };

    return (
        <div>
            <Navbar />
            <FaixaVoltar aoClicar={voltarAoMenu} />
            <div className={styles['container-gestao']}>
                <div className={styles['layout']}>
                    <aside className={styles['sidebar']}>
                        <div className={styles['profile-card']}>
                            <div className={styles['profile-row']}>
                                <div className={styles['avatar']} aria-hidden>
                                    {usuario?.imagem ? (
                                        <img 
                                            src={usuario.imagem} 
                                            alt="Avatar" 
                                            onError={(e) => {
                                                console.error('Erro ao carregar imagem:', usuario.imagem);
                                                setImagemErro(true);
                                                e.target.style.display = 'none';
                                            }}
                                            onLoad={() => {
                                                console.log('Imagem carregada com sucesso:', usuario.imagem);
                                                setImagemErro(false);
                                            }}
                                        />
                                    ) : null}
                                    {imagemErro && (
                                        <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
                                            Erro ao carregar foto
                                        </div>
                                    )}
                                </div>
                                <div className={styles['profile-text']}>
                                    <div className={styles['profile-name']}>{usuario?.nome || 'Seu nome'}</div>
                                    <div className={styles['profile-email']}>{usuario?.email || 'seu.email@exemplo.com'}</div>
                                </div>
                            </div>

                            {/* <div className={styles['profile-actions']}>
                                <label className={styles['upload-label']}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (ev) => {
                                            const file = ev.target.files?.[0];
                                            if (!file || !usuario) return;
                                            setLoading(true);
                                            setErro('');
                                            try {
                                                const fd = new FormData();
                                                fd.append('nome', usuario.nome || '');
                                                fd.append('email', usuario.email || '');
                                                fd.append('telefone', usuario.telefone || '');
                                                fd.append('cargo', usuario.cargo || '');
                                                fd.append('endereco', usuario.endereco || '');
                                                fd.append('imagem', file);

                                                const res = await API.put(`/usuarios/${usuario.id}`, fd);
                                                console.log('Resposta após upload:', res.data);
                                                console.log('Nova URL da imagem:', res.data.imagem);
                                                setUsuario(res.data);
                                                setImagemErro(false);
                                            } catch (err) {
                                                console.error('Erro ao enviar imagem', err);
                                                console.error('Detalhes do erro:', err.response?.data);
                                                setErro('Erro ao enviar imagem');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                </label>
                            </div> */}

                            {loading && <div style={{ marginTop: 8 }}>Carregando...</div>}
                            {erro && <div style={{ marginTop: 8, color: 'crimson' }}>{erro}</div>}
                        </div>

                        {/* Lado esquerdo reduzido: somente upload de imagem (o resto removido conforme solicitado) */}
                    </aside>

                    <main className={styles['main']}>
                        <div className={styles['main-card']}>
                            <h2 className={styles['panel-title']}>Painel de configurações</h2>
                            <p className={styles['muted']}>Selecione uma opção na coluna à esquerda para visualizar ou editar seus ajustes.</p>

                            {editMain ? (
                                <form className={styles['edit-form']} onSubmit={handleSaveMain}>
                                    <label className={styles['field']}>
                                        <span>Nome</span>
                                        <input name="nome" value={form.nome} onChange={(ev) => setForm({...form, nome: ev.target.value})} />
                                    </label>
                                    <label className={styles['field']}>
                                        <span>E-mail</span>
                                        <input name="email" value={form.email} onChange={(ev) => setForm({...form, email: ev.target.value})} />
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Telefone</span>
                                        <input name="telefone" value={form.telefone} onChange={(ev) => setForm({...form, telefone: ev.target.value})} />
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Cargo</span>
                                        <input name="cargo" value={form.cargo} onChange={(ev) => setForm({...form, cargo: ev.target.value})} />
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Endereço</span>
                                        <input name="endereco" value={form.endereco} onChange={(ev) => setForm({...form, endereco: ev.target.value})} />
                                    </label>
                                    <div className={styles['field']}>
                                        <span>Imagem (opcional)</span>
                                        <div className={styles['file-upload-wrapper']}>
                                            <label htmlFor="file-upload" className={styles['file-upload-button']}>
                                            Escolher imagem
                                            </label>
                                            <input 
                                                id="file-upload"
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(ev) => setForm({...form, imagemFile: ev.target.files?.[0] || null})} 
                                            />
                                            {form.imagemFile && (
                                                <span className={styles['file-name']}>
                                                    Arquivo selecionado: {form.imagemFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles['form-actions']}>
                                        <button type="submit" className={styles['btn-novo']}>Salvar</button>
                                        <button type="button" className={styles['btn-secondary']} onClick={handleCancelMain}>Cancelar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles['grid']}>
                                    {opcoes.map(o => (
                                        <div 
                                            key={o.key} 
                                            className={styles['option-card']}
                                            onClick={() => {
                                                if (o.key === 'Senha') {
                                                    navigate('/mudar-senha');
                                                }
                                            }}
                                            style={o.key === 'Senha' ? { cursor: 'pointer' } : {}}
                                        >
                                            <div className={styles['card-title']}>{o.titulo}</div>
                                            <div className={styles['card-desc']}>
                                                {usuario ? (
                                                    (() => {
                                                        switch (o.key) {
                                                            case 'Nome': return usuario.nome || '-';
                                                            case 'E-mail': return usuario.email || '-';
                                                            case 'Telefone': return usuario.telefone ;
                                                            case 'Endereço': return usuario.endereco ;
                                                            case 'Cargo': return usuario.cargo ;
                                                            case 'Senha': return (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                               
                                                                    <span style={{ fontSize: '12px', color: '#864176', textDecoration: 'underline' }}>
                                                                        (Clique para alterar)
                                                                    </span>
                                                                 </span>
                                                            );
                                                            // default: return '-';
                                                        }
                                                    })()
                                                ) : '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            
                            {!editMain && (
                                <button className={styles['edit-button']} onClick={() => setEditMain(true)}>
                                    Editar informações
                                </button>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Configuracao;
