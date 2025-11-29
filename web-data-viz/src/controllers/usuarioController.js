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
    idade,
    nomeOrg,
    sigla,
    cnpj,
  } = req.body;

  // Validações básicas
  if (!emailServer || !senhaServer || !tipoContaServer) {
    return res.status(400).json({ erro: "Email, senha e tipo de conta são obrigatórios!" });
  }

  try {
    // Cadastra a conta
    const idConta = await usuarioModel.cadastrarConta(
      emailServer,
      senhaServer,
      tipoContaServer
    );

    // Cadastra jogador ou organização
    if (tipoContaServer === "JOGADOR") {
      if (!idRegiao || !gameName || !tagline || !nome || !idade) {
        return res.status(400).json({ erro: "Todos os campos do jogador são obrigatórios!" });
      }
      
      // Garante que idade e idRegiao são números
      const idadeNum = parseInt(idade);
      const idRegiaoNum = parseInt(idRegiao);
      
      console.log("=== DEBUG CADASTRO JOGADOR ===");
      console.log("idConta:", idConta, typeof idConta);
      console.log("idRegiaoNum:", idRegiaoNum, typeof idRegiaoNum);
      console.log("gameName:", gameName, typeof gameName);
      console.log("tagline:", tagline, typeof tagline);
      console.log("nome:", nome, typeof nome);
      console.log("idadeNum:", idadeNum, typeof idadeNum);
      console.log("============================");
      
      await usuarioModel.cadastrarJogador(idConta, idRegiaoNum, gameName, tagline, nome, idadeNum);
    } else if (tipoContaServer === "ORGANIZACAO") {
      if (!nomeOrg || !sigla || !cnpj) {
        return res.status(400).json({ erro: "Todos os campos da organização são obrigatórios!" });
      }
      await usuarioModel.cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj);
    }

    res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    
    // Tratamento de erros específicos do MySQL
    if (erro.code === 'ER_DUP_ENTRY') {
      if (erro.message.includes('email')) {
        return res.status(400).json({ erro: "Este email já está cadastrado!" });
      }
      if (erro.message.includes('game_name')) {
        return res.status(400).json({ erro: "Este Game Name já está cadastrado!" });
      }
      if (erro.message.includes('cnpj')) {
        return res.status(400).json({ erro: "Este CNPJ já está cadastrado!" });
      }
      if (erro.message.includes('sigla')) {
        return res.status(400).json({ erro: "Esta sigla já está cadastrada!" });
      }
      return res.status(400).json({ erro: "Dados duplicados no sistema!" });
    }
    
    res.status(500).json({ erro: "Erro interno no servidor ao realizar cadastro." });
  }
}

async function autenticar(req, res) {
  const email = req.body.emailServer;
  const senhaHash = req.body.senhaServer;

  if (!email || !senhaHash) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios!" });
  }

  try {
    const usuario = await usuarioModel.autenticar(email, senhaHash);

    if (!usuario) {
      return res.status(403).json({ erro: "Email e/ou senha inválido(s)" });
    }

    res.json({
      id: usuario.id_conta,
      email: usuario.email,
      tipoConta: usuario.tipo_conta
    });
  } catch (erro) {
    console.error("Erro na autenticação:", erro);
    res.status(500).json({ erro: "Erro no servidor ao autenticar." });
  }
}

module.exports = {
  cadastrar,
  autenticar
};