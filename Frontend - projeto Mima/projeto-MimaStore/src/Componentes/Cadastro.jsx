import styles from './Componentes - CSS/Cadastro.module.css';
import React, { useState } from 'react';


export function Cadastro() {

    const [nomeInserido, setNomeInserido] = useState('');
    const [emailInserido, setEmailInserido] = useState(''); 
    const [senhaInserida, setSenhaInserida] = useState('');
    const [cargoInserido, setCargoInserido] = useState('');
    const [Usuarios, setUsuarios] = useState([]);
    const [mensagem, setMensagem] = useState('');

    
    function cadastrarFuncionario(event) {
        event.preventDefault();
        const Usuario = {
            nome: nomeInserido,
            email: emailInserido,
            senha: senhaInserida,
            cargo: cargoInserido
        }

        setUsuarios([...Usuarios, Usuario]);
        console.log(JSON.stringify(Usuario));
        console.log([...Usuarios, Usuario]);
        setMensagem('Cadastro concluído! ');

        setTimeout(() => {
            setMensagem('');
         setNomeInserido('');
         setEmailInserido('');
         setSenhaInserida('');
         setCargoInserido('');
            setMensagem('');
        }, 2000);
    }

    function addNome(e) {
        setNomeInserido(e.target.value);
    }

    function addEmail(e) {  
        setEmailInserido(e.target.value);
    }

    function addSenha(e) {
        setSenhaInserida(e.target.value);
    }

    function addCargo(e) {
        setCargoInserido(e.target.value);
    }


    return (
       <div className={styles["container-cadastro"]}> 
        <div className={styles["box-cadastro"]}>
            <h2 className={styles['box-container-titulo']}>Cadastrar Funcionário</h2>
            <form onSubmit={cadastrarFuncionario}>
                <div className={styles["form-group"]}>
                    <label htmlFor="nome">Nome</label>
                    <input type="text" value={nomeInserido} onChange={addNome} required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="email">Email</label>
                    <input type="email" value={emailInserido} onChange={addEmail} required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="senha">Senha</label>
                    <input type="password" value={senhaInserida} onChange={addSenha} required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="cargo">Cargo</label>
                    <select name="cargo" id="cargo" required onChange={addCargo} value={cargoInserido}>
                      <option value="" disabled>Seleciona uma opção</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Funcionario">Funcionario</option>
                   </select>
                </div>
                <button type='submit'>Cadastrar</button>
            </form>
                <div>
                    <h1>{mensagem}</h1>
                </div>
            
        </div>
      </div>
    );
}