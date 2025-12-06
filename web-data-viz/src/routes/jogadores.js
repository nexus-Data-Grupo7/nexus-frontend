var express = require("express");
var router = express.Router();

var jogadorController = require("../controllers/jogadoresController");

router.get("/listar", function (req, res) {
    jogadorController.listar(req, res);
});

router.get("/buscar/:idJogador", function (req, res) {
    jogadorController.buscarPorId(req, res);
});

router.get("/buscar-gamename/:gameName", function (req, res) {
    jogadorController.buscarPorGameName(req, res);
});

router.delete("/excluir", function (req, res) {
    jogadorController.excluir(req, res);
});

module.exports = router;