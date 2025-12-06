var organizacaoModel = require("../models/organizacaoModel");

function listar(req, res) {
    organizacaoModel.listar()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhuma organização encontrada!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar as organizações: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarPorId(req, res) {
    var idOrganizacao = req.params.idOrganizacao;

    organizacaoModel.buscarPorId(idOrganizacao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).send("Organização não encontrada!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar a organização: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function excluir(req, res) {
    var idOrganizacao = req.body.idOrganizacao;

    if (idOrganizacao == undefined) {
        res.status(400).send("O ID da organização está indefinido!");
        return;
    }
    organizacaoModel.buscarPorId(idOrganizacao)
        .then(function (resultado) {
            if (resultado.length === 0) {
                res.status(404).json({ erro: "Organização não encontrada!" });
                return;
            }

            const idConta = resultado[0].id_conta;

            organizacaoModel.contarJogadores(idOrganizacao)
                .then(function (resultadoJogadores) {
                    const totalJogadores = resultadoJogadores[0].total;

                    if (totalJogadores > 0) {
                        res.status(400).json({ 
                            erro: `Não é possível excluir! Esta organização possui ${totalJogadores} jogador(es) vinculado(s). Remova os jogadores primeiro.`,
                            totalJogadores: totalJogadores
                        });
                        return;
                    }

                    if (idConta) {
                        organizacaoModel.excluirComConta(idConta)
                            .then(function (resultadoExclusao) {
                                res.status(200).json({ 
                                    mensagem: "Organização e conta excluídas com sucesso!",
                                    id: idOrganizacao,
                                    idConta: idConta
                                });
                            })
                            .catch(function (erro) {
                                console.log(erro);
                                console.log("Houve um erro ao excluir a conta da organização: ", erro.sqlMessage);
                                res.status(500).json({ 
                                    erro: "Erro ao excluir conta e organização",
                                    detalhes: erro.sqlMessage 
                                });
                            });
                    } else {
                        organizacaoModel.excluir(idOrganizacao)
                            .then(function (resultadoExclusao) {
                                res.status(200).json({ 
                                    mensagem: "Organização excluída com sucesso!",
                                    id: idOrganizacao
                                });
                            })
                            .catch(function (erro) {
                                console.log(erro);
                                console.log("Houve um erro ao excluir a organização: ", erro.sqlMessage);
                                res.status(500).json({ 
                                    erro: "Erro ao excluir organização",
                                    detalhes: erro.sqlMessage 
                                });
                            });
                    }
                })
                .catch(function (erro) {
                    console.log(erro);
                    res.status(500).json({ 
                        erro: "Erro ao verificar jogadores vinculados",
                        detalhes: erro.sqlMessage 
                    });
                });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ 
                erro: "Erro ao verificar organização",
                detalhes: erro.sqlMessage 
            });
        });
}

function buscarPorCNPJ(req, res) {
    var cnpj = req.params.cnpj;

    organizacaoModel.buscarPorCNPJ(cnpj)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).send("Organização não encontrada!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar a organização: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listar,
    buscarPorId,
    excluir,
    buscarPorCNPJ
};