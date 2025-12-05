DROP DATABASE IF EXISTS MimaStore;
CREATE DATABASE IF NOT EXISTS MimaStore;

USE MimaStore;

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    imagem VARCHAR(500),
    recovery_token VARCHAR(500),
    recovery_token_expiry DATETIME
);

CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL
);

CREATE TABLE Fornecedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255)
);

CREATE TABLE Tamanho (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255)
);

CREATE TABLE Cor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255)
);

CREATE TABLE Material (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255)
);

CREATE TABLE Categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255)
);

CREATE TABLE Venda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    valor_total DOUBLE DEFAULT 0.0,
    valorTotal DOUBLE DEFAULT 0.0,
    data DATETIME DEFAULT current_timestamp,
    fkCliente INT,
    fkFuncionario INT,
    CONSTRAINT fk_venda_cliente FOREIGN KEY (fkCliente) REFERENCES Cliente(id_cliente),
    CONSTRAINT fk_venda_funcionario FOREIGN KEY (fkFuncionario) REFERENCES Usuario(id)
);

CREATE TABLE Item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(255),
    qtd_estoque INT,
    nome VARCHAR(255),
    preco DOUBLE,
    fkTamanho INT,
    fkCor INT,
    fkMaterial INT,
    fkCategoria INT,
    fkFornecedor INT,
    FOREIGN KEY (fkTamanho) REFERENCES Tamanho(id),
    FOREIGN KEY (fkCor) REFERENCES Cor(id),
    FOREIGN KEY (fkMaterial) REFERENCES Material(id),
    FOREIGN KEY (fkCategoria) REFERENCES Categoria(id),
    FOREIGN KEY (fkFornecedor) REFERENCES Fornecedor(id)
);

CREATE TABLE ItemVenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fkItem INT,
    fkItemFornecedor INT,
    fkVenda INT,
    qtdParaVender INT,
    FOREIGN KEY (fkItem) REFERENCES Item(id),
    FOREIGN KEY (fkItemFornecedor) REFERENCES Fornecedor(id),
    FOREIGN KEY (fkVenda) REFERENCES Venda(id)
);

-- ========================================
-- INSERTS INICIAIS
-- ========================================

INSERT INTO Fornecedor (nome, telefone, email) VALUES
('Empresa XYZ LTDA', '11987654321', 'contato@empresa.com');

INSERT INTO Tamanho (nome) VALUES ('M');
INSERT INTO Categoria (nome) VALUES ('Camiseta');
INSERT INTO Cor (nome) VALUES ('Preto');
INSERT INTO Material (nome) VALUES ('Lã');

-- ========================================
-- LISTAS COMPLETAS
-- ========================================

INSERT INTO categoria (nome) VALUES
('Blusa'), ('Camisa'), ('Camiseta'), ('Regata'), ('Top'), ('Casaco'), ('Jaqueta'),
('Cardigan'), ('Calça'), ('Short'), ('Saia'), ('Vestido'), ('Macacão'), ('Conjunto'),
('Blazer'), ('Colete'), ('Suéter'), ('Body'), ('Moletom'), ('Kimono'), ('Sobretudo'),
('Pijama'), ('Lingerie'), ('Beachwear'), ('Acessório');

INSERT INTO tamanho (nome) VALUES ('P'), ('M'), ('G'), ('U');

INSERT INTO cor (nome) VALUES
('Preto'), ('Branco'), ('Bege'), ('Azul-marinho'), ('Rosa-claro'), ('Verde-musgo'),
('Cinza'), ('Vermelho'), ('Bordô'), ('Marrom'), ('Azul-claro'), ('Roxo'),
('Amarelo-mostarda'), ('Verde-menta'), ('Lilás'), ('Caramelo'), ('Off-white'),
('Jeans'), ('Laranja'), ('Oliva');

INSERT INTO material (nome) VALUES
('Algodão'), ('Linho'), ('Viscose'), ('Suede'), ('Couro sintético'), ('Jeans'),
('Malha'), ('Crepe'), ('Poliéster'), ('Sarja'), ('Renda'), ('Veludo'),
('Tricô'), ('Seda sintética'), ('Moletom');

INSERT INTO fornecedor (nome, telefone, email, endereco) VALUES
('ModaSul', '(11) 3333-1111', 'contato@modasul.com', 'Rua das Confecções, 123 - São Paulo'),
('EstiloBrasil', '(21) 4444-2222', 'vendas@estilobrasil.com', 'Av. da Moda, 987 - Rio de Janeiro'),
('TrendWear', '(31) 5555-3333', 'comercial@trendwear.com', 'Rua Central, 45 - Belo Horizonte'),
('UrbanLook', '(41) 6666-4444', 'contato@urbanlook.com', 'Av. das Flores, 200 - Curitiba'),
('ChicHouse', '(51) 7777-5555', 'vendas@chichouse.com', 'Rua Principal, 78 - Porto Alegre');

INSERT INTO usuario (nome, email, telefone, endereco, senha, cargo) VALUES
('John Doe', 'john@doe.com', '1111-11111', 'Rua do Bacana', '$2a$10$0/TKTGxdREbWaWjWYhwf6e9P1fPOAMMNqEnZgOG95jnSkHSfkkIrC', 'Funcionario'),
('Karin', 'karin@mimastore.com', '(11) 98888-1234', 'Rua das Violetas, 99', '$2a$10$WEXAMPLE1', 'Gerente'),
('Silvia', 'silvia@mimastore.com', '(11) 97777-5678', 'Av. Central, 123', '$2a$10$WEXAMPLE2', 'Gerente');

INSERT INTO cliente (nome, email, telefone, endereco, cpf) VALUES
('Ana Costa', 'ana.costa@email.com', '(11) 90000-0001', 'Rua A, 10 - São Paulo', '11111111111'),
('Bruno Lima', 'bruno.lima@email.com', '(11) 90000-0002', 'Rua B, 20 - São Paulo', '22222222222'),
('Carla Mendes', 'carla.mendes@email.com', '(11) 90000-0003', 'Rua C, 30 - São Paulo', '33333333333'),
('Daniel Souza', 'daniel.souza@email.com', '(11) 90000-0004', 'Rua D, 40 - São Paulo', '44444444444'),
('Eduarda Rocha', 'eduarda.rocha@email.com', '(11) 90000-0005', 'Rua E, 50 - São Paulo', '55555555555');

-- ========================================
-- 15 ITENS
-- ========================================

INSERT INTO item (codigo, qtd_estoque, nome, preco, fkTamanho, fkCor, fkMaterial, fkCategoria, fkFornecedor) VALUES
('ITM001', 120, 'Blusa Decote V em Viscose', 89.90, 1, 2, 3, 1, 1),
('ITM002', 80, 'Calça Jeans Skinny', 159.90, 2, 18, 6, 9, 2),
('ITM003', 50, 'Vestido Longo Floral', 229.90, 3, 5, 3, 12, 1),
('ITM004', 60, 'Jaqueta Couro Sintético', 299.90, 3, 1, 5, 7, 3),
('ITM005', 40, 'Cardigan Tricô Liso', 119.90, 2, 16, 13, 8, 4),
('ITM006', 90, 'Saia Midi Suede', 149.90, 2, 10, 4, 11, 5),
('ITM007', 100, 'Camisa Linho Gola Padre', 139.90, 3, 3, 2, 2, 2),
('ITM008', 70, 'Macacão Jeans Feminino', 199.90, 2, 18, 6, 13, 1),
('ITM009', 45, 'Blazer Alfaiataria', 279.90, 3, 1, 8, 15, 5),
('ITM010', 30, 'Top Cropped Renda', 79.90, 1, 15, 11, 5, 4),
('ITM011', 55, 'Moletom Oversized', 159.90, 4, 7, 15, 19, 3),
('ITM012', 70, 'Regata Básica Algodão', 59.90, 1, 2, 1, 4, 1),
('ITM013', 85, 'Body Canelado', 99.90, 2, 9, 7, 18, 4),
('ITM014', 25, 'Casaco Longo de Lã', 349.90, 3, 1, 14, 6, 2),
('ITM015', 65, 'Conjunto Suede Feminino', 219.90, 2, 20, 4, 14, 1);

-- ========================================
-- PROCEDURE GERAR MASSA (COM VERIFICACAO DE ESTOQUE)
-- ========================================

DELIMITER $$

DROP PROCEDURE IF EXISTS gerar_vendas_massa$$

CREATE PROCEDURE gerar_vendas_massa(IN qnt INT)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE num_items INT;
    DECLARE j INT;
    DECLARE v_id INT;
    DECLARE fkC INT;
    DECLARE fkF INT;
    DECLARE fkIt INT;
    DECLARE fkItFor INT;
    DECLARE qty INT;
    DECLARE preco_item DOUBLE;
    DECLARE v_total DOUBLE;
    DECLARE start_ts INT;
    DECLARE end_ts INT;
    DECLARE rnd_ts INT;
    DECLARE estoque_atual INT;
    DECLARE itens_na_venda INT;
    DECLARE tentativas INT;
    DECLARE linhas_atualizadas INT;

    SET start_ts = UNIX_TIMESTAMP('2024-01-01 00:00:00');
    SET end_ts = UNIX_TIMESTAMP('2025-10-31 23:59:59');

    vendas_loop: WHILE i < qnt DO
        START TRANSACTION;

        SET fkC = FLOOR(RAND() * 5) + 1;
        SET fkF = FLOOR(RAND() * 3) + 1;
        SET rnd_ts = start_ts + FLOOR(RAND() * (end_ts - start_ts));

        INSERT INTO venda (valor_total, valorTotal, data, fkCliente, fkFuncionario)
        VALUES (0.0, 0.0, FROM_UNIXTIME(rnd_ts), fkC, fkF);

        SET v_id = LAST_INSERT_ID();
        SET v_total = 0.0;
        SET itens_na_venda = 0;

        SET num_items = FLOOR(RAND() * 5) + 1;
        SET j = 0;

        WHILE j < num_items DO
            SET tentativas = 0;

            seleciona_item: LOOP
                IF tentativas >= 10 THEN
                    LEAVE seleciona_item;
                END IF;

                SELECT id, preco, qtd_estoque, fkFornecedor
                INTO fkIt, preco_item, estoque_atual, fkItFor
                FROM item
                WHERE qtd_estoque > 0
                ORDER BY RAND()
                LIMIT 1;

                IF fkIt IS NULL THEN
                    LEAVE seleciona_item;
                END IF;

                SET qty = FLOOR(RAND() * 3) + 1;
                IF qty > estoque_atual THEN
                    SET qty = estoque_atual;
                END IF;

                IF qty <= 0 THEN
                    SET tentativas = tentativas + 1;
                    ITERATE seleciona_item;
                END IF;

                UPDATE item
                SET qtd_estoque = qtd_estoque - qty
                WHERE id = fkIt AND qtd_estoque >= qty;

                SET linhas_atualizadas = ROW_COUNT();

                IF linhas_atualizadas = 0 THEN
                    SET tentativas = tentativas + 1;
                    ITERATE seleciona_item;
                END IF;

                INSERT INTO itemvenda (fkItem, fkItemFornecedor, fkVenda, qtdParaVender)
                VALUES (fkIt, fkItFor, v_id, qty);

                SET v_total = v_total + (qty * preco_item);
                SET itens_na_venda = itens_na_venda + 1;
                LEAVE seleciona_item;
            END LOOP;

            SET j = j + 1;
        END WHILE;

        IF itens_na_venda = 0 THEN
            ROLLBACK;
            LEAVE vendas_loop;
        ELSE
            UPDATE venda
            SET valor_total = ROUND(v_total, 2),
                valorTotal = ROUND(v_total, 2)
            WHERE id = v_id;
            COMMIT;
        END IF;

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

CALL gerar_vendas_massa(500);

DROP PROCEDURE IF EXISTS gerar_vendas_massa;

-- EXEMPLO SOLO
INSERT INTO Venda (valor_total, valorTotal, data, fkCliente, fkFuncionario)
VALUES (100000.00, 100000.00, DATE_SUB(NOW(), INTERVAL 32 DAY), 1, 1);

SELECT * FROM venda WHERE valorTotal > 898910;
