import { MenuPrincipal } from "./MenuPrincipal";
import { Navbar } from "./Navbar";
import { FaixaSair } from "./FaixaSair";

export function MenuInicial({ aoNavegar }) {
    const handleSairSistema = () => {
        aoNavegar('splash');
    };

    return (
        <div>
            <Navbar />
            <FaixaSair aoClicar={handleSairSistema} />
            <MenuPrincipal aoNavegar={aoNavegar} />
        </div>
    );
}