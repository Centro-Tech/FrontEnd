import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../Componentes/Navbar';
import { FaixaVoltar } from '../Componentes/FaixaVoltar';
import API from '../Provider/API';
import { MensagemErro } from '../Componentes/MensagemErro';
import styles from '../Componentes/Componentes - CSS/MudarSenha.module.css';
import ilustracao from '../Componentes/assets/Mudar-Senha.png';

export default function MudarSenha() {
    const navigate = useNavigate();
    const [etapa, setEtapa] = useState(1); 
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const handleVoltar = () => {
        if (etapa === 1) {
            navigate('/login');
        } else {
            setEtapa(etapa - 1);
        }
    };

    const enviarCodigo = async (e) => {
        e.preventDefault();
        setErro('');
        setMensagemSucesso('');

        if (!email) {
            setErro('Digite seu email.');
            return;
        }

        setCarregando(true);
        try {
            await API.post('/usuarios/recuperar-senha', { email });
            setEtapa(2);
            setMensagemSucesso('Se o email existir, você receberá instruções em breve.');
        } catch (error) {
            const backendData = error?.response?.data;
            const possibleMessage = error?.response?.data?.message || (typeof backendData === 'string' ? backendData : null) || error?.message;

            if (typeof possibleMessage === 'string' && possibleMessage.includes('Email não encontrado')) {
                setErro('E-mail não encontrado. Verifique o endereço digitado e tente novamente.');
            } else {
                setErro(possibleMessage || 'Erro ao enviar código. Verifique o email.');
            }
        } finally {
            setCarregando(false);
        }
    };

    const reenviarCodigo = async () => {
        setErro('');
        setMensagemSucesso('');
        if (!email) {
            setErro('Email não informado para reenvio. Volte à tela anterior e informe o e-mail.');
            return;
        }
        setCarregando(true);
        try {
            await API.post('/usuarios/recuperar-senha', { email });
            setMensagemSucesso('E-mail reenviado (se existir). Verifique sua caixa de entrada e spam.');
        } catch (error) {
            const backendData = error?.response?.data;
            const possibleMessage = error?.response?.data?.message || (typeof backendData === 'string' ? backendData : null) || error?.message;

            if (typeof possibleMessage === 'string' && possibleMessage.includes('Email não encontrado')) {
                setErro('E-mail não encontrado. Verifique o endereço digitado ou cadastre-se.');
            } else {
                setErro(possibleMessage || 'Erro ao reenviar código. Tente novamente mais tarde.');
            }
        } finally {
            setCarregando(false);
        }
    };

    const confirmarCodigo = () => {
        setErro('');
        setEtapa(3);
    };

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const tokenParam = params.get('token');
            if (tokenParam) {
                setCodigo(tokenParam);
                setEtapa(3);
            }
        } catch (e) {
        }
    }, []);

    const redefinirSenha = async (e) => {
        e.preventDefault();
        setErro('');

        if (!codigo || !novaSenha || !confirmarSenha) {
            setErro('Preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não conferem.');
            return;
        }

        if (novaSenha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setCarregando(true);
        try {
            await API.post('/usuarios/redefinir-senha', { token: codigo, novaSenha });
            setEtapa(4);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const mensagem = error?.response?.data || error?.response?.data?.message || error?.message;
            setErro(mensagem || 'Erro ao redefinir senha. Verifique o código.');
        } finally {
            setCarregando(false);
        }
    };

    const voltarParaInicio = () => {
        navigate('/login');
    };

    if (etapa === 1) {
        return (
            <div className={styles.container}>
                <Navbar />
                <FaixaVoltar aoClicar={handleVoltar} />
                
                <div className={styles.centerContainer}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>Esqueceu sua senha?</h1>
                        <p className={styles.subtitle}>Confirme seu email para receber o código de segurança</p>
                        
                        <form onSubmit={enviarCodigo} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="Digite seu email"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className={styles.button}
                                disabled={carregando}
                            >
                                {carregando ? 'ENVIANDO...' : 'RECEBER CÓDIGO'}
                            </button>
                        </form>
                        
                        <MensagemErro mensagem={erro} />
                    </div>
                </div>
            </div>
        );
    }

    if (etapa === 2) {
        return (
            <div className={styles.container}>
                <div className={styles.centerContainer}>
                    <div className={styles.cardConfirmacao}>
                        <div className={styles.ilustracao}>
                            <img src={ilustracao} alt="Ilustração de mudança de senha" />
                        </div>
                        
                        <h1 className={styles.titleConfirmacao}>Confira sua caixa de entrada para redefinir sua senha</h1>
                        
                        <p className={styles.descricaoConfirmacao}>
                            Se o email que você forneceu estiver registrado, você receberá um email com instruções em breve. 
                            Caso não consiga encontrá-lo, confira sua pasta de spam ou reenvie o formulário.
                        </p>
                        
                        <div className={styles.buttonGroup}>
                            <button 
                                onClick={confirmarCodigo}
                                className={styles.buttonPrimary}
                            >
                                RECEBI O CÓDIGO
                            </button>
                            
                            <button
                                onClick={reenviarCodigo}
                                className={styles.buttonSecondary}
                                disabled={carregando || !email}
                            >
                                {carregando ? 'REENVIANDO...' : 'REENVIAR E-MAIL'}
                            </button>
                            
                            <button 
                                onClick={voltarParaInicio}
                                className={styles.buttonSecondary}
                            >
                                IR PARA A PÁGINA INICIAL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (etapa === 3) {
        return (
            <div className={styles.container}>
                <Navbar />
                <FaixaVoltar aoClicar={handleVoltar} />
                
                <div className={styles.centerContainer}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>Redefina Sua Senha!</h1>
                        
                        <form onSubmit={redefinirSenha} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Código Recebido</label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    className={styles.input}
                                    placeholder="Digite o código"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nova senha</label>
                                <input
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className={styles.input}
                                    placeholder="Digite sua nova senha"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Confirmar nova senha</label>
                                <input
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className={styles.input}
                                    placeholder="Confirme sua nova senha"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className={styles.button}
                                disabled={carregando}
                            >
                                {carregando ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
                            </button>
                        </form>
                        
                        <MensagemErro mensagem={erro} />
                    </div>
                </div>
            </div>
        );
    }

    if (etapa === 4) {
        return (
            <div className={styles.container}>
                <div className={styles.centerContainer}>
                    <div className={styles.cardSucesso}>
                        <h1 className={styles.titleSucesso}>Senha Alterada Com Sucesso!</h1>
                        <p className={styles.subtitleSucesso}>Redirecionando para a página inicial....</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
