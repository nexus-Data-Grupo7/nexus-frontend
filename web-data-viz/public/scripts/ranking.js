const selectFiltro = document.getElementById("filtroRanking");

function irParaPerfil(idJogador) {
    if (!idJogador) return;
    sessionStorage.setItem('idJogadorSelecionado', idJogador);
    window.location.href = 'dashboard_individual.html';
}

// --- NOVA FUNÇÃO PARA GERAR A SETINHA ---
function getRankingIcon(posicaoAtual, posicaoAnterior) {
    if (!posicaoAnterior) {
        // Se não tem histórico (novo jogador), fica estático
        return `<img src="images/estatico.svg" class="icone-status" title="Sem histórico anterior">`;
    }

    const atual = parseInt(posicaoAtual);
    const anterior = parseInt(posicaoAnterior);

    // No ranking, MENOR É MELHOR.
    if (atual < anterior) {
        // Ex: Era 10, virou 5. SUBIU!
        return `<img src="images/seta_para_cima.svg" class="icone-status" title="Subiu de ${anterior}° para ${atual}°">`;
    } else if (atual > anterior) {
        // Ex: Era 1, virou 3. DESCEU!
        return `<img src="images/seta_para_baixo.svg" class="icone-status" title="Caiu de ${anterior}° para ${atual}°">`;
    } else {
        // Igual
        return `<img src="images/estatico.svg" class="icone-status" title="Manteve a posição">`;
    }
}

function atualizarRanking() {
    const filtroRanking = selectFiltro.value;
    let url = "";

    if (filtroRanking === "todos") url = "/ranking/filtroTodos";
    else if (filtroRanking === "premiacoes") url = "/ranking/filtroPremiacoes";
    else if (filtroRanking === "vitoria") url = "/ranking/filtroVitoria";

    if (url) {
        fetch(url, { method: "GET" })
            .then(response => response.json())
            .then(data => {
                const dadosJogadoresDiv = document.getElementById("dadosJogadores");
                let htmlTotal = "";

                data.forEach(jogador => {
                    
                    // AQUI CHAMAMOS A FUNÇÃO DA SETINHA (Só funciona se o filtro for 'todos' que tem a query ajustada)
                    let setaHtml = "";
                    if(filtroRanking === "todos") {
                        setaHtml = getRankingIcon(jogador.posicao_ranking, jogador.posicao_anterior);
                    } else {
                        // Nos outros filtros, deixamos estático ou vazio pois não alteramos a query deles ainda
                        setaHtml = `<img src="images/estatico.svg" class="icone-status">`;
                    }

                    htmlTotal += `
            <div class="linhaTabelaRanking" onclick="irParaPerfil(${jogador.id_jogador})" style="cursor: pointer;">
                <div class="linhaTabelaRankingNumero">
                    ${jogador.posicao_ranking}°
                    ${setaHtml} </div>
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
                renderizarGraficosWinrate(data); // Separei a função de gráfico para ficar limpo
            })
            .catch(error => console.error("Erro ao buscar dados de ranking:", error));
    }
}

function renderizarGraficosWinrate(data) {
    data.forEach(jogador => {
        const wins = parseInt(jogador.vitorias, 10) || 0; // Garante 0 se for NaN
        const losses = parseInt(jogador.derrotas, 10) || 0; // Garante 0 se for NaN
        const total = wins + losses;

        // Se o jogador não tiver partidas, não renderiza nada para não quebrar
        if (total === 0) return;

        const winrate = Math.round((wins / total) * 100);

        const options = {
            chart: {
                type: 'bar',
                stacked: true,
                stackType: '100%', // Garante que ocupe toda a largura
                width: '100%',
                height: '100%', // Usa 100% da div pai
                sparkline: { enabled: false }, // Mantemos false para ter os números
                parentHeightOffset: 0, // <--- O SEGREDO: Remove margem extra do SVG
                toolbar: { show: false },
                events: {
                    click: function () {
                        irParaPerfil(jogador.id_jogador);
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '100%', // Ocupa toda a altura disponível
                    borderRadius: 4,   // Bordas arredondadas
                    dataLabels: {
                        position: 'center', // Texto no meio da barra
                        hideOverflowingLabels: false // Força mostrar o texto mesmo se for apertado
                    }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '11px',
                    fontWeight: 'bold',
                    colors: ['#fff']
                },
                formatter: function (val, opts) {
                    // Mostra o número apenas se for maior que 0
                    if (opts.seriesIndex === 0 && wins > 0) return wins + "W";
                    if (opts.seriesIndex === 1 && losses > 0) return losses + "L";
                    return "";
                },
                dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.5 }
            },
            series: [
                { name: 'Vitórias', data: [wins] },
                { name: 'Derrotas', data: [losses] }
            ],
            colors: ['#3b82f6', '#ef4444'], // Azul e Vermelho
            
            // Removemos Eixos e Grades para limpar o visual
            grid: {
                show: false,
                padding: { top: 0, bottom: 0, left: 0, right: 0 } // <--- IMPORTANTE: Zera margens
            },
            xaxis: {
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                show: false
            },
            legend: { show: false },
            tooltip: { enabled: false },

            // Texto da % (Winrate) flutuando à direita
            annotations: {
                position: 'front',
                texts: [{
                    x: '100%',
                    y: '50%', // Centraliza verticalmente
                    textAnchor: 'end', // Alinha à direita
                    style: {
                        color: '#ef4444',
                        fontWeight: '800',
                        fontSize: '12px',
                        background: 'transparent',
                        padding: { right: 5 }
                    }
                }]
            }
        };

        const chartId = `#graficoWinrate${jogador.id_jogador}`;
        const chartEl = document.querySelector(chartId);
        
        if (chartEl) {
            chartEl.innerHTML = ""; // Limpa gráfico antigo
            const chart = new ApexCharts(chartEl, options);
            chart.render();
        }
    });
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