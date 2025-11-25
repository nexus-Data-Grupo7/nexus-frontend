const jogadorModel = require("../models/jogadorModel");

async function dadosDashboardIndividual(req, res) {

    try {
        const resultados = await jogadorModel.dadosDashboardIndividual(req.params.idJogador);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de jogador." });
    }
}

async function dadosGraficoJogador(req, res) {
    try {
        const resultados = await jogadorModel.dadosGraficoJogador(req.params.idJogador);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de gráfico do jogador." });
    }
}

async function dadosGraficoJogadorPizza(req, res) {
    try {
        const resultados = await jogadorModel.dadosGraficoJogadorPizza(req.params.idJogador);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de gráfico pizza do jogador." });
    }
}

async function premiacao(req, res) {
    try {
        const resultados = await jogadorModel.premiacao(req.params.idJogador);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de premiação do jogador." });
    }
}

async function infoJogador(req, res) {
    try {
        const resultados = await jogadorModel.infoJogador(req.params.idJogador);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar informações do jogador." });
    }
}

module.exports = {
    dadosDashboardIndividual,
    dadosGraficoJogador,
    dadosGraficoJogadorPizza,
    premiacao,
    infoJogador
};
