import { Cadastro } from "./Cadastro";
import { Navbar } from "./Navbar";

export function TelaBase() {
    return (
        <div>
            <Navbar />
            <Cadastro />
        </div>
    );
}