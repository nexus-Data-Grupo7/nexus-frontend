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
    dtNascimento, // ALTERAÇÃO: Recebendo a data
    nomeOrg,
    sigla,
    cnpj,
  } = req.body;

  // Validações básicas
  if (!emailServer || !senhaServer || !tipoContaServer) {
    return res.status(400).json({ erro: "Email, senha e tipo de conta são obrigatórios!" });
  }

  try {
    // Cadastra a conta (o model já vai por a foto padrão)
    const idConta = await usuarioModel.cadastrarConta(
      emailServer,
      senhaServer,
      tipoContaServer
    );

    // Cadastra jogador ou organização
    if (tipoContaServer === "JOGADOR") {
      // ALTERAÇÃO: Valida dtNascimento
      if (!idRegiao || !gameName || !tagline || !nome || !dtNascimento) {
        return res.status(400).json({ erro: "Todos os campos do jogador são obrigatórios!" });
      }

      const idRegiaoNum = parseInt(idRegiao);

      console.log("=== DEBUG CADASTRO JOGADOR ===");
      console.log("dtNascimento:", dtNascimento);

      // ALTERAÇÃO: Passando a data para o model
      await usuarioModel.cadastrarJogador(idConta, idRegiaoNum, gameName, tagline, nome, dtNascimento);

    } else if (tipoContaServer === "ORGANIZACAO") {
      if (!nomeOrg || !sigla || !cnpj) {
        return res.status(400).json({ erro: "Todos os campos da organização são obrigatórios!" });
      }
      await usuarioModel.cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj);
    }

    res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      if (erro.message.includes('email')) return res.status(400).json({ erro: "Este email já está cadastrado!" });
      if (erro.message.includes('game_name')) return res.status(400).json({ erro: "Este Game Name já está cadastrado!" });
      if (erro.message.includes('cnpj')) return res.status(400).json({ erro: "Este CNPJ já está cadastrado!" });
      if (erro.message.includes('sigla')) return res.status(400).json({ erro: "Esta sigla já está cadastrada!" });
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

async function atualizarImagem(req, res) {
  const { idUsuario, novaImagem } = req.body;

  if (!idUsuario || !novaImagem) {
    return res.status(400).json({ erro: "ID e nova imagem são obrigatórios!" });
  }

  try {
    await usuarioModel.atualizarImagemPerfil(idUsuario, novaImagem);
    res.status(200).json({ mensagem: "Foto atualizada com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar foto:", erro);
    res.status(500).json({ erro: "Erro ao atualizar a foto." });
  }
}

async function obterPerfilJogador(req, res) {
  const { idUsuario } = req.params;
  try {
    const perfil = await usuarioModel.obterPerfilJogador(idUsuario);
    res.json(perfil);
  } catch (erro) {
    console.error("Erro ao obter perfil do jogador:", erro);
    res.status(500).json({ erro: "Erro ao obter o perfil do jogador." });
  }
}

async function obterPerfilOrganizacao(req, res) {
  const { idUsuario } = req.params;
  try {
    const perfil = await usuarioModel.obterPerfilOrganizacao(idUsuario);
    res.json(perfil);
  } catch (erro) {
    console.error("Erro ao obter perfil da organização:", erro);
    res.status(500).json({ erro: "Erro ao obter o perfil da organização." });
  }
}

async function atualizarPerfilJogador(req, res) {
  const { idUsuario, novoNome, novoEmail, novaSenha } = req.body;

  if (!idUsuario) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório!" });
  }

  // Verifica se pelo menos um campo foi enviado
  if ((!novoEmail || novoEmail.trim() === "") && (!novaSenha || novaSenha.trim() === "") && (!novoNome || novoNome.trim() === "")) {
    return res.status(400).json({ erro: "Preencha pelo menos um campo para atualizar." });
  }

  try {
    await usuarioModel.atualizarPerfilJogador(idUsuario, novoNome, novoEmail, novaSenha);
    res.status(200).json({ mensagem: "Perfil atualizado com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: "Este e-mail já está em uso por outra conta." });
    }
    res.status(500).json({ erro: "Erro ao atualizar o perfil." });
  }
}

async function excluirContaJogador(req, res) {
  const { idUsuario } = req.body;
  if (!idUsuario) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório!" });
  }

  try {
    await usuarioModel.excluirContaJogador(idUsuario);
    res.status(200).json({ mensagem: "Conta excluída com sucesso!" });
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    res.status(500).json({ erro: "Erro ao excluir a conta." });
  }
}

module.exports = {
  cadastrar,
  autenticar,
  atualizarImagem,
  obterPerfilJogador,
  obterPerfilOrganizacao,
  atualizarPerfilJogador,
  excluirContaJogador
};