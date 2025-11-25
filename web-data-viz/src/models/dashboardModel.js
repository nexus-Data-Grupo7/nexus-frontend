require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

async function carregarDashboard() {
    const query = `SELECT 
    -- --- DADOS DO MELHOR KDA ---
    kda_winner.game_name AS nome_melhor_kda,
    kda_winner.total_abates,
    kda_winner.total_mortes,
    kda_winner.total_assistencias,
    kda_winner.kda_calculado,

    -- --- DADOS DA MELHOR TAXA DE VITÓRIA ---
    winrate_winner.game_name AS nome_melhor_winrate,
    CONCAT(winrate_winner.taxa_vitoria, '%') AS taxa_vitoria,

    -- --- DADOS DO DESTAQUE (MVP) ---
    mvp_winner.game_name AS nome_destaque_geral,
    
    -- --- DADOS DA MAIOR PREMIAÇÃO ---
    money_winner.game_name AS nome_maior_premiacao,
    CONCAT('R$ ', FORMAT(money_winner.premiacao, 2, 'pt_BR')) AS valor_premiacao

FROM 
    -- 1. Subquery para achar o Melhor KDA
    (SELECT j.game_name, 
            SUM(dp.abates) as total_abates, 
            SUM(dp.mortes) as total_mortes, 
            SUM(dp.assistencias) as total_assistencias,
            ROUND((SUM(dp.abates) + SUM(dp.assistencias)) / GREATEST(SUM(dp.mortes), 1), 2) as kda_calculado
     FROM jogador j
     JOIN desempenho_partida dp ON j.id_jogador = dp.id_jogador
     GROUP BY j.id_jogador, j.game_name
     ORDER BY kda_calculado DESC LIMIT 1) AS kda_winner

JOIN 
    -- 2. Subquery para achar o Melhor WinRate
    (SELECT j.game_name, 
            ROUND((SUM(CASE WHEN dp.resultado = 'VITORIA' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as taxa_vitoria
     FROM jogador j
     JOIN desempenho_partida dp ON j.id_jogador = dp.id_jogador
     GROUP BY j.id_jogador, j.game_name
     ORDER BY taxa_vitoria DESC LIMIT 1) AS winrate_winner ON 1=1

JOIN 
    -- 3. Subquery para achar o Destaque (Pontuação Híbrida: WinRate + KDA)
    (SELECT j.game_name,
            ((SUM(CASE WHEN dp.resultado = 'VITORIA' THEN 1 ELSE 0 END) / COUNT(*)) * 100 + 
             ((SUM(dp.abates) + SUM(dp.assistencias)) / GREATEST(SUM(dp.mortes), 1) * 10)) as score_geral
     FROM jogador j
     JOIN desempenho_partida dp ON j.id_jogador = dp.id_jogador
     GROUP BY j.id_jogador, j.game_name
     ORDER BY score_geral DESC LIMIT 1) AS mvp_winner ON 1=1

JOIN 
    -- 4. Subquery para achar a Maior Premiação
    (SELECT game_name, premiacao 
     FROM jogador 
     ORDER BY premiacao DESC LIMIT 1) AS money_winner ON 1=1;`;

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

async function carregarDashboardGraficos() {
    const query = `(
    -- PARTE 1: Quantidade de vezes que cada Rota foi jogada
    SELECT 
        'Rota/Função' AS categoria,
        f.nome_funcao AS nome,
        COUNT(dp.id_funcao) AS total_vezes
    FROM desempenho_partida dp
    JOIN funcao f ON dp.id_funcao = f.id_funcao
    GROUP BY f.id_funcao, f.nome_funcao
)
UNION ALL
(
    -- PARTE 2: Os 3 Campeões mais jogados (Ranking Global)
    SELECT 
        'Top 3 Campeões' AS categoria,
        c.nome_campeao AS nome,
        COUNT(dp.id_campeao) AS total_vezes
    FROM desempenho_partida dp
    JOIN campeao c ON dp.id_campeao = c.id_campeao
    GROUP BY c.id_campeao, c.nome_campeao
    ORDER BY total_vezes DESC
    LIMIT 3
);`;
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ao buscar dados do dashboard gráficos:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}



module.exports = {
    carregarDashboard,
    carregarDashboardGraficos
};
