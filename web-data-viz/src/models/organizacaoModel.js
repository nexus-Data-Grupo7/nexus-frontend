var database = require("../database/config");

function listar() {
    var instrucaoSql = `
        SELECT 
            o.id_organizacao,
            o.id_conta,
            o.nome_org,
            o.sigla,
            o.cnpj,
            c.email,
            c.data_cadastro,
            c.imagem_perfil
        FROM organizacao o
        INNER JOIN conta c ON o.id_conta = c.id_conta
        ORDER BY o.nome_org;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPorId(idOrganizacao) {
    var instrucaoSql = `
        SELECT 
            o.*,
            c.email,
            c.data_cadastro,
            c.imagem_perfil
        FROM organizacao o
        INNER JOIN conta c ON o.id_conta = c.id_conta
        WHERE o.id_organizacao = ${idOrganizacao};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluir(idOrganizacao) {
    var instrucaoSql = `
        DELETE FROM organizacao WHERE id_organizacao = ${idOrganizacao};
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

function buscarPorCNPJ(cnpj) {
    var instrucaoSql = `
        SELECT * FROM organizacao 
        WHERE cnpj = '${cnpj}';
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function contarJogadores(idOrganizacao) {
    var instrucaoSql = `
        SELECT COUNT(*) as total
        FROM jogador 
        WHERE id_organizacao = ${idOrganizacao};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    buscarPorId,
    excluir,
    excluirComConta,
    buscarPorCNPJ,
    contarJogadores
};