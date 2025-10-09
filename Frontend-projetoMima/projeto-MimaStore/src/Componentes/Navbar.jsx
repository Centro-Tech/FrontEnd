import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Componentes - CSS/Navbar.module.css';
import Logo from './assets/Group 2.png';
import iconCardapio from './assets/icons8-cardápio.svg';
import fotoId from './assets/fotoIconExemplo.jpg';
import { Perfil } from '../Telas/Perfil.jsx';
import { useLocation } from 'react-router-dom';

export function Navbar({ mostrarHamburguer: mostrarHamburguerProp, mostrarPerfil: mostrarPerfilProp }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [perfilMenuOpen, setPerfilMenuOpen] = useState(false);
    const location = useLocation();

    const rotasSemHamburguer = ['/login', '/cadastro'];
    const rotasSemPerfil = ['/login', '/cadastro'];

    const mostrarHamburguer =
        typeof mostrarHamburguerProp === 'boolean'
            ? mostrarHamburguerProp
            : !rotasSemHamburguer.includes(location.pathname);

    const mostrarPerfil =
        typeof mostrarPerfilProp === 'boolean'
            ? mostrarPerfilProp
            : !rotasSemPerfil.includes(location.pathname);

    const handleMenuClick = () => {
        setMenuOpen(!menuOpen);
    };

    const handleCloseSidebar = () => {
        setMenuOpen(false);
    };

    const handlePerfilClick = () => {
        setPerfilMenuOpen((open) => !open);
    };

    const handleLogout = () => {
        // Adicione sua lógica de logout aqui
        setPerfilMenuOpen(false);
        // Exemplo: navigate('/login');
    };

    const handleConfig = () => {
        setPerfilMenuOpen(false);
        // Exemplo: navigate('/configuracoes');
    };

    return (
        <>
            <div className={styles['header']}>
                <div className={styles["container"]}>
                    <ul className={styles["navbar"]}>
                        {mostrarHamburguer && (
                            <li className={styles["item-left"]}>
                                <img
                                    src={iconCardapio}
                                    alt="Menu"
                                    className={styles['iconCardapio']}
                                    onClick={handleMenuClick}
                                    style={{ cursor: 'pointer' }}
                                />
                            </li>
                        )}
                        <div className={styles["right-section"]}>
                            {mostrarPerfil && (
                                <li className={styles["item"]} style={{ position: 'relative' }}>
                                    <div
                                        className={styles.perfilWrapper}
                                        onClick={handlePerfilClick}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Perfil nome="Karin Miralha" fotoId={fotoId} />
                                        
                                    </div>
                                    {perfilMenuOpen && (
                                        <div className={styles.perfilMenu} >
                                            <button onClick={handleConfig}>Configurações</button>
                                            <button onClick={handleLogout}>Logout</button>
                                        </div>
                                    )}
                                </li>
                            )}
                            <li className={styles["logo"]}>
                                <img src={Logo} alt="Logo" className={styles['logo']} />
                            </li>
                        </div>
                    </ul>
                </div>
            </div>

            {/* Sidebar sempre presente no DOM */}
            <div
                className={styles.sidebarOverlay}
                style={{
                    pointerEvents: menuOpen ? 'auto' : 'none',
                    opacity: menuOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
                onClick={handleCloseSidebar}
            >
                <div
                    className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}
                    onClick={e => e.stopPropagation()}
                >
                    <button className={styles.closeBtn} onClick={handleCloseSidebar}>×</button>
                    <nav>
                        <h2>Estoque</h2>
                        <ul>
                            <li><Link to="/estoque" className={styles.sidebarItem}>Visualizar Estoque</Link></li>
                            <li><Link to="/cadastrar-vestuario-existente" className={styles.sidebarItem}>Repor Estoque</Link></li>
                            <li><Link to="/cadastrar-vestuario" className={styles.sidebarItem}>Cadastrar Novas Peças</Link></li>
                            <li><Link to="/cadastrar-atributos" className={styles.sidebarItem}>Cadastrar Atributos</Link></li>
                        </ul>
                        <h2>Vendas</h2>
                        <ul>
                            <li><Link to="/realizar-venda" className={styles.sidebarItem}>Realizar Venda</Link></li>
                            <li><Link to="/historico-vendas" className={styles.sidebarItem}>Histórico de Vendas</Link></li>
                            <li><Link to="/dashboard" className={styles.sidebarItem}>Dashboard</Link></li>
                        </ul>
                        <h2>Pessoas</h2>
                        <ul>
                            <li><Link to="/cadastrar-funcionario" className={styles.sidebarItem}>Cadastrar Funcionário</Link></li>
                            <li><Link to="/cadastrar-fornecedor" className={styles.sidebarItem}>Cadastrar Fornecedor</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}