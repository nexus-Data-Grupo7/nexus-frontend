const express = require("express");
const router = express.Router();

const jogadorController = require("../controllers/jogadorController");
const { route } = require("./usuario");

router.get("/dadosDashboardIndividual/:idJogador", jogadorController.dadosDashboardIndividual);
router.get("/dadosGraficoJogador/:idJogador", jogadorController.dadosGraficoJogador);
router.get("/dadosGraficoJogadorPizza/:idJogador", jogadorController.dadosGraficoJogadorPizza);
router.get("/premiacao/:idJogador", jogadorController.premiacao);
router.get("/infoJogador/:idJogador", jogadorController.infoJogador);

module.exports = router;
