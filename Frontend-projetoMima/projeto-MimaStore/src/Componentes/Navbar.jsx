import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Componentes - CSS/Navbar.module.css';
import Logo from './assets/Group 2.png';
import iconCardapio from './assets/icons8-cardápio.svg';
import fotoId from './assets/fotoIconExemplo.jpg';
import { Perfil } from '../Telas/Perfil.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
// MUI Icons
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CachedIcon from '@mui/icons-material/Cached';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';

export function Navbar({ mostrarHamburguer: mostrarHamburguerProp, mostrarPerfil: mostrarPerfilProp }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [perfilMenuOpen, setPerfilMenuOpen] = useState(false);
    const navigate = useNavigate();
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
        // Navega para a tela de Configurações criada em src/Telas/Configuracao.jsx
        navigate('/configuracao');
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
                                    alt={menuOpen ? "Fechar menu" : "Abrir menu"}
                                    className={`${styles['iconCardapio']} ${menuOpen ? styles.iconCardapioOpen : ''}`}
                                    onClick={handleMenuClick}
                                    role="button"
                                    aria-expanded={menuOpen}
                                    aria-label={menuOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
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
                    <button className={styles.closeBtn} onClick={handleCloseSidebar} aria-label="Fechar menu">×</button>
                    <nav className={styles.sidebarContent}>
                        <div className={styles.menuGroup}>
                            <h2 className={styles.menuTitle}>Estoque</h2>
                            <ul className={styles.menuList}>
                                <li><Link to="/estoque" className={styles.menuItem}><span className={styles.menuIcon}><Inventory2Icon /></span><span className={styles.menuText}>Visualizar Estoque</span></Link></li>
                                <li><Link to="/cadastrar-vestuario" className={styles.menuItem}><span className={styles.menuIcon}><AddBoxIcon /></span><span className={styles.menuText}>Cadastrar Novas Peças</span></Link></li>
                                <li><Link to="/cadastrar-atributos" className={styles.menuItem}><span className={styles.menuIcon}><TuneIcon /></span><span className={styles.menuText}>Cadastrar Atributos</span></Link></li>
                            </ul>
                        </div>

                        <div className={styles.menuGroup}>
                            <h2 className={styles.menuTitle}>Vendas</h2>
                            <ul className={styles.menuList}>
                                <li><Link to="/realizar-venda" className={styles.menuItem}><span className={styles.menuIcon}><ShoppingCartIcon /></span><span className={styles.menuText}>Realizar Venda</span></Link></li>
                                <li><Link to="/historico-vendas" className={styles.menuItem}><span className={styles.menuIcon}><HistoryIcon /></span><span className={styles.menuText}>Histórico de Vendas</span></Link></li>
                                <li><Link to="/dashboard" className={styles.menuItem}><span className={styles.menuIcon}><DashboardIcon /></span><span className={styles.menuText}>Dashboard</span></Link></li>
                            </ul>
                        </div>

                        <div className={styles.menuGroup}>
                            <h2 className={styles.menuTitle}>Pessoas</h2>
                            <ul className={styles.menuList}>
                                <li><Link to="/gestao-fornecedores" className={styles.menuItem}><span className={styles.menuIcon}><BusinessIcon /></span><span className={styles.menuText}>Gestão de Fornecedores</span></Link></li>
                                <li><Link to="/gestao-funcionarios" className={styles.menuItem}><span className={styles.menuIcon}><GroupIcon /></span><span className={styles.menuText}>Gestão de Funcionários</span></Link></li>
                                <li><Link to="/gestao-clientes" className={styles.menuItem}><span className={styles.menuIcon}><PeopleIcon /></span><span className={styles.menuText}>Gestão de Clientes</span></Link></li>
                                <li><Link to="/mudar-senha" className={styles.menuItem}><span className={styles.menuIcon}><LockIcon /></span><span className={styles.menuText}>Alterar Senha</span></Link></li>
                            </ul>
                        </div>

                        <div className={styles.sidebarFooter}>
                            <Link to="/perfil" className={styles.profilePill} onClick={handleCloseSidebar}>
                                <img src={fotoId} alt="Avatar" className={styles.profileAvatar} />
                                <span className={styles.profileName}>Perfil</span>
                                <span className={styles.badge}>12</span>
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}