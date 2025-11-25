const idJogadorSelecionado = sessionStorage.getItem('idJogadorSelecionado');

function carregarDadosJogador() {
    console.log("ID do jogador selecionado no dashboard individual:", idJogadorSelecionado);
    const taxaVitoriaDiv = document.getElementById("divTaxaVitoria");
    const kdaMedioDiv = document.getElementById("divKdaMedio");
    const farmMedioDiv = document.getElementById("divFarmMedio");

    fetch(`jogador/dadosDashboardIndividual/${idJogadorSelecionado}`,
        { method: "GET" })
        .then(response => response.json())
        .then(data => {
            console.log("Dados do jogador recebido:", data);

            taxaVitoriaDiv.innerHTML = `
                <div class="infoSup">
                    Maior taxa de vitória
                </div>
                <div class="infoValor">
                    ${data[0].taxa_vitoria}%
                </div>
            `;
            kdaMedioDiv.innerHTML = `
                <div class="infoSup">
                    KDA médio
                </div>
                <div class="infoValor">
                    ${data[0].media_kills}/${data[0].media_deaths}/${data[0].media_assists}
                </div>
            `;
            farmMedioDiv.innerHTML = `
                <div class="infoSup">
                    Farm médio
                </div>
                <div class="infoValor">
                    ${data[0].farm_medio}/min
                </div>
            `;
        }).catch(error => {
            console.error("Erro ao carregar dados do jogador:", error);
        });
}

function carregarGrafico() {
    const idJogador = sessionStorage.getItem('idJogadorSelecionado');

    if (!idJogador) return;

    fetch(`/jogador/dadosGraficoJogador/${idJogador}`)
        .then(response => response.json())
        .then(data => {

            let saldo = 0;
            let todosDados = [];
            let todasCategorias = [];

            for (let i = 0; i < data.length; i++) {
                let resultado = data[i].resultado;

                if (resultado === 'VITORIA') {
                    saldo++;
                } else {
                    saldo--;
                }

                todosDados.push(saldo);
                todasCategorias.push(`Partida ${i + 1}`);
            }

            const limite = 6;
            const dadosRecentes = todosDados.slice(-limite);
            const categoriasRecentes = todasCategorias.slice(-limite);

            var optionsLinha = {
                chart: {
                    type: 'line',
                    height: '100%',
                    toolbar: { show: false },
                    background: 'transparent'
                },
                series: [{
                    name: 'Saldo de Vitórias',
                    data: dadosRecentes
                }],
                xaxis: {
                    categories: categoriasRecentes,
                    labels: { style: { colors: '#ccc' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                },
                yaxis: {
                    labels: { style: { colors: '#ccc' } }
                },
                colors: ['#00bcd4'],
                stroke: {
                    curve: 'smooth',
                    width: 3
                },
                markers: {
                    size: 4,
                    colors: ['#00bcd4'],
                    strokeColors: '#000',
                    strokeWidth: 2,
                    hover: { size: 7 }
                },
                grid: {
                    borderColor: 'rgba(255,255,255,0.1)',
                    strokeDashArray: 4
                },
                title: {
                    text: 'Desempenho (Últimas ' + limite + ' partidas)',
                    align: 'center',
                    style: { color: '#fff', fontSize: '16px' }
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function (val) { return val + " Pontos"; }
                    }
                }
            };

            document.querySelector("#graficoMid1").innerHTML = "";
            var chartLinha = new ApexCharts(document.querySelector("#graficoMid1"), optionsLinha);
            chartLinha.render();

        })
        .catch(error => {
            console.error("Erro no gráfico:", error);
        });
}

function carregarGraficoPizza() {
    const idJogador = sessionStorage.getItem('idJogadorSelecionado');
    if (!idJogador) return;

    fetch(`/jogador/dadosGraficoJogadorPizza/${idJogador}`)
        .then(response => response.json())
        .then(data => {
            console.log("Dados do gráfico de pizza recebidos:", data);
            if (data.length === 0) {
                document.querySelector("#graficoMid2").innerHTML = "<div style='color:white; text-align:center'>Sem dados</div>";
                return;
            }

            const nomesCampeoes = data.map(item => item.nome_campeao);
            const qtdPartidas = data.map(item => item.qtd_partidas);

            var optionsPizza = {
                chart: {
                    type: 'pie',
                    height: '100%',
                    background: 'transparent'
                },
                series: qtdPartidas,
                labels: nomesCampeoes,
                colors: ['#00bcd4', '#4CAF50', '#E91E63'], legend: {
                    position: 'right',
                    labels: {
                        colors: '#fff'
                    }
                },
                title: {
                    text: 'Top 3 Campeões mais jogados',
                    align: 'center',
                    style: {
                        color: '#fff',
                        fontSize: '16px'
                    }
                },
                dataLabels: {
                    style: {
                        colors: ['#fff']
                    }
                },
                stroke: {
                    colors: ['#000'],
                    width: 2
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function (val) {
                            return val + " partidas";
                        }
                    }
                }
            };

            document.querySelector("#graficoMid2").innerHTML = "";
            var chartPizza = new ApexCharts(document.querySelector("#graficoMid2"), optionsPizza);
            chartPizza.render();
        })
        .catch(error => {
            console.error("Erro ao carregar gráfico de pizza:", error);
        });
}

function carregarPremiacao() {

    const idJogador = sessionStorage.getItem('idJogadorSelecionado');
    if (!idJogador) return;
    fetch(`/jogador/premiacao/${idJogador}`)
        .then(response => response.json())
        .then(data => {
            console.log("Dados de premiação recebidos:", data);
            const premiacaoDiv = document.getElementById("divPremiacao");

            if (data[0].premiacao === null || data[0].premiacao === undefined || data[0].premiacao === 0) {
                premiacaoDiv.innerHTML = `
                <div class="infoInf">
                    Total em premiações
                </div>
                <div class="infoValor">
                    $0
                </div>
            `;
                return;
            }

            premiacaoDiv.innerHTML = `
                <div class="infoInf">
                    Total em premiações
                </div>
                <div class="infoValor">
                    $${data[0].premiacao}
                </div>
            `;
        })
        .catch(error => {
            console.error("Erro ao carregar dados de premiação:", error);
        });
}

function carregaInfoJogador() {
    const idJogador = sessionStorage.getItem('idJogadorSelecionado');
    if (!idJogador) return;

    fetch(`/jogador/infoJogador/${idJogador}`)
        .then(response => response.json())
        .then(data => {
            const divJogadorDetalhes = document.getElementById("divJogadorDetalhes");
            var idade = `${data[0].idade} anos`;
            if (data[0].idade === null || data[0].idade === undefined || data[0].idade === 0) {
                idade = "Sem dados"
            }

            divJogadorDetalhes.innerHTML = `
            <div class="infoJogadorDetalhesItem">
                    Nome: ${data[0].nome}
                </div>
                <div class="infoJogadorDetalhesItem">
                    Idade: ${idade}
                </div>
                <div class="infoJogadorDetalhesItem">
                    Posição: ${data[0].posicao_mais_jogada}
                </div>`
            console.log("Dados do jogador recebidos:", data);
        })
        .catch(error => {
            console.error("Erro ao carregar informações do jogador:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosJogador();
    carregarGrafico();
    carregarGraficoPizza();
    carregarPremiacao()
    carregaInfoJogador();
});