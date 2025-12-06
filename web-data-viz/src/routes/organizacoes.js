var express = require("express");
var router = express.Router();

var organizacaoController = require("../controllers/organizacaoController");

router.get("/listar", function (req, res) {
    organizacaoController.listar(req, res);
});

router.get("/buscar/:idOrganizacao", function (req, res) {
    organizacaoController.buscarPorId(req, res);
});

router.get("/buscar-cnpj/:cnpj", function (req, res) {
    organizacaoController.buscarPorCNPJ(req, res);
});

router.delete("/excluir", function (req, res) {
    organizacaoController.excluir(req, res);
});

module.exports = router;