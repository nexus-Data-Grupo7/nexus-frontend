require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function cadastrarConta(email, senhaHash, tipoConta) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [resConta] = await connection.execute(
      "INSERT INTO conta (email, senha_hash, tipo_conta) VALUES (?, ?, ?)",
      [email, senhaHash, tipoConta]
    );

    const idConta = resConta.insertId;

    await connection.commit();
    return idConta;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cadastrarJogador(idConta, idRegiao, gameName, tagline, nome, idade) {
  const connection = await pool.getConnection();
  try {
    const query = "INSERT INTO jogador (id_conta, id_regiao, game_name, tagline, nome, idade) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [idConta, idRegiao, gameName, tagline, nome, idade];
    
    console.log("Query:", query);
    console.log("Params:", params);
    
    const result = await connection.execute(query, params);
    
    console.log("Insert realizado com sucesso!");
    return result;
  } catch (error) {
    console.error("Erro no model cadastrarJogador:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      "INSERT INTO organizacao (id_conta, nome_org, sigla, cnpj) VALUES (?, ?, ?, ?)",
      [idConta, nomeOrg, sigla, cnpj]
    );
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function autenticar(email, senhaHash) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id_conta, email, tipo_conta FROM conta WHERE email = ? AND senha_hash = ?",
      [email, senhaHash]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    connection.release();
  }
}

module.exports = {
  cadastrarConta,
  cadastrarJogador,
  cadastrarOrganizacao,
  autenticar
};