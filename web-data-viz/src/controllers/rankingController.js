const rankingModel = require("../models/rankingModel");

async function filtroTodos(req, res) {

    try {
        const resultados = await rankingModel.filtroTodos();
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de ranking." });
    }
}

async function filtroPremiacoes(req, res) {

    try {
        const resultados = await rankingModel.filtroPremiacoes();
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de ranking." });
    }
}

async function filtroVitoria(req, res) {

    try {
        const resultados = await rankingModel.filtroVitoria();
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de ranking." });
    }
}

async function buscaJogador(req, res) {
    const nome = req.params.nome;

    try {
        const resultados = await rankingModel.buscaJogador(nome);
        res.status(200).json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dados de ranking." });
    }
}

module.exports = {
    filtroTodos,
    filtroPremiacoes,
    filtroVitoria,
    buscaJogador
};
