import styles from './Perfil.module.css';
/*import { useState } from 'react';*/
import iconExpandir from './assets/icons8-seta-para-expandir-50.png'; 


export function Perfil({ nome, fotoId}) {
    /*
    const [menuAberto, setMenuAberto] = useState(false);
    function abrirMenu() {
        setMenuAberto((aberto) => !aberto);
    }
        */

    return (
        <div className={styles["perfil"]}>
            <img src={iconExpandir} alt="" className ={styles['iconExpandir']}/>
            <h3>{nome}</h3>
            <img src={fotoId} alt="" className={styles['fotoPerfil']}/>
            
        </div>
    );
}

/*
import { useState } from 'react';
import styles from './Perfil.module.css';

export function Perfil({ nome, fotoId }) {
    const [menuAberto, setMenuAberto] = useState(false);

    function toggleMenu() {
        setMenuAberto((aberto) => !aberto);
    }

    return (
        <div className={styles["perfil"]}>
            <img
                src={fotoId}
                alt="Foto do usuário"
                className={styles["foto-perfil"]}
                onClick={toggleMenu}
                style={{ cursor: 'pointer' }}
            />
            <h3>{nome}</h3>
            {menuAberto && (
                <ul className={styles["menu-opcoes"]}>
                    <li>Perfil</li>
                    <li>Configurações</li>
                    <li>Sair</li>
                </ul>
            )}
        </div>
    );
}*/