require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

async function dadosDashboardIndividual(idJogador) {
    const query = `
SELECT 

    ROUND(AVG(abates), 0) AS media_kills,
 
    ROUND(AVG(mortes), 0) AS media_deaths,
    
    ROUND(AVG(assistencias), 0) AS media_assists,

    ROUND((SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) AS taxa_vitoria,

    ROUND(AVG(cs_num), 0) AS farm_medio

FROM desempenho_partida
WHERE id_jogador = ${idJogador};`;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ao buscar ranking por taxa de vitória:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function dadosGraficoJogador(idJogador) {
    const query = `
    SELECT resultado 
FROM desempenho_partida 
WHERE id_jogador = ${idJogador}
ORDER BY id_partida ASC;`;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ao buscar dados de gráfico do jogador:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function dadosGraficoJogadorPizza(idJogador) {
    const query = `
        SELECT 
    c.nome_campeao, 
    COUNT(dp.id_partida) as qtd_partidas
FROM desempenho_partida dp
JOIN campeao c ON dp.id_campeao = c.id_campeao
WHERE dp.id_jogador = ${idJogador} -- Será substituído pelo ID
GROUP BY c.nome_campeao
ORDER BY qtd_partidas DESC
LIMIT 3;`;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ao buscar dados de gráfico pizza do jogador:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function premiacao(idJogador) {
    const query = `
    SELECT premiacao FROM jogador WHERE id_jogador = ${idJogador};`;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ao buscar dados de premiação do jogador:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

function infoJogador(idJogador) {
    const query = `
    SELECT 
    j.nome, 
    j.idade,
    (
        SELECT f.nome_funcao
        FROM desempenho_partida dp
        JOIN funcao f ON dp.id_funcao = f.id_funcao
        WHERE dp.id_jogador = j.id_jogador
        GROUP BY f.id_funcao
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) AS posicao_mais_jogada
FROM 
    jogador j WHERE j.id_jogador = ${idJogador};`;
    let connection;
    return new Promise(async (resolve, reject) => {
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.query(query);
            resolve(rows);
        } catch (error) {
            console.error("Erro no model ao buscar informações do jogador:", error);
            reject(error);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    });
}

module.exports = {
    dadosDashboardIndividual,
    dadosGraficoJogador,
    dadosGraficoJogadorPizza,
    premiacao,
    infoJogador
};
