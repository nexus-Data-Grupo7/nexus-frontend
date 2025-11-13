const selectFiltro = document.getElementById("filtroRanking");

function irParaPerfil(idJogador) {
    if (!idJogador) {
        console.error("ID do jogador inválido.");
        return;
    }

    sessionStorage.setItem('idJogadorSelecionado', idJogador);
    console.log("ID do jogador selecionado:", idJogador);

    // window.location.href = 'dashboard_individual.html';
}

function atualizarRanking() {
    const filtroRanking = selectFiltro.value;
    let url = "";

    if (filtroRanking === "todos") {
        console.log("Filtro Todos selecionado");
        url = "/ranking/filtroTodos";
    } else if (filtroRanking === "premiacoes") {
        console.log("Filtro Premiações selecionado");
        url = "/ranking/filtroPremiacoes";
    } else if (filtroRanking === "vitoria") {
        console.log("Filtro Vitórias selecionado");
        url = "/ranking/filtroVitoria";
    }

    if (url) {
        fetch(url, { method: "GET" })
            .then(response => response.json())
            .then(data => {
                const dadosJogadoresDiv = document.getElementById("dadosJogadores");
                let htmlTotal = "";

                data.forEach(jogador => {
                    htmlTotal += `
            <div class="linhaTabelaRanking" onclick="irParaPerfil(${jogador.id_jogador})" style="cursor: pointer;">
                <div class="linhaTabelaRankingNumero">
                    ${jogador.posicao_ranking}°
                </div>
                <div class="linhaTabelaRankingNome">
                    ${jogador.game_name}
                </div>
                <div class="linhaTabelaRankingElo">
                    ${jogador.nome_elo}
                </div>
                <div class="linhaTabelaRankingCampeoes">
                    <img src="images/campeões/${jogador.campeao1}.png" alt="">
                    <img src="images/campeões/${jogador.campeao2}.png" alt="">
                    <img src="images/campeões/${jogador.campeao3}.png" alt="">
                </div>
                
                <div class="graficoWinrate" id="graficoWinrate${jogador.id_jogador}">
                </div>
            </div>`;
                });

                dadosJogadoresDiv.innerHTML = htmlTotal;

                data.forEach(jogador => {
                    const wins = parseInt(jogador.vitorias, 10);
                    const losses = parseInt(jogador.derrotas, 10);
                    const total = wins + losses;
                    const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

                    const options = {
                        chart: {
                            type: 'bar', stacked: true, stackType: '100%', width: '100%', height: 30,
                            toolbar: { show: false }, sparkline: { enabled: true },
                            events: {
                                click: function (event, chartContext, config) {
                                    irParaPerfil(jogador.id_jogador);
                                }
                            }
                        },
                        series: [{ name: 'Vitórias', data: [wins] }, { name: 'Derrotas', data: [losses] }],
                        plotOptions: { bar: { horizontal: true, barHeight: '100%', borderRadius: 5 } },
                        colors: ['#3b82f6', '#ef4444'],
                        dataLabels: { enabled: true, formatter: (val, opts) => opts.seriesIndex === 0 ? `${wins}W` : `${losses}L`, style: { colors: ['#fff'] } },
                        tooltip: { enabled: false },
                        xaxis: { categories: [''], labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                        yaxis: { show: false }, grid: { show: false }, legend: { show: false },
                        annotations: { position: 'front', texts: [{ x: '100%', text: `${winrate}%`, style: { color: '#ef4444', fontWeight: 600 } }] }
                    };

                    const chartEl = document.querySelector(`#graficoWinrate${jogador.id_jogador}`);
                    if (chartEl) {
                        const chart = new ApexCharts(chartEl, options);
                        chart.render();
                    }
                });
            })
            .catch(error => console.error("Erro ao buscar dados de ranking:", error));
    }
}

selectFiltro.addEventListener("change", atualizarRanking);
atualizarRanking();


function barraPesquisa() {
    const input = document.getElementById("input_barraPesquisa").value.toLowerCase();

    if (input.length === 0) {
        document.getElementById("resultadoBusca").innerHTML = "";
        return;
    }

    fetch(`/ranking/buscaJogador/${input}`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            const resultadoBuscaDiv = document.getElementById("resultadoBusca");
            let htmlResultado = "";

            data.forEach(jogador => {
                const img1 = jogador.campeao1 ? `<img src="images/campeões/${jogador.campeao1}.png" alt="">` : '';
                const img2 = jogador.campeao2 ? `<img src="images/campeões/${jogador.campeao2}.png" alt="">` : '';
                const img3 = jogador.campeao3 ? `<img src="images/campeões/${jogador.campeao3}.png" alt="">` : '';

                htmlResultado += `
            <div class="barraPesquisa-linhaResultado" onclick="irParaPerfil(${jogador.id_jogador})" style="cursor: pointer;">
                <div class="barraPesquisa-nomeJogador">
                    ${jogador.game_name}
                </div>
                <div class="barraPesquisa-eloJogador">
                    ${jogador.nome_elo || 'Sem Elo'}
                </div>
                <div class="barraPesquisa-top3campeoes">
                    ${img1}
                    ${img2}
                    ${img3}
                </div>
            </div>`;
            });

            resultadoBuscaDiv.innerHTML = htmlResultado;
        })
        .catch(error => {
            console.error("Erro ao buscar dados da barra de pesquisa:", error);
        });
}