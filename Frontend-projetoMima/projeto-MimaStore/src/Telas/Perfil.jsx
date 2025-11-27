import styles from '../Componentes/Componentes - CSS/Perfil.module.css';
import iconExpandir from '../Componentes/assets/icons8-seta-para-expandir-50.png'; 



export function Perfil({ nome, fotoId}) {
    
    return (
        <div className={styles["perfil"]}>
            <img src={iconExpandir} alt="" className ={styles['iconExpandir']}/>
            <h3>{nome}</h3>
            <img src={fotoId} alt="" className={styles['fotoPerfil']}/>
            
        </div>
    );
}