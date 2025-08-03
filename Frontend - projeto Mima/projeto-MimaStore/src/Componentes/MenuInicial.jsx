import { MenuPrincipal } from "./MenuPrincipal";
import { Navbar } from "./Navbar";
import { FaixaSair } from "./FaixaSair";

export function MenuInicial({ aoNavegar }) {
    return (
        <div>
            <Navbar />
            <FaixaSair />
            <MenuPrincipal aoNavegar={aoNavegar} />
        </div>
    );
}