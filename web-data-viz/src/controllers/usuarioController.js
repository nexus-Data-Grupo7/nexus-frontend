const usuarioModel = require("../models/usuarioModel");

async function cadastrar(req, res) {
  const {
    emailServer,
    senhaServer,
    tipoContaServer,
    idRegiao,
    gameName,
    tagline,
    nome,
    nomeOrg,
    sigla,
    cnpj,
  } = req.body;

  try {
    const idConta = await usuarioModel.cadastrarConta(
      emailServer,
      senhaServer,
      tipoContaServer
    );

  
    if (tipoContaServer === "JOGADOR") {
      await usuarioModel.cadastrarJogador(idConta, idRegiao, gameName, tagline, nome);
    } else if (tipoContaServer === "ORGANIZACAO") {
      await usuarioModel.cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj);
    }

    res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    res.status(500).json({ erro: erro.message });
  }
}

async function autenticar(req, res) {
  const email = req.body.emailServer;
  const senhaHash = req.body.senhaServer;

  if (!email || !senhaHash) {
    return res.status(400).send("Email ou senha não informados!");
  }

  try {
    const usuario = await usuarioModel.autenticar(email, senhaHash);

    if (!usuario) return res.status(403).send("Email e/ou senha inválido(s)");

    res.json({
      id: usuario.id_conta,
      email: usuario.email
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro no servidor ao autenticar.");
  }
}

module.exports = {
  cadastrar,
  autenticar
};
