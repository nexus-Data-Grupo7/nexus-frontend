// eu chamo as informações da model
var usuarioModel = require("../models/usuarioModel")

function cadastrar(req, res) {
    const tipoUsuario = req.params.tipoUsuario;
    const dados = req.body;

    if (dados.nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    }
    else if (dados.email == undefined) {
        res.status(400).send("Seu email está undefined!");
    }
    else if (dados.senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    }
    else {
        if (tipoUsuario == "jogador") {
            usuarioModel.cadastrarJogador(dados.nome, dados.email, dados.cpf, dados.senha)
                .then(resultado => {
                    res.status(201).json(resultado);
                })
                .catch(erro => {
                    res.status(500).json(erro);
                });
        } else if (tipoUsuario == "organizacao") {
            usuarioModel.cadastrarOrganizacao(dados.nome, dados.email, dados.cnpj, dados.senha)
                .then(resultado => {
                    res.status(201).json(resultado);
                })
                .catch(erro => {
                    res.status(500).json(erro);
                });
        } else {
            res.status(400).send("Tipo de usuário inválido!");
        }
    }
}

module.exports = {
    cadastrar
}