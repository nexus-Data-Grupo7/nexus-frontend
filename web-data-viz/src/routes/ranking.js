const express = require("express");
const router = express.Router();

const rankingController = require("../controllers/rankingController");

router.get("/filtroTodos", rankingController.filtroTodos);
router.get("/filtroPremiacoes", rankingController.filtroPremiacoes);
router.get("/filtroVitoria", rankingController.filtroVitoria);
router.get("/buscaJogador/:nome", rankingController.buscaJogador);

module.exports = router;
