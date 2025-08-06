import { useNavigate } from 'react-router-dom';
import { MenuPrincipal } from "./MenuPrincipal";
import { Navbar } from "./Navbar";
import { FaixaSair } from "./FaixaSair";

export function MenuInicial() {
    const navigate = useNavigate();
    
    const handleSairSistema = () => {
        navigate('/splash');
    };

    return (
        <div>
            <Navbar />
            <FaixaSair aoClicar={handleSairSistema} />
            <MenuPrincipal />
        </div>
    );
}