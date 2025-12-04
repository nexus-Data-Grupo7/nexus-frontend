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
router.put('/atualizarPerfilOrganizacao', usuarioController.atualizarPerfilOrganizacao);
router.delete('/excluirContaOrganizacao', usuarioController.excluirContaOrganizacao);
router.get("/administradores/listar", usuarioController.listarAdministradores);
router.post("/administradores/cadastrar", usuarioController.cadastrarAdministrador);
router.put("/administradores/editar", usuarioController.editarAdministrador);
router.delete("/administradores/excluir", usuarioController.excluirAdministrador);
router.get("/carregarBarraLateral/:idUsuario", usuarioController.carregarBarraLateral);

module.exports = router;