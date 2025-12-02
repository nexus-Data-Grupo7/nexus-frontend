const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/cadastrar', usuarioController.cadastrar);
router.post('/autenticar', usuarioController.autenticar);
router.put("/atualizarFoto", usuarioController.atualizarImagem);
router.get('/perfilJogador/:idUsuario', usuarioController.obterPerfilJogador);
router.get('/perfilOrganizacao/:idUsuario', usuarioController.obterPerfilOrganizacao);
router.put('/atualizarPerfilJogador', usuarioController.atualizarPerfilJogador);
router.delete('/excluirContaJogador', usuarioController.excluirContaJogador);

module.exports = router;