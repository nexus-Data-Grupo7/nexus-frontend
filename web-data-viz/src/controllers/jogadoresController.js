var jogadorModel = require("../models/jogadoresModel");

function listar(req, res) {
    jogadorModel.listar()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum jogador encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os jogadores: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarPorId(req, res) {
    var idJogador = req.params.idJogador;

    jogadorModel.buscarPorId(idJogador)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).send("Jogador não encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar o jogador: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function excluir(req, res) {
    var idJogador = req.body.idJogador;

    if (idJogador == undefined) {
        res.status(400).send("O ID do jogador está indefinido!");
        return;
    }

    jogadorModel.buscarPorId(idJogador)
        .then(function (resultado) {
            if (resultado.length === 0) {
                res.status(404).json({ erro: "Jogador não encontrado!" });
                return;
            }

            const idConta = resultado[0].id_conta;
            if (idConta) {
                jogadorModel.excluirComConta(idConta)
                    .then(function (resultadoExclusao) {
                        res.status(200).json({ 
                            mensagem: "Jogador e conta excluídos com sucesso!",
                            id: idJogador,
                            idConta: idConta
                        });
                    })
                    .catch(function (erro) {
                        console.log(erro);
                        console.log("Houve um erro ao excluir a conta do jogador: ", erro.sqlMessage);
                        res.status(500).json({ 
                            erro: "Erro ao excluir conta e jogador",
                            detalhes: erro.sqlMessage 
                        });
                    });
            } else {
                jogadorModel.excluir(idJogador)
                    .then(function (resultadoExclusao) {
                        res.status(200).json({ 
                            mensagem: "Jogador excluído com sucesso!",
                            id: idJogador
                        });
                    })
                    .catch(function (erro) {
                        console.log(erro);
                        console.log("Houve um erro ao excluir o jogador: ", erro.sqlMessage);
                        res.status(500).json({ 
                            erro: "Erro ao excluir jogador",
                            detalhes: erro.sqlMessage 
                        });
                    });
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ 
                erro: "Erro ao verificar jogador",
                detalhes: erro.sqlMessage 
            });
        });
}

function buscarPorGameName(req, res) {
    var gameName = req.params.gameName;

    jogadorModel.buscarPorGameName(gameName)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).send("Jogador não encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar o jogador: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listar,
    buscarPorId,
    excluir,
    buscarPorGameName
};