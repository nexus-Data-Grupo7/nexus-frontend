var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.post("/cadastrar/:tipoUsuario", function (req, res) {
    usuarioController.cadastrar(req, res)
})

router.post("/login/:tipoUsuario", function (req, res) {
    usuarioController.entrar(req, res)
})

module.exports = router;