var database = require("../database/config")

// Crio uma instrução para o MySql inserir um novo usuário
function cadastrarJogador(nome, email, cpf, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha)

    var instrucaoSql = `
    INSERT INTO jogador (nomeJogador, emailJogador, cpfJogador, senhaJogador) VALUES
    ('${nome}', '${email}', '${cpf}', '${senha}')`

    console.log("Executando a instrução SQL: \n" + instrucaoSql)
    return database.executar(instrucaoSql);
}

function cadastrarOrganizacao(nome, email, cnpj, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha)

    var instrucaoSql = `
    INSERT INTO organizacao (nomeOrganizacao, emailOrganizacao, cnpjOrganizacao, senhaOrganizacao) VALUES
    ('${nome}', '${email}', '${cnpj}', '${senha}')`


    console.log("Executando a instrução SQL: \n" + instrucaoSql)
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrarJogador,
    cadastrarOrganizacao
}