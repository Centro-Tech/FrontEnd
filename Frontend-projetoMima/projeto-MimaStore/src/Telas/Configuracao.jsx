import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Componentes/Componentes - CSS/Configuracao.module.css';
import API from '../Provider/API';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import { getImageUrl } from '../utils/images';

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
    const [editMain, setEditMain] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        endereco: '',
        imagemFile: null
    });
    const [formErrors, setFormErrors] = useState({});

    const isValidEmail = (email) => {
        if (!email) return false;
        // simples verificação de formato
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

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
                    setImagemErro(false); 
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
        // reset erros anteriores
        setErro('');
        setFormErrors({});

        // validação cliente para evitar chamada desnecessária ao servidor
        const newErrors = {};
        const nomeVal = (form.nome || '').toString().trim();
        if (!nomeVal) newErrors.nome = 'O nome é obrigatório';

        const emailVal = (form.email || '').toString().trim();
        if (!emailVal) newErrors.email = 'O e-mail é obrigatório';
        else if (!isValidEmail(emailVal)) newErrors.email = 'Formato de e-mail inválido';

        const cargoVal = (form.cargo || '').toString().trim();
        if (!cargoVal) newErrors.cargo = 'O cargo é obrigatório';
        else if (cargoVal.length < 2 || cargoVal.length > 50) newErrors.cargo = 'O cargo deve ter entre 2 e 50 caracteres';

        const telVal = (form.telefone || '').toString().trim();
        if (!telVal) newErrors.telefone = 'O telefone é obrigatório';
        else if (telVal.length < 8 || telVal.length > 20) newErrors.telefone = 'O telefone deve ter entre 8 e 20 caracteres';

        const enderecoVal = (form.endereco || '').toString().trim();
        if (!enderecoVal) newErrors.endereco = 'O endereço é obrigatório';

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            return;
        }
        try {
            const fd = new FormData();
            fd.append('nome', form.nome);
            fd.append('email', form.email);
            fd.append('telefone', form.telefone);
            fd.append('cargo', form.cargo);
            fd.append('endereco', form.endereco);
            if (form.imagemFile) fd.append('imagem', form.imagemFile);

            const res = await API.put(`/usuarios/${usuario.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUsuario(res.data);
            setEditMain(false);
            setFormErrors({});
        } catch (err) {
            console.error('Erro ao atualizar usuário', err);
            // Tentar extrair mensagens de validação do servidor
            const data = err.response?.data;
            // formato comum: { violations: [ { propertyPath: 'cargo', message: '...' }, ... ] }
            if (data && Array.isArray(data.violations)) {
                const fieldErrors = {};
                data.violations.forEach(v => {
                    const prop = v.propertyPath || v.field || v.path || '';
                    if (prop) fieldErrors[prop] = v.message || v.msg || v.error || JSON.stringify(v);
                });
                setFormErrors(fieldErrors);
                setErro('Erros de validação no formulário');
            } else if (data && typeof data === 'object') {
                // possível mapa de campo -> mensagem
                const fieldErrors = {};
                let found = false;
                Object.keys(data).forEach(k => {
                    const v = data[k];
                    if (typeof v === 'string') {
                        fieldErrors[k] = v;
                        found = true;
                    }
                });
                if (found) {
                    setFormErrors(fieldErrors);
                    setErro('Erros de validação no formulário');
                } else if (data.message) {
                    setErro(data.message);
                } else {
                    setErro('Erro ao salvar alterações');
                }
            } else if (typeof data === 'string') {
                setErro(data);
            } else {
                setErro('Erro ao salvar alterações');
            }
        }
    };

    const handleCancelMain = () => {
        if (usuario) {
            setForm({
                nome: usuario.nome ,
                email: usuario.email || '',
                telefone: usuario.telefone ,
                cargo: usuario.cargo || '',
                endereco: usuario.endereco || '',
                imagemFile: null
            });
            setFormErrors({});
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
                                            src={getImageUrl(usuario.imagem)} 
                                            alt="Avatar" 
                                            onError={(e) => {
                                                console.error('Erro ao carregar imagem:', usuario.imagem);
                                                console.error('URL normalizada:', getImageUrl(usuario.imagem));
                                                setImagemErro(true);
                                                e.target.style.display = 'none';
                                            }}
                                            onLoad={() => {
                                                console.log('Imagem carregada com sucesso:', usuario.imagem);
                                                console.log('URL normalizada:', getImageUrl(usuario.imagem));
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

                            {loading && <div style={{ marginTop: 8 }}>Carregando...</div>}
                            {erro && <div style={{ marginTop: 8, color: 'crimson' }}>{erro}</div>}
                        </div>

                        {/* Lado esquerdo reduzido: somente upload de imagem (o resto removido conforme solicitado) */}
                    </aside>

                    <main className={styles['main']}>
                        <div className={styles['main-card']}>
                            <h2 className={styles['panel-title']}>Painel de configurações</h2>
                            <p className={styles['muted']}>Selecione uma opção na coluna à esquerda para visualizar ou editar seus ajustes.</p>
                            {erro && <div style={{ marginTop: 8, color: 'crimson' }}>{erro}</div>}

                            {editMain ? (
                                <form className={styles['edit-form']} onSubmit={handleSaveMain}>
                                    <label className={styles['field']}>
                                        <span>Nome</span>
                                        <input name="nome" value={form.nome} onChange={(ev) => setForm({...form, nome: ev.target.value})} />
                                        {formErrors.nome && (
                                            <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
                                                {formErrors.nome}
                                            </div>
                                        )}
                                    </label>
                                    <label className={styles['field']}>
                                        <span>E-mail</span>
                                        <input name="email" value={form.email} onChange={(ev) => setForm({...form, email: ev.target.value})} />
                                        {formErrors.email && (
                                            <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
                                                {formErrors.email}
                                            </div>
                                        )}
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Telefone</span>
                                        <input name="telefone" value={form.telefone} onChange={(ev) => setForm({...form, telefone: ev.target.value})} />
                                        {formErrors.telefone && (
                                            <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
                                                {formErrors.telefone}
                                            </div>
                                        )}
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Cargo</span>
                                        <input name="cargo" value={form.cargo} onChange={(ev) => setForm({...form, cargo: ev.target.value})} />
                                        {formErrors.cargo && (
                                            <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
                                                {formErrors.cargo}
                                            </div>
                                        )}
                                    </label>
                                    <label className={styles['field']}>
                                        <span>Endereço</span>
                                        <input name="endereco" value={form.endereco} onChange={(ev) => setForm({...form, endereco: ev.target.value})} />
                                        {formErrors.endereco && (
                                            <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
                                                {formErrors.endereco}
                                            </div>
                                        )}
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
