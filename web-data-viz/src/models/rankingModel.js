require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

async function filtroTodos() {

    const query = `
    /* 1. Prepara o Histórico: Pega o Último e o Penúltimo registro de cada jogador */
    WITH HistoricoOrdenado AS (
        SELECT 
            id_jogador, 
            posicao, 
            data_registro,
            ROW_NUMBER() OVER (PARTITION BY id_jogador ORDER BY data_registro DESC) as rn
        FROM ranking_historico
    ),
    ComparacaoHistorico AS (
        SELECT 
            h1.id_jogador,
            h1.posicao AS posicao_atual,   -- O registro mais recente (rn=1)
            h2.posicao AS posicao_anterior -- O registro anterior (rn=2)
        FROM HistoricoOrdenado h1
        LEFT JOIN HistoricoOrdenado h2 
            ON h1.id_jogador = h2.id_jogador AND h2.rn = 2
        WHERE h1.rn = 1 -- Queremos apenas a linha mais recente como base
    ),

    /* 2. Calcula estatísticas de performance (Apenas para exibir na tela, não para ranquear) */
    EstatisticasJogador AS (
        SELECT
            id_jogador,
            COUNT(*) AS total_jogos,
            SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) AS vitorias,
            SUM(CASE WHEN resultado = 'DERROTA' THEN 1 ELSE 0 END) AS derrotas,
            (SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS taxa_vitorias,
            (SUM(abates) + SUM(assistencias)) / GREATEST(SUM(mortes), 1) AS kda_ratio
        FROM desempenho_partida
        GROUP BY id_jogador
    ),

    /* 3. Top 3 Campeões */
    CampeoesJogados AS (
        SELECT
            dp.id_jogador,
            c.nome_campeao,
            ROW_NUMBER() OVER (PARTITION BY dp.id_jogador ORDER BY COUNT(*) DESC) AS rn
        FROM desempenho_partida AS dp
        JOIN campeao AS c ON dp.id_campeao = c.id_campeao
        GROUP BY dp.id_jogador, c.nome_campeao
    ),
    Top3Campeoes AS (
        SELECT
            id_jogador,
            MAX(CASE WHEN rn = 1 THEN nome_campeao END) AS campeao1,
            MAX(CASE WHEN rn = 2 THEN nome_campeao END) AS campeao2,
            MAX(CASE WHEN rn = 3 THEN nome_campeao END) AS campeao3
        FROM CampeoesJogados WHERE rn <= 3 GROUP BY id_jogador
    )

    /* 4. SELECT FINAL */
    SELECT
        /* Agora usamos a posição salva no banco, não calculada na hora */
        ch.posicao_atual AS posicao_ranking, 
        
        j.id_jogador,
        j.game_name,
        j.nome AS nome_jogador,
        e.nome_elo,
        
        /* Posição do registro anterior para comparação */
        ch.posicao_anterior,

        t3.campeao1, t3.campeao2, t3.campeao3,
        est.vitorias, est.derrotas, est.taxa_vitorias

    FROM ComparacaoHistorico ch
    JOIN jogador AS j ON ch.id_jogador = j.id_jogador
    LEFT JOIN elo AS e ON j.id_elo = e.id_elo
    LEFT JOIN EstatisticasJogador AS est ON j.id_jogador = est.id_jogador
    LEFT JOIN Top3Campeoes AS t3 ON j.id_jogador = t3.id_jogador

    /* Ordena pela posição que está salva no banco */
    ORDER BY ch.posicao_atual ASC;`;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error("Erro no model ranking:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function filtroPremiacoes() {

    const query = `
      WITH EstatisticasJogador AS (
        SELECT
            id_jogador,
            COUNT(*) AS total_partidas_analisadas,
            SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) AS vitorias,
            SUM(CASE WHEN resultado = 'DERROTA' THEN 1 ELSE 0 END) AS derrotas,
            (SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS taxa_vitorias
        FROM
            desempenho_partida
        GROUP BY
            id_jogador
    ),

    CampeoesJogados AS (
        SELECT
            dp.id_jogador,
            c.nome_campeao,
            COUNT(*) AS total_jogos,
            ROW_NUMBER() OVER (
                PARTITION BY dp.id_jogador
                ORDER BY COUNT(*) DESC
            ) AS rn
        FROM
            desempenho_partida AS dp
        JOIN
            campeao AS c ON dp.id_campeao = c.id_campeao
        GROUP BY
            dp.id_jogador, c.nome_campeao
    ),
    
    Top3Campeoes AS (
        SELECT
            id_jogador,
            MAX(CASE WHEN rn = 1 THEN nome_campeao END) AS campeao1,
            MAX(CASE WHEN rn = 2 THEN nome_campeao END) AS campeao2,
            MAX(CASE WHEN rn = 3 THEN nome_campeao END) AS campeao3
        FROM
            CampeoesJogados
        WHERE
            rn <= 3
        GROUP BY
            id_jogador
    )

    SELECT
        /* AQUI ESTÁ A MUDANÇA:
           O Rank agora é calculado apenas com base na PREMIAÇÃO (do maior para o menor).
        */
        RANK() OVER (
            ORDER BY j.premiacao DESC
        ) AS posicao_ranking,
        
        j.id_jogador,
        j.game_name,
        j.nome AS nome_jogador,
        j.premiacao, /* Adicionei para você conferir o valor */
        
        e.nome_elo,
        
        t3.campeao1,
        t3.campeao2,
        t3.campeao3,
        
        est.vitorias,
        est.derrotas,
        est.taxa_vitorias,
        est.total_partidas_analisadas
        
    FROM
        jogador AS j
    LEFT JOIN
        elo AS e ON j.id_elo = e.id_elo
    LEFT JOIN
        EstatisticasJogador AS est ON j.id_jogador = est.id_jogador
    LEFT JOIN
        Top3Campeoes AS t3 ON j.id_jogador = t3.id_jogador

    WHERE
        j.id_elo IS NOT NULL
        AND est.total_partidas_analisadas >= 0
    
    /* Ordena o resultado final seguindo o cálculo do RANK acima */
    ORDER BY
        posicao_ranking ASC;`;

    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(query);

        return rows;

    } catch (error) {
        console.error("Erro no model ao buscar ranking:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function filtroVitoria() {

    const query = `
    WITH EstatisticasJogador AS (
        SELECT
            id_jogador,
            COUNT(*) AS total_partidas_analisadas,
            SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) AS vitorias,
            SUM(CASE WHEN resultado = 'DERROTA' THEN 1 ELSE 0 END) AS derrotas,
            (SUM(CASE WHEN resultado = 'VITORIA' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS taxa_vitorias
        FROM
            desempenho_partida
        GROUP BY
            id_jogador
    ),

    CampeoesJogados AS (
        SELECT
            dp.id_jogador,
            c.nome_campeao,
            COUNT(*) AS total_jogos,
            ROW_NUMBER() OVER (
                PARTITION BY dp.id_jogador
                ORDER BY COUNT(*) DESC
            ) AS rn
        FROM
            desempenho_partida AS dp
        JOIN
            campeao AS c ON dp.id_campeao = c.id_campeao
        GROUP BY
            dp.id_jogador, c.nome_campeao
    ),
    
    Top3Campeoes AS (
        SELECT
            id_jogador,
            MAX(CASE WHEN rn = 1 THEN nome_campeao END) AS campeao1,
            MAX(CASE WHEN rn = 2 THEN nome_campeao END) AS campeao2,
            MAX(CASE WHEN rn = 3 THEN nome_campeao END) AS campeao3
        FROM
            CampeoesJogados
        WHERE
            rn <= 3
        GROUP BY
            id_jogador
    )

    SELECT
        /* RANKING POR TAXA DE VITÓRIA:
           1º Critério: Maior taxa de vitória (DESC)
           2º Critério (Desempate): Quem jogou mais partidas (DESC)
        */
        RANK() OVER (
            ORDER BY 
                est.taxa_vitorias DESC, 
                est.total_partidas_analisadas DESC 
        ) AS posicao_ranking,
        
        j.id_jogador,
        j.game_name,
        j.nome AS nome_jogador,
        j.premiacao, 
        
        e.nome_elo,
        
        t3.campeao1,
        t3.campeao2,
        t3.campeao3,
        
        est.vitorias,
        est.derrotas,
        est.taxa_vitorias, /* Esse é o valor principal deste ranking */
        est.total_partidas_analisadas
        
    FROM
        jogador AS j
    LEFT JOIN
        elo AS e ON j.id_elo = e.id_elo
    LEFT JOIN
        EstatisticasJogador AS est ON j.id_jogador = est.id_jogador
    LEFT JOIN
        Top3Campeoes AS t3 ON j.id_jogador = t3.id_jogador

    WHERE
        j.id_elo IS NOT NULL
        AND est.total_partidas_analisadas > 0
    
    ORDER BY
        posicao_ranking ASC;`;

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

async function buscaJogador(textoDigitado) {
    const query = `
    /* 1. Primeiro achamos os jogadores que tem esse nome (LIMIT 5 para não travar a tela) */
    WITH JogadoresEncontrados AS (
        SELECT id_jogador, game_name, id_elo
        FROM jogador
        WHERE game_name LIKE CONCAT('%', ?, '%')
        LIMIT 5
    ),

    /* 2. Calculamos os campeões mais jogados APENAS para esses jogadores encontrados */
    RankCampeoes AS (
        SELECT
            dp.id_jogador,
            c.nome_campeao,
            ROW_NUMBER() OVER (PARTITION BY dp.id_jogador ORDER BY COUNT(*) DESC) as rn
        FROM desempenho_partida dp
        JOIN campeao c ON dp.id_campeao = c.id_campeao
        WHERE dp.id_jogador IN (SELECT id_jogador FROM JogadoresEncontrados)
        GROUP BY dp.id_jogador, c.nome_campeao
    ),

    /* 3. Pivotamos para pegar o Top 1, 2 e 3 */
    Top3 AS (
        SELECT
            id_jogador,
            MAX(CASE WHEN rn = 1 THEN nome_campeao END) as campeao1,
            MAX(CASE WHEN rn = 2 THEN nome_campeao END) as campeao2,
            MAX(CASE WHEN rn = 3 THEN nome_campeao END) as campeao3
        FROM RankCampeoes
        WHERE rn <= 3
        GROUP BY id_jogador
    )

    /* 4. Select Final unindo nome, elo e campeões */
    SELECT
    j.id_jogador,
        j.game_name,
        e.nome_elo,
        t3.campeao1,
        t3.campeao2,
        t3.campeao3
    FROM JogadoresEncontrados j
    LEFT JOIN elo e ON j.id_elo = e.id_elo
    LEFT JOIN Top3 t3 ON j.id_jogador = t3.id_jogador;
    `;

    let connection;
    try {
        connection = await pool.getConnection();
        // Passamos o textoDigitado para o '?' no SQL
        const [rows] = await connection.query(query, [textoDigitado]);
        return rows;
    } catch (error) {
        console.error("Erro ao buscar jogadores na barra de pesquisa:", error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


module.exports = {
    filtroTodos,
    filtroPremiacoes,
    filtroVitoria,
    buscaJogador
};
