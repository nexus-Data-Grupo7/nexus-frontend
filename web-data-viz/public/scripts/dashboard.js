function tempoDesde(dataIso) {
    const data = new Date(dataIso);
    const diffMs = Date.now() - data.getTime();
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (dias === 0) return "hoje";
    if (dias === 1) return "há 1 dia atrás";
    return `há ${dias} dias atrás`;
}

function renderTop3(top3) {
    const container = document.getElementById("top3-container");
    container.innerHTML = "";

    top3.forEach(player => {
        const dias = tempoDesde(player.data_atualizacao);
        const icone = getIcon(player);

        const card = `
            <div class="graficoInfTopJogador">
                <img src="${icone}" alt="">
                <div class="topJogadorInfo">
                    <div class="topNomeJogador">
                        ${player.game_name}
                    </div>
                    <div class="topJogadorData">
                        Top ${player.posicao_atual} - ${dias}
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML("beforeend", card);
    });
}


function getIcon(player) {
    if (!player.posicao_anterior) {
        return "images/estatico.svg";
    }

    if (player.posicao_anterior > player.posicao_atual) {
        return "images/seta_para_cima.svg";
    }

    if (player.posicao_anterior < player.posicao_atual) {
        return "images/seta_para_baixo.svg";
    }

    return "images/estatico.svg";
}


function carregarDashboard() {

    fetch(`dashboard/carregarDashboard`, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            console.log("Dados do dashboard recebido:", data);

            if (data.length > 0) {
                const stats = data[0];

                document.getElementById("divTaxaVitoria").innerHTML = `
                    <div class="infoSup">Maior taxa de vitória</div>
                    <div class="infoJogador">${stats.nome_melhor_winrate}</div>
                    <div class="infoValor">${stats.taxa_vitoria}</div>`;

                document.getElementById("divMelhorKDA").innerHTML = `
                    <div class="infoSup">Melhor KDA</div>
                    <div class="infoJogador">${stats.nome_melhor_kda}</div>
                    <div class="infoValor">${stats.total_abates}/${stats.total_mortes}/${stats.total_assistencias}</div>`;

                document.getElementById("divJogadorDestaque").innerHTML = `
                    <div class="infoSup">Jogador destaque</div>
                    <div class="infoJogador">${stats.nome_destaque_geral}</div>`;

                document.getElementById("divPremiacao").innerHTML = `
                    <div class="infoInf">Jogador com maior premiação</div>
                    <div class="infoJogador">${stats.nome_maior_premiacao}</div>
                    <div class="infoValor">${stats.valor_premiacao}</div>`;
            }
        })
        .catch(error => console.error("Erro ao carregar cards:", error));

    fetch(`dashboard/carregarDashboard/graficos`, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            console.log("Dados dos gráficos recebidos:", data);

            let rotasNomes = [];
            let rotasValores = [];

            let campeoesNomes = [];
            let campeoesValores = [];

            data.forEach(item => {
                if (item.categoria === 'Rota/Função') {
                    rotasNomes.push(item.nome);
                    rotasValores.push(item.total_vezes);
                } else if (item.categoria === 'Top 3 Campeões' || item.categoria === 'Campeao Top 3') {
                    campeoesNomes.push(item.nome);
                    campeoesValores.push(item.total_vezes);
                }
            });

            var optionsBarra = {
                chart: {
                    type: 'bar',
                    height: '100%',
                    toolbar: { show: false },
                    background: 'transparent'
                },
                series: [{
                    name: 'Partidas Jogadas',
                    data: rotasValores
                }],
                xaxis: {
                    categories: rotasNomes,
                    labels: { style: { colors: '#ccc' } }
                },
                yaxis: {
                    labels: { style: { colors: '#ccc' } }
                },
                colors: ['#00bcd4'],
                plotOptions: {
                    bar: {
                        borderRadius: 4,
                        horizontal: false,
                        columnWidth: '55%'
                    }
                },
                dataLabels: { enabled: false },
                grid: {
                    borderColor: 'rgba(255,255,255,0.1)'
                },
                title: {
                    text: 'Posições mais jogadas',
                    align: 'center',
                    style: { color: '#fff', fontSize: '16px' }
                }
            };

            document.querySelector("#graficoMid1").innerHTML = "";
            var chartBarra = new ApexCharts(document.querySelector("#graficoMid1"), optionsBarra);
            chartBarra.render();

            var optionsPizza = {
                chart: {
                    type: 'pie',
                    height: '100%',
                    background: 'transparent'
                },
                series: campeoesValores,
                labels: campeoesNomes,
                colors: ['#00bcd4', '#4CAF50', '#E91E63'],
                legend: {
                    position: 'right',
                    labels: { colors: '#fff' }
                },
                title: {
                    text: 'Top 3 campeões mais jogados',
                    align: 'center',
                    style: { color: '#fff', fontSize: '16px' }
                },
                dataLabels: {
                    style: { colors: ['#fff'] }
                },
                stroke: {
                    colors: ['#000'],
                    width: 2
                }
            };

            document.querySelector("#graficoMid2").innerHTML = "";
            var chartPizza = new ApexCharts(document.querySelector("#graficoMid2"), optionsPizza);
            chartPizza.render();

        })
        .catch(error => {
            console.error("Erro ao carregar dados dos gráficos:", error);
        });


    fetch(`dashboard/carregarDashboard/top3`, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            console.log("Dados do Top 3 recebido:", data);
            renderTop3(data);
        })
        .catch(error =>
            console.error("Erro ao carregar Top 3:", error));

}

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
});