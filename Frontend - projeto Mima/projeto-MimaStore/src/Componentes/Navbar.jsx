import styles from './Componentes - CSS/Navbar.module.css';
import Logo from './assets/Group 2.png';
import iconCardapio from './assets/icons8-cardápio.svg'
import fotoId from './assets/fotoIconExemplo.jpg';
import { Perfil } from './Perfil.jsx';

export function Navbar() {
    return (
        <div className={styles['header']}>
            <div className={styles["container"]}>
                <ul className={styles["navbar"]}>
                    <li className={styles["item-left"]}>
                        <img src={iconCardapio} alt="" className={styles['iconCardapio']}/>
                    </li>
                    
                    <div className={styles["right-section"]}>
                        <li className={styles["item"]}>
                            <Perfil nome="Karin Miralha" fotoId={fotoId} />
                        </li>
                        <li className={styles["logo"]}>
                            <img src={Logo} alt="Logo" className={styles['logo']}/>
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    )
}