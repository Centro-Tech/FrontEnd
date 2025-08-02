import { MenuPrincipal } from "./MenuPrincipal";
import { Navbar } from "./Navbar";
import { FaixaSair } from "./FaixaSair";

export function MenuInicial() {
    return (
        <div>
            <Navbar />
            <FaixaSair />
            <MenuPrincipal />
        </div>
    );
}