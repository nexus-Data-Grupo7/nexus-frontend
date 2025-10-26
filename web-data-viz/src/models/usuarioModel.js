require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function cadastrarConta(email, senhaHash, tipoConta) {
  const conection = await pool.getConnection();
  try {
    await conection.beginTransaction();

    const [resConta] = await conection.execute(
      "INSERT INTO conta (email, senha_hash, tipo_conta) VALUES (?, ?, ?)",
      [email, senhaHash, tipoConta]
    );

    const idConta = resConta.insertId;

    await conection.commit();
    conection.release();
    return idConta;
  } catch (error) {
    await conection.rollback();
    conection.release();
    throw error;
  }
}

async function cadastrarJogador(idConta, idRegiao, gameName, tagline, nome) {
  const conection = await pool.getConnection();
  try {
    await conection.execute(
      "INSERT INTO jogador (id_conta, id_regiao, game_name, tagline, nome) VALUES (?, ?, ?, ?, ?)",
      [idConta, idRegiao, gameName, tagline, nome]
    );
    conection.release();
  } catch (error) {
    conection.release();
    throw error;
  }
}

async function cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj) {
  const conection = await pool.getConnection();
  try {
    await conection.execute(
      "INSERT INTO organizacao (id_conta, nome_org, sigla, cnpj) VALUES (?, ?, ?, ?)",
      [idConta, nomeOrg, sigla, cnpj]
    );
    conection.release();
  } catch (error) {
    conection.release();
    throw error;
  }
}

async function autenticar(email, senhaHash) {
  const conection = await pool.getConnection();
  try {
    const [rows] = await conection.execute(
      "SELECT id_conta, email, senha_hash FROM conta WHERE email = ? AND senha_hash = ?",
      [email, senhaHash]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    conection.release();
  }
}

module.exports = {
  cadastrarConta,
  cadastrarJogador,
  cadastrarOrganizacao,
  autenticar
};
