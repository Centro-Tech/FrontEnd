import { useEffect } from "react";
import API from "../Provider/API";

function HomeMettods() {

    // Exemplo de um requisição GET
  useEffect(() => {
    API.get("/usuarios")
      .then(response => console.log(response.data));
  }, []);

  // Exemplo de uma requisição POST 
     API.post("/usuarios", {
    nome: "João",   
    idade: 30,
    email: "gmail.com"
     });

    // Exemplo de uma requisição PUT
    API.put("/usuarios/1", {
    nome: "João Atualizado",
    idade: 31,
  email: "joaoAtualizado@gmail.com"
    });

    // Exemplo de uma requisição DELETE
    API.delete("/usuarios/2")
      .then(() => console.log("Usuário deletado com sucesso"))
      .catch(error => console.error("Erro ao deletar usuário:", error));
}

export default HomeMettods;