const ID_USUARIO = sessionStorage.getItem("ID_USUARIO");
const EMAIL_USUARIO = sessionStorage.getItem("EMAIL_USUARIO");
const TIPO_CONTA = sessionStorage.getItem("TIPO_CONTA");
const FOTO_ATUAL = sessionStorage.getItem("FOTO_PERFIL") || "foto_perfil";

function toggleMenu() {
    const nav = document.getElementById('nav');
    const overlay = document.querySelector('.overlay');
    const menuToggle = document.querySelector('.menu-toggle');

    nav.classList.toggle('active');
    overlay.classList.toggle('active');

    const icon = menuToggle.querySelector('i');
    if (nav.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-times');
        menuToggle.setAttribute('aria-label', 'Fechar menu');
        document.body.style.overflow = 'hidden';
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.style.overflow = '';
    }
}

document.querySelectorAll('.navLinksLogo').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleMenu();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const nav = document.getElementById('nav');
        if (nav.classList.contains('active')) {
            toggleMenu();
        }
        fecharModalCampeao();
    }
});

const listaCampeoes = [
    "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa Medarda", "Amumu", "Anivia",
    "Annie", "Aphelios", "Ashe", "Aurelion Sol", "Aurora", "Azir", "Bard", "Bel'Veth",
    "Blitzcrank", "Brand", "Braum", "Briar", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath",
    "Corki", "Darius", "Diana", "Draven", "Dr. Mundo", "Ekko", "Elise", "Evelynn", "Ezreal",
    "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas",
    "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi", "Irelia", "Ivern",
    "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Karma",
    "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Kha'Zix", "Kindred",
    "Kled", "Kog'Maw", "K'Sante", "LeBlanc", "Lee Sin", "Leona", "Lillia", "Lissandra",
    "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Milio",
    "Miss Fortune", "Wukong", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus",
    "Nautilus", "Neeko", "Nidalee", "Nilah", "Nocturne", "Nunu e Willump", "Olaf",
    "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus",
    "Rek'Sai", "Rell", "Renata Glasc", "Renekton", "Rengar", "Riven", "Rumble", "Ryze",
    "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana",
    "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona", "Soraka", "Swain", "Sylas",
    "Syndra", "Tahm Kench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana",
    "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne",
    "Veigar", "Vel'Koz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick",
    "Xerath", "Xin Zhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri",
    "Ziggs", "Zilean", "Zoe", "Zyra"
];

const caminhoImagens = "./images/campeões/";
const extensaoImagem = ".png";

function abrirModalCampeao() {
    const modal = document.getElementById("modalCampeao");
    const containerLista = document.getElementById("listaCampeoes");

    containerLista.innerHTML = "";

    listaCampeoes.forEach(nome => {
        const divItem = document.createElement("div");
        divItem.classList.add("item-campeao");
        divItem.onclick = () => selecionarCampeao(nome);

        const img = document.createElement("img");
        img.src = `${caminhoImagens}${nome}${extensaoImagem}`;
        img.alt = nome;

        img.onerror = function () {
            this.src = './images/icon_camera.svg';
        };

        const span = document.createElement("span");
        span.innerText = nome;

        divItem.appendChild(img);
        divItem.appendChild(span);

        containerLista.appendChild(divItem);
    });

    modal.style.display = "flex";
}

function fecharModalCampeao() {
    document.getElementById("modalCampeao").style.display = "none";
}

async function selecionarCampeao(nomeCampeao) {
    if (!ID_USUARIO) {
        alert("Erro: Usuário não identificado. Faça login novamente.");
        return;
    }

    const imgPerfil = document.getElementById("img_perfil_atual");
    const fotoAntiga = imgPerfil.src;
    imgPerfil.src = `${caminhoImagens}${nomeCampeao}${extensaoImagem}`;

    fecharModalCampeao();

    try {
        console.log(`Atualizando foto para: ${nomeCampeao}`);

        const response = await fetch("/usuarios/atualizarFoto", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idUsuario: ID_USUARIO,
                novaImagem: nomeCampeao
            })
        });

        if (response.ok) {
            console.log("Sucesso no banco!");
            sessionStorage.setItem("FOTO_PERFIL", nomeCampeao);
        } else {
            console.error("Erro no backend");
            alert("Erro ao salvar foto.");
            imgPerfil.src = fotoAntiga;
        }

    } catch (error) {
        console.error("Erro de rede:", error);
        imgPerfil.src = fotoAntiga;
    }
}

window.onclick = function (event) {
    const modal = document.getElementById("modalCampeao");
    if (event.target == modal) {
        fecharModalCampeao();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const imgPerfil = document.getElementById("img_perfil_atual");

    if (FOTO_ATUAL === "foto_perfil") {
        imgPerfil.src = `./images/foto_perfil.png`;
    } else {
        imgPerfil.src = `${caminhoImagens}${FOTO_ATUAL}${extensaoImagem}`;
    }
});

function calcularIdade(dataString) {
    if (!dataString) return "Data N/A";

    const hoje = new Date();
    const nascimento = new Date(dataString);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

function calcularDiasDesdeUltimaPartida(dataString) {
    if (!dataString) return 0;

    const hoje = new Date();
    const ultimaPartida = new Date(dataString);

    const diferencaTime = Math.abs(hoje - ultimaPartida);
    const diferencaDias = Math.ceil(diferencaTime / (1000 * 60 * 60 * 24));

    return diferencaDias;
}

function carregarPerfil() {
    if (!ID_USUARIO) return;

    if (TIPO_CONTA === "JOGADOR") {
        fetch(`/usuarios/perfilJogador/${ID_USUARIO}`, { method: "GET" })
            .then(response => {
                if (!response.ok) throw new Error("Erro na requisição");
                return response.json();
            })
            .then(data => {
                console.log("Dados do jogador:", data);

                const divNome = document.querySelector(".nome span");
                if (divNome) divNome.innerText = data.nome;

                const divIdade = document.querySelector(".idade span");
                if (divIdade) {
                    const idadeCalculada = calcularIdade(data.dt_nascimento);
                    divIdade.innerText = `${idadeCalculada} anos`;
                }

                const imgPerfil = document.getElementById("img_perfil_atual");
                const fotoBanco = data.imagem_perfil || "foto_perfil";

                const fotoSessao = sessionStorage.getItem("FOTO_PERFIL");
                const fotoFinal = fotoSessao ? fotoSessao : fotoBanco;

                imgPerfil.src = `${caminhoImagens}${fotoFinal}${extensaoImagem}`;

                const divRankNick = document.querySelector(".rank span:first-child");
                const divRankInfo = document.querySelector(".rank .sub");

                if (divRankNick) {
                    divRankNick.innerText = `${data.game_name} #${data.tagline || ''}`;
                }

                if (divRankInfo) {
                    const posicao = data.ranking_atual ? `Top ${data.ranking_atual}` : "Sem Ranking";
                    const dias = calcularDiasDesdeUltimaPartida(data.ultima_partida);

                    divRankInfo.innerText = `${posicao} - há ${dias} dias atrás`;
                }

            }).catch(error => {
                console.error("Erro ao carregar perfil do jogador:", error);
            });

    } else if (TIPO_CONTA === "ORGANIZACAO") {
        // Lógica da organização (se necessário)
    }
}

function alterarInformacoes() {
    const novoNome = document.getElementById("inputNome").value;
    const novoEmail = document.getElementById("inputEmail").value;
    const novaSenha = document.getElementById("inputSenha").value;
    console.log("Alterar informações solicitadas.");

    if (!novoNome || !novoEmail || !novaSenha) {
        alert("Por favor, preencha todos os campos antes de salvar.");
        return;
    }
    if (TIPO_CONTA == "JOGADOR") {

        fetch("/usuarios/atualizarPerfilJogador", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idUsuario: ID_USUARIO,
                novoNome: novoNome,
                novoEmail: novoEmail,
                novaSenha: novaSenha
            })
        }).then(response => {
            if (!response.ok) throw new Error("Erro ao atualizar perfil");
            alert("Informações atualizadas com sucesso!");
            carregarPerfil();
        }).catch(error => {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar informações. Tente novamente.");
        });

        console.log("Alterar informações para:", { novoNome, novoEmail, novaSenha });
    }

}

function excluirConta() {

    if (TIPO_CONTA == "JOGADOR") {

        fetch("/usuarios/excluirContaJogador", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idUsuario: ID_USUARIO
            })
        }).then(response => {   
            if (!response.ok) throw new Error("Erro ao excluir conta");
            alert("Conta excluída com sucesso!");
            window.location.href = "./index.html";
            // Redirecionar para página inicial ou de cadastro/login
        }).catch(error => {
            console.error("Erro ao excluir conta:", error);
            alert("Erro ao excluir conta. Tente novamente.");
        });
    } else if (TIPO_CONTA == "ORGANIZACAO") {
        // Lógica de exclusão para organização
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const imgPerfil = document.getElementById("img_perfil_atual");
    if (FOTO_ATUAL === "foto_perfil") {
        imgPerfil.src = `./images/foto_perfil.png`;
    } else {
        imgPerfil.src = `${caminhoImagens}${FOTO_ATUAL}${extensaoImagem}`;
    }

    carregarPerfil();
});