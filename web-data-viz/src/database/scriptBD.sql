CREATE DATABASE IF NOT EXISTS db_nexus;
USE db_nexus;

CREATE TABLE IF NOT EXISTS conta (
    id_conta INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_conta ENUM('JOGADOR', 'ORGANIZACAO', 'ADMIN') NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imagem_perfil VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS admin(
	id_admin INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR (255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizacao (
    id_organizacao INT PRIMARY KEY AUTO_INCREMENT,
    id_conta INT UNIQUE NOT NULL,
    nome_org VARCHAR(100) NOT NULL,
    sigla VARCHAR(10) UNIQUE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    CONSTRAINT fk_organizacao_conta FOREIGN KEY (id_conta)
        REFERENCES conta(id_conta)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS elo (
    id_elo INT PRIMARY KEY AUTO_INCREMENT,
    nome_elo VARCHAR(50) UNIQUE NOT NULL,
    ordem_classificacao INT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS regiao (
    id_regiao INT PRIMARY KEY AUTO_INCREMENT,
    codigo_regiao VARCHAR(10) UNIQUE NOT NULL,
    nome_regiao VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS jogador (
    id_jogador INT PRIMARY KEY AUTO_INCREMENT,
    id_conta INT UNIQUE NULL,
    id_organizacao INT NULL,
    id_regiao INT NOT NULL,
    id_elo INT NULL,
    game_name VARCHAR(50) NOT NULL UNIQUE,
    tagline VARCHAR(10),
    nome VARCHAR(45) NOT NULL,
    divisao ENUM('I', 'II', 'III', 'IV') NULL,
    pontos_liga INT DEFAULT 0,
    premiacao DOUBLE DEFAULT 0.00,
    dt_nascimento DATE,
    
    CONSTRAINT fk_jogador_conta FOREIGN KEY (id_conta)
        REFERENCES conta(id_conta)
        ON DELETE CASCADE,
    CONSTRAINT fk_jogador_organizacao FOREIGN KEY (id_organizacao)
        REFERENCES organizacao(id_organizacao)
        ON DELETE SET NULL,
    CONSTRAINT fk_jogador_elo FOREIGN KEY (id_elo)
        REFERENCES elo (id_elo)
        ON DELETE SET NULL,
    CONSTRAINT fk_jogador_regiao FOREIGN KEY (id_regiao)
        REFERENCES regiao (id_regiao),
    CONSTRAINT uk_riot_nick UNIQUE (game_name , tagline)
);

CREATE TABLE IF NOT EXISTS partida (
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    datahora_inicio DATE NOT NULL,
    duracao_segundos INT NOT NULL
);

CREATE TABLE IF NOT EXISTS funcao (
    id_funcao INT PRIMARY KEY AUTO_INCREMENT,
    nome_funcao VARCHAR(25) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS campeao (
    id_campeao INT PRIMARY KEY AUTO_INCREMENT,
    id_campeao_riot INT UNIQUE NOT NULL,
    nome_campeao VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS desempenho_partida (
    id_desempenho INT PRIMARY KEY AUTO_INCREMENT,
    id_jogador INT NOT NULL,
    id_partida INT NOT NULL,
    id_campeao INT NOT NULL,
    id_funcao INT NOT NULL,
    resultado ENUM('VITORIA', 'DERROTA') NOT NULL,
    abates INT DEFAULT 0,
    mortes INT DEFAULT 0,
    assistencias INT DEFAULT 0,
    cs_num INT,
    cs_por_minuto DECIMAL(4,1),
    runa_principal VARCHAR(50),
    feiticos VARCHAR(50),
    CONSTRAINT uk_jogador_partida UNIQUE (id_jogador, id_partida),
    CONSTRAINT fk_desempenho_jogador FOREIGN KEY (id_jogador)
        REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    CONSTRAINT fk_desempenho_partida FOREIGN KEY (id_partida)
        REFERENCES partida(id_partida) ON DELETE CASCADE,
    CONSTRAINT fk_desempenho_campeao FOREIGN KEY (id_campeao)
        REFERENCES campeao(id_campeao),
    CONSTRAINT fk_desempenho_funcao FOREIGN KEY (id_funcao)
        REFERENCES funcao(id_funcao)
);

CREATE TABLE IF NOT EXISTS classe (
    id_classe INT PRIMARY KEY AUTO_INCREMENT,
    nome_classe VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS campeao_classe (
    id_campeao INT,
    id_classe INT,
    CONSTRAINT pk_campeao_classe PRIMARY KEY (id_campeao , id_classe),
    CONSTRAINT fk_campeao_classe FOREIGN KEY (id_campeao)
        REFERENCES campeao (id_campeao)
        ON DELETE CASCADE,
    CONSTRAINT fk_classe_campeao FOREIGN KEY (id_classe)
        REFERENCES classe (id_classe)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS log (
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    id_conta INT NULL,
    log_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_log ENUM('ERRO', 'INFO', 'SUCESSO') NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    CONSTRAINT fk_log_conta FOREIGN KEY (id_conta) 
        REFERENCES conta(id_conta) 
        ON DELETE SET NULL
);

CREATE TABLE ranking_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_jogador INT NOT NULL,
    posicao INT NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin(nome, email, senha)
VALUES("Nexus", "nexus@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");

INSERT INTO regiao (codigo_regiao, nome_regiao) VALUES 
('BR1', 'Brasil'), 
('NA1', 'América do Norte'), 
('LA1', 'América Latina Norte'), 
('LA2', 'América Latina Sul'), 
('KR', 'Coreia'), 
('EUN1', 'Europa Nórdica e Leste'), 
('EUW1', 'Europa Ocidental');

INSERT INTO elo (nome_elo, ordem_classificacao) VALUES 
('Ferro', 1), 
('Bronze', 2), 
('Prata', 3), 
('Ouro', 4), 
('Platina', 5), 
('Esmeralda', 6), 
('Diamante', 7), 
('Mestre', 8), 
('Grão-Mestre', 9), 
('Desafiante', 10);

INSERT INTO funcao (nome_funcao) VALUES 
('Topo'), 
('Caçador'), 
('Meio'), 
('Atirador'), 
('Suporte');

INSERT INTO classe (nome_classe) VALUES 
('Lutador'), 
('Mago'), 
('Assassino'), 
('Tanque'), 
('Atirador'), 
('Suporte');

INSERT INTO campeao (id_campeao_riot, nome_campeao) VALUES
(266, 'Aatrox'),
(103, 'Ahri'),
(84, 'Akali'),
(166, 'Akshan'),
(12, 'Alistar'),
(799, 'Ambessa Medarda'),
(32, 'Amumu'),
(34, 'Anivia'),
(1, 'Annie'),
(523, 'Aphelios'),
(22, 'Ashe'),
(136, 'Aurelion Sol'),
(893, 'Aurora'),
(268, 'Azir'),
(432, 'Bard'),
(200, 'Bel\'Veth'),
(53, 'Blitzcrank'),
(63, 'Brand'),
(201, 'Braum'),
(233, 'Briar'),
(51, 'Caitlyn'),
(164, 'Camille'),
(69, 'Cassiopeia'),
(31, 'Cho\'Gath'),
(42, 'Corki'),
(122, 'Darius'),
(131, 'Diana'),
(119, 'Draven'),
(36, 'Dr. Mundo'),
(245, 'Ekko'),
(60, 'Elise'),
(28, 'Evelynn'),
(81, 'Ezreal'),
(9, 'Fiddlesticks'),
(114, 'Fiora'),
(105, 'Fizz'),
(3, 'Galio'),
(41, 'Gangplank'),
(86, 'Garen'),
(150, 'Gnar'),
(79, 'Gragas'),
(104, 'Graves'),
(887, 'Gwen'),
(120, 'Hecarim'),
(74, 'Heimerdinger'),
(910, 'Hwei'),
(420, 'Illaoi'),
(39, 'Irelia'),
(427, 'Ivern'),
(40, 'Janna'),
(59, 'Jarvan IV'),
(24, 'Jax'),
(126, 'Jayce'),
(202, 'Jhin'),
(222, 'Jinx'),
(145, 'Kai\'Sa'),
(429, 'Kalista'),
(43, 'Karma'),
(30, 'Karthus'),
(38, 'Kassadin'),
(55, 'Katarina'),
(10, 'Kayle'),
(141, 'Kayn'),
(85, 'Kennen'),
(121, 'Kha\'Zix'),
(203, 'Kindred'),
(240, 'Kled'),
(96, 'Kog\'Maw'),
(897, 'K\'Sante'),
(7, 'LeBlanc'),
(64, 'Lee Sin'),
(89, 'Leona'),
(876, 'Lillia'),
(127, 'Lissandra'),
(236, 'Lucian'),
(117, 'Lulu'),
(99, 'Lux'),
(54, 'Malphite'),
(90, 'Malzahar'),
(57, 'Maokai'),
(11, 'Master Yi'),
(902, 'Milio'),
(21, 'Miss Fortune'),
(62, 'Wukong'),
(82, 'Mordekaiser'),
(25, 'Morgana'),
(950, 'Naafiri'),
(267, 'Nami'),
(75, 'Nasus'),
(111, 'Nautilus'),
(518, 'Neeko'),
(76, 'Nidalee'),
(895, 'Nilah'),
(56, 'Nocturne'),
(20, 'Nunu e Willump'),
(2, 'Olaf'),
(61, 'Orianna'),
(516, 'Ornn'),
(80, 'Pantheon'),
(78, 'Poppy'),
(555, 'Pyke'),
(246, 'Qiyana'),
(133, 'Quinn'),
(497, 'Rakan'),
(33, 'Rammus'),
(421, 'Rek\'Sai'),
(526, 'Rell'),
(888, 'Renata Glasc'),
(58, 'Renekton'),
(107, 'Rengar'),
(92, 'Riven'),
(68, 'Rumble'),
(13, 'Ryze'),
(360, 'Samira'),
(113, 'Sejuani'),
(235, 'Senna'),
(147, 'Seraphine'),
(875, 'Sett'),
(35, 'Shaco'),
(98, 'Shen'),
(102, 'Shyvana'),
(27, 'Singed'),
(14, 'Sion'),
(15, 'Sivir'),
(72, 'Skarner'),
(901, 'Smolder'),
(37, 'Sona'),
(16, 'Soraka'),
(50, 'Swain'),
(517, 'Sylas'),
(134, 'Syndra'),
(223, 'Tahm Kench'),
(163, 'Taliyah'),
(91, 'Talon'),
(44, 'Taric'),
(17, 'Teemo'),
(412, 'Thresh'),
(18, 'Tristana'),
(48, 'Trundle'),
(23, 'Tryndamere'),
(4, 'Twisted Fate'),
(29, 'Twitch'),
(77, 'Udyr'),
(6, 'Urgot'),
(110, 'Varus'),
(67, 'Vayne'),
(45, 'Veigar'),
(161, 'Vel\'Koz'),
(711, 'Vex'),
(254, 'Vi'),
(234, 'Viego'),
(112, 'Viktor'),
(8, 'Vladimir'),
(106, 'Volibear'),
(19, 'Warwick'),
(101, 'Xerath'),
(5, 'Xin Zhao'),
(157, 'Yasuo'),
(777, 'Yone'),
(83, 'Yorick'),
(350, 'Yuumi'),
(154, 'Zac'),
(238, 'Zed'),
(221, 'Zeri'),
(115, 'Ziggs'),
(26, 'Zilean'),
(142, 'Zoe'),
(143, 'Zyra');