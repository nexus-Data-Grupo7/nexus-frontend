require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function cadastrarConta(email, senhaHash, tipoConta) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [resConta] = await connection.execute(
      "INSERT INTO conta (email, senha_hash, tipo_conta, imagem_perfil) VALUES (?, ?, ?, 'foto_perfil')",
      [email, senhaHash, tipoConta]
    );

    const idConta = resConta.insertId;

    await connection.commit();
    return idConta;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ALTERAÇÃO AQUI: Recebe dtNascimento ao invés de idade
async function cadastrarJogador(idConta, idRegiao, gameName, tagline, nome, dtNascimento) {
  const connection = await pool.getConnection();
  try {
    // ALTERAÇÃO AQUI: Insert na coluna dt_nascimento
    const query = "INSERT INTO jogador (id_conta, id_regiao, game_name, tagline, nome, dt_nascimento) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [idConta, idRegiao, gameName, tagline, nome, dtNascimento];
    
    console.log("Query:", query);
    console.log("Params:", params);
    
    const result = await connection.execute(query, params);
    
    console.log("Insert realizado com sucesso!");
    return result;
  } catch (error) {
    console.error("Erro no model cadastrarJogador:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function cadastrarOrganizacao(idConta, nomeOrg, sigla, cnpj) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      "INSERT INTO organizacao (id_conta, nome_org, sigla, cnpj) VALUES (?, ?, ?, ?)",
      [idConta, nomeOrg, sigla, cnpj]
    );
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function autenticar(email, senhaHash) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id_conta, email, tipo_conta FROM conta WHERE email = ? AND senha_hash = ?",
      [email, senhaHash]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    connection.release();
  }
}

async function atualizarImagemPerfil(idUsuario, novaImagem) {
    const connection = await pool.getConnection();
    try {
        const query = "UPDATE conta SET imagem_perfil = ? WHERE id_conta = ?";
        await connection.execute(query, [novaImagem, idUsuario]);
    } finally {
        connection.release();
    }
}

async function obterPerfilJogador(idUsuario) {
    const connection = await pool.getConnection();
    try {
        // Query avançada:
        // 1. Pega dados do Jogador e da Conta
        // 2. Subselect para pegar a data da última partida (para calcular os dias)
        // 3. Subselect para pegar a última posição no histórico de ranking
        const query = `
            SELECT 
                j.nome, 
                j.dt_nascimento, 
                j.game_name, 
                j.tagline, 
                c.imagem_perfil,
                (
                    SELECT MAX(p.datahora_inicio) 
                    FROM partida p 
                    JOIN desempenho_partida dp ON p.id_partida = dp.id_partida 
                    WHERE dp.id_jogador = j.id_jogador
                ) as ultima_partida,
                (
                    SELECT posicao 
                    FROM ranking_historico rh 
                    WHERE rh.id_jogador = j.id_jogador 
                    ORDER BY data_registro DESC 
                    LIMIT 1
                ) as ranking_atual
            FROM jogador j
            JOIN conta c ON j.id_conta = c.id_conta
            WHERE j.id_conta = ?
        `;
        
        const [rows] = await connection.execute(query, [idUsuario]);
        return rows[0];
    } finally {
        connection.release();
    }
}

async function obterPerfilOrganizacao(idUsuario) {
    const connection = await pool.getConnection();
    try {
        const query = "SELECT * FROM organizacao WHERE id_conta = ?";
        const [rows] = await connection.execute(query, [idUsuario]);
        return rows[0];
    } finally {
        connection.release();
    }
}

async function atualizarPerfilJogador(idUsuario, nome, email, senha) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Atualiza Tabela CONTA (Email e Senha) se fornecidos
    const camposConta = [];
    const valoresConta = [];

    if (email && email.trim() !== "") {
      camposConta.push("email = ?");
      valoresConta.push(email);
    }
    if (senha && senha.trim() !== "") {
      camposConta.push("senha_hash = ?");
      valoresConta.push(senha);
    }

    if (camposConta.length > 0) {
      valoresConta.push(idUsuario);
      const queryConta = `UPDATE conta SET ${camposConta.join(", ")} WHERE id_conta = ?`;
      await connection.execute(queryConta, valoresConta);
    }

    // 2. Atualiza Tabela ESPECÍFICA (Nome) se fornecido
    // Tenta atualizar Jogador. Se não afetar linhas (não é jogador), tenta Organização.
    if (nome && nome.trim() !== "") {
      const [resJog] = await connection.execute(
        "UPDATE jogador SET nome = ? WHERE id_conta = ?",
        [nome, idUsuario]
      );

      if (resJog.affectedRows === 0) {
        await connection.execute(
          "UPDATE organizacao SET nome_org = ? WHERE id_conta = ?",
          [nome, idUsuario]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function excluirContaJogador(idUsuario) {
    // 1. O Model NÃO deve usar req ou res. Ele recebe o ID direto como argumento.
    
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // BUSCAR ID_JOGADOR (Para limpar tabelas sem FK)
        const [jogadores] = await connection.execute(
            "SELECT id_jogador FROM jogador WHERE id_conta = ?", 
            [idUsuario]
        );

        if (jogadores.length > 0) {
            const idJogador = jogadores[0].id_jogador;

            // DELETAR MANUALMENTE DO RANKING (Pois não tem Cascade no SQL)
            await connection.execute(
                "DELETE FROM ranking_historico WHERE id_jogador = ?", 
                [idJogador]
            );
        }

        // DELETAR A CONTA
        // O MySQL cuidará do 'jogador', 'desempenho_partida' e 'log' via CASCADE/SET NULL
        await connection.execute("DELETE FROM conta WHERE id_conta = ?", [idUsuario]);

        await connection.commit();
        return true; // Retorna sucesso para o controller

    } catch (error) {
        await connection.rollback();
        console.error("Erro no model ao excluir conta:", error);
        throw error; // Joga o erro de volta para o controller tratar
    } finally {
        connection.release();
    }
}

async function atualizarPerfilOrganizacao(idUsuario, nome, email, senha, sigla) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const camposConta = [];
        const valoresConta = [];

        if (email && email.trim() !== "") {
            camposConta.push("email = ?");
            valoresConta.push(email);
        }
        if (senha && senha.trim() !== "") {
            camposConta.push("senha_hash = ?");
            valoresConta.push(senha);
        }

        // Se houver algo para atualizar na conta, executa o UPDATE
        if (camposConta.length > 0) {
            valoresConta.push(idUsuario);
            const queryConta = `UPDATE conta SET ${camposConta.join(", ")} WHERE id_conta = ?`;
            await connection.execute(queryConta, valoresConta);
        }

        // 2. Atualiza Tabela ORGANIZACAO (Nome Org e Sigla)
        const camposOrg = [];
        const valoresOrg = [];

        if (nome && nome.trim() !== "") {
            camposOrg.push("nome_org = ?");
            valoresOrg.push(nome);
        }
        if (sigla && sigla.trim() !== "") {
            camposOrg.push("sigla = ?");
            valoresOrg.push(sigla);
        }

        // Se houver algo para atualizar na organização, executa o UPDATE
        if (camposOrg.length > 0) {
            valoresOrg.push(idUsuario);
            const queryOrg = `UPDATE organizacao SET ${camposOrg.join(", ")} WHERE id_conta = ?`;
            await connection.execute(queryOrg, valoresOrg);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function excluirContaOrganizacao(idUsuario) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Como usamos DELETE CASCADE no banco de dados (fk_organizacao_conta),
        // ao deletar a conta, a organização some automaticamente.
        await connection.execute("DELETE FROM conta WHERE id_conta = ?", [idUsuario]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function autenticarAdmin(email, senhaHash) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id_admin, nome, email FROM admin WHERE email = ? AND senha = ?",
      [email, senhaHash]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    connection.release();
  }
}

async function listarAdministradores() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id_admin, nome, email, DATE_FORMAT(data_cadastro, '%d/%m/%Y') as data_cadastro FROM admin ORDER BY nome"
    );
    return rows;
  } finally {
    connection.release();
  }
}

async function cadastrarAdministrador(nome, email, senhaHash) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO admin (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function editarAdministrador(idAdmin, nome, email, senhaHash) {
  const connection = await pool.getConnection();
  try {
    const campos = [];
    const valores = [];

    if (nome && nome.trim() !== "") {
      campos.push("nome = ?");
      valores.push(nome);
    }
    if (email && email.trim() !== "") {
      campos.push("email = ?");
      valores.push(email);
    }
    if (senhaHash && senhaHash.trim() !== "") {
      campos.push("senha = ?");
      valores.push(senhaHash);
    }

    if (campos.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    valores.push(idAdmin);
    const query = `UPDATE admin SET ${campos.join(", ")} WHERE id_admin = ?`;
    
    const [result] = await connection.execute(query, valores);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function excluirAdministrador(idAdmin) {
  const connection = await pool.getConnection();
  try {
    const [admin] = await connection.execute(
      "SELECT email FROM admin WHERE id_admin = ?",
      [idAdmin]
    );

    if (admin.length > 0 && admin[0].email === 'nexus@gmail.com') {
      throw new Error("Não é possível excluir o administrador padrão");
    }

    const [result] = await connection.execute(
      "DELETE FROM admin WHERE id_admin = ?",
      [idAdmin]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function buscarAdministradorPorId(idAdmin) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id_admin, nome, email FROM admin WHERE id_admin = ?",
      [idAdmin]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function carregarBarraLateral(idUsuario) {
  const connection = await pool.getConnection();
  try {
    // Implement the query to fetch the sidebar data based on the user ID
    const [rows] = await connection.execute(
      "SELECT email, imagem_perfil FROM conta WHERE id_conta = ?",
      [idUsuario]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

module.exports = {
    cadastrarConta,
    cadastrarJogador,
    cadastrarOrganizacao,
    autenticar,
    atualizarImagemPerfil,
    obterPerfilJogador,
    obterPerfilOrganizacao,
    atualizarPerfilJogador,
    excluirContaJogador,
    atualizarPerfilOrganizacao,
    excluirContaOrganizacao,
    autenticarAdmin,
    listarAdministradores,
    cadastrarAdministrador,
    editarAdministrador,
    excluirAdministrador,
    buscarAdministradorPorId,
    carregarBarraLateral
};