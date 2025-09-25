CREATE DATABASE nexus;
USE nexus;

CREATE Table jogador (
idJogador INT PRIMARY KEY AUTO_INCREMENT,
nomeJogador VARCHAR(50),
emailJogador VARCHAR(60) UNIQUE,
cpfJogador CHAR(11) UNIQUE,
senhaJogador VARCHAR(10)
);

CREATE Table organizacao (
idOrganizacao INT PRIMARY KEY AUTO_INCREMENT,
nomeOrganizacao VARCHAR(50),
emailOrganizacao VARCHAR(60) UNIQUE,
cnpjOrganizacao CHAR(14) UNIQUE,
senhaOrganizacao VARCHAR(10)
);

SELECT * FROM jogador;
SELECT * FROM organizacao;