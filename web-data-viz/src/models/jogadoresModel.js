var database = require("../database/config");

function listar() {
    var instrucaoSql = `
        SELECT 
            j.id_jogador,
            j.id_conta,
            j.game_name,
            j.tagline,
            j.nome,
            j.divisao,
            j.pontos_liga,
            j.premiacao,
            j.dt_nascimento,
            r.nome_regiao,
            r.codigo_regiao,
            e.nome_elo,
            o.nome_org,
            o.sigla,
            c.email,
            c.data_cadastro
        FROM jogador j
        LEFT JOIN regiao r ON j.id_regiao = r.id_regiao
        LEFT JOIN elo e ON j.id_elo = e.id_elo
        LEFT JOIN organizacao o ON j.id_organizacao = o.id_organizacao
        LEFT JOIN conta c ON j.id_conta = c.id_conta
        ORDER BY j.game_name;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPorId(idJogador) {
    var instrucaoSql = `
        SELECT 
            j.*,
            r.nome_regiao,
            e.nome_elo,
            o.nome_org,
            c.email
        FROM jogador j
        LEFT JOIN regiao r ON j.id_regiao = r.id_regiao
        LEFT JOIN elo e ON j.id_elo = e.id_elo
        LEFT JOIN organizacao o ON j.id_organizacao = o.id_organizacao
        LEFT JOIN conta c ON j.id_conta = c.id_conta
        WHERE j.id_jogador = ${idJogador};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluir(idJogador) {
    var instrucaoSql = `
        DELETE FROM jogador WHERE id_jogador = ${idJogador};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluirComConta(idConta) {
    var instrucaoSql = `
        DELETE FROM conta WHERE id_conta = ${idConta};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPorGameName(gameName) {
    var instrucaoSql = `
        SELECT * FROM jogador 
        WHERE game_name = '${gameName}';
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    buscarPorId,
    excluir,
    excluirComConta,
    buscarPorGameName
};