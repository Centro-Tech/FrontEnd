import styles from './Cadastro.module.css';


export function Cadastro() {
    return (
       <div className={styles["container-cadastro"]}> 
        <div className={styles["box-cadastro"]}>
            <h2 className={styles['box-container-titulo']}>Cadastrar Funcionário</h2>
            <form>
                <div className={styles["form-group"]}>
                    <label htmlFor="nome">Nome</label>
                    <input type="text" id="nome" name="nome" required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="senha">Senha</label>
                    <input type="password" id="senha" name="senha" required />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="cargo">Cargo</label>
                    <select name="cargo" id="cargo">
                        <option value="" disabled selected>Seleciona uma opção</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Funcionario">Funcionario</option>
                    </select>
                </div>
                <button>Cadastrar</button>
            </form>
            
        </div>
      </div>
    );
}